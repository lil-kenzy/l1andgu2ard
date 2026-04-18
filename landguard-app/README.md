# Landguard Mobile App

React Native mobile application for Landguard property management platform. Built with Expo for cross-platform iOS and Android support.

## Features

### Authentication
- Email/phone login and registration
- OTP verification
- Role-based authentication (buyer, seller, admin)
- Persistent session management with AsyncStorage

### Buyer Experience
- Interactive property explorer with map view
- Advanced property search with filters
- Property detail pages
- Favorites and alerts system
- User profile management

### Seller Experience
- Multi-step property listing wizard
- Property management dashboard
- Sales analytics and statistics
- Document and media uploads
- Business profile management

### Admin Experience
- System dashboard with key metrics
- Property verification queue
- Dispute management system
- User management and moderation

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation with Expo Router
- **State Management**: React Hooks (useState, useContext)
- **Maps**: React Native Maps with Leaflet integration
- **Storage**: AsyncStorage for local persistence
- **HTTP Client**: Axios with interceptors
- **Styling**: React Native StyleSheet + NativeWind
- **UI Components**: Custom components (Button, TextInput, Card, ParcelCard)

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI globally installed: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Or Expo Go app on physical device

### Installation

1. **Clone and navigate to app directory**
   ```bash
   cd landguard-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend URL
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device/emulator**
   - iOS: Press `i` in terminal
   - Android: Press `a` in terminal
   - Or scan QR code with Expo Go app

## Project Structure

```
landguard-app/
├── app/                           # Expo Router entry point
├── screens/                       # Screen components
│   ├── auth/                     # Auth flows (Login, Register, OTP, Onboarding)
│   ├── buyer/                    # Buyer app screens
│   ├── seller/                   # Seller app screens
│   └── admin/                    # Admin app screens
├── components/                    # Reusable UI components
│   ├── Button.tsx
│   ├── TextInput.tsx
│   ├── Card.tsx
│   └── ...
├── lib/                          # Business logic & utilities
│   ├── auth.ts                   # Session management
│   ├── api.ts                    # API client & endpoints
│   └── theme.ts                  # Design tokens
├── utils/                        # Helper functions
│   └── helpers.ts
├── types.ts                      # TypeScript type definitions
├── App.tsx                       # Root navigation component
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## API Integration

The app connects to the Landguard backend at `http://localhost:5000/api` (configurable via `.env.local`).

### Implemented API Endpoints

#### Authentication
- `POST /auth/login` - Sign in with email/password
- `POST /auth/register` - Create new account
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/token-refresh` - Refresh authentication token
- `POST /auth/logout` - Sign out

#### Properties
- `GET /properties` - List all properties
- `GET /properties/:id` - Get property details
- `POST /properties` - Create new listing
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property
- `GET /properties/search` - Search properties

#### Users
- `GET /users/profile` - Get logged-in user profile
- `PUT /users/profile` - Update profile
- `POST /users/profile-image` - Upload profile picture

#### Analytics
- `GET /analytics/seller` - Get seller statistics
- `GET /analytics/properties/:id` - Get property analytics

#### Transactions & Notifications
- `GET /transactions` - List user transactions
- `GET /notifications` - List user notifications

## Key Components

### Session Management (`lib/auth.ts`)
- `getClientSession()` - Retrieve current user session
- `setClientSession(role, token)` - Persist session
- `clearClientSession()` - Clear session (logout)
- `normalizeRole(input)` - Validate and normalize user role
- `getRoleHome(role)` - Get role-specific dashboard route

### API Client (`lib/api.ts`)
- Axios instance with automatic token attachment
- Interceptors for 401 token refresh
- Organized endpoint groups: authAPI, propertiesAPI, usersAPI, etc.

### UI Components
- **Button**: Variant support (primary, secondary, outline, danger), sizes (sm, md, lg), loading state
- **TextInput**: Label, error display, required field indicator, dark mode support
- **Card**: Elevated cards with optional onPress
- **ParcelCard**: Property listing card with image, price, status badge, verification indicator

## Dark Mode

The app supports system-level dark mode (iOS 13+, Android 10+). Components use `useColorScheme()` from React Native to automatically adapt styling.

## State Management

This app uses React Hooks for state management:
- Component-level state with `useState`
- Side effects with `useEffect`
- Context API ready for global state (Theme, Auth, etc.)

For larger features, consider upgrading to Redux or Zustand.

## Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## Building for Production

### iOS
```bash
npm run prebuild
npm run build -- --platform ios
```

### Android
```bash
npm run prebuild
npm run build -- --platform android
```

## Troubleshooting

### Port Issues
If port 19000 is in use:
```bash
npm start -- --port 19001
```

### Cache Issues
```bash
npm start -- --clear
```

### Module Resolution
```bash
npm install
npx expo doctor
```

### Map Not Loading
Ensure MapView is wrapped in `ScrollView` and locations are valid GPS coordinates (e.g., Ghana: 5-12°N, -3-2°W).

## Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Submit pull request

## Next Steps

- [x] Core authentication flow
- [x] Buyer dashboard and property exploration
- [x] Seller listing wizard with multi-step form
- [x] Admin verification and dispute management
- [ ] Real-time messaging with WebSocket
- [ ] Payment integration (Stripe/PayPal)
- [ ] Push notifications (Expo Notifications)
- [ ] Offline mode with local sync
- [ ] Enhanced map features (Mapbox integration)
- [ ] Video property tours
- [ ] Document OCR scanning
- [ ] Blockchain verification layer

## License

Proprietary - Landguard

## Support

For issues and questions, contact: support@landguard.com
