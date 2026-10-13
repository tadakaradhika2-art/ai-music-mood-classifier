# AI Music Mood Classifier 🎵🧠

An AI-powered acoustic psychology web application that classifies the emotional mood, energy dynamics, lyrical themes, and psychological valence of songs using **Google Gemini AI** and **Supabase PostgreSQL**. Built with **Next.js 16 App Router**, **React 19**, **TypeScript**, and **Tailwind CSS**, fully prepared for production deployment on **Vercel**.

---

## 🌟 Key Features

1. **AI-Powered Mood Classification**
   - Classifies songs into primary emotional categories (*Happy*, *Sad*, *Romantic*, *Energetic*, *Calm*, *Angry*, *Nostalgic*, *Motivational*, *Melancholic*, *Peaceful*, *Mysterious*).
   - Generates 2–4 nuanced secondary moods.
   - Calculates qualitative **AI Semantic Fit** confidence scores.
   - Computes **Energy Level** (1–10) and **Emotional Valence** (1–10) scales with visual meters.
   - Extracts overarching lyrical themes and vivid emotional keywords.
   - Suggests real-world listening contexts and recommended activities.

2. **Smart Metadata-Only Fallback**
   - When lyrics are not available, Gemini analyzes the track based on title semantics, artist discography, and genre norms.
   - Explicitly flags results as metadata-only to maintain transparency.

3. **Supabase Database Persistence**
   - Full CRUD support: Create, Read, Update metadata, and Delete analyses.
   - Row Level Security (RLS) policies configured in `supabase/schema.sql`.
   - In-memory development repository fallback ensures the app runs smoothly out-of-the-box before Supabase credentials are configured.

4. **Music Library & Advanced Filtering**
   - Responsive desktop table and mobile cards.
   - Real-time search across song titles, artists, and genres.
   - Instant filtering by mood and genre.
   - Multi-field sorting (Date Analyzed, Title, Energy Level).
   - Server-side pagination.

5. **Track Mood Comparison**
   - Side-by-side acoustic contrast tool comparing energy deltas, valence deltas, and shared themes.
   - AI-generated comparative verdict on how two tracks transition into each other.

6. **Reporting, Analytics & Exporting**
   - Aggregated metrics: Total Analyzed, Dominant Mood, 7-Day Recency, Mood Diversity.
   - SVG-rendered Mood Distribution chart and Energy/Valence breakdown.
   - User Intuition Concordance tracking (comparing user guesses with AI verdicts).
   - Export full library as **CSV** or individual tracks as **JSON**.
   - Print-friendly layout and Save-as-PDF support (`window.print()`).

