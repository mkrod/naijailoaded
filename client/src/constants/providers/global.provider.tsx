import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    useMemo,
    type Dispatch,
    type FC,
    type ReactNode,
    type RefObject,
    type SetStateAction
} from 'react';
import type { colorScheme, Note, Prompt, Scheme, Snack } from '../types/global.types';
import { applyCssVariables, colors } from '../variables/global.vars';

interface GlobalContextType {
    note: Note | undefined;
    setNote: Dispatch<SetStateAction<Note | undefined>>;
    snackNote: Snack | undefined;
    snackNoteSetter: (value: Snack) => void;
    prompt: Prompt | undefined;
    setPrompt: Dispatch<SetStateAction<Prompt | undefined>>;
    activeColor: colorScheme;
    isMobile: boolean;
    activity: boolean;
    setActivity: Dispatch<SetStateAction<boolean>>;
    userScheme: Scheme;
    setUserScheme: Dispatch<SetStateAction<Scheme>>;
    switchScheme: () => void;
    setAccent: (accent: string) => void;
    pathHelper: RefObject<string | undefined>;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const GlobalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // 1. Initialize state with "safe" defaults to prevent Hydration Mismatch
    const [userScheme, setUserScheme] = useState<Scheme>('light');
    const [note, setNote] = useState<Note | undefined>(undefined);
    const [prompt, setPrompt] = useState<Prompt | undefined>(undefined);
    const [activity, setActivity] = useState(false); // Default to false so LCP isn't blocked by a loader
    const [isMobile, setIsMobile] = useState(false);
    const [snackNote, setSnackNote] = useState<Snack | undefined>(undefined);
    const [activeColor, setActiveColor] = useState<colorScheme>(colors.light);

    const pathHelper = useRef<string | undefined>(undefined);

    /* -------------------- Responsiveness (matchMedia is 10x faster than Resize) -------------------- */
    useEffect(() => {
        const mql = window.matchMedia('(max-width: 770px)');
        setIsMobile(mql.matches); // Set initial value on mount

        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    /* -------------------- Scheme & Theme Logic -------------------- */
    const updateTheme = useCallback((scheme: Scheme) => {
        const schemeColors = colors[scheme];
        setUserScheme(scheme);
        setActiveColor(schemeColors);
        applyCssVariables(schemeColors);

        // Sync theme-color meta tag without expensive removal/re-injection
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', schemeColors.background as string);

        document.documentElement.setAttribute('data-theme', scheme);
    }, []);

    useEffect(() => {
        const savedScheme = (localStorage.getItem('scheme') as Scheme) || 'light';
        updateTheme(savedScheme);
    }, [updateTheme]);

    const switchScheme = () => {
        const next = userScheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('scheme', next);
        updateTheme(next);
    };

    /* -------------------- Accent Override -------------------- */
    const setAccent = useCallback((accent: string) => {
        if (!accent) return;
        document.documentElement.style.setProperty('--app-accent', accent);
        localStorage.setItem('app-accent', accent);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('app-accent') || '#0f74f8';
        setAccent(saved);
    }, [setAccent]);

    /* -------------------- Notification Logic -------------------- */
    useEffect(() => {
        if (!note) return;
        const t = setTimeout(() => setNote(undefined), 5000);
        return () => clearTimeout(t);
    }, [note]);

    const snackNoteSetter = useCallback((value: Snack) => {
        setSnackNote(undefined);
        setTimeout(() => setSnackNote(value), 50);
    }, []);

    // 2. Memoize the context value to prevent unnecessary re-renders of the entire app
    const contextValue = useMemo(() => ({
        note, setNote,
        snackNote, snackNoteSetter,
        prompt, setPrompt,
        activeColor,
        isMobile,
        activity, setActivity,
        userScheme, setUserScheme,
        switchScheme,
        setAccent,
        pathHelper
    }), [note, snackNote, snackNoteSetter, prompt, activeColor, isMobile, activity, userScheme, setAccent]);

    return (
        <GlobalContext.Provider value={contextValue}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalProvider = () => {
    const context = useContext(GlobalContext);
    if (!context) throw new Error('useGlobalProvider must be used within a GlobalProvider');
    return context;
};