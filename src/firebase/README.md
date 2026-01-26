# Firebase Configuration

Replace the values in `src/firebase/config.ts` with your Firebase project configuration.

You can find your Firebase config in:
Firebase Console > Project Settings > Your apps > Web app > Config

Example:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "myapp-12345.firebaseapp.com",
  projectId: "myapp-12345",
  storageBucket: "myapp-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
}
```
