# Debt Recovery Frontend

A modern React application for managing debt recovery operations.

## Features

- **Authentication**: User registration and login
- **Dashboard**: Overview of debt recovery statistics
- **Client Management**: Add, edit, and delete debtors
- **Risk Assessment**: Visual risk scoring system
- **Communication Tracking**: Message history and sending
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- React 19
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Lucide React for icons
- React Hot Toast for notifications

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## API Integration

The frontend connects to the backend API running on `http://localhost:5000`. Make sure the server is running before using the application.

## Pages

- `/login` - User authentication
- `/register` - User registration
- `/dashboard` - Overview and statistics
- `/clients` - Client management
- `/clients/:id` - Client details and communication
