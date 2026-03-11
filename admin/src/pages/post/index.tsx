import { useCallback, useEffect, useRef, useState, type FC, type ReactNode, type RefObject } from 'react'
import styles from "./css/post.module.css";
import { useGlobalProvider } from '@/constants/providers/global.provider';
import Dropdown from '@/components/utilities/dropdown';
import { useCategoryProvider } from '@/constants/providers/categories.provider';
import { usePostProvider } from '@/constants/providers/posts.provider';
import InputField from '@/components/utilities/input.field';
import { TbPlaylistAdd } from 'react-icons/tb';
import { useRouter } from '@/constants/utilities/useRouter';
import { Checkbox, Pagination } from '@mui/material';
import ActivityIndicator from '@/components/utilities/activity.indicator';
import EmptyList from '@/components/utilities/empty.list';
import PostCard from '@/components/utilities/post.card';
import useClickOutside from '@/constants/utilities/useOutsideClick';
import { MdOutlineDatasetLinked } from 'react-icons/md';
import PageScrapper from '@/components/utilities/scrapper';
import { deletePosts } from '@/constants/controllers/posts.controller';



const Posts: FC = (): ReactNode => {

    const { isMobile, setNote } = useGlobalProvider();
    const mobileClass = isMobile ? "mobile_" : "";
    const { categories, contentTypes, } = useCategoryProvider();
    const { postsResponse, posts, postFilter, setPostFilter, fetchingPosts, setFetchingPosts } = usePostProvider();
    const { totalResult, page, perPage, } = postsResponse;


    const router = useRouter();

    const triggerFetch = () => {
        setFetchingPosts(true);
    };

    const updateFilter = (payload: Partial<typeof postFilter>) => {
        if (!payload.page) {
            payload["page"] = 1
        } //reset page to 1 if we are sending new filter, so it tsart from the top of the result and not admist
        setPostFilter(prev => ({ ...prev, ...payload }));
        triggerFetch();
    };

    /* ===================================================== */
    const limitRef = useRef<HTMLDivElement | null>(null);
    const [showLimitOptions, setShowLimitOptions] = useState<boolean>(false);
    const closeLimitOptions = () => {
        if (showLimitOptions) setShowLimitOptions(false);
    }
    useClickOutside(limitRef as RefObject<Element>, closeLimitOptions);


    /*=======================================*/
    const [selectedPostsId, setSelectedPostsId] = useState<string[]>([]);
    const [allIds, setAllIds] = useState<string[]>([])
    useEffect(() => {
        const ids = posts.map((p) => p.post_id);
        setAllIds(ids)   //will reset per page/result /*intentional*/
    }, [posts])

    useEffect(() => {
        if (!selectedPostsId.length || !totalResult || !posts) return;
        const message = `Selected ${selectedPostsId.length} Post(s)`;
        setNote({ type: "warning", title: message });
    }, [selectedPostsId])

    /*=======================================*/

    /*=======================================*/
    const [openedAction, setOpenedAction] = useState<string>(""); //to track which post's action dropdown is open
    /*=======================================*/
    const [isOpenScrapper, setIsOpenScrapper] = useState<boolean>(false);

    const [isDeletingPost, setIsDeletingPost] = useState<boolean>(false);
    const handleDeletePosts = useCallback(async () => {
        if (selectedPostsId.length === 0) return;
        if (isDeletingPost) return;

        try {
            setIsDeletingPost(true);

            const response = await deletePosts({ post_ids: selectedPostsId });
            if (response.status !== 200) throw Error("Delete failed!.");
            //clean up
            setFetchingPosts(true); //refresh posts list;
            setSelectedPostsId([]);
            setNote({ type: "success", title: "Post deleted successfully" })

        } catch (err) {
            console.log("Failed too delete Post: ", (err as any).message);
            setNote({ type: "error", title: "Failed too delete Post" });
        } finally {
            setIsDeletingPost(false);
        }
    }, [selectedPostsId]);

    return (
        <div className={styles[`${mobileClass}container`]}>
            <header className={styles[`${mobileClass}header_container`]}>
                <h1 className={styles.header_label}>Posts</h1>
                <section className={styles[`${mobileClass}filter_container`]}>
                    <Dropdown
                        options={[
                            {
                                id: "",
                                name: "Filter by Categories"
                            },
                            ...categories.map((c) => ({
                                id: c.category_id,
                                name: c.name
                            }))
                        ]}
                        value={postFilter.category_id}
                        placeholder='Filter by Categories'
                        onChange={(e) => updateFilter({ category_id: e })}
                        disabled={fetchingPosts}
                        height={isMobile ? "2.5rem" : undefined}
                        width={isMobile ? "100%" : undefined}
                    />
                    <Dropdown
                        options={[
                            {
                                id: "",
                                name: "Filter by Type"
                            },
                            ...contentTypes.map((c) => ({
                                id: c.code,
                                name: c.name
                            }))
                        ]}
                        value={postFilter.content_type}
                        placeholder='Filter by Type'
                        onChange={(e) => updateFilter({ content_type: e })}
                        disabled={fetchingPosts}
                        height={isMobile ? "3rem" : undefined}
                        width={isMobile ? "100%" : undefined}
                    />
                    {selectedPostsId.length > 0 && (
                        <section className={styles[`${mobileClass}action_container`]}>
                            <button
                                className={`${styles.action_button} ${styles.delete_button}`}
                                onClick={handleDeletePosts}
                            >
                                Delete
                            </button>
                        </section>
                    )}
                    <div className={styles[`${mobileClass}search_container`]}>
                        <InputField
                            value={postFilter.title ?? ""}
                            setValue={(title) => updateFilter({ title })}
                            label='Search Posts'
                            style={{ width: "100%", height: "100%" }}
                            labelStyle={{ backgroundColor: "var(--background-sec)" }}
                            autocomplete='off'
                        />
                    </div>
                    <div className={styles[`${mobileClass}add_new_post_icon`]}>
                        <button
                            className={styles.add_post_button}
                            onClick={() => {
                                router.push("/posts/create");
                            }}
                        >
                            <TbPlaylistAdd size={20} />
                            New
                        </button>

                        <button
                            className={styles.add_post_button}
                            onClick={() => setIsOpenScrapper(true)}
                        >
                            <MdOutlineDatasetLinked size={20} />
                            Scrap a page
                        </button>
                    </div>
                </section>
            </header>
            <section className={styles.main_container}>
                <div className={styles.inner_scroll_container}>
                    <header className={styles.table_header}>
                        <div className={`${styles.table_col} ${styles.checkbox}`}>
                            <Checkbox
                                checked={!!allIds.length && allIds.every(id => selectedPostsId.includes(id))}
                                onChange={(_, value) => {
                                    if (value) {
                                        setSelectedPostsId(prev =>
                                            Array.from(new Set([...prev, ...allIds]))
                                        );
                                    } else {
                                        setSelectedPostsId(prev =>
                                            prev.filter(id => !allIds.includes(id))
                                        );
                                    }
                                }}


                            />
                        </div>
                        <div className={`${styles.table_col} ${styles.sn}`}>
                            SN
                        </div>
                        <div className={`${styles.table_col} ${styles.title}`}>
                            Media
                        </div>
                        <div className={`${styles.table_col} ${styles.category}`}>
                            Category
                        </div>
                        <div className={`${styles.table_col} ${styles.group}`}>
                            Group
                        </div>
                        <div className={`${styles.table_col} ${styles.status}`}>
                            Status
                        </div>
                        <div className={`${styles.table_col} ${styles.created_at}`}>
                            Created At
                        </div>
                        <div className={`${styles.table_col} ${styles.updated_at}`}>
                            Last Modified
                        </div>
                        <div className={`${styles.table_col} ${styles.actions}`}>
                            Actions
                        </div>
                    </header>
                    <main className={styles.table_content}>
                        {fetchingPosts ? (
                            <div className={styles.table_empty_container}>
                                <ActivityIndicator
                                    size='big'
                                    style='spin'
                                />
                            </div>
                        ) : null}
                        {!fetchingPosts && posts.length === 0 ? (
                            <div className={styles.table_empty_container}>
                                <EmptyList
                                    title='No Posts At this time'
                                />
                            </div>
                        ) : null}
                        {!fetchingPosts && posts.length > 0 ? (
                            posts.map((post, index) => {
                                const isSelected = selectedPostsId.includes(post.post_id);
                                const sn: string = String((postFilter.page - 1) * postFilter.limit + index + 1); //calculate sn based on page and limit

                                return (
                                    <PostCard
                                        data={post}
                                        key={post.post_id}
                                        isSelected={isSelected}
                                        sn={sn}

                                        openedAction={openedAction}
                                        setOpenedAction={setOpenedAction}
                                        onSelected={({ id, value }) => {
                                            if (value) {
                                                setSelectedPostsId((prev) => ([...prev, id]))
                                            } else {
                                                setSelectedPostsId((prev) => {
                                                    const filter = prev.filter((p) => p !== id);
                                                    return filter;
                                                })
                                            }
                                        }}
                                    />
                                )
                            })
                        ) : null}
                    </main>
                </div>
            </section>
            <footer className={styles[`${mobileClass}footer_container`]}>
                <section className={styles.limit_container}>
                    <span className={styles.limit_label}>
                        Rows Per Result:
                    </span>
                    <div ref={limitRef} className={styles.limit_drop_down}>
                        <button onClick={() => setShowLimitOptions((prev) => !prev)} className={styles.limit_value}>
                            {postFilter.limit}
                        </button>
                        {showLimitOptions && (
                            <div className={styles.limit_options}>
                                {[20, 50, 100, 200].map((n) => (
                                    <span
                                        key={n}
                                        className={styles.limit_option}
                                        onClick={() => {
                                            updateFilter({ limit: n });
                                            setShowLimitOptions(false);
                                        }}
                                    >
                                        {n}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                <section className={styles[`${mobileClass}pagination_container`]}>
                    <Pagination
                        shape="rounded"
                        variant='outlined'
                        page={page}
                        count={Math.ceil(Number(totalResult) / Number(perPage))}
                        onChange={(_, page) => updateFilter({ page })}
                    />
                </section>
            </footer>
            {isOpenScrapper && (
                <PageScrapper
                    close={() => setIsOpenScrapper(false)}
                />
            )}
        </div>
    )
}

export default Posts;