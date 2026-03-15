import React, { FC, useRef, useState, useEffect } from 'react';
import styles from "./css/trending.posts.module.css";
import { Post } from '@/constants/types/post.type';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import HorizontalCard from './horizontal.card';

interface Props {
    posts: Post[];
}

const TrendingPosts: FC<Props> = ({ posts }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [index, setIndex] = useState(0);
    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);

    // Checks if the scroll container has reached the boundaries
    const checkScrollLimits = () => {
        if (!containerRef.current) return;

        const { scrollLeft, scrollWidth, offsetWidth } = containerRef.current;

        // At the start if scrollLeft is 0
        setIsAtStart(scrollLeft <= 0);

        // At the end if (current scroll + visible width) >= total content width
        // We use a 5px buffer to account for sub-pixel rounding in browsers
        setIsAtEnd(scrollLeft + offsetWidth >= scrollWidth - 5);

        // Update current index for button logic
        const firstItem = containerRef.current.firstElementChild as HTMLElement;
        if (firstItem) {
            const gap = parseFloat(getComputedStyle(containerRef.current).columnGap || '0');
            const step = firstItem.offsetWidth + gap;
            setIndex(Math.round(scrollLeft / step));
        }
    };

    // Use effect to handle initial state and window resizing
    useEffect(() => {
        checkScrollLimits();
        window.addEventListener('resize', checkScrollLimits);
        return () => window.removeEventListener('resize', checkScrollLimits);
    }, [posts]);

    const handleScroll = (direction: 'next' | 'prev') => {
        if (!containerRef.current) return;

        let targetIndex = direction === 'next' ? index + 1 : index - 1;

        // Clamp the index within bounds
        targetIndex = Math.max(0, Math.min(targetIndex, posts.length - 1));

        const targetItem = containerRef.current.children[targetIndex] as HTMLElement;

        if (targetItem) {
            targetItem.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start',
            });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.header_text}>Trending Posts</div>
                <div className={styles.controls_container}>
                    <button
                        className={styles.control}
                        onClick={() => handleScroll('prev')}
                        disabled={isAtStart}
                    >
                        <FaAngleLeft size={18} />
                    </button>
                    <button
                        className={styles.control}
                        onClick={() => handleScroll('next')}
                        disabled={isAtEnd}
                    >
                        <FaAngleRight size={18} />
                    </button>
                </div>
            </div>

            <div
                className={styles.content_container}
                ref={containerRef}
                onScroll={checkScrollLimits}
            >
                {posts.map((post, i) => (
                    <div key={post.post_id || i} className={styles.item}>
                        <HorizontalCard data={post} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingPosts;