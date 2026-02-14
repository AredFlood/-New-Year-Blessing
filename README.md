# AI New Year Blessings App (2026 Horse Year Edition)

A full-stack AI-powered application for generating personalized Chinese New Year blessings. Built with React, Express, Supabase, and DeepSeek AI.

![Dashboard Preview](dashboard_screenshot.png)

## Features

- 🧧 **AI Generation**: Personalized blessings based on relationship and memories (using DeepSeek V3).
- 📱 **Contact Management**: Store and manage contacts via Supabase.
- 🎨 **Festive UI**: 2026 Year of the Horse themed interface with dragon/lion dance motifs.
- 📥 **Batch Import**: Import contacts via text paste (Image parsing available with compatible models).
- ⚡ **Modern Stack**: Vite + React + TailwindCSS + Express backend.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Express, Node.js
- **Database**: Supabase (PostgreSQL)
- **AI**: DeepSeek API (OpenAI-compatible)

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase project
- A DeepSeek API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/new-year-blessings-ai.git
   cd new-year-blessings-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   DEEPSEEK_API_KEY=your_deepseek_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   # SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (Optional, for backend admin tasks)
   ```

4. Setup Database:
   Run the SQL script located at `supabase/schema.sql` in your Supabase project's SQL Editor to create the necessary tables.

### Running the App

Run both frontend (port 3000) and backend (port 3001) concurrently:

```bash
npm run dev:all
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)

## License

MIT
