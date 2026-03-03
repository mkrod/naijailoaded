import type { FC } from 'react'
import styles from "./css/horizontal.card.module.css";
import { Post, Thumbnail } from '@/constants/types/post.type';
import Link from 'next/link';
import { IoTimeOutline } from 'react-icons/io5';
import { defaultContentDt, formatDateProfessional, getTypeIcon } from '@/constants/variables/global.vars';
import ImageViewer from './viewable_image';

interface Props {
    data: Post;
}

const HorizontalCard: FC<Props> = ({ data }) => {
    const postUrl = `/${data.content_type?.toLowerCase()}/${data.slug}`;
    const img = typeof data.content_thumbnail === "string" ? JSON.parse(data.content_thumbnail) as Thumbnail[] : data.content_thumbnail;
    //const img = JSON.parse(data.content_thumbnail) as Thumbnail[];

    return (
        <Link
            href={postUrl}
            className={styles.container}
            itemScope
            itemType="https://schema.org/MusicRecording"
        >
            <div
                className={styles.image_container}
                role="button"
                aria-label={`View cover art for ${data.title}`}
            >
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

            {/* The actual clickable link for navigation */}
            <section
                className={styles.meta_container}
                itemProp="url"
            >
                <div className={styles.meta_label_type}>
                    <div className={styles.meta_dot_icon}>
                        {getTypeIcon(data?.content_type?.toLowerCase() as Post['content_type'])}
                    </div>
                    <span className={styles.meta_type_text}>
                        {data.content_type}
                    </span>
                </div>

                <h3 className={styles.meta_title} itemProp="name">
                    {data.title}
                </h3>

                <div className={styles.meta_others_container}>
                    <div className={styles.meta_others_user_time}>
                        <div className={styles.created_at_container}>
                            <div className={styles.created_at_icon}>
                                <IoTimeOutline size={12} />
                            </div>
                            <time
                                className={styles.created_at}
                                dateTime={data.created_at}
                            >
                                {formatDateProfessional(data.created_at)}
                            </time>
                        </div>
                    </div>
                </div>
            </section>
        </Link>
    );
}

export default HorizontalCard