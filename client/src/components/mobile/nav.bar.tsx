import { FC, ReactNode, use, useEffect, useState } from 'react'
import styles from "./css/nav.bar.module.css";
import { appLogo, googleSignInLink, navLinks, segmentPath, siteName, subLinks } from '@/constants/variables/global.vars';
import { IoSearch } from 'react-icons/io5';
import Switch from '../utilities/switch';
import { useGlobalProvider } from '@/constants/providers/global.provider';
import { useRouter } from 'next/router';
import InputField from '../utilities/input.field';
import { MdKeyboardArrowDown, MdLogout } from 'react-icons/md';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AlertBar from '../utilities/alert';
import { FcGoogle } from 'react-icons/fc';
import { useUserProvider } from '@/constants/providers/user.provider';

interface Props {
    children: ReactNode;
}

const MobileNavbar: FC<Props> = ({ children }): ReactNode => {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const router = useRouter();
    const { userScheme, switchScheme, note, setNote } = useGlobalProvider();
    const { user } = useUserProvider();
    const { query } = router;
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [headlineText, setHeadlineText] = useState<string>("");
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

    const { paths } = segmentPath(pathname)
    const is404 = router.pathname === "/404";

    const { slug } = query;

    useEffect(() => {
        if (!slug) {
            setHeadlineText("");
            return;
        }
        setHeadlineText(`: ${paths[paths.length - 1].name}`)
    }, [slug]);

    const userNames = typeof user?.name === "string" ? JSON.parse(user.name) : user?.name;

    return (
        <div className={styles.container}>
            <header className={styles.top}>
                <div className={styles.bar_container}>
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className={`${styles.bars} ${isOpen ? styles.bars_active : ""}`}>
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
                <div
                    className={styles.logo_container}
                    onClick={() => router.push("/")}
                >
                    <img src={appLogo} className={styles.logo} alt='logo' />
                    <div className={styles.app_name_container}>
                        <span className={styles.naijai}>naijai</span>
                        <span className={styles.loaded}>loaded</span>
                    </div>
                </div>

                <div className={styles.top_right}>
                    <div onClick={() => setIsOpen(true)} className={styles.bar_container}>
                        <IoSearch size={20} />
                    </div>

                    <Switch
                        checked={userScheme === "dark"}
                        onChange={switchScheme}
                        rounded={false}
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
            <nav className={`${styles.navbar_container}  ${isOpen ? styles.navbar_open : ""}`}>
                <div className={styles.search_container}>
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
                                router.push(`/search?q=${searchTerm?.toLowerCase()}`);

                                setIsOpen(false);
                            }
                        }}

                    />
                </div>
                <div className={styles.minor_links}>
                    {navLinks.map(({ name, path }, idx) => (
                        <Link
                            href={path}
                            onClick={() => setIsOpen(!isOpen)}
                            key={idx}
                            className={`${styles.minor_link} ${isActive(path) ? styles.path_active : ""}`}
                        >
                            <span className={styles.link}>{name}</span>
                        </Link>
                    ))}
                </div>
                <div className={styles.have_account}>
                    {/*<span>Have an account?</span>
                    <button className={styles.sign_in_button}>Sign in</button>*/}
                    {!user && (
                        <Link
                            href={googleSignInLink}
                            target='_self'
                            className={styles.sign_in_button}>
                            <FcGoogle size={20} />
                            Sign in with google
                        </Link>
                    )}
                    {user && (
                        <div className={styles.user_name}>
                            <span>Hello, {Object.values(userNames).join(" ")}</span>
                            <button
                                className={styles.sign_out_button}
                            >
                                <MdLogout size={20} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.social_links}>
                    <div className={styles.social_link}>

                    </div>
                </div>
            </nav>
            <AlertBar
                note={note}
            />
            <main className={styles.content_container}>
                {children}
            </main>
        </div>
    )
}

export default MobileNavbar