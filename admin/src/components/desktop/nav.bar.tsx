import { useState, type FC, type ReactNode } from 'react';
import styles from "./css/desktop.nav.bar.module.css";
import NavBar from '../utilities/nav';
import { HiMiniXMark } from 'react-icons/hi2';
import { HiChevronRight } from 'react-icons/hi';


interface Props {
    children?: ReactNode;
}

const DesktopNavbar: FC<Props> = ({ children }): ReactNode => {

    const [isOpen, setIsOpen] = useState<boolean>(false);


    return (
        <div className={styles.container}>
            <aside
                className={`
                    ${styles.side_bar_container} 
                    ${isOpen ? "" : styles.side_bar_container_closed}
                `}
            >
                <NavBar
                    isOpen={isOpen}
                />
                <div
                    className={styles.toggle_icons}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? (
                        <HiMiniXMark size={15} color='var(--color)' />
                    ) : (
                        <HiChevronRight size={15} color='var(--color)' />
                    )}
                </div>
            </aside>
            <main className={styles.main_container}>
                {children}
            </main>
        </div>
    )
}

export default DesktopNavbar