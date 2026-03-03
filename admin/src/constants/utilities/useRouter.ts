import type { NavigateOptions } from "react-router";
import { useNavigate, useLocation, useSearchParams, useParams } from "react-router";

interface NextRouter {
    push: (href: string, state?: NavigateOptions['state']) => Promise<void> | void;
    replace: (href: string, state?: NavigateOptions['state']) => Promise<void> | void;
    back: () => Promise<void> | void;
    forward: (href: string) => Promise<void> | void;
    pathname: string;
    search: any;
    hash: string;
    state: any;
    query: {
        [k: string]: string;
    };
    params: {
        [k: string]: string | undefined;
    };
    refresh: () => void;
}

export function useRouter<TParams extends Record<string, string | undefined> = Record<string, string | undefined>>(): NextRouter & { params: TParams } {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const params = useParams() as TParams; // type cast here once

    return {
        push: (href: string, state?: NavigateOptions['state']) => {
            localStorage.setItem("resume_page", href); //save page for resumption
            navigate(href, { state })
        },
        replace: (href: string, state?: NavigateOptions['state']) => {
            localStorage.setItem("resume_page", href); //save path for resumption
            navigate(href, { replace: true, state });
        },
        back: () => {
            localStorage.removeItem("resume_page");
            navigate(-1);
        },
        forward: () => navigate(1),

        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        state: location.state,
        params, // strongly typed now
        query: Object.fromEntries(searchParams.entries()),
        refresh: () => navigate(0),
    };
}
