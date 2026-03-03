import { type FC } from "react";
import styles from "./css/activity.indicator.module.css";

interface Props {
    cover?: boolean;
    style: "spin" | "typing";
    color?: string;
    size: "small" | "medium" | "big";
}

const ActivityIndicator: FC<Props> = ({
    cover = false,
    style,
    color = "var(--accent)",
    size,
}) => {
    return (
        <div
            className={`${styles.container} ${cover ? styles.container_covered : ""}`}
        >
            {style === "spin" && (
                <span
                    className={`${styles.spinner} ${styles[size]}`}
                    style={{ borderTopColor: color }}
                />
            )}

            {style === "typing" && (
                <span className={styles.typing}>
                    <i style={{ background: color }} />
                    <i style={{ background: color }} />
                    <i style={{ background: color }} />
                </span>
            )}
        </div>
    );
};

export default ActivityIndicator;
