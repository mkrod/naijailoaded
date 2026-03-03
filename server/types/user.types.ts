export interface JwtTokenPayload {
    user_id: string;
    email?: string;
    role: "admin" | "user";
}

export interface UserData {
    [key: string]: any; // Dynamic fields for user data
}


export interface User {
    id: number;
    user_id: string;
    name: {
        first: string;
        last: string;
    };
    username?: string;
    avatar?: string;
    email: string;
    role: JwtTokenPayload['role'];
    password: string;
    user_data: UserData;
    created_at: Date;
}