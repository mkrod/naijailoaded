"use  client"


import type { APIArrayResponse, colorScheme, Response } from "../types/global.types";
import { createTheme } from "@mui/material";
import type { Post } from "../types/post.type";
import { GoDotFill } from "react-icons/go";
import { MdMusicNote } from "react-icons/md";
import { PiGooglePhotosLogoBold, PiNewspaperClippingFill } from "react-icons/pi";
import { HiOutlineHome } from "react-icons/hi2";
import { HiOutlineCog, HiOutlineViewGrid } from "react-icons/hi";
import { RiVideoFill } from "react-icons/ri";

//meta
export const siteName = import.meta.env.VITE_SITE_NAME;
export const siteURL = import.meta.env.VITE_CLIENT_URL;
export const siteDescription = "";
export const siteKeyWord = "naijaloaded, naijailoaded, naijaload";


export const appLogo: string = "/NL_logo.png";
export const appLogoText = "/logo+text.svg";
export const defaultDp: string = "/isolated-layout.svg";

export const defaultContentDt = "/advert_img.webp";


export const server: string = import.meta.env.VITE_SERVER_URL ?? "https://192.168.43.150";
// SERVER
const serverBase = import.meta.env.VITE_SERVER_URL ?? "https://192.168.43.150";
const serverPort = import.meta.env.VITE_SERVER_PORT;
const serverNamespace = import.meta.env.VITE_SERVER_NAMESPACE ?? "/api";

export const serverURL =
    `${serverBase}${serverPort ? `:${serverPort}` : ""}${serverNamespace}`.trim();


// CLIENT
const clientBase = import.meta.env.VITE_CLIENT_URL ?? "https://192.168.43.150";
const clientPort = import.meta.env.VITE_CLIENT_PORT;
const clientNamespace = import.meta.env.VITE_CLIENT_NAMESPACE ?? "";

export const clientURL =
    `${clientBase}${clientPort ? `:${clientPort}` : ""}${clientNamespace}`.trim();


// ADMIN
const adminBase = import.meta.env.VITE_ADMIN_URL ?? "https://192.168.43.150";
const adminPort = import.meta.env.VITE_ADMIN_PORT;
const adminNamespace = import.meta.env.VITE_ADMIN_NAMESPACE ?? "";

export const adminURL =
    `${adminBase}${adminPort ? `:${adminPort}` : ""}${adminNamespace}`.trim();

//cookie analytics
export const googleAnalyticsID = "G-8KKXVF25ZF";
export const googleAdsID = "";
export const facebookPixelID = "3452294181590573";


//Auth

