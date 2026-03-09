import { type FC, type ReactNode } from 'react';
import styles from "./css/nav.module.css";
import { appLogo, navLinks } from '@/constants/variables/global.vars';
import Switch from './switch';
import { useGlobalProvider } from '@/constants/providers/global.provider';
import NavLinker from './nav.link';
import { MdLogout } from 'react-icons/md';

interface Props {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}
const NavBar: FC<Props> = ({ isOpen, setIsOpen }): ReactNode => {

    const { switchScheme, userScheme, isMobile } = useGlobalProvider();
    const mobileClass = isMobile ? "mobile_" : "";
    const path = location.pathname;
    const isActive = (nav: any) => nav.path === "/" ? path === "/" : path.startsWith(nav.path as string);

    return (
        <div className={styles.container}>
            {!isMobile ? (
                <header className={styles.header}>
                    <div className={styles.logo_text_container}>
                        <div className={styles.logo_container}>
                            <img
                                src={appLogo}
                                alt='AppLogo'
                                className={styles.app_logo}
                            />
                        </div>
                        <div
                            className={`
                        ${styles.app_name_container}
                        ${!isOpen ? styles.hidden : ""}`}
                        >
                            <span className={styles.naijai}>naijai</span>
                            <span className={styles.loaded}>loaded</span>
                        </div>
                    </div>
                </header>
            ) : null}
            <nav className={styles.nav_container}>
                {navLinks.map((link, index) => (
                    <NavLinker
                        isActive={isActive(link)}
                        key={index}
                        link={link}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                    />
                ))}
            </nav>
            {/*<section className={styles.nav_drafts}>
                <span className={styles.nav_sub_nav_header_text}>Drafts</span>
                <ul className={styles.nav_draft_list}>
                    {[1, 2].map((item) => (
                        <NavLinker
                            key={item}
                            link={{
                                name: `Draft ${item}`,
                                path: `/drafts/${item}`,
                                icon: <img src={appLogo} height="1.5rem" width="1.5rem" />,
                            }}
                            isOpen={isOpen}
                        />
                    ))}
                </ul>
            </section>*/}
            <section className={styles.nav_bottom}>
                <div className={styles.theme_container}>
                    {isOpen ? (
                        <Switch
                            checked={userScheme === "dark"}
                            onChange={() => switchScheme()}
                            rounded={false}
                            size="medium"
                        />
                    ) : null}
                    <div
                        onClick={!isOpen ? () => switchScheme() : undefined}
                        className={`${styles[`${mobileClass}theme_label`]} ${!isOpen ? styles.clickable_theme_label : ""}`}
                        style={{ textAlign: isOpen ? "start" : "center" }}
                    >
                        {userScheme === "dark" ? "Dark Mode" : "Light Mode"}
                    </div>
                </div>
                <div className={styles.logout_container}>
                    <NavLinker
                        link={{
                            name: "Logout",
                            path: "/logout",
                            icon: <MdLogout size={18} />,
                        }}
                        isOpen={isOpen}
                    />
                </div>
            </section>
        </div>
    )
}

export default NavBar