import React, { FC, useEffect, useState } from 'react'
import styles from "./css/album.child.card.module.css";
import { Content } from '@/constants/types/post.type';
import { LiaDownloadSolid } from 'react-icons/lia';
import Link from 'next/link';

interface Props {
    data: Content;
    idx: number;
    activeIndex?: number;
    setActive?: (index: number) => void;
}


const AlbumChildCard: FC<Props> = ({ data, idx, activeIndex = 0, setActive }) => {
    const [artistName, setArtistName] = useState<string>("")
    const [title, setTitle] = useState<string>("");


    useEffect(() => {
        const format = (str = "") =>
            str
                .replace(/[^a-zA-Z0-9 ]/g, " ") // remove special characters
                .replace(/\s+/g, " ")           // collapse multiple spaces
                .trim()
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");

        // Artist name: either displayName or first part of title
        const artistSource =
            //data?.artist?.displayName ??
            data?.title?.split(/\s*[-–]\s*/)[0] ?? "";

        // Title name: second part of title (after - or –) or full title
        const titleSource =
            data?.title?.split(/\s*[-–]\s*/)[1] ?? data?.title ?? "";

        setArtistName(format(artistSource));
        setTitle(format(titleSource));
    }, [data?.title]);


    return (
        <div
            className={`${styles.container}  ${activeIndex === idx ? styles.container_active : ""}`}
        >
            <div className={styles.index_container}>
                {idx + 1}.
            </div>
            <div
                onClick={() => setActive?.(idx)}
                className={styles.title_artist_container}
            >
                <span className={styles.title}>{title}</span>
                <span className={styles.artist}>{artistName}</span>
            </div>
            <div className={styles.download_container}>
                <Link
                    href={data.url}
                    download={`${data.title?.replaceAll("-", "")}.mp3`}
                    className={styles.download_icon}
                >
                    <LiaDownloadSolid size={18} />
                </Link>
            </div>
        </div>
    )
}

export default AlbumChildCard