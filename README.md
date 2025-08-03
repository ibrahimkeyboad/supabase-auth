# AgriLink - Complete Authentication System

A comprehensive authentication system built with Supabase Auth and Google OAuth integration for React Native/Expo applications.

## 🚀 Features

- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **Supabase Auth**: Secure authentication backend with session management
- **TypeScript Support**: Full type safety for authentication flows
- **Cross-Platform**: Works on Web, iOS, and Android
- **Error Handling**: Comprehensive error states and user feedback
- **Session Management**: Automatic token refresh and session persistence
- **Auth Guards**: Protected routes with automatic redirects
- **User Profile**: Complete user information display and management

## 📋 Prerequisites

Before setting up the authentication system, ensure you have:

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Google OAuth App**: Set up OAuth credentials in Google Cloud Console
3. **Environment Variables**: Configure your Supabase credentials

## ⚙️ Setup Instructions

### 1. Supabase Configuration

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure Google OAuth**:
   - In your Supabase dashboard, go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials:
     - Client ID
     - Client Secret

3. **Set Redirect URLs**:
   - Add your app's redirect URLs in Supabase:
     - For web: `http://localhost:8081/auth/callback`
     - For production: `https://yourdomain.com/auth/callback`

### 2. Google Cloud Console Setup

1. **Create OAuth 2.0 Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Configure Authorized Redirect URIs**:
   - Add your Supabase auth callback URL:
     - `https://your-project-ref.supabase.co/auth/v1/callback`

### 3. Environment Variables

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install Dependencies

The required dependencies are already included in `package.json`:

```bash
npm install
```

## 🏗️ Architecture

### Core Components

1. **AuthContext**: Centralized authentication state management
2. **AuthService**: Authentication operations and API calls
3. **GoogleSignInButton**: Reusable Google sign-in component
4. **AuthGuard**: Route protection component
5. **UserProfile**: User information display component

### File Structure

```
├── types/auth.ts                 # TypeScript type definitions
├── lib/auth.ts                   # Authentication service layer
├── contexts/AuthContext.tsx      # React context for auth state
├── components/auth/
│   ├── GoogleSignInButton.tsx    # Google sign-in button
│   ├── AuthGuard.tsx            # Route protection
│   └── UserProfile.tsx          # User profile display
├── app/
│   ├── auth/callback.tsx        # OAuth callback handler
│   ├── (onboarding)/auth.tsx    # Authentication screen
│   └── _layout.tsx              # Root layout with AuthProvider
```

## 🔐 Security Features

### Row Level Security (RLS)
- All database tables have RLS enabled
- User data is automatically filtered by authentication state
- Secure API endpoints with proper authorization

### Session Management
- Automatic token refresh
- Secure session storage
- Proper session cleanup on sign-out

### Error Handling
- Comprehensive error states
- User-friendly error messages
- Graceful fallbacks for network issues

## 📱 Usage Examples

### Basic Authentication Flow

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <GoogleSignInButton />
      )}
    </div>
  );
}
```

### Protected Routes

```typescript
import AuthGuard from '@/components/auth/AuthGuard';

function ProtectedScreen() {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  );
}
```

### User Profile Display

```typescript
import UserProfile from '@/components/auth/UserProfile';

function ProfileScreen() {
  return (
    <View>
      <UserProfile showSignOut={true} />
    </View>
  );
}
```

## 🔧 Customization

### Styling
All components use the app's design system and can be customized through the `styles` prop or by modifying the component stylesheets.

### Error Handling
Customize error messages and handling in the `AuthContext` and `AuthService` files.

### Additional Providers
Extend the authentication system by adding more OAuth providers in the Supabase dashboard and updating the `AuthService`.

## 🚀 Deployment

### Web Deployment
1. Build your app: `npm run build:web`
2. Deploy to your hosting provider
3. Update redirect URLs in Supabase and Google Console

### Mobile Deployment
1. Build with EAS: `eas build`
2. Configure deep linking for OAuth callbacks
3. Update redirect URLs for production

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Redirect Issues**:
   - Verify redirect URLs in both Supabase and Google Console
   - Check that URLs match exactly (including protocols)

2. **Session Not Persisting**:
   - Ensure AsyncStorage is properly configured
   - Check that the AuthProvider wraps your entire app

3. **Google Sign-in Fails**:
   - Verify Google OAuth credentials in Supabase
   - Check that Google+ API is enabled
   - Ensure client ID and secret are correct

### Debug Mode
Enable debug logging by adding console.log statements in the AuthService methods.

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.