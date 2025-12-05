# 🚀 El Guajiro de Hialeah - Referencia Rápida

## 📦 Archivos Disponibles

1. **CODIGO_COMPLETO_APP.md** (206 KB) - Código completo de todos los archivos
2. **CODIGO_COMPLETO_APP.pdf** (273 KB) - Versión PDF del código completo
3. **CODE_OVERVIEW.md** (7.4 KB) - Resumen ejecutivo de la estructura
4. **CODE_OVERVIEW.pdf** (44 KB) - Versión PDF del resumen
5. **QUICK_REFERENCE.md** - Este archivo

---

## 🎯 Inicio Rápido

### 1. Estructura del Proyecto

```
nextjs_space/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout raíz
│   ├── page.tsx           # Página principal
│   ├── globals.css        # Estilos globales
│   └── api/               # API endpoints
├── components/            # Componentes React
│   ├── hero-section.tsx
│   ├── main-app.tsx
│   ├── education-section.tsx  (12 biografías)
│   └── ui/                # Shadcn UI components
├── lib/                   # Utilidades y helpers
│   ├── db.ts             # Cliente Prisma
│   ├── perplexity-parser.ts
│   └── types.ts
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
└── public/
    └── calixto-gonzalez-hero.jpg
```

### 2. Comandos Esenciales

```bash
# Instalación
cd /home/ubuntu/el_guajiro_de_hialeah/nextjs_space
yarn install

# Base de datos
yarn prisma generate
yarn prisma migrate dev

# Desarrollo
yarn dev  # http://localhost:3000

# Producción
yarn build
yarn start
```

### 3. Variables de Entorno (.env)

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

---

## 📊 Arquitectura de Componentes

```
┌─────────────────────────────────────────┐
│           app/layout.tsx                │
│  (Root Layout con Playfair Display)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│            app/page.tsx                 │
│   ┌─────────────────────────────────┐  │
│   │    <HeroSection />              │  │
│   │  (Foto de Calixto González)    │  │
│   └─────────────────────────────────┘  │
│   ┌─────────────────────────────────┐  │
│   │      <MainApp />                │  │
│   │  ┌─────────────────────────┐   │  │
│   │  │ <NavigationTabs />      │   │  │
│   │  └─────────────────────────┘   │  │
│   │  ┌─────────────────────────┐   │  │
│   │  │ Tab Content:            │   │  │
│   │  │ - ProcessingSection     │   │  │
│   │  │ - DecimalsSection       │   │  │
│   │  │ - AnalysisSection       │   │  │
│   │  │ - ExportSection         │   │  │
│   │  │ - EducationSection      │   │  │
│   │  │ - AboutModal            │   │  │
│   │  └─────────────────────────┘   │  │
│   └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🗄️ Esquema de Base de Datos

```prisma
model Video {
  id            String   @id @default(cuid())
  youtubeUrl    String   @unique
  title         String
  status        ProcessingStatus
  decimas       Decima[]
  poets         Poet[]
  analysis      Analysis?
}

model Poet {
  id          String   @id
  name        String
  videoId     String
  decimas     Decima[]
}

model Decima {
  id              String   @id
  number          Int
  lines           String[]  // 10 versos
  rhymeScheme     String   // ABBAACCDDC
  videoId         String
  poetId          String
  isTopThree      Boolean
}

model Analysis {
  id                  String   @id
  videoId             String   @unique
  summaryThemes       String?
  recurringThemes     String?
  culturalSignificance String?
}
```

---

## 🎨 Paleta de Colores

```css
/* Tema Cubano Vintage */
--gold: #C8A05C;        /* Títulos principales */
--terracotta: #D2691E;  /* Acentos */
--brown: #5C4033;       /* Texto */
--beige: #F5E6D3;       /* Fondos */
--cream: #E6D7C1;       /* Alternativo */
```

---

## 🌐 API Endpoints

### GET `/api/video/[id]/decimas`
Obtiene las décimas de un video

### GET `/api/video/[id]/analysis`
Obtiene el análisis completo

### POST `/api/validate-youtube`
Valida una URL de YouTube
```json
{
  "youtubeUrl": "https://youtube.com/watch?v=..."
}
```

### POST `/api/process-video`
Procesa resultados de Perplexity
```json
{
  "videoId": "cuid...",
  "perplexityResults": "..."
}
```

### GET `/api/video/[id]/export/text`
Exporta análisis como texto

### GET `/api/video/[id]/export/pdf`
Exporta análisis como PDF

### POST `/api/video/[id]/share`
Genera enlace compartible

---

## 📚 Componentes Clave

### hero-section.tsx
- Imagen de Calixto González a pantalla completa
- Título "Calixto González"
- Subtítulo "El Guajiro de Hialeah"
- Badge vintage "EST 1936"

### education-section.tsx
12 biografías expandibles de maestros:
- Vicente Espinel (1550-1624)
- El Cucalambé (1829-1861)
- Plácido (1809-1844)
- El Indio Naborí (1922-2005)
- Angelito Valiente (1916-1987)
- Francisco Riverón Hernández (1917-1975)
- Justo Vega (1909-1993)
- Adolfo Alfonso (1925-2012)
- Chanito Isidrón (1903-1992)
- Omar Mirabal (1955-presente)
- Tomasita Quiala (1960-2025)
- Julio Pablo El Príncipe Pinareño

### processing-section.tsx
Flujo de trabajo:
1. Input de URL de YouTube
2. Validación de URL
3. Generación de prompt para Perplexity
4. Modal con prompt maestro
5. Input para resultados de Perplexity
6. Parsing y almacenamiento

---

## 🔍 Funciones Clave

### lib/perplexity-parser.ts
```typescript
export function parsePerplexityResults(text: string): {
  decimas: ParsedDecima[];
  analysis: Analysis;
}
```

### lib/syllable-counter.ts
```typescript
export function countSyllables(line: string): number
export function detectSinalefa(line: string): string[]
```

### lib/rhyme-validator.ts
```typescript
export function validateRhymeScheme(
  lines: string[]
): {
  scheme: string;
  isValid: boolean;
}
```

---

## 🚀 Próximos Pasos

Para acceder al código completo:
1. Abre `/home/ubuntu/CODIGO_COMPLETO_APP.pdf`
2. Revisa `/home/ubuntu/CODE_OVERVIEW.pdf` para el resumen

Para modificar la app:
1. Navega a `/home/ubuntu/el_guajiro_de_hialeah/nextjs_space`
2. Edita los archivos necesarios
3. Ejecuta `yarn dev` para ver cambios en tiempo real

---

**Generado**: $(date)
**Ubicación del Proyecto**: /home/ubuntu/el_guajiro_de_hialeah

