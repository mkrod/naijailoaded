import React from 'react';
import Link from 'next/link';
import styles from './css/ticker.module.module.css'; // You'll create this next
import { Post } from '@/constants/types/post.type';
import { clientURL } from '@/constants/variables/global.vars';

interface TickerProps {
    items: Post[];
}

const NewsTicker: React.FC<TickerProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className={styles.ticker_wrap}>
            <div className={styles.ticker_title}>BREAKING</div>
            <div className={styles.ticker_move}>
                {items.map((item) => (
                    <Link
                        key={item.post_id}
                        href={`${clientURL}/news/${item.slug}`}
                        className={styles.ticker_item}
                    >
                        {item.title} <span className={styles.separator}>•</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default NewsTicker;