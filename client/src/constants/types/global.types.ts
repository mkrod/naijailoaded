import { type CSSProperties } from 'react'

export interface colorScheme {
    background: CSSProperties['background']
    backgroundSecondary: CSSProperties['background']
    backgroundFade: CSSProperties['background']

    text: CSSProperties['color']
    textFade: CSSProperties['color']
    textFadeSecondary: CSSProperties['color']

    accent: CSSProperties['color']
    accentFeint: CSSProperties['color']

    border: CSSProperties['borderColor']
    borderFade: CSSProperties['borderColor']
}



export type Scheme = "dark" | "light";


export interface Note {
    type: "success" | "error" | "warning";
    title: string;
    body?: string;
}

export interface Snack {
    message: string;
}

export interface Prompt {
    title: string;
    description?: string;
    onAccept: () => void;
    onDecline?: () => void;
}

export interface Response<T = any> {
    status: number | undefined;
    success?: boolean;
    message?: string;
    data?: T;
    error?: {
        message: string;
        status?: number;
    };
}

export interface NavLink {
    label: string;
    path: string | (() => Promise<Response>);
    icon: React.ReactElement;
}


export interface APIArrayResponse<T = any[]> {
    page: string;
    perPage: string;
    totalResult: string;
    hasNext: boolean;
    results: T;
}