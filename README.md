# FlightAnalytics Dashboard

A comprehensive, interactive data analytics dashboard for US domestic flight on-time performance — built as a final project for a Data Analytics course.

**Live demo:** https://arystan01.github.io/flight-analytics-dashboard/

---

## Overview

This dashboard analyzes **583,985 domestic flights** across **346 airports**, **5,535 routes**, and **17 airlines** in January 2019 — revealing patterns in delays, cancellations, and punctuality.

![Dashboard Preview](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80&fit=crop)

---

## Features

### 5 Interactive Pages

| Page | What it shows |
|------|--------------|
| **Overview** | Animated KPI counters, delay breakdown donut, disruption cascade chart, dataset metadata |
| **Airlines** | On-time rankings for all 17 carriers, cancellation chart, airline logos, sortable grid |
| **Airports** | Top 20 hubs by departures with city photos, OTP table, performance comparison |
| **Routes** | Live US map with animated flight arcs, airport dots sized by traffic, route detail panel |
| **Timing** | Delay curve by hour, weekly pattern, Jan calendar heatmap, distance bucket analysis |

### Key Interactions
- 🗺️ **Interactive US map** — click arcs or airport dots to explore route details
- 🔍 **Route search** — filter the 20 busiest routes by airport code
- 🔄 **Flip button** — instantly switch to the reverse route (LAX→SFO ↔ SFO→LAX)
- 🌙 **Dark mode** — persists across sessions via localStorage
- 📊 **National avg reference lines** — every route compared to the 75.62% national baseline

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite |
| Charts | Recharts |
| Map | react-simple-maps (geoAlbersUsa projection) |
| Styling | CSS custom properties (light + dark themes) |
| Data prep | Python · pandas |
| Deployment | GitHub Pages via GitHub Actions |

---

## Dataset

**Source:** Bureau of Transportation Statistics (BTS) — On-Time Performance  
**File:** `Jan_2019_ontime.csv` — 583,985 rows · 73 columns · 73 MB  
**Preprocessed to:** `public/data.json` — 17 KB  

**On-time definition:** Arrived within 15 minutes of scheduled arrival time (FAA/BTS standard)

### Key Findings
- **75.62%** of flights arrived on time in January 2019
- **54%** of disrupted flights had *both* a departure and arrival delay — the ripple effect of late pushback
- **Hawaiian Airlines** led all carriers at **85.98%** on-time; JetBlue trailed at **65.2%**
- **6am departures** had just **6.97%** delay rate vs **24.64%** at 7pm
- **ATL** was the nation's busiest hub with **31,155** departures

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/arystan01/flight-analytics-dashboard.git
cd flight-analytics-dashboard

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

### Data Preprocessing (optional)

The preprocessed `public/data.json` is already included. To regenerate from the raw CSV:

```bash
# Place Jan_2019_ontime.csv in the project root, then:
python preprocess.py
```

Requires Python 3 with `pandas` installed.

---

## Project Structure

```
flight-dashboard/
├── public/
│   └── data.json          # Preprocessed flight data (17 KB)
├── src/
│   ├── pages/
│   │   ├── Overview.jsx
│   │   ├── AirlinesPage.jsx
│   │   ├── AirportsPage.jsx
│   │   ├── RoutesPage.jsx
│   │   └── TimingPage.jsx
│   ├── components/
│   │   ├── Nav.jsx
│   │   ├── Footer.jsx
│   │   ├── CarrierPerformance.jsx
│   │   ├── DelayByTimeBlock.jsx
│   │   ├── WeeklyPattern.jsx
│   │   └── DailyTrend.jsx
│   ├── cityPhotos.js       # Unsplash photo ID mapping
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── preprocess.py           # pandas CSV → JSON pipeline
└── vite.config.js
```

---

## License

MIT — free to use for academic and personal projects.
