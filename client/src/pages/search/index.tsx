import Head from "next/head";
import { useRouter } from "next/router";
import { FC } from "react";
import { siteName, clientURL } from "@/constants/variables/global.vars";
import { Post, PostFilter, Thumbnail } from "@/constants/types/post.type";
import { APIArrayResponse, Response } from "@/constants/types/global.types";
import { GetServerSideProps } from "next";
import styles from "./css/search.module.css";
import { getPosts } from "@/constants/controllers/posts.controller";
import { Pagination, PaginationItem } from "@mui/material";
import Link from "next/link";
import EmptyList from "@/components/utilities/empty.list";
import HorizontalCard from "@/components/utilities/horizontal.card";
import { useGlobalProvider } from "@/constants/providers/global.provider";

interface Props {
    data: APIArrayResponse;
}

const Search: FC<Props> = ({ data }) => {
    const router = useRouter();
    const { q } = router.query;
    const { results, totalResult, page, perPage } = data;

    // --- SEO & TRENDING OPTIMIZATION ---
    const searchQuery = typeof q === "string" ? q : "";
    const capitalizedQuery = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);

    // Enhanced Title for CTR: "Trending [Topic] Results" 
    const seoTitle = `${capitalizedQuery} - Latest Trends & Results ${Number(page) > 1 ? `(Page ${page})` : ""} | ${siteName}`;
    const seoDesc = `Explore the most recent and trending content for "${searchQuery}" on ${siteName}. Found ${totalResult} results updated for ${new Date().getFullYear()}.`;

    // Extract first item thumbnail for Social Media OG image
    const firstItemThumb = results.length > 0
        ? typeof results[0].content_thumbnail === "string" ? (JSON.parse(results[0].content_thumbnail ?? "[]") as Thumbnail[])[0]?.url
            : (results[0].content_thumbnail as Thumbnail)?.url
        : "";

    // Structured Data: ItemList + Breadcrumbs + SearchAction
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": clientURL },
                    { "@type": "ListItem", "position": 2, "name": "Search", "item": `${clientURL}/search` },
                    { "@type": "ListItem", "position": 3, "name": capitalizedQuery }
                ]
            },
            {
                "@type": "ItemList",
                "name": `Search results for ${searchQuery}`,
                "numberOfItems": results.length,
                "itemListElement": results.map((item: Post, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "url": `${clientURL}/${item.content_type?.toLowerCase()}/${item.slug}`,
                    "name": item.title
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
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />

                {/* Canonical: Ensures Google doesn't penalize for duplicate query params */}
                <link rel="canonical" href={`${clientURL}/search?q=${encodeURIComponent(searchQuery)}`} />

                {/* Open Graph / Social - Crucial for "Trending" content visibility */}
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:type" content="website" />
                {firstItemThumb && <meta property="og:image" content={firstItemThumb} />}
                <meta property="og:url" content={`${clientURL}${router.asPath}`} />
                <meta property="og:site_name" content={siteName} />
                <meta name="twitter:card" content="summary_large_image" />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>

            <main className={styles[`${mobileClass}container`]}>
                <header className={styles.header_container}>
                    <h1 className={styles.header_text}>
                        Results for <span className={styles.query_highlight}>"{searchQuery}"</span>
                    </h1>
                    <p className={styles.results_count}>
                        Showing {results.length} of {totalResult} items found
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
                        <EmptyList title={`No results found for "${searchQuery}"`} />
                    </div>
                )}

                <nav aria-label="Search results pagination" className={styles.pagination_container}>
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
    const { q, page } = context.query as { q: string, page: string };
    let p = page || "1";

    if (typeof q !== 'string' || !q.trim() || q.trim().length < 2) {
        return { notFound: true };
    }

    try {
        const { data } = await getPosts({ title: q.trim(), page: Number(p) } as PostFilter) as Response<APIArrayResponse>;

        if (!data) {
            return { notFound: true };
        }

        return {
            props: { data }
        };
    } catch (error) {
        console.error("Search error:", error);
        return { notFound: true };
    }
}

export default Search;