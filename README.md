# Indaba Care

Indaba Care is an offline-first web application for childcare management, built with Next.js, TypeScript, and Firebase. It enables parents and nannies to manage childcare activities effectively, even with limited internet connectivity.

## Features

- **Offline-First**: Works without internet connection; data syncs automatically when online
- **Parent Preferences & Child Profiles**: Manage child information, schedules, and medical details
- **Resource Hub**: Access educational resources for childcare
- **Nanny Hours & Schedule Tracking**: Track childcare sessions and activities
- **Photo Capture & Sharing**: Securely capture and share photos with family members
- **In-App Feedback**: Submit suggestions or report issues
- **Multi-Language Support**: Interface available in multiple languages
- **PWA Capabilities**: Install on devices and access offline

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Chakra UI
- **State Management**: React Query
- **Offline Storage**: PouchDB
- **Backend**: Firebase (Auth, Firestore, Storage)
- **PWA**: Workbox for service worker
- **Internationalization**: next-i18next

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/indaba-care.git
   cd indaba-care
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication (Email/Password and Google Sign-in)
3. Create a Firestore database
4. Set up Firebase Storage
5. Configure Firestore security rules (samples provided in `/firebase/firestore.rules`)
6. Configure Storage security rules (samples provided in `/firebase/storage.rules`)

## Project Structure

```
/
├── public/               # Static files
│   ├── locales/          # Translation files
│   └── icons/            # PWA icons
├── src/
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utility functions
│   │   ├── firebase.ts   # Firebase initialization
│   │   ├── db.ts         # PouchDB setup
│   │   └── sync.ts       # Sync functionality
│   ├── pages/            # Next.js pages
│   ├── styles/           # Global styles
│   └── types/            # TypeScript type definitions
├── next.config.js        # Next.js configuration
├── next-i18next.config.js # i18n configuration
└── package.json
```

## Offline Capabilities

Indaba Care uses PouchDB for local storage and a custom sync mechanism to synchronize data with Firebase when the device is online. The application includes:

- Visual indicators for online/offline status
- Local storage of all user actions
- Background synchronization
- Conflict resolution strategies

## Deployment

### Vercel Deployment

The easiest way to deploy Indaba Care is using [Vercel](https://vercel.com/):

1. Push your code to a Git repository (GitHub, GitLab, BitBucket)
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

To build the application for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be in the `.next` folder.

## Mobile App Development

For the React Native mobile version:

1. Use Expo to initialize the project:
   ```bash
   expo init indaba-care-mobile --template blank --npm
   ```

2. Copy shared code (components, hooks, utils) into the React Native project

3. Replace web-specific APIs:
   - FileReader → expo-file-system
   - HTML input → react-native-image-picker

4. Configure offline storage with WatermelonDB or expo-sqlite

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Next.js
- Firebase
- PouchDB
- Chakra UI
- React Query
- Workbox
