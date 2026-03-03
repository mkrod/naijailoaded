interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
    id_token: string;
}


interface GoogleRefreshTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    id_token?: string;
}


interface GoogleIdTokenPayload {
    iss: string;             // Issuer
    azp: string;             // Authorized party (client ID)
    aud: string;             // Audience (client ID)
    sub: string;             // Unique Google user ID
    email: string;           // User email
    email_verified: boolean; // Whether email is verified
    at_hash: string;         // Access token hash
    name: string;            // Full name
    picture: string;         // Profile picture URL
    given_name: string;      // First name
    family_name: string;     // Last name
    iat: number;             // Issued at timestamp (seconds)
    exp: number;             // Expiration timestamp (seconds)
}


export type { GoogleTokenResponse, GoogleRefreshTokenResponse, GoogleIdTokenPayload };