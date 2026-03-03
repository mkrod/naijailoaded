import React, { FC } from 'react';
import styles from "./css/music.player.placeholder.module.css";
import { Post, Thumbnail } from '@/constants/types/post.type';
import { defaultContentDt } from '@/constants/variables/global.vars';

interface Props {
    data: Post;
}

const MusicPlayerPlaceholder: FC<Props> = ({ data }) => {
    const img = typeof data.content_thumbnail === "string" ? JSON.parse(data.content_thumbnail) as Thumbnail[] : data.content_thumbnail;
    //const img = JSON.parse(data.content_thumbnail) as Thumbnail[];


    return (
        <div className={styles.wrapper} aria-busy="true" aria-live="polite">
            {/* Background blur/overlay for aesthetic consistency */}
            <div className={styles.art_container}>
                <img
                    src={img?.[0]?.url ?? defaultContentDt}
                    alt={data.title}
                    className={styles.thumbnail}
                />
            </div>

            <div className={styles.info_container}>
                {/* SEO: Keeping the title in the static HTML */}
                <span className={styles.title}>{data.title}</span>
                <span className={styles.subtitle}>Preparing audio...</span>
            </div>

            {/* Static visual representation of controls */}
            <div className={styles.controls_mock}>
                <div className={styles.progress_bar_mock}></div>
                <div className={styles.buttons_mock}>
                    <div className={styles.circle_small}></div>
                    <div className={styles.circle_large}></div>
                    <div className={styles.circle_small}></div>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayerPlaceholder;