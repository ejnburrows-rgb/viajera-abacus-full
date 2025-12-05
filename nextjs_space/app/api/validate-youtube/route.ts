import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

interface VideoInfo {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  
  return null;
}

async function getVideoInfo(youtubeId: string): Promise<VideoInfo> {
  try {
    // Usar oEmbed API de YouTube (no requiere API key)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ViajeroDigital/1.0)',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Video no encontrado o no disponible');
      }
      throw new Error('Error al obtener información del video');
    }

    const data = await response.json();
    
    return {
      id: youtubeId,
      title: data.title || 'Video de YouTube',
      duration: 'Duración no disponible',
      thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    };
  } catch (error) {
    // Fallback: devolver info básica sin hacer request
    console.log('Using fallback video info:', error);
    return {
      id: youtubeId,
      title: 'Video de YouTube',
      duration: 'Ver en YouTube',
      thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL de YouTube requerida' },
        { status: 400 }
      );
    }

    const youtubeId = extractYouTubeId(url.trim());
    
    if (!youtubeId) {
      return NextResponse.json(
        { error: 'URL de YouTube inválida. Asegúrate de usar un enlace válido de YouTube.' },
        { status: 400 }
      );
    }

    // Validar que el ID no sea muy corto o largo
    if (youtubeId.length < 5 || youtubeId.length > 20) {
      return NextResponse.json(
        { error: 'ID de YouTube inválido. Verifica el enlace.' },
        { status: 400 }
      );
    }

    const videoInfo = await getVideoInfo(youtubeId);

    return NextResponse.json({
      youtubeId,
      title: videoInfo.title,
      duration: videoInfo.duration,
      thumbnailUrl: videoInfo.thumbnailUrl,
      youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`
    });

  } catch (error) {
    console.error('YouTube validation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    if (errorMessage.includes('Video no encontrado') || errorMessage.includes('no disponible')) {
      return NextResponse.json(
        { error: 'Este video no está disponible o es privado' },
        { status: 404 }
      );
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return NextResponse.json(
        { error: 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Error al validar el video de YouTube. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
