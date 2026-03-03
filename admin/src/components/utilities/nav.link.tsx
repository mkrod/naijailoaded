import type { navLinks } from '@/constants/variables/global.vars'
import { type FC, type ReactNode } from 'react'
import { NavLink } from 'react-router';
import styles from "./css/nav.module.css";


interface Props {
    link: typeof navLinks[number];
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}
const NavLinker: FC<Props> = ({ link, isOpen, setIsOpen }): ReactNode => {


    return (
        <NavLink
            to={link.path}
            end
            className={styles.nav}
            title={!isOpen ? link.name : undefined}
            onClick={() => setIsOpen?.(false)}
        >
            <div
                className={styles.nav_icon}
            >
                {link.icon}
            </div>
            <div
                className={`${styles.nav_label} ${!isOpen ? styles.hidden : ""}`}
            >
                {link.name}
            </div>
        </NavLink>
    )
}

export default NavLinker