7. **Modern Dark Dashboard Design**
   - Deep navy background (`#080d1a`), electric violet accents (`#8b5cf6`), cyan highlights (`#06b6d4`).
   - Soundwave audio pulse animations during AI analysis.
   - Fully responsive for mobile devices, tablets, and desktop displays.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom glassmorphism and animations
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Engine**: [Google Gemini AI](https://aistudio.google.com/) via official `@google/genai` SDK
- **Database**: [Supabase](https://supabase.com/) PostgreSQL database with Row Level Security
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📂 Project Architecture

```
├── BUILD_CHECKLIST.md       # 5 mandatory milestone tracking checklist
├── README.md                # Project documentation & deployment manual
├── .env.example             # Environment variable template
├── package.json             # Dependencies and build scripts
├── tsconfig.json            # TypeScript configuration
├── supabase/
│   └── schema.sql           # PostgreSQL table schema, indexes, and RLS policies
└── src/
    ├── app/
    │   ├── layout.tsx       # Root layout with fonts and metadata
    │   ├── page.tsx         # Main dashboard page
    │   ├── globals.css      # Theme variables and animations
    │   ├── dashboard/page.tsx # Dashboard route
    │   ├── library/page.tsx   # Music Library with filters, table, and cards
    │   ├── reports/page.tsx   # Reports, distribution charts, and print view
    │   ├── settings/page.tsx  # System diagnostics and setup status
    │   └── api/
    │       ├── analyze/route.ts  # Gemini AI classification API
    │       ├── songs/route.ts    # List & Create songs API
    │       ├── songs/[id]/route.ts # Get, Patch, Delete song API
    │       ├── reports/route.ts  # Aggregate dashboard metrics API
    │       ├── insights/route.ts # Library AI insights & comparison API
    │       └── settings/route.ts # Safe configuration diagnostics API
    ├── components/
    │   ├── layout/          # Sidebar, Header, and mobile drawer
    │   ├── dashboard/       # StatsOverview, RecentAnalyses, SmartInsights, EmptyState
    │   ├── music/           # SongAnalysisForm, MoodResultCard, Modals (Edit, Delete, Compare)
    │   └── charts/          # MoodDistributionChart, EnergyDistributionChart
    ├── lib/
    │   ├── gemini.ts        # Gemini AI SDK integration and prompts
    │   ├── supabase/        # Supabase client and in-memory fallback layer
    │   ├── validation.ts    # Request and AI JSON schema validation
    │   └── utils.ts         # Formatting, CSV/JSON export utilities, mood metadata
    └── types/
        └── index.ts         # Data models, API contracts, and TypeScript interfaces
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18.0 or newer (v20+ or v24+ recommended)
- **npm**: v9+
- A Google Gemini API Key (free tier available at [Google AI Studio](https://aistudio.google.com/))
- *(Optional for cloud database)* A free [Supabase](https://supabase.com/) account

### 2. Installation

Clone or extract the repository, then install dependencies:

```bash
npm install
```

### 3. Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your credentials:

```ini
# Google Gemini API
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Supabase PostgreSQL Database (Optional for initial demo; app has built-in memory fallback)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 4. Supabase Database Migration (When using Supabase)

1. Navigate to your Supabase Project Dashboard.
2. Open the **SQL Editor** in the left sidebar.
3. Open `supabase/schema.sql` from this repository.
4. Copy and paste the entire script into the SQL Editor and click **Run**.
5. This creates the `songs` table, performance indexes on `primary_mood`, `genre`, and `created_at`, updated timestamp triggers, and Row Level Security policies.

### 5. Running the Application Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Scenarios

| Scenario | Description | Expected Behavior |
| :--- | :--- | :--- |
| **1. Empty Database** | Open dashboard when database contains 0 songs. | Displays onboarding guide without crashing. |
| **2. Analysis with Lyrics** | Analyze a song with valid title and lyrics. | Gemini classifies mood, energy, and valence, and saves to database. |
| **3. Metadata-Only** | Analyze an instrumental or track without lyrics. | Displays explicit "Metadata-Only Analysis" badge and explains stylistic inference. |
| **4. Missing API Key** | Submit form without `GEMINI_API_KEY`. | Displays clear error explaining how to configure the key. No fake data shown. |
| **5. Search & Filter** | Search by title or filter by mood in `/library`. | Instantly filters records from database. |
| **6. Update Metadata** | Edit title/artist via "Edit Metadata". | Updates record safely while preserving AI classification fields. |
| **7. Delete Analysis** | Delete a song analysis from library. | Displays confirmation modal, deletes from database, updates UI. |
| **8. Export Report** | Click "Export CSV" or "Print / Save PDF" in `/reports`. | Downloads valid CSV or opens browser print dialog with print styling. |
| **9. Mobile Responsiveness** | Open on mobile viewport (< 640px). | Clean single-column layout, drawer menu, cards instead of table, zero overflow. |
| **10. Production Build** | Run `npm run build`. | Succeeds with zero TypeScript or compilation errors. |

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your `ai-music-mood-classifier` repository.
4. In the **Environment Variables** section, configure:
   - `GEMINI_API_KEY` = *your Gemini API key*
   - `GEMINI_MODEL` = `gemini-2.5-flash`
   - `NEXT_PUBLIC_SUPABASE_URL` = *your Supabase URL*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *your Supabase anon key*
   - `SUPABASE_SERVICE_ROLE_KEY` = *your Supabase service role key* (optional)
5. Click **Deploy**.
6. Once deployed, test all pages (`/`, `/library`, `/reports`, `/settings`).

---

## 🔒 Security & Privacy Notice

- API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are accessed strictly inside server-side API routes and are never bundled into client JavaScript.
- All song inputs and AI JSON responses are strictly validated and sanitized before database insertion.
- The Settings page provides diagnostics without displaying secret keys.

---

## 📄 License

MIT License. Developed for showcase, portfolio, and educational purposes.
