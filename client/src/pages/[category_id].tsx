import { FC, ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { Pagination, PaginationItem } from "@mui/material";

import styles from "./css/category.module.css";
import { clientURL, siteName } from "@/constants/variables/global.vars";
import HorizontalCard from "@/components/utilities/horizontal.card";
import { Post, PostFilter, Thumbnail } from "@/constants/types/post.type";
import { APIArrayResponse } from "@/constants/types/global.types";
import { useGlobalProvider } from "@/constants/providers/global.provider";
import EmptyList from "@/components/utilities/empty.list";
import { getPosts } from "@/constants/controllers/posts.controller";

interface Props {
    data: APIArrayResponse;
    activeCategory: string;
}

const Category: FC<Props> = ({ data, activeCategory }): ReactNode => {
    const router = useRouter();
    const { page, totalResult, perPage, results } = data;
    const mobileClass = useGlobalProvider().isMobile ? "mobile_" : "";

    const categoryName = activeCategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // --- SEO & SEMANTIC LOGIC ---
    const seoTitle = `${categoryName} - Latest Updates & Content | Page ${page} | ${siteName}`;
    const seoDesc = `Browse the latest ${categoryName} content on ${siteName}. View ${totalResult} results including articles, videos, and more. Page ${page}.`;

    // Multi-Graph Schema for Category Hubs
    const categorySchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": clientURL },
                    { "@type": "ListItem", "position": 2, "name": categoryName }
                ]
            },
            {
                "@type": "ItemList",
                "name": `${categoryName} Content List`,
                "numberOfItems": results.length,
                "itemListElement": results.map((item: Post, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "CreativeWork",
                        "name": item.title,
                        "headline": item.title,
                        "url": `${clientURL.toLowerCase()}/${item.content_type?.toLowerCase()}/${item.slug}`,
                        "image": typeof item.content_thumbnail === "string" ? (JSON.parse(item.content_thumbnail ?? "[]") as Thumbnail[])[0]?.url : item.content_thumbnail?.[0]?.url,
                    }
                }))
            }
        ]
    };

    const totalPages = Math.ceil(Number(totalResult) / Number(perPage));

    return (
        <>
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${clientURL}${router.asPath}`} />
                <meta name="robots" content="index, follow" />

                <link rel="canonical" href={`${clientURL}/category/${activeCategory}`} />

                {Number(page) > 1 && <link rel="prev" href={`${clientURL}/category/${activeCategory}?page=${Number(page) - 1}`} />}
                {Number(page) < totalPages && <link rel="next" href={`${clientURL}/category/${activeCategory}?page=${Number(page) + 1}`} />}

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
                />
            </Head>

            <main className={styles[`${mobileClass}container`]}>
                <header className={styles.header_container}>
                    <h1 className={styles.header_text}>{categoryName}</h1>
                    <p className={styles.result_count}>{totalResult} results available</p>
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
                        <EmptyList title={`No content found in ${categoryName}.`} />
                    </div>
                )}

                {totalPages > 1 && (
                    <nav aria-label="Pagination" className={styles.pagination_container}>
                        <Pagination
                            renderItem={(item) => (
                                <PaginationItem
                                    component={Link}
                                    href={{
                                        pathname: `/${activeCategory}`,
                                        query: { page: item.page },
                                    }}
                                    {...item}
                                />
                            )}
                            page={Number(page)}
                            count={totalPages}
                            hidePrevButton={Number(page) < 2}
                            hideNextButton={Number(page) >= totalPages}
                        />
                    </nav>
                )}
            </main>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { category_id } = context.params as { category_id: string };
    const { page = "1" } = context.query;

    if (!category_id) return { notFound: true };

    const filter = {
        page: Number(page),
        category_id: category_id,
    } as PostFilter;

    try {
        const { data, error } = await getPosts(filter);

        if (error || !data || Number(data.totalResult) === 0) {
            return { notFound: true };
        }

        return {
            props: {
                data,
                activeCategory: category_id
            }
        };
    } catch (err) {
        return { notFound: true };
    }
};

export default Category;