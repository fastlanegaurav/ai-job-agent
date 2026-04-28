# 🤖 GK AI Job Application Agent

> A live, AI-powered job search and application agent built on Gaurav Kumar's CV.  
> Searches for relevant DevOps / Cloud / TPM roles and auto-generates tailored cover letters, form data, and interview talking points — powered by Claude AI.

**Live Demo:** https://gaurav0090.github.io/ai-job-agent

---

## ✨ Features

| Feature | Description |
|---|---|
| **Job Search** | AI-generated realistic job listings matching your query + location |
| **Skill Matching** | Each listing scored against your CV (high / medium / low %) |
| **Auto-Apply** | One click → generates full cover letter + form data + talking points |
| **Cover Letter** | Standalone generator with tone control (formal, confident, startup, technical) |
| **Application Log** | Track every application with draft / sent status |
| **CV Profile** | Full profile dashboard with achievements and skills |

---

## 🚀 Quick Start (5 minutes)

### Step 1 — Clone the repo

```bash
git clone https://github.com/gaurav0090/ai-job-agent.git
cd ai-job-agent
```

### Step 2 — Open locally

No build step needed — this is a pure HTML/CSS/JS app.

```bash
# Option A: Python server
python3 -m http.server 8080
# Then open http://localhost:8080

# Option B: Node.js (npx)
npx serve .

# Option C: Just double-click index.html (works for most features)
```

### Step 3 — Deploy to GitHub Pages (free, live URL)

1. Push this repo to your GitHub account
2. Go to **Settings → Pages**
3. Set Source → **Deploy from branch: main, folder: / (root)**
4. Your live URL: `https://YOUR_USERNAME.github.io/ai-job-agent`

---

## 🔑 API Key Setup

The agent uses the **Anthropic Claude API** (free tier available).

### How to add your API key

The app calls the Anthropic API directly from the browser using the claude.ai embedded proxy when running inside Claude chat. For standalone deployment:

**Option A: Environment variable via Netlify/Vercel (recommended)**
- Deploy to Netlify or Vercel
- Add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`
- Use a serverless function (see `api/generate.js` below)

**Option B: GitHub Actions secret (for CI/CD builds)**
```yaml
# .github/workflows/deploy.yml — see workflow file
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

**Option C: Prompt at runtime (simplest for personal use)**

Add this to the top of `js/agent.js`:
```javascript
const ANTHROPIC_API_KEY = localStorage.getItem('gk_api_key') 
  || prompt('Enter your Anthropic API key:');
localStorage.setItem('gk_api_key', ANTHROPIC_API_KEY);
```

Then add the key to fetch headers:
```javascript
headers: {
  "Content-Type": "application/json",
  "x-api-key": ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01"
}
```

Get your free API key at: https://console.anthropic.com

---

## 📁 Project Structure

```
ai-job-agent/
├── index.html              # Main app (single-page)
├── css/
│   └── style.css           # All styles (dark theme, responsive)
├── js/
│   ├── cv-data.js          # Gaurav's complete CV data
│   ├── agent.js            # AI agent logic (search, match, generate)
│   └── app.js              # UI controller (tabs, rendering, log)
├── api/
│   └── generate.js         # Serverless function (Netlify/Vercel)
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deploy workflow
├── .gitignore
└── README.md
```

---

## 🛠 How It Works

```
User types job query
       ↓
searchJobsAI() → Claude API generates 6 realistic job listings
       ↓
scoreMatch()   → Each job scored against CV skillKeywords array
       ↓
User clicks Auto-Apply
       ↓
generateApplicationPackage() → Claude API generates:
  ├── Cover letter (4 paragraphs, tailored to company + role)
  ├── Form data (all fields pre-filled from CV)
  ├── Match analysis (skill gaps, fit assessment)
  └── Interview talking points (5 role-specific bullet points)
```

---

## 🎯 Customization

### Update CV data

Edit `js/cv-data.js` — all candidate information is centralized there:

```javascript
const CV = {
  name:     "Your Name",
  title:    "Your Title",
  email:    "your@email.com",
  // ... all fields
};
```

### Add real job board APIs

Replace the `searchJobsAI()` function in `js/agent.js` with real API calls:

```javascript
// Naukri.com (requires partner API access)
// LinkedIn Jobs API (requires LinkedIn Developer account)
// Indeed Publisher API (requires Indeed Publisher account)
// Adzuna API (free tier available — adzuna.in)
```

### Change AI model

In `js/agent.js`:
```javascript
const AGENT_CONFIG = {
  model: "claude-opus-4-6",  // Change model here
  // ...
};
```

---

## 📦 Deploy Options

### GitHub Pages (free)
```bash
git add .
git commit -m "Initial commit"
git push origin main
# Enable Pages in repo Settings
```

### Netlify (free, custom domain)
```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

### Vercel (free, instant)
```bash
npm install -g vercel
vercel --prod
```

---

## 🔧 Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES2020) — no framework, no build step
- **AI Engine:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Fonts:** IBM Plex Mono + Sora (Google Fonts)
- **Deployment:** GitHub Pages / Netlify / Vercel
- **CI/CD:** GitHub Actions

---

## 📄 License

MIT — free to use and modify.

---

## 👤 Author

**Gaurav Kumar** · DevOps Engineer & Technical Project Manager  
📧 gaurav04099@gmail.com · 🔗 [linkedin.com/in/gaurav0090](https://linkedin.com/in/gaurav0090)  
📍 Bengaluru, India
