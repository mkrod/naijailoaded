import Head from "next/head";
import { useRouter } from "next/router";
import { FC } from "react";
import { siteName, clientURL } from "@/constants/variables/global.vars";
import { Post, PostFilter, Thumbnail } from "@/constants/types/post.type";
import { APIArrayResponse, Response } from "@/constants/types/global.types";
import { GetServerSideProps } from "next";
import styles from "./css/trending.module.css";
import { getPosts } from "@/constants/controllers/posts.controller";
import { Pagination, PaginationItem } from "@mui/material";
import Link from "next/link";
import EmptyList from "@/components/utilities/empty.list";
import HorizontalCard from "@/components/utilities/horizontal.card";
import { useGlobalProvider } from "@/constants/providers/global.provider";

interface Props {
    data: APIArrayResponse;
}

const Trending: FC<Props> = ({ data }) => {
    const router = useRouter();
    const { results, totalResult, page, perPage } = data;

    // --- SEO & TRENDING OPTIMIZATION ---
    // Trending hubs are optimized for "Top" and "Popular" keywords
    const seoTitle = `Trending Now: Top Stories & Viral Content ${Number(page) > 1 ? `- Page ${page}` : ""} | ${siteName}`;
    const seoDesc = `Stay ahead with the most popular content on ${siteName}. Discover today's trending stories, viral updates, and top-rated posts.`;

    // Extract first item thumbnail for Social Media sharing
    const trendingThumb = results.length > 0
        ? typeof results[0].content_thumbnail === "string" ? (JSON.parse(results[0].content_thumbnail ?? "[]") as Thumbnail[])[0]?.url
            : (results[0].content_thumbnail as Thumbnail)?.url
        : "";

    // Structured Data: CollectionPage + ItemList (Proper SEO standard)
    const trendingSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "name": `Trending on ${siteName}`,
                "description": seoDesc,
                "url": `${clientURL}/trending`
            },
            {
                "@type": "ItemList",
                "name": "Trending Stories",
                "numberOfItems": results.length,
                "itemListElement": results.map((item: Post, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "url": `${clientURL}/${item.content_type?.toLowerCase()}/${item.slug}`,
                    "name": item.title,
                    "image": typeof item.content_thumbnail === "string" ? (JSON.parse(item.content_thumbnail ?? "[]") as Thumbnail[])[0]?.url : item.content_thumbnail?.[0]?.url,
                }))
            }
        ]
    };

    const mobileClass = useGlobalProvider().isMobile ? "mobile_" : "";

    const handlePageChange = (_: any, newPage: number) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: newPage },
        }, undefined, { shallow: false });
    };

    return (
        <>
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                {/* Trending pages should be indexed to capture traffic for viral keywords */}
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />

                {/* Canonical: Maintain a clean URL for the trending hub */}
                <link rel="canonical" href={`${clientURL}/trending`} />

                {/* Open Graph / Social */}
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${clientURL}${router.asPath}`} />
                {trendingThumb && <meta property="og:image" content={trendingThumb} />}
                <meta name="twitter:card" content="summary_large_image" />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(trendingSchema) }}
                />
            </Head>

            <main className={styles[`${mobileClass}container`]}>
                <header className={styles.header_container}>
                    <h1 className={styles.header_text}>Explore Trending</h1>
                    <p className={styles.results_count}>
                        Showing {results.length} of the most popular content
                    </p>
                </header>

                <section>
                    <ul className={styles[`${mobileClass}content_container`]}>
                        {results.map((item) => (
                            <li key={item.post_id}>
                                <HorizontalCard data={item} />
                            </li>
                        ))}
                    </ul>
                </section>

                {results.length === 0 && (
                    <div className={styles.empty_container}>
                        <EmptyList title="No trending stories found today" />
                    </div>
                )}

                <nav aria-label="Trending pagination" className={styles.pagination_container}>
                    <Pagination
                        renderItem={(item) => (
                            <PaginationItem
                                component={Link}
                                href={{
                                    pathname: router.pathname,
                                    query: { ...router.query, page: item.page },
                                }}
                                {...item}
                            />
                        )}
                        page={Number(page)}
                        count={Math.ceil(Number(totalResult) / Number(perPage))}
                        hidePrevButton={Number(page) < 2}
                        hideNextButton={Number(page) >= Math.ceil(Number(totalResult) / Number(perPage))}
                        onChange={handlePageChange}
                    />
                </nav>
            </main>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { category_id, page = "1" } = context.query;

    try {
        const { data } = await getPosts({
            category_id,
            page: Number(page),
            is_trending: true
        } as PostFilter) as Response<APIArrayResponse>;

        if (!data) {
            return { notFound: true };
        }

        return {
            props: { data }
        };
    } catch (error) {
        console.error("Trending Error:", error);
        return { notFound: true };
    }
}

export default Trending;