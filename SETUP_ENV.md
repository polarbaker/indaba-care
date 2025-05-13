# Quick Environment Setup

To get started quickly with Indaba Care, follow these steps to set up your environment.

## 1. Setting Up Firebase

### Option 1: Use the demo Firebase project (Recommended for beginners)

For quick testing and development, we've created a demo Firebase project with the correct security rules. To use it:

1. Copy the contents of `.env.example` to a new file named `.env.local` in the project root:

```bash
cp .env.example .env.local
```

2. The Firebase credentials in `.env.example` point to a read-only demo project that works out of the box.

### Option 2: Use Firebase Emulators (Recommended for development)

Firebase emulators provide a local development environment without requiring a Firebase project.

1. Install the Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Initialize Firebase emulators (from the project root):

```bash
firebase init emulators
```

3. Select the following emulators:
   - Authentication
   - Firestore
   - Storage

4. Start the emulators:

```bash
firebase emulators:start
```

5. Use the emulator configuration already uncommented in `.env.example`:

```
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

### Option 3: Create your own Firebase project

For a fully-functional application with your own data:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google Sign-in)
4. Create a Firestore database
5. Set up Firebase Storage
6. In Project Settings > General > Your apps, click the web icon (</>) to add a web app
7. Register your app and copy the Firebase configuration 
8. Create a `.env.local` file with your new Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 2. Firestore Security Rules

If you're using your own Firebase project, you'll need to set up security rules. Here's a starter set of rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /families/{familyId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.members[request.auth.uid] != null);
    }
    
    match /children/{childId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/families/$(resource.data.familyId)).data.members[request.auth.uid] != null;
    }
    
    match /activities/{activityId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/children/$(resource.data.childId)).data.familyId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.families;
    }
  }
}
```

## 3. Storage Rules

If you're using your own Firebase project, set up these storage rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /families/{familyId}/{allChildren=**} {
      allow read, write: if request.auth != null &&
        request.auth.uid in firestore.get(/databases/(default)/documents/families/$(familyId)).data.members;
    }
    
    match /users/{userId}/{allChildren=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Test User Accounts

For the demo Firebase project, you can use these test credentials:

- Email: demo@indabacare.com
- Password: indaba123

- Email: parent@indabacare.com
- Password: indaba123

- Email: nanny@indabacare.com
- Password: indaba123

## 5. Running the Application

Once you've set up your environment:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit http://localhost:3000 in your browser to see the application!

## 6. Troubleshooting

If you encounter issues:

1. **Firebase Connection Issues**: Check that your `.env.local` file has the correct configuration
2. **Authentication Problems**: Try using the Firebase emulators if the demo project doesn't work
3. **Missing Dependencies**: Make sure you ran `npm install`
4. **Port Already in Use**: Change the port with `npm run dev -- -p 3001` 

For more detailed information, check the `README.md` and `DEVELOPER_GUIDE.md` files.
