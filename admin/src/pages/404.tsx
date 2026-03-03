import { type FC } from 'react';
import styles from "./css/not-found.module.css";
import { NavLink } from 'react-router';

const NotFound: FC = () => {


    return (
        <div className={styles.container}>
            <h3 className={styles.nav}>404 Not Found</h3>
            <div className={styles.display}>
                <div className={styles.imgWrapper}>
                    <img
                        src="/Scarecrow.png"
                        alt="404-Scarecrow"
                        className={styles.image}
                    />
                </div>
                <div className={styles.content}>
                    <h2 className={styles.info}>I have bad news for you</h2>
                    <p className={styles.text}>
                        The content you are looking for might be removed or is temporarily unavailable.
                    </p>
                    <NavLink
                        to="/"
                        className={styles.btn}
                    >
                        Back to homepage
                    </NavLink>
                </div>
            </div>
        </div>
    )
}

export default NotFound;
