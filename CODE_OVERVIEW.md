# 📚 El Guajiro de Hialeah - Resumen del Código

## 🎯 Descripción General

Aplicación web Next.js 14 para análisis de décimas cubanas a partir de videos de YouTube, con integración manual de Perplexity AI.

## 📂 Estructura del Proyecto

```
el_guajiro_de_hialeah/nextjs_space/
├── app/
│   ├── layout.tsx                 # Layout principal de la app
│   ├── page.tsx                   # Página principal
│   ├── globals.css                # Estilos globales
│   └── api/
│       ├── validate-youtube/      # Validación de URLs de YouTube
│       ├── process-video/         # Procesamiento de resultados de Perplexity
│       └── video/[id]/
│           ├── decimas/           # API de décimas
│           ├── analysis/          # API de análisis
│           ├── share/             # API de compartir
│           └── export/
│               ├── text/          # Exportar como texto
│               └── pdf/           # Exportar como PDF
├── components/
│   ├── hero-section.tsx           # Sección hero con foto de Calixto
│   ├── main-app.tsx               # Contenedor principal de la app
│   ├── navigation-tabs.tsx        # Sistema de pestañas
│   ├── processing-section.tsx     # Sección de procesamiento
│   ├── decimals-section.tsx       # Visualización de décimas
│   ├── analysis-section.tsx       # Visualización de análisis
│   ├── export-section.tsx         # Opciones de exportación
│   ├── education-section.tsx      # Educación histórica (12 biografías)
│   ├── about-modal.tsx            # Modal "Acerca de" con biografías
│   ├── prompt-modal.tsx           # Modal con prompt para Perplexity
│   ├── tribute-section.tsx        # Sección de tributo
│   └── ui/                        # Componentes de Shadcn UI (50+ componentes)
├── lib/
│   ├── db.ts                      # Cliente de Prisma
│   ├── utils.ts                   # Utilidades generales
│   ├── types.ts                   # Definiciones de tipos TypeScript
│   ├── perplexity-parser.ts       # Parser de resultados de Perplexity
│   ├── syllable-counter.ts        # Contador de sílabas español
│   ├── rhyme-validator.ts         # Validador de rimas
│   └── openrouter-client.ts       # Cliente de OpenRouter
├── prisma/
│   └── schema.prisma              # Esquema de base de datos
└── public/
    └── calixto-gonzalez-hero.jpg  # Foto principal
```

## 🗄️ Modelos de Base de Datos

### Video
- ID, URL de YouTube, título, duración
- Estado de procesamiento (PENDING, ANALYZING, COMPLETED, ERROR)
- Relaciones: décimas, poetas, análisis

### Poet
- Nombre del poeta
- Número de turno en la controversia
- Relaciones: video, décimas

### Decima
- 10 líneas (versos)
- Esquema de rima (ABBAACCDDC)
- Métricas (octosílabos)
- Análisis técnico, poético, cultural
- Top 3 rankings
- Relaciones: video, poeta

### Analysis
- Resumen (temas, tono, interacción, calidad)
- Análisis profundo (temas recurrentes, regionalismos, improvisación)
- Comparación con el canon
- Significado cultural
- Relación: video

## 🎨 Componentes Principales

### 1. Hero Section
- Imagen de fondo de Calixto González
- Título "Calixto González"
- Subtítulo "El Guajiro de Hialeah"
- Badge vintage "EST 1936"
- Décima de tributo

### 2. Main App
- Sistema de navegación por pestañas
- 6 secciones principales:
  1. **Procesar Transcripción**: Validación de URL y obtención de prompt
  2. **Décimas Formateadas**: Visualización de décimas extraídas
  3. **Análisis Completo**: Análisis detallado de la canturía
  4. **Exportar Resultados**: Opciones de exportación (PDF, texto, compartir)
  5. **Educación Histórica**: Historia de la décima y biografías de poetas
  6. **Acerca de**: Biografía de Calixto González y créditos

