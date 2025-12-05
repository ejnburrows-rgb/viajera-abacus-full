"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Loader2, Play, FileText, Sparkles } from "lucide-react";
import Image from "next/image";
import { PromptModal } from "./prompt-modal";

interface ProcessingSectionProps {
  onVideoProcessed: (videoId: string) => void;
}

interface VideoPreview {
  title: string;
  duration: string;
  thumbnailUrl: string;
  youtubeId: string;
}

type ProcessingStage = 'idle' | 'validating' | 'parsing' | 'completed' | 'error';

export default function ProcessingSection({ onVideoProcessed }: ProcessingSectionProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState<VideoPreview | null>(null);
  const [perplexityResult, setPerplexityResult] = useState("");
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [error, setError] = useState<string>("");
  const [processedInfo, setProcessedInfo] = useState<{decimasCount: number; poetsCount: number} | null>(null);

  const validateAndPreviewUrl = useCallback(async (url: string) => {
    if (!url.trim()) return;

    setProcessingStage('validating');
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
      setProcessingStage('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al validar el enlace');
      setProcessingStage('error');
      setVideoPreview(null);
    }
  }, []);

  const handleOpenPromptModal = () => {
    if (!youtubeUrl.trim()) {
      setError("Por favor pega primero el enlace de YouTube");
      return;
    }
    setPromptModalOpen(true);
  };

  const processPerplexityResult = useCallback(async () => {
    if (!videoPreview || !perplexityResult.trim()) {
      setError("Por favor pega el resultado de Perplexity");
      return;
    }

    setProcessingStage('parsing');
    setError("");

    try {
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          youtubeUrl: youtubeUrl.trim(),
          youtubeId: videoPreview.youtubeId,
          title: videoPreview.title,
          duration: videoPreview.duration,
          thumbnailUrl: videoPreview.thumbnailUrl,
          perplexityResult: perplexityResult.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Error al procesar el resultado';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Mostrar warnings si existen
      if (data.warnings && data.warnings.length > 0) {
        console.log('Advertencias del parser:', data.warnings);
      }

      // Guardar información del procesamiento
      setProcessedInfo({
        decimasCount: data.decimasCount || 0,
        poetsCount: data.poetsCount || 0
      });

      setProcessingStage('completed');
      setTimeout(() => onVideoProcessed(data.videoId), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error durante el procesamiento');
      setProcessingStage('error');
      setProcessedInfo(null);
    }
  }, [videoPreview, youtubeUrl, perplexityResult, onVideoProcessed]);

  const isProcessing = processingStage === 'validating' || processingStage === 'parsing';

  return (
    <>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#C8A05C] mb-4 font-serif">
            🌴 Procesar Transcripción con Perplexity
          </h2>
          <p className="text-[#5C4033]/80 max-w-3xl mx-auto">
            Este app usa tu suscripción de Perplexity existente para transcribir y analizar décimas. 
            Es <strong className="text-[#C8A05C]">100% GRATIS</strong> - solo copia el prompt, úsalo en Perplexity.ai, 
            y pega el resultado aquí para formatearlo profesionalmente.
          </p>
        </div>

        <Card className="p-8 max-w-3xl mx-auto cuban-card">
          <div className="space-y-6">
            {/* Step 1: YouTube URL */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C8A05C] text-white text-sm font-bold">
                  1
                </div>
                <label htmlFor="youtube-url" className="text-sm font-bold text-[#5C4033]">
                  Pega el enlace de YouTube
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
                  {processingStage === 'validating' ? (
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

            {/* Step 2: Get Prompt */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C8A05C] text-white text-sm font-bold">
                  2
                </div>
                <label className="text-sm font-bold text-[#5C4033]">
                  Obtén el Prompt Maestro
                </label>
              </div>
              <Button
                onClick={handleOpenPromptModal}
                disabled={!youtubeUrl.trim() || isProcessing}
                variant="outline"
                className="w-full border-[#5C4033] text-[#5C4033] hover:bg-[#5C4033] hover:text-white py-6"
              >
                <FileText className="w-5 h-5 mr-2" />
                Obtener Prompt para Perplexity
              </Button>
              <p className="text-xs text-[#5C4033]/70 text-center">
                Copia el prompt, pégalo en Perplexity.ai con tu enlace de YouTube, y espera el análisis completo
              </p>
            </div>

            {/* Step 3: Paste Result */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C8A05C] text-white text-sm font-bold">
                  3
                </div>
                <label htmlFor="perplexity-result" className="text-sm font-bold text-[#5C4033]">
                  Pega el resultado de Perplexity aquí
                </label>
              </div>
              <Textarea
                id="perplexity-result"
                placeholder="Pega aquí TODO el análisis generado por Perplexity (décimas, análisis, etc.)..."
                value={perplexityResult}
                onChange={(e) => setPerplexityResult(e.target.value)}
                className="min-h-[300px] bg-white/90 border-[#C8A05C]/30 focus:border-[#D2691E] font-mono text-sm"
                disabled={isProcessing}
              />
              <p className="text-xs text-[#5C4033]/70">
                Asegúrate de copiar TODO el resultado, incluyendo décimas, análisis y estructura métrica
              </p>
            </div>

            {/* Process Button */}
            <Button
              onClick={processPerplexityResult}
              disabled={!videoPreview || !perplexityResult.trim() || isProcessing}
              className="w-full cuban-button text-lg py-6"
            >
              {processingStage === 'parsing' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Formateando resultado...
                </>
              ) : processingStage === 'completed' ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  ¡Completado!
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Procesar y Formatear
                </>
              )}
            </Button>

            {/* Success Message */}
            {processingStage === 'completed' && processedInfo && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="font-semibold">¡Análisis formateado con éxito!</p>
                    <p className="text-sm">
                      Se detectaron <strong>{processedInfo.decimasCount} décimas</strong> de <strong>{processedInfo.poetsCount} poeta(s)</strong>.
                    </p>
                    <p className="text-sm mt-1">
                      Navega a <strong>"Décimas Formateadas"</strong> para verlas todas,
                      y a <strong>"Análisis Completo"</strong> para el análisis profundo y texto completo.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Error Message */}
            {error && processingStage === 'error' && (
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="flex items-start gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Error al procesar el resultado</p>
                    <pre className="text-sm whitespace-pre-wrap font-sans bg-white/50 p-3 rounded border border-red-200">
                      {error}
                    </pre>
                  </div>
                </div>
              </Card>
            )}

            {/* Info Box */}
            <Card className="p-4 bg-[#C8A05C]/10 border-[#C8A05C]/30">
              <p className="text-sm text-[#5C4033]">
                <strong>💡 ¿Por qué este método?</strong> Usar tu cuenta de Perplexity directamente te da:
              </p>
              <ul className="text-sm text-[#5C4033] mt-2 space-y-1 ml-4">
                <li>✓ Acceso a Claude Sonnet 4.5 (el mejor modelo para análisis literario)</li>
                <li>✓ Costo $0 (usa tu suscripción existente)</li>
                <li>✓ Control total sobre el proceso</li>
                <li>✓ Resultados formateados profesionalmente en este app</li>
              </ul>
            </Card>
          </div>
        </Card>
      </div>

      <PromptModal 
        open={promptModalOpen} 
        onOpenChange={setPromptModalOpen}
        youtubeUrl={youtubeUrl}
      />
    </>
  );
}
