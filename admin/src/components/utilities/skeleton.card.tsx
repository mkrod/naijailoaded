import type { ReactNode } from "react";
import styles from "./css/skeleton.card.module.css";

export const SkeletonCard = (): ReactNode => (
    <div className={styles.container}>
        <div className={styles.left_container}>
            <div className={styles.icon_container}>
            </div>
        </div>
        <div className={styles.metric_raw_container}>
            <span className={styles.title}></span>
            <span className={styles.metric_current_value}>
            </span>
        </div>
        <div className={styles.metric_trend_container}>
            <span className={styles.trend_icon}>
            </span>
        </div>
    </div >
);
