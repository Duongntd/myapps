# MyApps - README

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication → Google provider
   - Create a Firestore database (start in test mode)
   - Get your Firebase config from Project Settings
   - Update `src/firebase/config.ts` with your Firebase configuration

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── layout/         # Layout components (Header, etc.)
├── views/              # Page components
│   ├── Home.vue        # MyApps home page
│   └── ReadTracker/    # Read Tracker app views
├── router/             # Vue Router configuration (TypeScript)
├── stores/             # Pinia stores (state management, TypeScript)
├── firebase/           # Firebase configuration and services (TypeScript)
└── main.ts             # Application entry point
```

## Firebase Setup

1. Create a Firebase project
2. Enable Google Authentication
3. Create Firestore database
4. Copy your config to `src/firebase/config.ts`

Example config structure:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
}
```

## Features

### MyApps Platform
- Home page listing all available apps
- Navigation between apps

### Read Tracker (In Development)
- Dashboard (coming soon)
- Reading Sessions (coming soon)
- Books Management (coming soon)
- Goals Tracking (coming soon)
- Settings & Reminders (coming soon)

## Development

The project uses:
- Vue 3 with Composition API and TypeScript
- Vue Router for routing
- Pinia for state management
- TypeScript for type safety
- Firebase for backend services
- Vite for build tooling

## License

MIT
