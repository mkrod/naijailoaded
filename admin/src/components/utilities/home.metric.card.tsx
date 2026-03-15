import type { AnalyticsMetric, MetricCode } from '@/constants/types/analytics.types'
import { type FC, type ReactNode } from 'react'
import styles from "./css/home.metric.card.module.css";
import { FiShoppingBag, FiUser, FiUserCheck } from "react-icons/fi";
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import { MdOutlineTrendingFlat } from 'react-icons/md';


interface Props {
    metric: AnalyticsMetric;
}

const metricIcons = {
    users: (
        <div style={{ backgroundColor: "#664bff" }} className={styles.icon_container}>
            <FiUserCheck size={20} />
        </div>
    ),
    visitors: (
        <div style={{ backgroundColor: "#ff6b6d" }} className={styles.icon_container}>
            <FiUser size={20} />
        </div>
    ),
    orders: (
        <div style={{ backgroundColor: "#3fa9ff" }} className={styles.icon_container}>
            <FiShoppingBag size={20} />
        </div>
    ),
} as Record<MetricCode, ReactNode>;

const trendIcon = {
    up: <IoMdTrendingUp size={20} color='#007d00' />,
    flat: <MdOutlineTrendingFlat size={20} color='var(--accent)' />,
    down: <IoMdTrendingDown size={20} color='#ff0000' />,
}

const MetricCard: FC<Props> = ({ metric }): ReactNode => {
    const { title, code, current, trend } = metric;

    return (
        <div className={styles.container}>
            <div className={styles.left_container}>
                {metricIcons[code]}
            </div>
            <div className={styles.metric_raw_container}>
                <span className={styles.title}>{title}</span>
                <span className={styles.metric_current_value}>
                    {current.value}
                </span>
            </div>
            <div className={styles.metric_trend_container}>
                {trend && trend.value !== 0 && (
                    <span className={styles.percentage}>
                        {trend.value}%
                    </span>
                )}
                {trend && trend.direction && (
                    <span className={styles.trend_icon}>
                        {trendIcon[trend.direction]}
                    </span>
                )}
            </div>
        </div >
    )
}

export default MetricCard