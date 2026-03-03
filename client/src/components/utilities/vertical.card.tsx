import React, { FC, ReactNode } from 'react'
import styles from "./css/vertical.card.module.css";
import type { Post, Thumbnail } from '@/constants/types/post.type';
import Link from 'next/link';
import { GoDotFill } from 'react-icons/go';
import { IoTimeOutline } from 'react-icons/io5';
import { defaultContentDt, formatDateProfessional, getTypeIcon } from '@/constants/variables/global.vars';
import ImageViewer from './viewable_image';



interface Props {
    data: Post;
}

const VerticalCard: FC<Props> = ({ data }): ReactNode => {
    const postUrl = `/${data.content_type?.toLowerCase()}/${data.slug}`;
    const img = JSON.parse(data.content_thumbnail) as Thumbnail[];

    return (
        <Link
            href={postUrl}
            className={styles.container}
            itemScope
            itemType="https://schema.org/MusicRecording" // Consistent with your list schema
        >
            <div className={styles.image_container}>
                <ImageViewer
                    src={img?.[0]?.url ?? defaultContentDt}
                    // SEO FIX: Provide descriptive alt text
                    alt={data.title}
                    itemProp="image"
                    options={{
                        thumbnailClassName: styles.image,
                        canView: false
                    }}
                />
            </div>

            <main className={styles.meta_container} itemProp="url">
                <div className={styles.meta_label_type}>
                    <div className={styles.meta_dot_icon}>
                        {getTypeIcon(data?.content_type?.toLowerCase() as Post['content_type'])}
                    </div>
                    <span className={styles.meta_type_text}>
                        {data.content_type}
                    </span>
                </div>

                {/* SEO FIX: Use H3 and REMOVE JS-based truncation */}
                <h3 className={styles.meta_title} itemProp="name">
                    {data.title}
                </h3>

                <div className={styles.meta_others_container}>
                    <div className={styles.meta_others_user_time}>
                        <div className={styles.created_at_container}>
                            <div className={styles.created_at_icon}>
                                <IoTimeOutline size={12} />
                            </div>
                            {/* SEO FIX: Use semantic <time> tag */}
                            <time
                                className={styles.created_at}
                                dateTime={data.created_at}
                            >
                                {formatDateProfessional(data.created_at)}
                            </time>
                        </div>
                    </div>
                </div>
            </main>
        </Link>
    );
};


export default VerticalCard