# MyApps - README

A platform for multiple app ideas, starting with **Read Tracker** - a comprehensive reading time tracking application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account (free tier available)

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up Firebase:**
   - Create a `.env` file in the root directory
   - Copy `.env.example` and fill in your Firebase configuration
   - See `SETUP.md` for detailed Firebase setup instructions

3. **Start development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

5. **Deploy to Firebase Hosting:**
```bash
npm run deploy
```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[USER_GUIDE.md](./USER_GUIDE.md)** - User documentation for Read Tracker
- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Project planning and milestones
- **[CHECKLIST.md](./CHECKLIST.md)** - Quick reference checklist

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── common/         # Common UI components
│   ├── layout/         # Layout components
│   └── ReadTracker/    # Read Tracker specific components
├── views/              # Page components
│   ├── Home.vue        # MyApps home page
│   └── ReadTracker/    # Read Tracker app views
├── router/             # Vue Router configuration
├── stores/             # Pinia stores (state management)
├── firebase/           # Firebase configuration and services
├── composables/        # Vue composables
└── assets/             # Static assets
```

## ✨ Features

### MyApps Platform
- Home page listing all available apps
- Navigation between apps
- Google authentication

### Read Tracker
- 📊 **Dashboard**: Overview of reading statistics, charts, and goals
- 📖 **Reading Sessions**: Track daily reading time with detailed history
- 📚 **Books Management**: Add, edit, and manage your reading list
- 🎯 **Goals**: Set and track daily/weekly/monthly/yearly reading goals
- ⚙️ **Settings**: Account management and preferences

## 🛠️ Technology Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript
- **Routing**: Vue Router 4
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + vue-chartjs
- **Backend**: Firebase (Authentication, Firestore, Hosting, Analytics)
- **Build Tool**: Vite
- **Date Handling**: date-fns

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and deploy to Firebase Hosting
- `npm run deploy:hosting` - Deploy only hosting (after build)

## 🔧 Development

### Environment Variables

Create a `.env` file with:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication
3. Create Firestore database (start in test mode)
4. Enable Firebase Hosting
5. Copy configuration to `.env` file

See `SETUP.md` for detailed instructions.

## 🚢 Deployment

The app is configured for Firebase Hosting. See `DEPLOYMENT.md` for:
- Deployment steps
- Environment variable configuration
- Custom domain setup
- Troubleshooting

## 📱 Mobile Optimization

The application is fully optimized for mobile devices with:
- Responsive design
- Touch-friendly interactions
- Mobile-optimized charts
- Adaptive layouts

## 🔒 Security

- Environment variables for sensitive configuration
- Firebase security rules for data access
- HTTPS enforced via Firebase Hosting
- Security headers configured

## 📊 Analytics

Firebase Analytics is integrated to track:
- User engagement
- Page views
- Custom events

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📄 License

MIT

## 🙏 Acknowledgments

Built with Vue 3, Firebase, and modern web technologies.


