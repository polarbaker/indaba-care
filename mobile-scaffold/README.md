# Indaba Care Mobile App

This is the mobile application scaffold for Indaba Care, designed to be implemented with React Native and Expo. The scaffold provides the foundation for building a full mobile version of the Indaba Care web application.

## Overview

The mobile application will share core functionality with the web app:
- User authentication
- Offline-first architecture using WatermelonDB
- Child profile management
- Schedule tracking
- Photo capture and sharing
- Resource hub access
- Multi-language support

## Shared Architecture

The mobile app is designed to share as much code as possible with the web application:
- Common TypeScript interfaces and types
- Shared business logic and validation functions
- Authentication mechanisms
- Data models

## Development Setup

1. After implementing the complete scaffold, install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm start
   ```

3. Run on iOS simulator:
   ```bash
   npm run ios
   ```

4. Run on Android simulator:
   ```bash
   npm run android
   ```

## Offline Capabilities

The mobile app uses WatermelonDB for offline storage, which provides:
- Efficient querying
- Data synchronization
- Relationship handling
- Conflict resolution

## Shared Code Structure

The shared code between web and mobile will be organized in a `/shared` directory in the main project, with imports as needed in the mobile application.
