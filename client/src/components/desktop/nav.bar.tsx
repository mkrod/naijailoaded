import { FC, ReactNode, useEffect, useState } from 'react'
import styles from "./css/nav.bar.module.css";
import { appLogo, navLinks, segmentPath, siteName, subLinks } from '@/constants/variables/global.vars';
import { useRouter } from 'next/router';
import InputField from '../utilities/input.field';
import { MdKeyboardArrowDown } from 'react-icons/md';
import Switch from '../utilities/switch';
import { useGlobalProvider } from '@/constants/providers/global.provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AlertBar from '../utilities/alert';


interface Props {
    children: ReactNode;
}


const DesktopNavbar: FC<Props> = ({ children }): ReactNode => {

    const router = useRouter();
    const { userScheme, switchScheme, note, setNote } = useGlobalProvider();
    const { push, query } = router;
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [headlineText, setHeadlineText] = useState<string>("")
    const normalize = (p: string | null | undefined) => {
        return p ? p === "/" ? "/" : p.replace(/\/$/, "") : "";
    }



    const isActive = (path: string) => {
        const currentPath = normalize(pathname);
        const linkPath = normalize(path);

        return linkPath === "/"
            ? currentPath === "/"
            : currentPath === linkPath ||
            currentPath.startsWith(linkPath + "/");
    }

    const { paths } = segmentPath(pathname);

    const is404 = router.pathname === "/404";



    const { slug } = query;

    useEffect(() => {
        if (!slug) {
            setHeadlineText("");
            return;
        }
        setHeadlineText(`: ${paths[paths.length - 1].name}`)
    }, [slug]);

    return (
        <div className={styles.container}>
            <header className={styles.top}>
                <div
                    onClick={() => router.push("/")}
                    className={styles.logo_container}
                >
                    <img src={appLogo} className={styles.logo} alt='logo' />
                    <div className={styles.app_name_container}>
                        <span className={styles.naijai}>naijai</span>
                        <span className={styles.loaded}>loaded</span>
                    </div>
                </div>
                <nav className={styles.minor_links}>
                    {navLinks.map(({ name, path }, idx) => {
                        return (
                            <Link
                                href={path}
                                key={idx}
                                className={`${styles.minor_link} ${isActive(path) ? styles.path_active : ""}`}
                            //onClick={() => push(path)}
                            >
                                <span className={styles.link}>{name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className={styles.top_right}>
                    <InputField
                        label='Search Music, Video...'
                        value={searchTerm}
                        style={{ width: "100%" }}
                        setValue={(searchTerm) => setSearchTerm(searchTerm)}
                        type='search'
                        autocomplete='off'
                        keyDown={(e) => {
                            if (e.key === "Enter") {
                                if (searchTerm.length < 3) {
                                    return setNote({ type: "warning", title: "please enter atleast 3 letters" });
                                }
                                push(`/search?q=${searchTerm?.toLowerCase()}`);
                            }
                        }}
                    />
                </div>
            </header>
            <header className={styles.bottom}>
                {!headlineText.trim() && (
                    <div className={styles.bottom_links}>
                        {subLinks.map((sl, idx) => (
                            <Link
                                href={`${sl.path}`}
                                key={idx}
                                className={styles.bottom_link}
                            >
                                <span>{sl.name}</span>
                                <div className={styles.bottom_link_icon}>
                                    <MdKeyboardArrowDown />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                {headlineText.trim() && (
                    <div className={styles.bottom_headline}>
                        <span
                            className={styles.headline_bold}
                        >
                            READING
                        </span>
                        <span
                            className={styles.headline_text}
                        >
                            {headlineText}
                        </span>
                    </div>
                )}
                <div className={styles.bottom_right}>
                    <Switch
                        checked={userScheme === "dark"}
                        onChange={switchScheme}
                        rounded={false}
                    />
                </div>
            </header>
            {!is404 && paths.length > 0 && (
                <nav className={styles.path_trees_container}>
                    <Link
                        href="/"
                        className={styles.path_tree}
                    >
                        {siteName}
                    </Link>
                    {paths.map((p) => (
                        <Link
                            key={p.path}
                            href={p.path}
                            className={styles.path_tree}
                        >
                            &nbsp;&gt;&nbsp;{p.name}
                        </Link>
                    ))}
                </nav>
            )}
            <AlertBar
                note={note}
            />
            <main className={styles.content_container}>
                {children}
            </main>
        </div >
    )
}

export default DesktopNavbar