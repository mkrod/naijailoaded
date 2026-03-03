import type { GoogleTokenResponse } from "../../types/google.types.js";

const getTokenWithCode = async (code: string): Promise<GoogleTokenResponse> => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
    }

    const data: GoogleTokenResponse = await response.json();
    return data;
}

const longTermTokenExchange = async (token: string): Promise<GoogleTokenResponse> => {
    // For Google OAuth2, long-term tokens are typically obtained via refresh tokens.
    // This function assumes 'token' is a refresh token.
    return await refreshGoogleToken(token);
}

const refreshGoogleToken = async (refreshToken: string): Promise<GoogleTokenResponse> => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            grant_type: 'refresh_token',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to exchange refresh token for new tokens');
    }

    const data: GoogleTokenResponse = await response.json();
    return data;
}

export { getTokenWithCode, longTermTokenExchange };