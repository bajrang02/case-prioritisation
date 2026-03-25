# Legal Case Priority System

An AI-driven intelligent legal case management and prioritization system designed to assist Courts, Judges, and Clerks in handling and streamlining their workloads. It automatically assigns priority scores to cases based on multiple parameters, including fundamental rights, custody status, precedents, and public interest.

## Features

- **Role-Based Access:** Distinct portals for Admins, Judges, and Clerks.
- **AI Case Prioritization:** Uses Gemini AI to analyze case details and determine urgency/priority scores.
- **Interactive Dashboards:** Visual insights on case status, priority distribution, and court efficiency.
- **Secure Authentication:** Basic approval-based registration loop.

## Technology Stack

- **Frontend:** React.js, Vite, Chart.js for visualizations.
- **Backend:** Node.js, Express.js.
- **Database:** SQLite3.
- **AI Integration:** Google Gemini API (`@google/genai`).

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v16+ recommended) installed on your machine.

## Installation & Setup

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd legal-case-system
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory of the project (if it doesn't exist already) and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY="your_google_gemini_api_key_here"
   ```
   *You can get an API key from [Google AI Studio](https://aistudio.google.com/apikey).*

## Running the Application

This project requires running both the backend API server and the frontend Vite development server simultaneously.

**Terminal 1: Start the Backend Server**
```bash
npm run server
```
*The backend will start running on `http://localhost:3001`.*

**Terminal 2: Start the Frontend Application**
Open a new terminal window/tab, ensure you are in the project folder, and run:
```bash
npm run dev
```
*Vite will start the frontend development server, typically on `http://localhost:5173`. Open this URL in your browser to view the app.*

## Default Flow
- Register a new account on the Login/Signup screen.
- Wait for the **Admin** to approve your account.
- Once approved, log in with your credentials to view the dashboard and manage cases.