export const googleClientID: string = "20912650344-lpjm8luidtdc2j1q47p33fpfihjb6lkr.apps.googleusercontent.com";
export const googleRedirectURI: string = `https://localhost:3500/api/auth/google/callback`;
export const googleScope: string = "user_info"
export const googleSignInLink = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientID}&redirect_uri=${googleRedirectURI}&response_type=code&scope=openid+email+profile&include_granted_scopes=true&access_type=offline&prompt=consent`;


export const colors: Record<string, colorScheme> = {
    light: {
        background: '#ffffff',
        backgroundSecondary: '#eeeeee',
        backgroundFade: '#2424249d',
        text: '#000000',
        accent: '#06a700', //'#5d04ec',
        accentFeint: '#06a70033', //36
        textFade: '#656565',
        textFadeSecondary: '#a5a5a5',
        border: '#727272',
        borderFade: '#dddddd',
    },

    dark: {
        background: '#111111',
        backgroundSecondary: '#000000',
        backgroundFade: '#0000009d',
        text: '#f1f1f1',
        accent: '#06a700',//'#a974ff',
        accentFeint: '#06a70033',
        textFade: '#999999',
        textFadeSecondary: '#707070',
        border: '#3a3a3a',
        borderFade: '#42424261'
        //borderFade: '#3a3a3a2a',
    },
}

export const applyCssVariables = (scheme: colorScheme) => {
    const root = document.documentElement

    root.style.setProperty('--background', scheme.background as string)
    root.style.setProperty('--background-sec', scheme.backgroundSecondary as string)
    root.style.setProperty('--background-fade', scheme.backgroundFade as string)

    root.style.setProperty('--color', scheme.text as string)
    root.style.setProperty('--color-fade', scheme.textFade as string)
    root.style.setProperty('--text-fade', scheme.textFadeSecondary as string)

    root.style.setProperty('--accent', scheme.accent as string)
    root.style.setProperty('--accent-feint', scheme.accentFeint as string)

    root.style.setProperty('--border-normal', scheme.border as string)
    root.style.setProperty('--border-fade', scheme.borderFade as string)
}




export const serverRequest = async (method: "post" | "get" | "put" | "delete" | "patch", route: string, data?: any, type?: "json" | "form" | "formdata", responseType: "blob" | "json" = "json"): Promise<Response> => {
    const headers: HeadersInit = {};

    if (type === "json") {
        headers["Content-Type"] = "application/json";
    } else if (type === "form") {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    // Don't set Content-Type for FormData
    //if (accessToken) {
    //    headers["Authorization"] = `Bearer ${accessToken}`;
    //}
    //if (refreshToken) {
    //    headers["x-refresh-token"] = refreshToken;
    // }

    const options: RequestInit = {
        method: method.toUpperCase(),
        headers,
        credentials: "include",
    };

    if (method === "post" || method === "put" || method === "delete" || method === "patch") {
        if (type === "json") {
            options.body = JSON.stringify({ ...data });
        } else if (type === "form") {
            options.body = new URLSearchParams({ ...data }).toString();
        } else if (type === "formdata") {
            options.body = data; // data is already a FormData instance
            // Do not set Content-Type manually
        }
    } else if (method === "get" && data) {
        route += `?${new URLSearchParams(data).toString()}`;
    }

    //console.log(`Request: ${options.method} ${serverURL}${route}`);

    const response = await fetch(`${serverURL}${route}`, options);

    if (!response.ok) {
        console.log(response.statusText)
        throw new Error((await response.json()).message);
    }

    let res;
    if (responseType === "blob") {
        res = response.blob();
    } else if (responseType === "json") {
        res = response.json()
    }

    return res;
};



export const serverRequestWithProgress = async (
    method: "post" | "get" | "put" | "delete" | "patch",
    route: string,
    data?: any,
    type?: "json" | "form" | "formdata",
    responseType: "blob" | "json" = "json",
    onProgress?: (percent: number) => void // New callback for progress
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let url = `${serverURL}${route}`;

        // Handle GET params
        if (method === "get" && data) {
            url += `?${new URLSearchParams(data).toString()}`;
        }

        xhr.open(method.toUpperCase(), url, true);

        xhr.timeout = 1200000;
        xhr.withCredentials = true;

        // Set Headers
        if (type === "json") {
            xhr.setRequestHeader("Content-Type", "application/json");
        } else if (type === "form") {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        // FormData headers are handled automatically by XHR

        // Progress Tracking (Upload)
        if (onProgress && xhr.upload) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            };
        }

        // Response Handling
        xhr.responseType = responseType;

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                // Emulating your error handling
                const errorResponse = xhr.response;
                reject(new Error(errorResponse?.message || xhr.statusText));
            }
        };

        // --- HANDLE TIMEOUT ERROR ---
        xhr.ontimeout = () => {
            reject(new Error("The request timed out. The processing took too long."));
        };

        xhr.onerror = () => reject(new Error("Network Error"));

        // Body Construction
        let body: any = null;
        if (method !== "get" && data) {
            if (type === "json") {
                body = JSON.stringify({ ...data });
            } else if (type === "form") {
                body = new URLSearchParams({ ...data }).toString();
            } else if (type === "formdata") {
                body = data; // FormData instance
            }
        }

        xhr.send(body);
    });
};





export function isValidPassword(password: string): boolean {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return password.length >= 6 && hasLetter && hasNumber;
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function passWordStrength(password: string): number {
    const pwd = password;
    let score = 0;
    const totalChecks = 3;

    if (pwd.length >= 6) score++;                // Length
    if (/[a-zA-Z]/.test(pwd)) score++;           // Has letter
    if (/\d/.test(pwd)) score++;                 // Has number

    const percentage = Math.round((score / totalChecks) * 100);
    return percentage;
}



export const cachePath = (path: string) => {
    localStorage.setItem("last_page", path);
    return path; //essence of this is to keep track of the user last visited page so as to resume there on page reload
}


export const navLinks = [
    {
        name: "Home",
        icon: <HiOutlineHome size={18} />,
        path: "/"
    },
    {
        name: "Library",
        icon: <HiOutlineViewGrid size={18} />,
        path: "/library"
    },
    {
        name: "Posts",
        icon: <PiGooglePhotosLogoBold size={18} />,
        path: "/posts"
    },
    {
        name: "Settings",
        icon: <HiOutlineCog size={18} />,
        path: "/settings"
    }
]

export const subLinks = [
    { name: "Trending", path: "/trending" },
    { name: "DJ Mix", path: "/mix-tape" },
    { name: "News", path: "/news" },
    { name: "Sport", path: "/sport" },
    { name: "Advertise", path: "/advert" },
]


function roundIfNecessary(num: number): string {
    return Number.isInteger(num * 100) ? String(num) : String(num.toFixed(2));
}

export function formatNumberWithCommas(num: number | string): string {
    const clean = Number(num);
    if (isNaN(clean)) return "0.00";

    return roundIfNecessary(clean).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export const formatNumberString = (num: number, decimals = 2) => {
    const format = (value: number, suffix: string) =>
        `${parseFloat(value.toFixed(decimals))}${suffix}`;

    if (num >= 1_000_000_000) {
        return format(num / 1_000_000_000, 'B');
    }
    if (num >= 1_000_000) {
        return format(num / 1_000_000, 'M');
    }
    if (num >= 1_000) {
        return format(num / 1_000, 'K');
    }

    return num.toString();
};


export function formatDateProfessional(input: Date | string): string {
    const now = new Date();
    const date = typeof input === "string" ? new Date(input) : input;
    if (isNaN(date.getTime())) return "Invalid date";

    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays <= 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }); // e.g. 22 May 2025
}

export const formatDate = (d: Date | string) => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;

    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
};

export function formatTimeHM(timestamp: number | null): string {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
}

export const authCarouselImages = [
    "/temp_1.webp",
    "/temp_2.jpg",
    "/temp_3.webp"
]

export const testData = Array.from({ length: 10 }).flatMap((_, i) => [
    {
        post_id: `1-${i}`,
        author: { user_id: "jcsvdhs", username: "dandee" },
        title: "K4C - Ectasy Hype Groove Vol.2 (Amapiano Rave)",
        slug: "k4c-ectasy-hype-groove-vol-2-amapiano-rave",
        created_at: "2026-02-13T00:00:00.000Z",
        content_thumbnail: "https://naijailoaded.com.ng/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-27-at-9.13.23-PM.jpeg",
        category_id: "trending",
        content_type: "Music",
    },
    {
        post_id: `2-${i}`,
        author: { user_id: "jcsvdhs", username: "dandee" },
        title: "Cyril Godly – All To You",
        slug: "",
        created_at: "2026-02-12T00:00:00.000Z",
        content_thumbnail: "https://naijailoaded.com.ng/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-01-at-11.27.20-AM.jpeg",
        category_id: "trending",
        content_type: "Music",
    },
    {
        post_id: `3-${i}`,
        author: { user_id: "jcsvdhs", username: "dandee" },
        title: "[MUSIC] IK Master Ft Sakordie & ICE C – Loniru",
        slug: "",
        created_at: "2026-02-11T00:00:00.000Z",
        content_thumbnail: "https://naijailoaded.com.ng/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-11-at-7.43.19-PM.jpeg",
        category_id: "trending",
        content_type: "Music",
    }
]);


export const segmentPath = (pathname: string) => {
    if (!pathname) return { paths: [] };
    const segments = pathname.split("/").filter(Boolean);

    const paths = segments.map((segment, index) => {
        // 1️⃣ Clean the segment for display
        const clean = segment
            .replaceAll(/[^a-zA-Z0-9 ]/g, " ") // remove special chars
            .replaceAll(/\s+/g, " ")           // collapse multiple spaces
            .trim();

        const name = clean
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");

        // 2️⃣ Build relative path cumulatively
        const path = "/" + segments.slice(0, index + 1).join("/");

        return { name, path };
    });

    return { paths };
}




export const theme = createTheme({
    components: {
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    color: "var(--color)",
                    borderColor: "var(--border-fade)",

                    "&:hover": {
                        backgroundColor: "var(--background-sec)", // or use alpha()
                        color: "var(--color)",
                    },

                    "&.Mui-selected": {
                        backgroundColor: "var(--accent)",
                        color: "#fff",

                        "&:hover": {
                            backgroundColor: "var(--background)", // keep solid on hover
                        },
                    },

                    "&.Mui-disabled": {
                        opacity: 0.4,
                    },
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    padding: 0,
                    color: "var(--border-normal)",
                    "&.Mui-checked": {
                        color: "var(--accent)",
                    },
                    "&.Mui-disabled": {
                        color: "var(--border-fade)",
                    }
                },
            },
        },
        MuiRadio: {
            styleOverrides: {
                root: {
                    padding: 0,
                    color: "var(--border-normal)",
                    borderColor: "var(--border-fade)",
                    "&.Mui-checked": {
                        color: "var(--accent)",
                    },
                }
            }
        },
    }
});



export const getTypeIcon = (type: Post['content_type']) => {
    if (type === "music") {
        return (
            <MdMusicNote size={18} color="var(--accent)" />
        )
    }
    if (type === "video") {
        return (
            <RiVideoFill size={18} color="var(--accent)" />
        )
    }
    if (type === "news") {
        return (
            <PiNewspaperClippingFill size={18} color="var(--accent)" />
        )
    }


    return <GoDotFill size={18} color="var(--accent)" />
}

export const formatTime = (sec: number) => {
    const totalSeconds = Math.floor(sec);

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");

    return h > 0
        ? `${h}:${mm}:${ss}`
        : `${m}:${ss}`;
};



export const DefaultAPIArrayResponse: APIArrayResponse = {
    page: "1",
    perPage: "5",
    totalResult: "10",
    hasNext: false,
    results: []
}

export function getSlugFromString(value: string | undefined, separator: string = "-") {
    if (!value) return undefined;

    return value
        // 1. Replace all non-alphanumeric characters with the separator
        .replace(/[^a-zA-Z0-9]+/g, separator)
        // 2. Remove leading/trailing separators (cleanup)
        .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '')
        //to Lower Case
        .toLowerCase();
}

export function removeAndReorder<T extends { id: number | string }>(
    arr: T[],
    index: number
): T[] {
    return arr
        .filter((_, i) => i !== index)
        .map((item, i) => ({
            ...item,
            id: Number(i + 1),
        }));
}


type MediaType = "video" | "music" | "image";

/**
 * Validates links for video, music, or images (default).
 * Supports direct file extensions and major platform domains.
 */
export const validateMediaLink = (link: string, inputType: string): boolean => {
    if (!link || typeof link !== 'string') return false;

    // Default to 'image' if type is not 'video' or 'music'
    const type: MediaType = (inputType === "video" || inputType === "music")
        ? inputType
        : "image";

    try {
        const url = new URL(link);
        const path = url.pathname.toLowerCase();
        const hostname = url.hostname.toLowerCase().replace('www.', '');
        const search = url.search.toLowerCase();

        const rules = {
            image: {
                extensions: /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp)$/i,
                domains: [/picsum\.photos/, /images\.unsplash\.com/, /cloudinary\.com/, /fbcdn\.net/, /twimg\.com/]
            },
            music: {
                extensions: /\.(mp3|wav|ogg|aac|flac|m4a|opus)$/i,
                domains: [/spotify\.com/, /soundcloud\.com/, /audiomack\.com/, /deezer\.com/, /music\.apple\.com/]
            },
            video: {
                extensions: /\.(mp4|webm|mov|m4v|ogv)$/i,
                domains: [
                    /youtube\.com/, /youtu\.be/, /vimeo\.com/,
                    /instagram\.com/, /facebook\.com\/watch/, /tiktok\.com/,
                    /twitch\.tv/, /dai\.ly/
                ]
            }
        };

        const currentRule = rules[type];

        // 1. Check path and query params for file extensions
        if (currentRule.extensions.test(path) || currentRule.extensions.test(search)) {
            return true;
        }

        // 2. Check for known platform domains
        return currentRule.domains.some(regex => regex.test(hostname));

    } catch (e) {
        // Invalid URL format
        return false;
    }
};