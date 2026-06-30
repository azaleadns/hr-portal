# HR Portal

A Human Resources (HR) Portal built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. The application provides an intuitive interface for managing applicants, job postings, recruitment workflows, templates, and HR dashboards.

---

## Features

- 📊 HR Dashboard
- 👥 Applicant Tracking System (ATS)
- ➕ Add Candidate Management
- 💼 Open Job Listings
- 📝 Post New Positions
- 📄 Document & Template Management
- 🔐 Login Interface
- 📈 Recruitment Analytics
- 🔄 Google Sheets Synchronization
- 📱 Responsive Design

---

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Chart.js
- Express
- Google GenAI SDK
- HTML2PDF
- Mammoth
- Docx Preview

---

## Project Structure

```text
src/
├── components/
│   ├── Dashboard
│   ├── ApplicantTracker
│   ├── OpenJobs
│   ├── Templates
│   ├── Login
│   ├── Sidebar
│   ├── AddCandidateModal
│   ├── ApplicantDetailModal
│   └── PostPositionModal
│
├── data/
│   └── mockData.ts
│
├── utils/
│   └── googleSheetsSync.ts
│
├── App.tsx
├── main.tsx
└── types.ts
```

---

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd hr-portal
```

### Install dependencies

```bash
npm install
```

---

## Environment Variables

Copy the example environment file.

```bash
cp .env.example .env.local
```

Add your API keys and configuration.

```env
GEMINI_API_KEY=your_api_key_here
```

---

## Running the Project

Start the development server.

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Available Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run linting |
| `npm run clean` | Clean build artifacts |

---

## Main Modules

### Dashboard
Displays recruitment metrics and HR statistics.

### Applicant Tracker
Manage applicants throughout the hiring pipeline.

### Open Jobs
View and manage available job positions.

### Templates
Manage HR document templates.

### Candidate Management
Add, update, and organize candidate information.

### Google Sheets Integration
Synchronize recruitment data with Google Sheets.

---

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Chart.js
- React Router
- Express
- Google Generative AI
- HTML2PDF
- Mammoth
- Docx Preview

---

