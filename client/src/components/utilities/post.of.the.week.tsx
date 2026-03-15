import React, { FC, ReactNode } from 'react'
import styles from "./css/post.of.the.week.module.css";
import { Post } from '@/constants/types/post.type';
import HomeCarousel from './home.carousel';

interface Props {
    post: Post;
}
const PostOfTheWeek: FC<Props> = ({ post }): ReactNode => {

    return (
        <div className={styles.container}>
            <div className={styles.header_container}>
                <div className={styles.header_text}>
                    post of the week
                </div>
            </div>
            <div className={styles.content_container}>
                <HomeCarousel
                    data={[post]}
                    width="100%"
                />
            </div>
        </div>
    )
}

export default PostOfTheWeek