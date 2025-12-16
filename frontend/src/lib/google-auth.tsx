'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

// Replace with your Google OAuth Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        // Skip Google OAuth if not configured
        return <>{children}</>;
    }

    return (
        <GoogleOAuthProvider
            clientId={GOOGLE_CLIENT_ID}
            onScriptLoadError={() => console.log('Google OAuth script failed to load')}
        >
            {children}
        </GoogleOAuthProvider>
    );
}
