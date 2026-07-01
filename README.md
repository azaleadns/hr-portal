# HR Portal

A Human Resources (HR) Portal built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. The application provides an intuitive interface for managing applicants, job postings, recruitment workflows, templates, and HR dashboards.

---

# Features

- 📊 HR Dashboard
- 👥 Applicant Tracking System (ATS)
- ➕ Candidate Management
- 💼 Open Job Listings
- 📝 Job Posting Management
- 📄 Document & Template Management
- 📈 Recruitment Analytics
- 🔄 Google Sheets Synchronization
- 📱 Responsive User Interface

---

# Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend
- Express.js

### Libraries
- Chart.js
- Google GenAI SDK
- HTML2PDF
- Mammoth
- Docx Preview

---

# Project Structure

```text
src/
├── components/
│   ├── Dashboard/
│   ├── ApplicantTracker/
│   ├── OpenJobs/
│   ├── Templates/
│   ├── Login/
│   ├── Sidebar/
│   ├── AddCandidateModal/
│   ├── ApplicantDetailModal/
│   └── PostPositionModal/
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

# Requirements

Before running the project, make sure the following are installed:

- Node.js 18 or later
- npm 9 or later
- Git
- A modern web browser (Google Chrome, Microsoft Edge, Firefox, or Safari)
- Internet connection (required for Google APIs and AI features)

---

# Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
```

## 2. Go to the Project Folder

```bash
cd hr-portal
```

## 3. Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env.local` file in the project root.

Example:

```env
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key.

---

# Running the Project

Start the development server.

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:3000
```

---

# Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

# Available Scripts

| Command | Description |
|----------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

# How to Use

### Login

Open the application and sign in using your account credentials.

### Account

Username: hr_portal
Password: [portal2026]

### Dashboard

The dashboard displays recruitment statistics and hiring metrics.

### Applicant Tracker

- Add new applicants
- View applicant information
- Update applicant status
- Track recruitment progress

### Job Management

- View available job openings
- Create new job postings
- Edit or remove job listings

### Templates

Manage HR document templates used during recruitment.

### Google Sheets Integration

If configured, recruitment data can be synchronized with Google Sheets.

---

# Main Modules

## Dashboard

Displays overall hiring statistics and recruitment analytics.

## Applicant Tracker

Allows HR personnel to manage applicants throughout the hiring process.

## Open Jobs

Displays all active job openings.

## Templates

Stores and manages reusable HR document templates.

## Candidate Management

Handles applicant records and profile information.

## Google Sheets Integration

Synchronizes recruitment data with Google Sheets.

---

# Common Errors and Solutions

## 1. npm: command not found

### Cause

Node.js is not installed.

### Solution

Install Node.js from the official website and restart your terminal.

Verify installation:

```bash
node -v
npm -v
```

---

## 2. Module not found

### Cause

Dependencies are missing.

### Solution

```bash
npm install
```

---

## 3. Port 3000 is already in use

### Cause

Another application is using the same port.

### Solution

Run the application on another port.

```bash
npm run dev -- --port 5173
```

---

## 4. Missing GEMINI_API_KEY

### Cause

The environment variable is missing.

### Solution

Create or update `.env.local`.

```env
GEMINI_API_KEY=your_api_key_here
```

Restart the development server afterwards.

---

## 5. Google Sheets Sync Failed

### Possible Causes

- Invalid API credentials
- Google Sheets API is disabled
- Incorrect Spreadsheet ID
- Spreadsheet permissions are not configured properly

### Solution

- Verify API credentials.
- Enable Google Sheets API.
- Check the Spreadsheet ID.
- Ensure the spreadsheet is shared with the appropriate account.

---

## 6. Build Failed

### Solution

Delete existing dependencies and reinstall them.

Windows (Command Prompt)

```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

Linux / macOS

```bash
rm -rf node_modules package-lock.json
npm install
```

Then rebuild.

```bash
npm run build
```

---

# Troubleshooting

If the application does not run correctly:

1. Verify that Node.js is installed.
2. Ensure all dependencies are installed.
3. Check that the `.env.local` file contains the required environment variables.
4. Restart the development server after modifying environment variables.
5. Review terminal and browser console logs for error messages.
6. Reinstall dependencies if necessary.

---

# Future Improvements

- User Authentication
- Role-Based Access Control
- Database Integration
- Resume Parsing
- Interview Scheduling
- Email Notifications
- Calendar Integration
- Export Reports

---

# Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Express.js
- Chart.js
- Google Generative AI SDK
- HTML2PDF
- Mammoth
- Docx Preview