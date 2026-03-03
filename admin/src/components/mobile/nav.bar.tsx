import { useState, type FC, type ReactNode } from 'react';
import styles from "./css/mobile.nav.bar.module.css";
import { appLogo } from '@/constants/variables/global.vars';
import NavBar from '../utilities/nav';


interface Props {
    children?: ReactNode;
}

const MobileNavbar: FC<Props> = ({ children }): ReactNode => {

    const [isOpen, setIsOpen] = useState<boolean>(false);


    return (
        <div className={styles.container}>
            <nav className={`${styles.nav_container} ${isOpen ? styles.nav_open : ""}`}>
                <NavBar
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                />
            </nav>
            <div className={styles.content_container}>
                <header className={styles.header_container}>
                    <div className={styles.bar_container}>
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className={`${styles.bars} ${isOpen ? styles.bars_active : ""}`}>
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                    <div className={styles.logo_container}>
                        <img src={appLogo} className={styles.logo} alt='logo' />
                        <div className={styles.app_name_container}>
                            <span className={styles.naijai}>naijai</span>
                            <span className={styles.loaded}>loaded</span>
                        </div>
                    </div>
                </header>
                <main className={styles.content_container}>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default MobileNavbar;