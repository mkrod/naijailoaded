import { FC, ReactNode, useMemo } from "react";
import styles from "./css/others.module.css";
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

const timeFilter: DropdownOption[] = [
    { id: "newest", name: "Newest" },
    { id: "oldest", name: "Oldest" },
];

interface Props {
    data: APIArrayResponse;
    categories: APIArrayResponse;
}

const Others: FC<Props> = ({ data, categories }): ReactNode => {
    const router = useRouter();
    const { page, totalResult, perPage, results } = data;
    const { isMobile } = useGlobalProvider();
    const mobileClass = isMobile ? "mobile_" : "";

    const handleFilterChange = (key: string, value: string) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, [key]: value, page: 1 },
        });
    };

    const categoryFilter: DropdownOption[] = useMemo(() => {
        const options = categories?.results?.map((c) => ({
            name: c.name,
            id: c.category_id
        })) ?? [];
        return [{ name: "All Categories", id: "" }, ...options];
    }, [categories]);

    // --- SEO & CONTENT OPTIMIZATION ---
    const activeCategory = categoryFilter.find(c => c.id !== "" && c.id === router.query.category_id);
    const categoryName = activeCategory ? activeCategory.name : "Other Contents";

    const seoTitle = `${categoryName} ${Number(page) > 1 ? `(Page ${page})` : ""} | ${siteName}`;
    const seoDesc = `Explore ${categoryName} on ${siteName}. Discover ${totalResult} articles and updates. Updated for ${new Date().getFullYear()}.`;

    // Helper to extract thumbnail URL safely
    const getThumbUrl = (item: Post): string => {
        if (!item?.content_thumbnail) return "";
        try {
            const thumbs = typeof item.content_thumbnail === "string"
                ? JSON.parse(item.content_thumbnail) as Thumbnail[]
                : item.content_thumbnail as Thumbnail[];
            return Array.isArray(thumbs) ? thumbs[0]?.url : (thumbs as any)?.url || "";
        } catch (e) {
            return "";
        }
    };

    const firstItemThumb = results.length > 0 ? getThumbUrl(results[0]) : "";

    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": clientURL },
                    { "@type": "ListItem", "position": 2, "name": "Others", "item": `${clientURL}/others` },
                    ...(activeCategory ? [{ "@type": "ListItem", "position": 3, "name": categoryName }] : [])
                ]
            },
            {
                "@type": "ItemList",
                "name": `${categoryName} List`,
                "numberOfItems": results.length,
                "itemListElement": results.map((item: Post, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "Article",
                        "headline": item.title,
                        "url": `${clientURL}/${item.content_type?.toLowerCase() || 'others'}/${item.slug}`,
                        "image": getThumbUrl(item),
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
                <meta name="robots" content="index, follow" />

                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${clientURL}${router.asPath}`} />
                {firstItemThumb && <meta property="og:image" content={firstItemThumb} />}

                <link rel="canonical" href={`${clientURL}/others${router.query.category_id ? `?category_id=${router.query.category_id}` : ""}`} />

                {Number(page) > 1 && (
                    <link rel="prev" href={`${clientURL}/others?page=${Number(page) - 1}${router.query.category_id ? `&category_id=${router.query.category_id}` : ""}`} />
                )}
                {Number(page) < Math.ceil(Number(totalResult) / Number(perPage)) && (
                    <link rel="next" href={`${clientURL}/others?page=${Number(page) + 1}${router.query.category_id ? `&category_id=${router.query.category_id}` : ""}`} />
                )}

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />
            </Head>

            <main className={styles[`${mobileClass}container`]}>
                <header className={styles.header_container}>
                    <h1 className={styles.header_text}>{categoryName}</h1>
                    <div className={styles[`${mobileClass}header_filter_container`]}>
                        <Dropdown
                            options={categoryFilter}
                            defaultValue="All Categories"
                            value={(router.query.category_id as string) ?? ""}
                            onChange={(id) => handleFilterChange("category_id", id)}
                            placeholder="Category"
                        />
                        <Dropdown
                            options={timeFilter}
                            defaultValue="Newest"
                            value={(router.query.order as string) ?? "newest"}
                            onChange={(order) => handleFilterChange("order", order)}
                            placeholder="Sort"
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
                        <EmptyList title={`Nothing found in ${categoryName}`} />
                    </div>
                )}

                <nav aria-label="Pagination" className={styles.pagination_container}>
                    <Pagination
                        page={Number(page)}
                        count={Math.ceil(Number(totalResult) / Number(perPage))}
                        renderItem={(item) => (
                            <PaginationItem
                                component={Link}
                                href={{
                                    pathname: "/others",
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

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { page = 1, category_id = "", order = "newest" } = context.query;

    const filter = {
        page: Number(page),
        category_id: category_id as string,
        order,
        content_type: "others"
    } as PostFilter;

    try {
        const [{ data }, { data: categories }] = await Promise.all([
            getPosts(filter),
            getCategories({} as CategoriesFilter)
        ]);

        if (!data) return { notFound: true };

        return { props: { data, categories } };
    } catch (e) {
        return { notFound: true };
    }
};

export default Others;