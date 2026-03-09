import { cachePath, type navLinks } from '@/constants/variables/global.vars'
import { type FC, type ReactNode } from 'react'
import styles from "./css/nav.module.css";
import { useRouter } from '@/constants/utilities/useRouter';


interface Props {
    isActive?: boolean;
    link: typeof navLinks[number];
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}
const NavLinker: FC<Props> = ({ isActive, link, isOpen, setIsOpen }): ReactNode => {

    const router = useRouter();

    return (
        <div
            //to={link.path}
            //end
            className={`${styles.nav} ${isActive ? styles.nav_active : ""}`}
            title={!isOpen ? link.name : undefined}
            onClick={() => {
                cachePath(link.path);
                router.push(link.path);
                setIsOpen?.(false);
            }}
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
        </div>
    )
}

export default NavLinker