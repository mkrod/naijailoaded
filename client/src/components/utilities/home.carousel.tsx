"use client";

import styles from "./css/home.carousel.module.css";
import { CSSProperties, FC, useEffect, useRef, useState } from "react";
import { BsBookmark } from "react-icons/bs";
import { IoTimeOutline } from "react-icons/io5";
import { defaultContentDt, formatDateProfessional, getTypeIcon } from "@/constants/variables/global.vars";
import { GoDotFill } from "react-icons/go";
import Link from "next/link";
import { Post, Thumbnail } from "@/constants/types/post.type";


interface Props {
    height?: CSSProperties["height"];
    width?: CSSProperties["width"];
    square?: boolean;
    data: Post[];
    others?: {
        isBookmarked?: boolean;
    }
}

const HomeCarousel: FC<Props> = ({
    data = [],
    height,
    width = "300px",
    square = true,
    others
}) => {
    const [current, setCurrent] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startX = useRef(0);
    const isDragging = useRef(false);

    // ================= AUTO SLIDE =================

    const nextSlide = () => {
        if (!data.length) return;
        setCurrent((p) => (p + 1) % data.length);
    };

    const resetAutoSlide = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(nextSlide, 4000);
    };

    useEffect(() => {
        if (!data.length) return;
        resetAutoSlide();
        return () => { intervalRef.current && clearInterval(intervalRef.current) };
    }, [data.length]);

    useEffect(() => {
        if (!trackRef.current) return;
        trackRef.current.style.transition = "transform 0.5s ease";
        trackRef.current.style.transform = `translateX(-${current * 100}%)`;
    }, [current]);

    // ================= SWIPE =================

    const handleStart = (x: number) => {
        if (!containerRef.current || !trackRef.current) return;
        isDragging.current = true;
        startX.current = x;
        trackRef.current.style.transition = "none";
    };

    const handleMove = (x: number) => {
        if (!isDragging.current || !containerRef.current || !trackRef.current)
            return;

        const diff = x - startX.current;
        const containerWidth = containerRef.current.offsetWidth;

        const percent = (diff / containerWidth) * 100;

        trackRef.current.style.transform = `translateX(${-current * 100 + percent
            }%)`;
    };

    const handleEnd = (x: number) => {
        if (!isDragging.current || !containerRef.current) return;
        isDragging.current = false;

        const diff = x - startX.current;
        const threshold = containerRef.current.offsetWidth * 0.15;

        if (diff > threshold && current > 0) {
            setCurrent((p) => p - 1);
        } else if (diff < -threshold && current < data.length - 1) {
            setCurrent((p) => p + 1);
        } else {
            trackRef.current!.style.transition = "transform 0.5s ease";
            trackRef.current!.style.transform = `translateX(-${current * 100}%)`;
        }

        resetAutoSlide();
    };

    const [isBookmarked, setIsBookmarked] = useState<boolean>(Boolean(others?.isBookmarked))

    return (
        <div
            ref={containerRef}
            className={styles.container}
            style={{ width, height, aspectRatio: square ? "1/1" : undefined }}
        >
            {/* Indicators */}
            <div className={styles.carousel_buttons}>
                {data.map((_, i) => (
                    <button
                        key={_.post_id}
                        className={`${styles.button} ${current === i ? styles.active : ""
                            }`}
                        onClick={() => {
                            setCurrent(i);
                            resetAutoSlide();
                        }}
                    />
                ))}
            </div>

            {/* Track */}
            <div
                ref={trackRef}
                className={styles.image_container}
                onMouseDown={(e) => handleStart(e.clientX)}
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseUp={(e) => handleEnd(e.clientX)}
                onMouseLeave={(e) => handleEnd(e.clientX)}
                onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
            >
                {data.map((item) => {
                    const img = JSON.parse(item.content_thumbnail) as Thumbnail[];

                    return (
                        <div
                            key={item.post_id}
                            className={styles.slide}
                        >
                            <img

                                src={img?.[0]?.url ?? defaultContentDt}
                                className={styles.img}
                                draggable={false}
                            />
                            <Link
                                href={`${item.content_type}/${item.slug}`}
                                className={styles.meta_container}
                            >
                                <div className={styles.meta_label_type}>
                                    <div className={styles.meta_dot_icon}>

                                        {getTypeIcon(item?.content_type?.toLowerCase() as Post['content_type'])}
                                    </div>
                                    <span className={styles.meta_type_text}>
                                        {`${item.content_type} ${item.category_id ? " - " + item.category_id : ""}`}
                                    </span>
                                </div>
                                <h1
                                    className={styles.meta_title}
                                >
                                    {item.title}
                                </h1>
                                <div className={styles.meta_others_container}>
                                    <div className={styles.meta_others_user_time}>
                                        {item?.author?.username && (<span>{`by ${item.author.username} | `}</span>)}
                                        <div className={styles.created_at_container}>
                                            <div className={styles.created_at_icon}>
                                                <IoTimeOutline size={12} />
                                            </div>
                                            <span className={styles.created_at}>{formatDateProfessional(item.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className={styles.meta_others_icons}>
                                        <div className={styles.meta_bookmark_icon}>
                                            <BsBookmark size={20} color={isBookmarked ? "var(--accent)" : ""} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div >
    );
};

export default HomeCarousel;
