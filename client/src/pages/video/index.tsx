import { FC, ReactNode } from "react";
import styles from "./css/video.module.css";
import Dropdown, { DropdownOption } from "@/components/utilities/dropdown";
import { clientURL, siteName } from "@/constants/variables/global.vars";
import { Pagination, PaginationItem } from "@mui/material";
import Head from "next/head";
import { Post, PostFilter, Thumbnail } from "@/constants/types/post.type";
import { useRouter } from "next/router";
import { APIArrayResponse } from "@/constants/types/global.types";
import { useGlobalProvider } from "@/constants/providers/global.provider";
import EmptyList from "@/components/utilities/empty.list";
import Link from "next/link";
import VerticalCard from "@/components/utilities/vertical.card";
import { getPosts } from "@/constants/controllers/posts.controller";
import { getCategories } from "@/constants/controllers/categories.controller";
import { CategoriesFilter } from "@/constants/types/categories.type";
import { GetServerSideProps } from "next";

const timeFilter: DropdownOption[] = [
    { id: "newest", name: "Newest" },
    { id: "oldest", name: "Oldest" },
];

interface Props {
    data: APIArrayResponse;
    categories: APIArrayResponse;
}

const Video: FC<Props> = ({ data, categories }): ReactNode => {
    const router = useRouter();
    const { page, totalResult, perPage, results } = data;

    const mobileClass = useGlobalProvider().isMobile ? "mobile_" : "";

    const handleFilterChange = (key: string, value: string) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, [key]: value, page: 1 },
        }, undefined, { shallow: false });
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
    categoryFilter.unshift({ name: "Filter by category", id: "" });

    // --- SEO & TRENDING OPTIMIZATION ---
    const activeCategory = categoryFilter.find(c => c.id !== "" && c.id === router.query.category_id);
    const categoryName = activeCategory ? activeCategory.name : "All Videos";

    const seoTitle = `Watch ${categoryName} - Latest Trending Videos ${Number(page) > 1 ? `(Page ${page})` : ""} | ${siteName}`;
    const seoDesc = `Stream the latest ${categoryName} videos on ${siteName}. Discover high-quality trending content and viral clips. Found ${totalResult} videos.`;

    const firstItemThumb = results.length > 0
        ? typeof results[0].content_thumbnail === "string" ? (JSON.parse(results[0].content_thumbnail ?? "[]") as Thumbnail[])[0]?.url
            : (results[0].content_thumbnail as Thumbnail)?.url
        : "";

    // Multi-Graph Schema: Breadcrumbs + Video ItemList
    const videoSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": clientURL },
                    { "@type": "ListItem", "position": 2, "name": "Videos", "item": `${clientURL}/video` },
                    activeCategory && { "@type": "ListItem", "position": 3, "name": categoryName }
                ].filter(Boolean)
            },
            {
                "@type": "ItemList",
                "name": `${categoryName} Video Gallery`,
                "numberOfItems": results.length,
                "itemListElement": results.map((item: Post, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "VideoObject",
                        "name": item.title,
                        "description": item.description || seoDesc,
                        "thumbnailUrl": typeof item.content_thumbnail === "string" ? (JSON.parse(item.content_thumbnail ?? "[]") as Thumbnail[])[0]?.url : item.content_thumbnail?.[0]?.url,
                        "uploadDate": item.created_at,
                        "contentUrl": `${clientURL}/${item.content_type?.toLowerCase()}/${item.slug}`,
                        "url": `${clientURL}/${item.content_type?.toLowerCase()}/${item.slug}`
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
                <meta property="og:type" content="video.other" />
                <meta property="og:url" content={`${clientURL}${router.asPath}`} />
                {firstItemThumb && <meta property="og:image" content={firstItemThumb} />}
                <meta name="twitter:card" content="summary_large_image" />

                <link rel="canonical" href={`${clientURL}/video${router.query.category_id ? `?category_id=${router.query.category_id}` : ""}`} />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
                />
            </Head>

            <main className={styles[`${mobileClass}container`]}>
                <header className={styles.header_container}>
                    <h1 className={styles.header_text}>Explore {categoryName}</h1>
                    <div className={styles[`${mobileClass}header_filter_container`]}>
                        <Dropdown
                            options={categoryFilter}
                            defaultValue={categoryFilter[0]?.name}
                            value={(router.query.category_id as string) ?? ""}
                            onChange={(category_id) => handleFilterChange("category_id", category_id)}
                            placeholder="Filter by Categories"
                        />
                        <Dropdown
                            options={timeFilter}
                            defaultValue={timeFilter[0]?.id}
                            value={(router.query.order as string) ?? ""}
                            onChange={(order) => handleFilterChange("order", order)}
                            placeholder="Filter by Date"
                        />
                    </div>
                </header>

                <section>
                    <ul className={styles[`${mobileClass}content_container`]}>
                        {results.map((item) => (
                            <li key={item.post_id}>
                                <VerticalCard data={item} />
                            </li>
                        ))}
                    </ul>
                </section>

                {results.length === 0 && (
                    <div className={styles.empty_container}>
                        <EmptyList title={`No ${categoryName} found`} />
                    </div>
                )}

                <nav aria-label="Video pagination" className={styles.pagination_container}>
                    <Pagination
                        page={Number(page)}
                        count={Math.ceil(Number(totalResult) / Number(perPage))}
                        onChange={handlePageChange}
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
        content_type: "video"
    } as PostFilter;

    try {
        const { data } = await getPosts(filter);
        const { data: categories } = await getCategories({} as CategoriesFilter);

        if (!data) {
            return { notFound: true };
        }

        return { props: { data, categories } };
    } catch (e) {
        return { notFound: true };
    }
};

export default Video;