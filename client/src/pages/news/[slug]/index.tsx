import { useCallback, useEffect, useReducer, useState, type FC } from 'react';
import Head from 'next/head';
import styles from "./css/news.view.module.css";
import DOMPurify from 'isomorphic-dompurify';

// Providers & Controllers
import { useGlobalProvider } from '@/constants/providers/global.provider';
import { addComment, getComments } from '@/constants/controllers/comments.controller';

// Components
import EditableInput from '@/components/utilities/input';
import ActivityIndicator from '@/components/utilities/activity.indicator';
import EmptyList from '@/components/utilities/empty.list';
import CommentCard from '@/components/utilities/comment.card';

// Types & Vars
import { Content, Post, PostFilter, Thumbnail } from '@/constants/types/post.type';
import { siteName, clientURL, DefaultAPIArrayResponse, formatDate } from '@/constants/variables/global.vars';
import { Comment } from '@/constants/types/comments.types';
import { GetServerSideProps } from 'next';
import { getPost, getPosts } from '@/constants/controllers/posts.controller';
import { APIArrayResponse, Response } from '@/constants/types/global.types';
import Share from '@/components/utilities/share';
import HorizontalCard from '@/components/utilities/horizontal.card';
import ImageViewer from '@/components/utilities/viewable_image';

interface State {
    isMounted: boolean;
    replying_to: { id: string | null; name: string | null; };
    comment_ancestor_id: string | null;
    commentText: string;
    comments: APIArrayResponse;
    loadingComments: boolean;
    sending: boolean;
}

type Action = Partial<State>;
const initialState: State = {
    isMounted: false,
    replying_to: { id: null, name: null },
    comment_ancestor_id: null,
    commentText: "",
    comments: DefaultAPIArrayResponse,
    loadingComments: true,
    sending: false
};

const reducer = (state: State, action: Action): State => ({ ...state, ...action });

interface Props {
    data: Post;
    sanitizedDescription: string;
    similarPosts: APIArrayResponse;
}

