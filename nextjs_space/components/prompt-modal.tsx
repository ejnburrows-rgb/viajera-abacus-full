
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { useState } from 'react';

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  youtubeUrl: string;
}

const MASTER_PROMPT = `**ROL**: Eres un experto transcriptor especializado en poesía improvisada cubana y décima espinela, con profundo conocimiento de métrica española, rima consonante y estructura poética tradicional.

**TAREA PRINCIPAL**: Transcribir grabaciones de décimas improvisadas (controversias, polémicas, eventos de repentismo) al formato de décima espinela escrita, respetando rigurosamente la estructura métrica y esquema de rima.

**ESTRUCTURA OBLIGATORIA**:
- Esquema de rima: A B B A A C C D D C (rima consonante)
- Métrica: Versos octosílabos (8 sílabas por verso)
- Formato: Cada décima debe tener exactamente 10 versos

**INSTRUCCIONES ESPECÍFICAS**:
1. Identificación de poetas: Cuando el usuario especifique orden, organiza las décimas en ese orden exacto. Incluye encabezados: **[Nombre del Poeta - Título/tema]**. Numera consecutivamente.

2. Proceso de transcripción: Identifica dónde comienza/termina cada décima. Convierte discurso oral en versos de 8 sílabas. Asegura esquema ABBAACCDDC con rima consonante. Corrige errores menores.

3. Verificación de calidad: Cuenta sílabas (debe ser 8). Verifica rima consonante. Asegura coherencia temática. Mantén vocabulario original.

4. Formato de presentación:
   **[1. Poeta X - Tema]**
   
   Verso 1 (A) [8 sílabas]
   Verso 2 (B) [8 sílabas]
   [... hasta verso 10]
   
   ---

5. Manejo de contenido extenso: Organiza por secciones temáticas. Mantén numeración continua. Incluye separadores visuales.

6. Casos especiales: Ajusta con sinéresis/diéresis si es necesario. Busca rima consonante más cercana. Documenta ajustes.

**IDIOMA**: Español, respetando regionalismos cubanos.

**PRIORIDAD**: Precisión métrica > Rima exacta > Sentido literal

Después de transcribir todas las décimas, genera un análisis completo que incluya:
- Un resumen general de la canturía (temáticas, estilos, técnicas)
- Las top 3 décimas de cada poeta con análisis de: dominio técnico, recursos literarios, notas culturales
- Un análisis profundo del evento completo`;

export function PromptModal({ open, onOpenChange, youtubeUrl }: PromptModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MASTER_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando:', err);
    }
  };

  const handleOpenPerplexity = () => {
    window.open('https://www.perplexity.ai', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#F5E6D3] border-2 border-[#C8A05C]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#5C4033] mb-2">
            📋 Prompt Maestro para Perplexity
          </DialogTitle>
          <DialogDescription className="text-[#5C4033]/80">
            Sigue estos pasos para obtener la transcripción y análisis completo:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instrucciones paso a paso */}
          <div className="bg-white/50 p-4 rounded-lg border border-[#C8A05C]/30">
            <h3 className="font-bold text-[#5C4033] mb-3">📍 Pasos a seguir:</h3>
            <ol className="space-y-2 text-sm text-[#5C4033]/90">
              <li className="flex gap-2">
                <span className="font-bold min-w-[24px]">1.</span>
                <span>Copia el prompt maestro abajo haciendo clic en el botón "Copiar Prompt"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold min-w-[24px]">2.</span>
                <span>Abre Perplexity.ai haciendo clic en "Abrir Perplexity"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold min-w-[24px]">3.</span>
                <span>Pega el prompt en el campo de entrada de Perplexity</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold min-w-[24px]">4.</span>
                <span>Añade el enlace de YouTube: <span className="font-mono text-xs bg-white px-2 py-1 rounded">{youtubeUrl}</span></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold min-w-[24px]">5.</span>
                <span>Asegúrate de seleccionar <strong>Claude Sonnet 4.5</strong> como modelo</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold min-w-[24px]">6.</span>
                <span>Envía y espera la respuesta completa de Perplexity</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold min-w-[24px]">7.</span>
                <span>Copia TODO el resultado generado por Perplexity</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold min-w-[24px]">8.</span>
                <span>Vuelve a esta app y pega el resultado en el campo correspondiente</span>
              </li>
            </ol>
          </div>

          {/* Prompt copiable */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#5C4033]">Prompt Maestro:</h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="bg-[#C8A05C] text-white hover:bg-[#C8A05C]/90 border-none"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Prompt
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleOpenPerplexity}
                  variant="outline"
                  size="sm"
                  className="bg-[#5C4033] text-white hover:bg-[#5C4033]/90 border-none"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Perplexity
                </Button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#C8A05C]/30 max-h-96 overflow-y-auto">
              <pre className="text-xs text-[#5C4033] whitespace-pre-wrap font-mono leading-relaxed">
                {MASTER_PROMPT}
              </pre>
            </div>
          </div>

          {/* Nota importante */}
          <div className="bg-[#C8A05C]/10 p-4 rounded-lg border border-[#C8A05C]/30">
            <p className="text-sm text-[#5C4033]">
              <strong>💡 Nota:</strong> Este proceso usa tu suscripción de Perplexity existente, 
              por lo que es completamente <strong>GRATIS</strong>. El app formateará automáticamente 
              el resultado en las secciones de Décimas Formateadas, Análisis Completo y Exportación.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
