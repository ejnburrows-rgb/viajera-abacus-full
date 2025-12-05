
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, Play, Key, Sparkles } from "lucide-react";
import Image from "next/image";
import StageIndicator, { Stage, StageStatus } from "./stage-indicator";
import RhymeVisualizer from "./rhyme-visualizer";
import { 
  extractDecimas, 
  validateMetrics, 
  analyzeCultural,
  type DecimaSchema 
} from "@/lib/openrouter-client";
import { validateRhymeScheme, type RhymeValidationResult } from "@/lib/rhyme-validator";
import { validateDecimaSyllables } from "@/lib/syllable-counter";

interface ProcessingSectionProps {
  onVideoProcessed: (videoId: string) => void;
}

interface VideoPreview {
  title: string;
  duration: string;
  thumbnailUrl: string;
  youtubeId: string;
}

type PipelineStage = 'idle' | 'validating' | 'extracting' | 'validating-metrics' | 'analyzing' | 'completed' | 'error';

export default function ProcessingSectionRefactored({ onVideoProcessed }: ProcessingSectionProps) {
  // Form state
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [videoPreview, setVideoPreview] = useState<VideoPreview | null>(null);
  
  // Pipeline state
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [error, setError] = useState<string>("");
  
  // Stage tracking
  const [stages, setStages] = useState<Stage[]>([
    {
      id: 'extract',
      name: 'Extracción de Décimas',
      description: 'Identificar y extraer todas las décimas del video',
      status: 'pending'
    },
    {
      id: 'validate',
      name: 'Validación Métrica',
      description: 'Verificar estructura silábica y detectar sinalefas',
      status: 'pending'
    },
    {
      id: 'analyze',
      name: 'Análisis Cultural',
      description: 'Analizar rima, temas culturales y patrones lingüísticos',
      status: 'pending'
    }
  ]);
  
  // Results state
  const [processedDecimas, setProcessedDecimas] = useState<DecimaSchema[]>([]);
  const [rhymeResults, setRhymeResults] = useState<RhymeValidationResult[]>([]);
  const [selectedDecimaIndex, setSelectedDecimaIndex] = useState<number>(0);

  // Load API key from localStorage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openrouter_api_key');
      if (saved) setApiKey(saved);
    }
  });

  // Update stage status
  const updateStage = useCallback((stageId: string, status: StageStatus, error?: string) => {
    setStages(prev => prev.map(s => 
      s.id === stageId ? { ...s, status, error } : s
    ));
  }, []);

  // Validate YouTube URL
  const validateAndPreviewUrl = useCallback(async (url: string) => {
    if (!url.trim()) return;

    setPipelineStage('validating');
    setError("");
    
    try {
      const response = await fetch('/api/validate-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al validar el enlace');
      }

      setVideoPreview(data);
      setPipelineStage('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al validar el enlace');
      setPipelineStage('error');
      setVideoPreview(null);
    }
  }, []);

  // Save API key to localStorage
  const saveApiKey = useCallback((key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('openrouter_api_key', key);
    }
  }, []);

  // Main processing pipeline
  const runPipeline = useCallback(async () => {
    if (!videoPreview || !apiKey) {
      setError("Por favor proporciona el enlace de YouTube y la clave API");
      return;
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-or-')) {
      setError('Clave API inválida. Debe comenzar con "sk-or-"');
      return;
    }

    // Save API key
    saveApiKey(apiKey);

    // Reset state
    setError("");
    setProcessedDecimas([]);
    setRhymeResults([]);
    
    try {
      // ============================================================
      // STAGE 1: EXTRACTION
      // ============================================================
      setPipelineStage('extracting');
      updateStage('extract', 'active');
      
      console.log('🚀 Stage 1: Extracting décimas...');
      const extractionResult = await extractDecimas(apiKey, youtubeUrl);
      
      if (!extractionResult.decimas || extractionResult.decimas.length === 0) {
        throw new Error('No se encontraron décimas en el video');
      }
      
      console.log(`✅ Extracted ${extractionResult.decimas.length} décimas`);
      updateStage('extract', 'completed');
      
      // ============================================================
      // STAGE 2: VALIDATION
      // ============================================================
      setPipelineStage('validating-metrics');
      updateStage('validate', 'active');
      
      console.log('🚀 Stage 2: Validating metrics...');
      const validationResult = await validateMetrics(apiKey, extractionResult.decimas);
      
      console.log('✅ Metrics validated');
      updateStage('validate', 'completed');
      
      // ============================================================
      // STAGE 3: CULTURAL ANALYSIS
      // ============================================================
      setPipelineStage('analyzing');
      updateStage('analyze', 'active');
      
      console.log('🚀 Stage 3: Analyzing cultural context...');
      const analysisResult = await analyzeCultural(
        apiKey,
        extractionResult.decimas,
        validationResult.decimas
      );
      
      if (!analysisResult.decimas || analysisResult.decimas.length === 0) {
        throw new Error('No se pudo completar el análisis cultural');
      }
      
      console.log('✅ Cultural analysis completed');
      updateStage('analyze', 'completed');
      
      // ============================================================
      // CLIENT-SIDE VALIDATION
      // ============================================================
      console.log('🔍 Running client-side validations...');
      
      // Validate rhyme schemes
      const rhymeValidations = analysisResult.decimas.map(decima => 
        validateRhymeScheme(decima.versos)
      );
      
      // Validate syllable counts (double-check LLM work)
      const syllableValidations = analysisResult.decimas.map(decima =>
        validateDecimaSyllables(decima.versos)
      );
      
      // Log validation results
      rhymeValidations.forEach((result, idx) => {
        if (!result.valid) {
          console.warn(`⚠️ Décima ${idx + 1}: Rhyme validation failed`, result.errors);
        }
      });
      
      syllableValidations.forEach((result, idx) => {
        if (!result.valid) {
          console.warn(`⚠️ Décima ${idx + 1}: Syllable count issues on verses:`, result.invalidVerses);
        }
      });
      
      // ============================================================
      // SAVE TO DATABASE
      // ============================================================
      console.log('💾 Saving to database...');
      const saveResponse = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          youtubeId: videoPreview.youtubeId,
          title: videoPreview.title,
          duration: videoPreview.duration,
          thumbnailUrl: videoPreview.thumbnailUrl,
          analysisResult: analysisResult
        })
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Error al guardar resultados');
      }

      const { videoId } = await saveResponse.json();
      
      // ============================================================
      // SUCCESS - UPDATE UI
      // ============================================================
      setProcessedDecimas(analysisResult.decimas);
      setRhymeResults(rhymeValidations);
      setPipelineStage('completed');
      
      console.log('✅ Pipeline completed successfully!');
      
      // Navigate to results after delay
      setTimeout(() => onVideoProcessed(videoId), 1500);
      
    } catch (err) {
      console.error('❌ Pipeline error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido durante el procesamiento';
      setError(errorMessage);
      setPipelineStage('error');
      
      // Mark current stage as error
      const currentStage = stages.find(s => s.status === 'active');
      if (currentStage) {
        updateStage(currentStage.id, 'error', errorMessage);
      }
    }
  }, [videoPreview, apiKey, youtubeUrl, updateStage, stages, saveApiKey, onVideoProcessed]);

  const isProcessing = ['validating', 'extracting', 'validating-metrics', 'analyzing'].includes(pipelineStage);
  const canProcess = videoPreview && apiKey && !isProcessing;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#C8A05C] mb-4 font-serif">
          🤖 Procesamiento con IA Multi-Etapa
        </h2>
        <p className="text-[#5C4033]/80 max-w-3xl mx-auto">
          Sistema avanzado de análisis con validación automática en 3 etapas: 
          <strong className="text-[#C8A05C]"> Extracción → Validación → Análisis Cultural</strong>.
          Utiliza tu clave API de OpenRouter para acceder a modelos Claude, GPT-4 o Gemini.
        </p>
      </div>

      <Card className="p-8 max-w-4xl mx-auto cuban-card">
        <div className="space-y-6">
          {/* Step 1: YouTube URL */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C8A05C] text-white text-sm font-bold">
                1
              </div>
              <label htmlFor="youtube-url" className="text-sm font-bold text-[#5C4033]">
                Enlace de YouTube
              </label>
            </div>
            <div className="flex gap-3">
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onBlur={() => validateAndPreviewUrl(youtubeUrl)}
                className="flex-1 bg-white/90 border-[#C8A05C]/30 focus:border-[#D2691E]"
                disabled={isProcessing}
              />
              <Button
                onClick={() => validateAndPreviewUrl(youtubeUrl)}
                disabled={!youtubeUrl.trim() || isProcessing}
                variant="outline"
                className="border-[#C8A05C] text-[#C8A05C] hover:bg-[#C8A05C] hover:text-white"
              >
                {pipelineStage === 'validating' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Validar'
                )}
              </Button>
            </div>
          </div>

          {/* Video Preview */}
          {videoPreview && (
            <Card className="p-4 bg-[#F5E6D3]/50 border-[#C8A05C]/20">
              <div className="flex gap-4 items-start">
                <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={videoPreview.thumbnailUrl}
                    alt={videoPreview.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#5C4033] line-clamp-2 mb-1">
                    {videoPreview.title}
                  </h3>
                  <p className="text-sm text-[#5C4033]/70">
                    Duración: {videoPreview.duration}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: API Key */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C8A05C] text-white text-sm font-bold">
                2
              </div>
              <label htmlFor="api-key" className="text-sm font-bold text-[#5C4033]">
                Clave API de OpenRouter
              </label>
            </div>
            <div className="flex gap-3">
              <Input
                id="api-key"
                type="password"
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-white/90 border-[#C8A05C]/30 focus:border-[#D2691E]"
                disabled={isProcessing}
              />
              <Button
                onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
                variant="outline"
                className="border-[#5C4033] text-[#5C4033] hover:bg-[#5C4033] hover:text-white"
              >
                <Key className="w-4 h-4 mr-2" />
                Obtener Clave
              </Button>
            </div>
            <p className="text-xs text-[#5C4033]/70">
              Obtén una clave gratuita en openrouter.ai. Tu clave se guarda localmente (no se envía a nuestros servidores).
            </p>
          </div>

          {/* Process Button */}
          <Button
            onClick={runPipeline}
            disabled={!canProcess}
            className="w-full cuban-button text-lg py-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : pipelineStage === 'completed' ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                ¡Completado!
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Iniciar Pipeline de IA
              </>
            )}
          </Button>

          {/* Stage Indicator */}
          {(isProcessing || pipelineStage === 'completed') && (
            <div className="mt-6">
              <StageIndicator stages={stages} />
            </div>
          )}

          {/* Success Message */}
          {pipelineStage === 'completed' && processedDecimas.length > 0 && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">
                    ¡Análisis completado con éxito! {processedDecimas.length} décimas procesadas
                  </p>
                  <p className="text-sm">
                    Navega a las otras secciones para ver los resultados detallados.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Error Message */}
          {error && pipelineStage === 'error' && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-3 text-red-800">
                <AlertCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold mb-2">Error durante el procesamiento</p>
                  <pre className="text-sm whitespace-pre-wrap font-sans bg-white/50 p-3 rounded border border-red-200">
                    {error}
                  </pre>
                </div>
              </div>
            </Card>
          )}

          {/* Model Selection Info */}
          <Card className="p-4 bg-[#C8A05C]/10 border-[#C8A05C]/30">
            <p className="text-sm text-[#5C4033]">
              <strong>💡 Modelos Disponibles:</strong> OpenRouter te da acceso a múltiples modelos:
            </p>
            <ul className="text-sm text-[#5C4033] mt-2 space-y-1 ml-4">
              <li>✓ <strong>Claude 3.5 Sonnet</strong> (Recomendado para análisis literario)</li>
              <li>✓ GPT-4 (Excelente para contexto cultural)</li>
              <li>✓ Gemini Pro (Rápido y económico)</li>
              <li>✓ Control total sobre temperatura y tokens</li>
            </ul>
          </Card>
        </div>
      </Card>

      {/* Rhyme Visualization */}
      {pipelineStage === 'completed' && processedDecimas.length > 0 && rhymeResults.length > 0 && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-[#C8A05C] font-serif">
            Vista Previa de Resultados
          </h3>
          
          {/* Décima selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {processedDecimas.map((_, idx) => (
              <Button
                key={idx}
                onClick={() => setSelectedDecimaIndex(idx)}
                variant={selectedDecimaIndex === idx ? "default" : "outline"}
                className={selectedDecimaIndex === idx ? "bg-[#C8A05C]" : ""}
              >
                Décima {idx + 1}
              </Button>
            ))}
          </div>
          
          {/* Show rhyme visualization for selected décima */}
          {rhymeResults[selectedDecimaIndex] && (
            <RhymeVisualizer
              result={rhymeResults[selectedDecimaIndex]}
              verses={processedDecimas[selectedDecimaIndex].versos}
            />
          )}
        </div>
      )}
    </div>
  );
}
