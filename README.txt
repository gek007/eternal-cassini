### IMPORTANT !!! Read carefully !!! 

# RSS Reader - Setup and Usage Guide

A modern RSS feed reader that aggregates your favorite feeds in a beautiful card-based interface.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
```bash
cd c:\Users\DELL-PC\.gemini\antigravity\playground\eternal-cassini
```

2. Install dependencies (if not already installed):
```bash
npm install
```

## Running the Application

The application consists of two servers that need to run simultaneously:

### Step 1: Start the Backend Server

Open a terminal and run:
```bash
npm run server
```

You should see:
```
🚀 RSS Reader API Server running on http://localhost:3000
📡 Ready to fetch RSS feeds!
```

**Keep this terminal running!**

### Step 2: Start the Frontend Server

Open a **NEW** terminal (keep the backend running) and run:
```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

### Step 3: Open the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Using the Application

1. **Add a Feed**: Enter an RSS feed URL in the input field and click "Add Feed"
   - Example feeds to try:
     - Hacker News: `https://news.ycombinator.com/rss`
     - The Verge: `https://www.theverge.com/rss/index.xml`
     - TechCrunch: `https://techcrunch.com/feed/`

2. **View Articles**: Articles from all subscribed feeds are displayed in a card-based grid, sorted by most recent first

3. **Refresh Feeds**: Click "Refresh All" to update all feeds with the latest articles

4. **Remove a Feed**: Click the "✕" button next to a feed name to unsubscribe

## Features

- ✨ Modern dark mode UI with glassmorphism effects
- 📰 Subscribe to unlimited RSS/Atom feeds
- 🔄 Automatic feed aggregation and sorting
- 💾 Persistent storage (feeds saved in browser localStorage)
- 🎨 Beautiful card-based article display
- 📱 Responsive design for all screen sizes
- ⚡ Fast and lightweight

## Troubleshooting

### Port Already in Use

If you see an error that port 3000 or 5173 is already in use:

**For port 3000 (backend):**
```bash
# Find the process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual process ID)
Stop-Process -Id PID -Force
```

**For port 5173 (frontend):**
```bash
# Find the process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with the actual process ID)
Stop-Process -Id PID -Force
```

### Feed Won't Load

- Make sure both servers are running
- Check that the RSS feed URL is valid and accessible
- Some feeds may have CORS restrictions or be temporarily unavailable

### Data Persistence

- Your subscribed feeds are stored in browser localStorage
- Clearing browser data will remove your subscriptions
- Each browser maintains its own separate list of feeds

## Project Structure

```
eternal-cassini/
├── server.js          # Backend Express server (CORS proxy)
├── index.html         # Main HTML structure
├── style.css          # Design system and styles
├── main.js            # Frontend application logic
├── package.json       # Dependencies and scripts
└── README.txt         # This file
```

## Future Enhancements

- Ollama LLM integration for daily report generation (planned)
- Article search and filtering
- Feed categories and organization
- Export/import feed subscriptions
- Dark/light mode toggle

## Support

For issues or questions, check the implementation plan or contact the development team.

---

**Enjoy your RSS reading experience! 📰✨**
