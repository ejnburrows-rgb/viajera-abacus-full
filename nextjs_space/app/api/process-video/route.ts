import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parsePerplexityResult, validateParsedResult } from '@/lib/perplexity-parser';
import { type DecimaSchema } from '@/lib/openrouter-client';

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Support both old Perplexity format and new OpenRouter format
interface ProcessVideoRequest {
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  perplexityResult?: string; // Legacy format
  analysisResult?: {
    decimas: DecimaSchema[];
    resumen: {
      total_decimas: number;
      notas: string;
    };
  }; // New OpenRouter format
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessVideoRequest = await request.json();
    const { youtubeUrl, youtubeId, title, duration, thumbnailUrl, perplexityResult, analysisResult } = body;

    if (!youtubeUrl || !youtubeId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: youtubeUrl y youtubeId' },
        { status: 400 }
      );
    }

    // Determine which format we're processing
    let decimas: DecimaSchema[] = [];
    let summary = '';
    let deepAnalysis = '';
    let topDecimasData: any[] = [];
    
    if (analysisResult) {
      // New OpenRouter format - already structured
      console.log('Processing OpenRouter format');
      decimas = analysisResult.decimas;
      summary = analysisResult.resumen.notas;
      
      if (!decimas || decimas.length === 0) {
        return NextResponse.json(
          { error: 'No se encontraron décimas en el resultado del análisis' },
          { status: 400 }
        );
      }
      
    } else if (perplexityResult) {
      // Legacy Perplexity format - needs parsing
      console.log('Processing legacy Perplexity format');
      console.log('Input length:', perplexityResult.length, 'characters');
      console.log('First 200 chars:', perplexityResult.substring(0, 200));
      
      const parsedResult = parsePerplexityResult(perplexityResult);
      console.log('Parsed décimas count:', parsedResult.decimas.length);
      console.log('Top décimas count:', parsedResult.analysis.topDecimas.length);
      
      // Validate the result
      const validation = validateParsedResult(parsedResult, true);
      
      // Show warnings but don't fail if we have at least one décima
      if (validation.warnings.length > 0) {
        console.log('Parser warnings:', validation.warnings);
      }
      
      if (!validation.valid) {
        const errorMessage = validation.errors.join('\n');
        return NextResponse.json(
          { 
            error: errorMessage,
            details: validation.errors,
            debugInfo: {
              textLength: perplexityResult.length,
              decimasFound: parsedResult.decimas.length,
              firstDecima: parsedResult.decimas[0] || null
            }
          },
          { status: 400 }
        );
      }
      
      // Convert legacy format to new format
      decimas = parsedResult.decimas.map((d, idx) => ({
        numero: idx + 1,
        poeta: d.poetName,
        versos: d.verses,
        analisis_metrico: {
          silabas_por_verso: Array(10).fill(8), // Assume 8 syllables
          sinalefas_detectadas: 0,
          palabras_finales: d.verses.map(v => v.split(/\s+/).pop() || '')
        },
        analisis_cultural: d.theme || 'Análisis pendiente'
      }));
      
      // Extract analysis sections
      summary = parsedResult.analysis.summary;
      deepAnalysis = parsedResult.analysis.deepAnalysis;
      topDecimasData = parsedResult.analysis.topDecimas;
      
      console.log('Successfully converted', decimas.length, 'décimas to new format');
      console.log('Summary length:', summary.length, 'chars');
      console.log('Deep analysis length:', deepAnalysis.length, 'chars');
      
    } else {
      return NextResponse.json(
        { error: 'Se requiere perplexityResult o analysisResult' },
        { status: 400 }
      );
    }

    // Check if video already exists
    let video = await prisma.video.findUnique({
      where: { youtubeUrl }
    });

    if (video) {
      // Delete existing data to reprocess
      await prisma.analysis.deleteMany({ where: { videoId: video.id } });
      await prisma.decima.deleteMany({ where: { videoId: video.id } });
      await prisma.poet.deleteMany({ where: { videoId: video.id } });
    } else {
      // Create new video record
      video = await prisma.video.create({
        data: {
          youtubeUrl,
          youtubeId,
          title,
          duration,
          thumbnailUrl,
          status: 'ANALYZING'
        }
      });
    }

    // Group décimas by poet
    const poetGroups = new Map<string, DecimaSchema[]>();
    decimas.forEach(decima => {
      const existing = poetGroups.get(decima.poeta) || [];
      existing.push(decima);
      poetGroups.set(decima.poeta, existing);
    });

    // Save poets and décimas
    let turnNumber = 1;
    const decimaRecords = new Map<number, string>(); // Map décima number to ID
    
    for (const [poetName, poetDecimas] of poetGroups.entries()) {
      const poet = await prisma.poet.create({
        data: {
          videoId: video.id,
          name: poetName,
          turnNumber: turnNumber++
        }
      });

      for (const decima of poetDecimas) {
        const decimaRecord = await prisma.decima.create({
          data: {
            videoId: video.id,
            poetId: poet.id,
            number: decima.numero,
            lines: decima.versos,
            rhymeScheme: 'ABBAACCDDC',
            meter: 'Octosílabos',
            timestamp: null,
            technicalMastery: `${decima.analisis_metrico.silabas_por_verso.filter(s => s === 8).length}/10 versos con métrica correcta`,
            poeticDevices: `${decima.analisis_metrico.sinalefas_detectadas} sinalefas detectadas`,
            culturalElements: decima.analisis_cultural,
            emotionalResonance: 'Análisis emocional pendiente'
          }
        });
        
        // Store the ID for later matching with top décimas
        decimaRecords.set(decima.numero, decimaRecord.id);
      }
    }
    
    // Mark top décimas with their interpretations
    if (topDecimasData && topDecimasData.length > 0) {
      for (const topDecima of topDecimasData) {
        const decimaId = decimaRecords.get(topDecima.decimaNumber);
        if (decimaId) {
          await prisma.decima.update({
            where: { id: decimaId },
            data: {
              isTopThree: true,
              topThreeRank: topDecima.decimaNumber, // Use original order as rank
              topThreeReason: topDecima.culturalNotes || 'Décima destacada por su valor literario'
            }
          });
        }
      }
    }

    // Save analysis with new simplified structure
    await prisma.analysis.create({
      data: {
        videoId: video.id,
        summary: summary || 'Análisis de la canturía disponible en el texto completo.',
        deepAnalysis: deepAnalysis || 'Análisis profundo disponible en el texto completo.'
      }
    });

    // Update video status and save raw transcript
    await prisma.video.update({
      where: { id: video.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        transcript: perplexityResult || JSON.stringify(analysisResult, null, 2)
      }
    });

    return NextResponse.json({
      success: true,
      videoId: video.id,
      decimasCount: decimas.length,
      poetsCount: poetGroups.size
    });

  } catch (error: any) {
    console.error('Error procesando video:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el video' },
      { status: 500 }
    );
  }
}
