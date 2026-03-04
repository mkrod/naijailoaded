import { FC, ReactNode } from "react";
import styles from "./css/news.module.css";
import Dropdown, { DropdownOption } from "@/components/utilities/dropdown";
import { clientURL, siteName } from "@/constants/variables/global.vars";
import HorizontalCard from "@/components/utilities/horizontal.card";
import { Pagination, PaginationItem } from "@mui/material";
import Head from "next/head";
import { Post, PostFilter, Thumbnail } from "@/constants/types/post.type";
import { useRouter } from "next/router";
import { APIArrayResponse } from "@/constants/types/global.types";
import { useGlobalProvider } from "@/constants/providers/global.provider";
import EmptyList from "@/components/utilities/empty.list";
import Link from "next/link";
import { getPosts } from "@/constants/controllers/posts.controller";
import { getCategories } from "@/constants/controllers/categories.controller";
import { CategoriesFilter } from "@/constants/types/categories.type";
import { GetServerSideProps } from "next";
import NewsTicker from "@/components/utilities/news.ticker";

const timeFilter: DropdownOption[] = [
    { id: "newest", name: "Newest" },
    { id: "oldest", name: "Oldest" },
];

interface Props {
    data: APIArrayResponse;
    categories: APIArrayResponse;
}

const News: FC<Props> = ({ data, categories }): ReactNode => {
    const router = useRouter();
    const { page, totalResult, perPage, results } = data;
    const mobileClass = useGlobalProvider().isMobile ? "mobile_" : "";

    const handleFilterChange = (key: string, value: string) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, [key]: value, page: 1 },
        });
    };

    const handlePageChange = (_: any, newPage: number) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: newPage },
        });
    };

    const categoryFilter: DropdownOption[] = categories?.results?.map((c) => ({
        name: c.name,
        id: c.category_id
    })) ?? [];
    categoryFilter.unshift({ name: "All Categories", id: "" });

    // --- SEO & NEWS OPTIMIZATION ---
    const activeCategory = categoryFilter.find(c => c.id !== "" && c.id === router.query.category_id);
    const categoryName = activeCategory ? activeCategory.name : "Latest News";

    // Fixed: Updated to News keywords
    const seoTitle = `${categoryName} - Breaking News & Updates ${Number(page) > 1 ? `(Page ${page})` : ""} | ${siteName}`;
    const seoDesc = `Stay updated with the latest ${categoryName} and breaking stories on ${siteName}. Found ${totalResult} articles. Updated daily for ${new Date().getFullYear()}.`;

    const firstItemThumb = results.length > 0
        ? typeof results[0].content_thumbnail === "string" ? (JSON.parse(results[0].content_thumbnail ?? "[]") as Thumbnail[])[0]?.url
            : (results[0].content_thumbnail as Thumbnail)?.url
        : "";

    // Multi-Graph Schema: Breadcrumbs + News Article ItemList
    const newsSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": clientURL },
                    { "@type": "ListItem", "position": 2, "name": "News", "item": `${clientURL}/news` },
                    activeCategory && { "@type": "ListItem", "position": 3, "name": categoryName }
                ].filter(Boolean)
            },
            {
                "@type": "ItemList",
                "name": `${categoryName} Headlines`,
                "numberOfItems": results.length,
                "itemListElement": results.map((item: Post, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "NewsArticle", // Changed from MusicRecording
                        "headline": item.title,
                        "url": `${clientURL.toLowerCase()}/${item.content_type?.toLowerCase()}/${item.slug}`,
                        "image": typeof item.content_thumbnail === "string" ? (JSON.parse(item.content_thumbnail ?? "[]") as Thumbnail[])[0]?.url : item.content_thumbnail?.[0]?.url,
                        "datePublished": item.created_at
                    }
                }))
            }
        ]
    };

    return (
        <>
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <meta name="robots" content="index, follow, max-image-preview:large" />

                {/* Open Graph */}
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${clientURL}${router.asPath}`} />
                {firstItemThumb && <meta property="og:image" content={firstItemThumb} />}

                {/* Fixed: Updated Canonical and Pagination links to /news */}
                <link rel="canonical" href={`${clientURL}/news${router.query.category_id ? `?category_id=${router.query.category_id}` : ""}`} />
                {Number(page) > 1 && (
                    <link rel="prev" href={`${clientURL}/news?page=${Number(page) - 1}${router.query.category_id ? `&category_id=${router.query.category_id}` : ""}`} />
                )}
                {Number(page) < Math.ceil(Number(totalResult) / Number(perPage)) && (
                    <link rel="next" href={`${clientURL}/news?page=${Number(page) + 1}${router.query.category_id ? `&category_id=${router.query.category_id}` : ""}`} />
                )}

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
                />
            </Head>

            <main className={styles[`${mobileClass}container`]}>
                {/* ADD TICKER HERE */}
                <NewsTicker items={results.slice(0, 5)} />
                <header className={styles.header_container}>
                    <h1 className={styles.header_text}>{categoryName}</h1>
                    <div className={styles[`${mobileClass}header_filter_container`]}>
                        <Dropdown
                            options={categoryFilter}
                            defaultValue={categoryFilter[0]?.name}
                            value={(router.query.category_id as string) ?? ""}
                            onChange={(category_id) => handleFilterChange("category_id", category_id)}
                            placeholder="Filter by Category"
                        />
                        <Dropdown
                            options={timeFilter}
                            defaultValue={timeFilter[0]?.id}
                            value={(router.query.order as string) ?? ""}
                            onChange={(order) => handleFilterChange("order", order)}
                            placeholder="Sort By"
                        />
                    </div>
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
                        <EmptyList title={`No news articles found in ${categoryName}`} />
                    </div>
                )}

                <nav aria-label="News pagination" className={styles.pagination_container}>
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

export const getServerSideProps: GetServerSideProps = async (context: any) => {
    const { page = 1, category_id = "", order = "newest" } = context.query;

    const filter = {
        page: Number(page),
        category_id,
        order,
        content_type: "news" // Ensures we only fetch news
    } as PostFilter;

    try {
        const { data } = await getPosts(filter);
        const { data: categories } = await getCategories({} as CategoriesFilter);

        if (!data) return { notFound: true };

        return { props: { data, categories } };
    } catch (e) {
        return { notFound: true };
    }
};

export default News;