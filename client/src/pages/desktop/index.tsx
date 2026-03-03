import React, { FC, ReactNode } from 'react'
import styles from "./css/home.module.css"
import HomeCarousel from '@/components/utilities/home.carousel'
import HorizontalCard from '@/components/utilities/horizontal.card'
import VerticalCard from '@/components/utilities/vertical.card'
import { testData } from '@/constants/variables/global.vars'
import { HomePageContentProps } from '..'
import Link from 'next/link'


interface Props {
    data?: HomePageContentProps;
}

const DesktopHome: FC<Props> = ({ data }): ReactNode => {



    return (
        <div className={styles.container}>

            <div className={styles.top_content}>
                {(data?.recommended?.results || []).length > 0 && (
                    <div className={styles.top_content_left}>

                        <div className={styles.top_content_left_header}>
                            <span className={styles.top_content_left_header_text}>Recommended</span>
                            <div className={styles.top_content_left_header_line} />
                        </div>
                        <div className={styles.top_content_left_contents}>
                            {data?.recommended?.results?.slice(0, 5).map((data) => (
                                <div
                                    key={data.post_id}
                                    className={styles.section_two_content}
                                >
                                    <HorizontalCard
                                        data={data}
                                    />
                                </div>
                            ))}
                        </div>

                    </div>
                )}
                <div className={styles.top_content_center}>
                    {(data?.trending?.results || []).length > 0 && (
                        <HomeCarousel
                            width="100%"
                            height="25rem"
                            data={data?.trending?.results?.slice(0, 4) || []} /**Trending Content Here Ranked show top 4 or 5 */
                        />
                    )}
                    {(data?.news?.results || []).length > 0 && (
                        <div className={styles.top_content_center_bottom}>
                            {data?.news?.results?.slice(0, 2).map((data) => ( //Random News
                                <div
                                    key={data.post_id}
                                    className={styles.top_content_center_bottom_content}
                                >
                                    <HorizontalCard
                                        data={data}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {(data?.video?.results || []).length > 0 && (
                    <div className={styles.top_content_right}>
                        {data?.video?.results?.map((data) => ( //Random videos
                            <VerticalCard
                                key={data.post_id}
                                data={data}
                            />
                        ))}
                    </div>
                )}
            </div>

            {(data?.music?.results || []).length > 0 && (
                <div className={styles.section_two}>
                    <div className={styles.section_two_header}>
                        <span className={styles.section_two_header_text}>New Music</span>
                        <div className={styles.section_two_header_line} />
                    </div>
                    <div className={styles.section_two_contents}>
                        {data?.music?.results.slice(0, 12).map((data) => (
                            <div
                                key={data.post_id}
                                className={styles.section_two_content}
                            >
                                <VerticalCard
                                    data={data}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.section_two_nav_container}>
                        <Link
                            href='/music'
                            className={styles.section_two_nav}
                        >
                            View All
                        </Link>
                    </div>
                </div>
            )}


            {(data?.hotsong?.results || []).length > 0 && (
                <div className={styles.section_two}>
                    <div className={styles.section_two_header}>
                        <span className={styles.section_two_header_text}>Hotest Songs</span>
                        <div className={styles.section_two_header_line} />
                    </div>
                    <div className={styles.section_two_contents}>
                        {data?.hotsong?.results?.slice(0, 12).map((data) => (
                            <div
                                key={data.post_id}
                                className={styles.section_two_content}
                            >
                                <HorizontalCard
                                    data={data}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.section_two_nav_container}>
                        <Link
                            href='/music'
                            className={styles.section_two_nav}
                        >
                            View All
                        </Link>
                    </div>
                </div>
            )}

            {(data?.mixtape?.results || []).length > 0 && (
                <div className={styles.section_two}>
                    <div className={styles.section_two_header}>
                        <span className={styles.section_two_header_text}>Latest Dj Mix</span>
                        <div className={styles.section_two_header_line} />
                    </div>
                    <div className={styles.section_two_contents}>
                        {data?.mixtape?.results?.slice(0, 12).map((data) => (
                            <div
                                key={data.post_id}
                                className={styles.section_two_content}
                            >
                                <HorizontalCard
                                    data={data}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.section_two_nav_container}>
                        <Link
                            href='/music?category_id=mix-tape'
                            className={styles.section_two_nav}
                        >
                            View All
                        </Link>
                    </div>
                </div>
            )}


            {(data?.news?.results || []).length > 0 && (
                <div className={styles.section_two}>
                    <div className={styles.section_two_header}>
                        <span className={styles.section_two_header_text}>Latest Article</span>
                        <div className={styles.section_two_header_line} />
                    </div>
                    <div className={styles.section_two_contents}>
                        {data?.news?.results?.slice(0, 12).map((data) => (
                            <div
                                key={data.post_id}
                                className={styles.section_two_content}
                            >
                                <HorizontalCard
                                    data={data}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.section_two_nav_container}>
                        <Link
                            href='/news'
                            className={styles.section_two_nav}
                        >
                            View All
                        </Link>
                    </div>
                </div>
            )}

        </div >
    )
}

export default DesktopHome