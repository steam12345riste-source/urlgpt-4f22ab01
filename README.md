# URLGPT - URL Shortener

A modern URL shortening service built with React, TypeScript, and Lovable Cloud.

## Features

- 🔗 Shorten long URLs with random alphanumeric codes (1-11 characters)
- ⏰ Automatic 24-hour link expiration with live countdown timers
- 🗑️ Auto-deletion of expired links
- 📊 Maximum 11 shortened URLs per user
- 💾 Persistent storage using Lovable Cloud backend
- 🎨 Dark theme with clean, minimal design

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Bun](https://bun.sh/) (recommended) or npm
- A Lovable Cloud account (for backend features)

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd urlgpt
```

### Step 2: Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### Step 3: Configure Environment Variables

The `.env` file is automatically configured if you're using Lovable Cloud. For local development, ensure these variables are set:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5173
```

**Important:** The `VITE_APP_URL` determines what domain is shown in your shortened URLs:
- For local development: `http://localhost:5173`
- For production on Lovable: `https://urlgpt.lovable.app`
- For custom domain: `https://yourdomain.com`

### Step 4: Start the Development Server

Using Bun:
```bash
bun run dev
```

Or using npm:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 5: Access Your Local URLs

When running locally, shortened URLs will display as:
```
http://localhost:5173/abc123
```

## Deployment Options

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_APP_URL` (your Vercel domain)

Or click this button:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/urlgpt)

### Deploy to Render

1. Connect your GitHub repository to Render
2. Render will automatically detect `render.yaml`
3. Set environment variables in Render dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_APP_URL` (your Render domain)

### Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Set environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_APP_URL` (your Netlify domain)

Or connect your repository in Netlify dashboard for automatic deployments.

### Deploy with Docker

1. Build the Docker image:
   ```bash
   docker build -t urlgpt .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:80 \
     -e VITE_SUPABASE_URL=your_url \
     -e VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
     -e VITE_APP_URL=http://localhost:3000 \
     urlgpt
   ```

Or use Docker Compose:
```bash
docker-compose up -d
```

Make sure to create a `.env` file with your environment variables for Docker Compose.

### Deploy to Lovable (Recommended)

1. Click **Publish** in the Lovable editor
2. Your app is live at `yourproject.lovable.app`
3. Optionally add a custom domain in Settings → Domains

## Using a Custom Domain

### Option 1: Deploy to Lovable with Custom Domain

1. Click the **Publish** button in Lovable
2. Go to Project Settings → Domains
3. Click **Connect Domain** and follow the DNS setup instructions
4. Update `VITE_APP_URL` in your environment to match your domain

### Option 2: Self-Host with Custom Domain

1. Build the production version:
   ```bash
   bun run build
   ```

2. Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

3. Set environment variables on your hosting platform:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_APP_URL=https://yourdomain.com
   ```

4. Configure your DNS to point to your hosting provider

## Database Setup

The app requires a Supabase database with the following table:

```sql
CREATE TABLE public.shortened_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expire_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  short_code TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  user_id TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.shortened_urls ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert shortened URLs" 
  ON public.shortened_urls FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can read shortened URLs" 
  ON public.shortened_urls FOR SELECT 
  USING (true);

CREATE POLICY "Users can delete their own URLs" 
  ON public.shortened_urls FOR DELETE 
  USING (true);
```

If using Lovable Cloud, the database is automatically set up for you.

## Project Structure

```
urlgpt/
├── src/
│   ├── components/        # React components
│   │   ├── UrlShortenerForm.tsx  # Form to create short URLs
│   │   ├── UrlList.tsx           # List of user's URLs
│   │   └── ui/                   # Shadcn UI components
│   ├── pages/            # Route pages
│   │   ├── Index.tsx             # Main page
│   │   ├── Redirect.tsx          # Handles short URL redirects
│   │   └── NotFound.tsx          # 404 page
│   ├── integrations/     # Supabase integration
│   └── App.tsx           # Main app component
├── supabase/             # Database migrations
├── vercel.json           # Vercel deployment config
├── render.yaml           # Render deployment config
├── netlify.toml          # Netlify deployment config
├── Dockerfile            # Docker container config
├── docker-compose.yml    # Docker Compose config
└── public/               # Static assets
```

## How It Works

1. **Creating Short URLs:**
   - User enters a long URL
   - System generates a random code (1-11 characters)
   - URL is stored in database with 24-hour expiration
   - User can create max 11 URLs

2. **Accessing Short URLs:**
   - User visits `yourdomain.com/abc123`
   - App looks up the code in database
   - If found and not expired, redirects to original URL
   - If expired, deletes the link and shows 404

3. **Expiration & Cleanup:**
   - Links expire after 24 hours
   - Live countdown timer shows time remaining
   - Expired links are auto-deleted when viewed or accessed

## Troubleshooting

### URLs not redirecting locally
Make sure `VITE_APP_URL` is set to `http://localhost:5173` in your `.env` file.

### "Failed to load URLs" error
Check that your Supabase credentials are correct in `.env` and the database table exists.

### Links expire too quickly/slowly
The expiration is set in the database migration. To change it, modify the `expire_at` default in the table schema.

### Docker build fails
Ensure you have Docker installed and running. If using Bun in Docker, make sure the base image supports it.

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Lovable Cloud (Supabase)
- **Build Tool:** Vite
- **UI Components:** Shadcn UI
- **Routing:** React Router
- **State Management:** React Hooks

## License

MIT License - feel free to use this project however you'd like!

## Credits

Built with ❤️ by ExploitZ3r0 using Lovable.
