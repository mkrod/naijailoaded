export interface UserData {
    [key: string]: any; // Dynamic fields for user data
}


export interface Name {
    first: string;
    last: string;
}

export interface User {
    id: number;
    user_id: string;
    /**
     * JSON parse to
     * {
        first: string;
        last: string;
    }
     */
    name: string;
    username?: string;
    avatar?: string;
    email: string;
    role: "user" | "admin";
    password: string;
    user_data: UserData;
    created_at: Date;
}