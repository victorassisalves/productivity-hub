# Productivity Hub

A next-generation productivity platform that integrates multiple time management methodologies into a unified, intelligent task management system with enhanced collaboration and user experience.

## Features

- **Multiple productivity frameworks** including:
  - Pomodoro technique
  - Eisenhower Matrix for task prioritization
  - Time Blocking
  - Smart Goals
  - Focus Mode
  - GTD (Getting Things Done) Workflow
  - Activity Analytics

- **Team collaboration** capabilities:
  - User management with authentication
  - Team workspaces
  - Project sharing
  - Task assignments
  - Activity logs and notifications

- **AI-powered features**:
  - Task optimization suggestions
  - Smart scheduling
  - Productivity insights and analytics
  - Pattern recognition for productivity habits

## Tech Stack

- **Frontend**:
  - React.js with TypeScript
  - Tailwind CSS for styling
  - shadcn UI components
  - Context API for state management
  - React Query for data fetching
  - Responsive design for all devices

- **Backend**:
  - Firebase Authentication
  - Firestore for database
  - Express.js server
  - RESTful API structure

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account with Firestore enabled

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/productivity-hub.git
   cd productivity-hub
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express API
- `/shared` - Shared types and utilities
- `/assets` - Static assets like images

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.