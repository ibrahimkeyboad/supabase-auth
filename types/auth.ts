export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
    iss?: string;
    name?: string;
    phone_verified?: boolean;
    picture?: string;
    provider_id?: string;
    sub?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  aud?: string;
  confirmation_sent_at?: string;
  confirmed_at?: string;
  created_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  phone?: string;
  role?: string;
  updated_at?: string;
}

export interface AuthSession {
  access_token: string;
  expires_at?: number;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
}

export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}