### 3. Processing Section
- Campo de entrada para URL de YouTube
- Botón de validación
- Modal con prompt maestro para Perplexity
- Área de texto para pegar resultados
- Parser de resultados de Perplexity

### 4. Education Section
**12 Maestros de la Décima** (biografías expandibles con asterisco):
- Vicente Espinel (1550-1624) - El Arquitecto Original
- El Cucalambé (1829-1861) - Primer Arquitecto de la Cubanización
- Plácido (1809-1844) - Transparencia Trágica
- El Indio Naborí (1922-2005) - Voz Lírica del Siglo XX
- Angelito Valiente (1916-1987) - Teatro en Movimiento
- Francisco Riverón Hernández (1917-1975) - Poeta Pictórico
- Justo Vega (1909-1993) - El Caballero de la Décima
- Adolfo Alfonso (1925-2012) - Compenetración sin Réplica
- Chanito Isidrón (1903-1992) - Fundador de la Novela en Décimas
- Omar Mirabal (1955-presente) - El Cantor del Mayabeque
- Tomasita Quiala (1960-2025) - La Reina del Repentismo
- Julio Pablo El Príncipe Pinareño - Arquitecto de Versos en Tiempo Presente

## 🎨 Paleta de Colores (Tema Cubano Vintage)

- **Dorado/Bronce**: `#C8A05C` (títulos principales, acentos)
- **Terracota**: `#D2691E` (acentos secundarios, bordes)
- **Marrón Oscuro**: `#5C4033` (texto principal)
- **Beige**: `#F5E6D3` (fondos de tarjetas)
- **Crema**: `#E6D7C1` (fondos alternativos)

## 🔧 Tecnologías Principales

- **Framework**: Next.js 14.2.28
- **UI**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.3
- **Database**: PostgreSQL con Prisma 6.7.0
- **UI Components**: Shadcn UI (Radix UI)
- **Icons**: Lucide React 0.446.0
- **Fonts**: Playfair Display (Google Fonts)
- **TypeScript**: 5.2.2

## 🌐 APIs Utilizadas

- **YouTube Data API**: Validación de videos
- **Perplexity**: Análisis de transcripciones (manual)
- **OpenRouter**: Cliente LLM (futuro uso)

## 📊 Flujo de Trabajo

1. Usuario ingresa URL de YouTube
2. App valida la URL y extrae metadata del video
3. App genera prompt maestro para Perplexity
4. Usuario copia prompt y lo pega en Perplexity.ai
5. Usuario copia respuesta de Perplexity
6. Usuario pega respuesta en la app
7. App parsea resultados y extrae décimas
8. App almacena en base de datos
9. Usuario visualiza décimas, análisis y puede exportar

## 🎯 Características Clave

✅ Validación de URLs de YouTube
✅ Generación de prompts para Perplexity
✅ Parser robusto de resultados de Perplexity
✅ Extracción de décimas con metadata completa
✅ Análisis literario profundo
✅ Sistema de Top 3 décimas por poeta
✅ Exportación a PDF y texto
✅ Enlaces compartibles
✅ Sección educativa con biografías expandibles
✅ Diseño responsive vintage cubano
✅ 12 biografías detalladas de maestros de la décima
✅ Sistema de navegación por pestañas

## 📝 Variables de Entorno Requeridas

```bash
DATABASE_URL="postgresql://..."
```

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
yarn install

# Generar cliente de Prisma
yarn prisma generate

# Ejecutar migraciones
yarn prisma migrate dev

# Iniciar servidor de desarrollo
yarn dev

# Build de producción
yarn build

# Iniciar servidor de producción
yarn start
```

## 📄 Archivos Generados

- **CODIGO_COMPLETO_APP.md**: Código completo en Markdown (206 KB)
- **CODIGO_COMPLETO_APP.pdf**: Código completo en PDF
- **CODE_OVERVIEW.md**: Este archivo de resumen

---

**Última Actualización**: 21 de noviembre de 2025
**Versión de la App**: 1.0.0
**Autor**: Desarrollado para preservar el legado de Calixto González