const NewsView: FC<Props> = ({ data, sanitizedDescription, similarPosts }) => {
    const { isMobile, setNote } = useGlobalProvider();
    const [state, setState] = useReducer(reducer, initialState);
    const [createdAt, setCreatedAt] = useState<string | null>(null);

    const mobileClass = isMobile ? "mobile_" : "";
    const thumbnailObj = typeof data.content_thumbnail === "string" ? (JSON.parse(data.content_thumbnail ?? "[]") as Thumbnail[])[0] : data.content_thumbnail?.[0];

    const fetchComments = useCallback(async () => {
        try {
            const res = await getComments({ post_id: data.post_id } as Comment);
            setState({ comments: res.data, loadingComments: false });
        } catch (err) {
            setState({ loadingComments: false });
        }
    }, [data.post_id]);

    useEffect(() => {
        setState({ isMounted: true });
        fetchComments();
        setCreatedAt(formatDate(data.created_at));
    }, [fetchComments, data.created_at]);

    // --- NEWS SEO OPTIMIZATION ---
    const seoTitle = `${data.title} | News & Updates | ${siteName}`;
    const seoDesc = data.title; // Keep it clean for news

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": data.title,
        "image": [thumbnailObj?.url],
        "datePublished": data.created_at,
        "dateModified": data.updated_at || data.created_at,
        "author": [{
            "@type": "Person",
            "name": siteName,
            "url": clientURL
        }]
    };

    const handleSendComment = async () => {
        if (state.sending || !state.commentText.trim()) return;
        setState({ sending: true });
        try {
            const { status, message } = await addComment({
                post_id: data.post_id,
                parent_id: state.replying_to.id,
                ancestor_id: state.comment_ancestor_id,
                comment: state.commentText
            } as Comment);

            if (status === 201) {
                setNote({ type: "success", title: message! });
                setState({ commentText: "", replying_to: { id: null, name: null }, loadingComments: true });
                fetchComments();
            }
        } catch (err: any) {
            setNote({ type: "error", title: err.message });
        } finally { setState({ sending: false }); }
    };
    const contents = typeof data.content === "string" ? (JSON.parse(data.content) as Content[]) : data.content

    return (
        <>
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <meta property="og:title" content={data.title} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:image" content={thumbnailObj?.url} />
                <meta property="og:type" content="article" />
                <link rel="canonical" href={`${clientURL}/news/${data.slug}`} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            </Head>

            <main className={styles[`${mobileClass}container`]}>
                <section className={styles[`${mobileClass}content_container`]}>

                    {/* Replaced Player with Article Featured Image */}
                    <header className={styles[`${mobileClass}featured_image_container`]}>
                        {contents?.map((content) => (
                            <ImageViewer
                                key={content.id}
                                src={content?.url}
                                alt={data.title}
                                options={{
                                    thumbnailClassName: styles[`${mobileClass}featured_image`],
                                    canView: true
                                }}
                                caption={data.title}
                            />
                        ))}
                    </header>

                    <article className={styles.content_details}>
                        <h1 className={styles.title}>{data.title}</h1>

                        <div className={styles.meta_info}>
                            <time dateTime={data.created_at} className={styles.created_at}>
                                Published: {createdAt ?? "--"}
                            </time>
                        </div>

                        <div
                            className={styles.article_body}
                            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                        />

                        {/* Removed Album/Music Download logic for News */}

                        {state.isMounted && (
                            <section className={styles.comment_section_container}>
                                {Boolean(data.comment_enabled) && (
                                    <div className={styles.comment_box}>
                                        <EditableInput
                                            style={{ height: "10rem" }}
                                            placeholder={state.replying_to.id ? `Replying to ${state.replying_to.name}` : 'Join the discussion...'}
                                            value={state.commentText}
                                            onChange={(text) => setState({ commentText: text })}
                                            AIdisabled
                                            showProceedButton
                                            proceedButtonText='Post Comment'
                                            onProceed={handleSendComment}
                                        />
                                    </div>
                                )}
                                <h3>Comments</h3>
                                <div className={styles.comments}>
                                    {state.loadingComments && <ActivityIndicator size='small' style='spin' cover />}
                                    {!state.loadingComments && state.comments?.results?.length === 0 && (
                                        <EmptyList title='No comments yet.' margin='5rem 0' />
                                    )}
                                    {!state.loadingComments && (state.comments?.results || []).map((comment) => (
                                        <CommentCard
                                            key={comment.comment_id}
                                            commentData={comment}
                                            replyingTo={(c) => setState({ replying_to: c })}
                                            setAncestor={(id) => setState({ comment_ancestor_id: id })}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </article>

                    <aside className={styles[`${mobileClass}share_container`]}>
                        <Share data={data} />
                    </aside>
                </section>

                {similarPosts?.results?.length > 0 && (
                    <section className={styles.others_container}>
                        <header className={styles.section_two_header}>
                            <h2 className={styles.section_two_header_text}>Related News</h2>
                            <div className={styles.section_two_header_line} />
                        </header>
                        <ul className={styles[`${mobileClass}section_two_contents`]}>
                            {similarPosts.results.slice(0, 12).map((sp: Post) => (
                                <li key={sp.post_id} style={{ listStyle: 'none' }}>
                                    <HorizontalCard data={sp} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const slug = context.params?.slug as string;
    if (!slug) return { notFound: true };

    try {
        const { data, error } = await getPost({ slug });
        if (error || !data) return { notFound: true };

        // Allow more tags for News Articles (like links and lists)
        const sanitizedDescription = DOMPurify.sanitize(data.description || "", {
            FORBID_TAGS: ['img', 'audio', 'video', 'a', 'h1', 'h2', 'h3', "h4", "h5", "h6", 'hr', 'script'],
            //FORBID_CONTENTS: ['img', 'audio', 'video', 'a', 'h1', 'h2', 'h3', 'hr', 'script'],
        });

        // Set content_type specifically to news for related posts
        const { data: similarPosts } = await getPosts({
            content_type: "news",
            title: slug.split("-")[0]
        } as PostFilter);

        return { props: { data, sanitizedDescription, similarPosts } };
    } catch (e) { return { notFound: true }; }
};

export default NewsView;