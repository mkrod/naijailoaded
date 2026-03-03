import React, { FC, ReactNode } from 'react'
import styles from "./css/home.module.css"
import HomeCarousel from '@/components/utilities/home.carousel'
import HorizontalCard from '@/components/utilities/horizontal.card'
import VerticalCard from '@/components/utilities/vertical.card'
import { HomePageContentProps } from '..'
import Link from 'next/link'


interface Props {
    data?: HomePageContentProps;
}

const MobileHome: FC<Props> = ({ data }): ReactNode => {

    //console.log(data);

    return (
        <div className={styles.container}>

            {(data?.trending?.results || []).length > 0 && (
                <HomeCarousel
                    width="100%"
                    square
                    data={data?.trending?.results?.slice(0, 4) || []} /**Trending Content Here Ranked show top 4 or 5 */
                />
            )}

            {(data?.news?.results || []).length > 0 && (
                <div className={styles.cards_section}>
                    {data?.news?.results.slice(0, 2).map((data) => ( //Random News
                        <HorizontalCard
                            key={data.post_id}
                            data={data}
                        />
                    ))}
                </div>
            )}


            {(data?.video?.results || []).length > 0 && (
                <div className={styles.cards_section}>
                    {data?.video?.results?.slice(0, 2).map((data) => ( //Random News
                        <VerticalCard
                            key={data.post_id}
                            data={data}
                        />
                    ))}
                </div>
            )}


            {(data?.music?.results || []).length > 0 && (
                <div className={styles.section_two}>
                    <header className={styles.section_two_header}>
                        <h1 className={styles.section_two_header_text}>New Music</h1>
                        <div className={styles.section_two_header_line} />
                    </header>
                    <div className={styles.section_two_contents}>
                        <div className={styles.section_two_contents_inner}>
                            {data?.music?.results?.slice(0, 12).map((data) => (
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
                    <header className={styles.section_two_header}>
                        <h1 className={styles.section_two_header_text}>Hotest Songs</h1>
                        <div className={styles.section_two_header_line} />
                    </header>
                    <div className={styles.section_two_contents}>
                        <div className={styles.section_two_contents_inner}>
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
                    <header className={styles.section_two_header}>
                        <h1 className={styles.section_two_header_text}>Latest Dj Mix</h1>
                        <div className={styles.section_two_header_line} />
                    </header>
                    <div className={styles.section_two_contents}>
                        <div className={styles.section_two_contents_inner}>
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
                    <header className={styles.section_two_header}>
                        <h1 className={styles.section_two_header_text}>Latest Article</h1>
                        <div className={styles.section_two_header_line} />
                    </header>
                    <div className={styles.section_two_contents}>
                        <div className={styles.section_two_contents_inner}>
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


            {(data?.recommended?.results || []).length > 0 && (
                <div className={styles.section_two}>
                    <header className={styles.section_two_header}>
                        <h1 className={styles.section_two_header_text}>Recommended</h1>
                        <div className={styles.section_two_header_line} />
                    </header>
                    <div className={styles.section_two_contents}>
                        <div className={styles.section_two_contents_inner}>
                            {data?.recommended?.results?.slice(0, 12).map((data) => (
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
                    </div>
                    <div className={styles.section_two_nav_container}>
                        <button className={styles.section_two_nav}>
                            View All
                        </button>
                    </div>
                </div>
            )}


        </div>
    )
}





export default MobileHome;