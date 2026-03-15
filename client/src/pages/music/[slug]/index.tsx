import { useCallback, useEffect, useReducer, useState, type FC } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import styles from "./css/music.view.module.css";
import DOMPurify from 'isomorphic-dompurify';

// Providers & Controllers
import { useGlobalProvider } from '@/constants/providers/global.provider';
import { addComment, getComments } from '@/constants/controllers/comments.controller';

// Components
import MusicPlayerPlaceholder from '@/components/utilities/music.player.placeholder';
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
import AlbumChildCard from '@/components/utilities/album.child.card';
import TrendingPosts from '@/components/utilities/trending.posts';
import PostOfTheWeek from '@/components/utilities/post.of.the.week';

interface State {
    isMounted: boolean;
    replying_to: {
        id: string | null;
        name: string | null;
    };
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
    //similarPosts: APIArrayResponse;
    trendingPosts: APIArrayResponse<Post[]>;
    postOfTheWeek: Post | undefined;
}

const MusicPlayer = dynamic(() => import('@/components/utilities/music.player'), {
    ssr: false,
    loading: () => <div style={{ minHeight: '150px' }} />
});

const MusicView: FC<Props> = ({ data, sanitizedDescription, trendingPosts, postOfTheWeek }) => {
    const { isMobile, setNote } = useGlobalProvider();
    const [state, setState] = useReducer(reducer, initialState);
    const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
    const [createdAt, setCreatedAt] = useState<string | null>(null);

    const mobileClass = isMobile ? "mobile_" : "";
    const contents: Content[] = data.content;
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

    // --- PURE CONTENT SEO ---
    const seoTitle = `${data.title} - Listen & Download MP3 | ${siteName}`;
    const seoDesc = `Stream and download ${data.title}. Check out lyrics, track information, and official audio on ${siteName}.`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": data.is_album ? "MusicAlbum" : "MusicRecording",
        "name": data.title,
        "image": thumbnailObj?.url,
        // Add this to help Google link the song to an artist
        "byArtist": {
            "@type": "MusicGroup",
            "name": data.artist?.displayName || "Unknown Artist"
        },
        "datePublished": data.created_at,
        "description": data.title,
        "url": `${clientURL}/music/${data.slug}`,
        //"audio": data.is_album ? undefined : contents[0]?.url,
        // For singles, this helps Google understand it's a streamable file
        "audio": data.is_album ? undefined : {
            "@type": "AudioObject",
            "contentUrl": contents[0]?.url,
            "encodingFormat": "audio/mpeg"
        },
        "numTracks": data.is_album ? contents.length : 1
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

    console.log("post of the week: ", postOfTheWeek);

    return (
        <>
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <meta property="og:title" content={data.title} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:image" content={thumbnailObj?.url} />
                <meta property="og:type" content="music.song" />
                <link rel="canonical" href={`${clientURL}/music/${data.slug}`} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            </Head>

            {/* Changed from div to main */}
            <main className={styles[`${mobileClass}container`]}>
                {/* Changed from div to section */}
                <section className={styles[`${mobileClass}content_container`]}>
                    <header className={styles[`${mobileClass}player_container`]}>
                        {state.isMounted ? (
                            <MusicPlayer
                                thumbnail={thumbnailObj?.url}
                                data={contents[activeTrackIndex]}
                                totalTrack={contents.length}
                                activeTrack={activeTrackIndex}
                                setTrack={setActiveTrackIndex}
                            />
                        ) : (
                            <MusicPlayerPlaceholder data={data} />
                        )}
                    </header>

                    {/* Changed from div to article */}
                    <article className={styles.content_details}>
                        <h1 className={styles.title}>{data.title}</h1>

                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                        />

                        <div className={styles.download_container}>
                            {Boolean(data.is_album) && contents.length > 0 && contents.map((cnt, idx) => (
                                <AlbumChildCard
                                    key={idx}
                                    idx={idx}
                                    data={cnt}
                                    activeIndex={activeTrackIndex}
                                    setActive={setActiveTrackIndex}
                                />
                            ))}
                            {!data.is_album && !Boolean(contents[activeTrackIndex]?.is_embeded) && contents.length === 1 && (
                                <a
                                    className={styles.download_button}
                                    href={contents[activeTrackIndex].url}
                                    download={`${data.slug}.mp3`}
                                    rel="noopener noreferrer"
                                >
                                    Download MP3
                                </a>
                            )}
                        </div>

                        <div className={styles.created_data}>
                            {/* Use time tag for semantic date */}
                            <time dateTime={data.created_at} className={styles.created_at}>{createdAt ?? "--"}</time>
                            <span className={styles.created_at}>{`${contents.length} Songs`}</span>
                        </div>

                        {state.isMounted && (
                            <section className={styles.comment_section_container}>
                                {Boolean(data.comment_enabled) && (
                                    <div className={styles.comment_box}>
                                        <EditableInput
                                            style={{ height: "10rem" }}
                                            placeholder={state.replying_to.id ? `Replying to ${state.replying_to.name}` : 'Drop a comment...'}
                                            value={state.commentText}
                                            onChange={(text) => setState({ commentText: text })}
                                            AIdisabled
                                            showProceedButton
                                            proceedButtonText='Send'
                                            onProceed={handleSendComment}
                                        />
                                    </div>
                                )}
                                <h3>Comments</h3>
                                <div className={styles.comments}>
                                    {state.loadingComments && <ActivityIndicator size='small' style='spin' cover />}
                                    {!state.loadingComments && state.comments?.results?.length === 0 && (
                                        <EmptyList title='Be the first to comment!' margin='5rem 0' />
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

                    {/* Changed from div to aside as it is supplementary content */}
                    <aside className={styles[`${mobileClass}share_container`]}>
                        <Share data={data} />
                    </aside>
                </section>

                {trendingPosts.results?.length > 0 && (
                    <div className={styles.trending_posts_container}>
                        <TrendingPosts
                            posts={trendingPosts?.results ?? []}
                        />
                    </div>
                )}

                <div className={styles[`${mobileClass}others_container`]}>
                    {postOfTheWeek && (
                        <div className={styles.post_of_the_week_container}>
                            <PostOfTheWeek
                                post={postOfTheWeek}
                            />
                        </div>
                    )}
                    {(data as any).related?.length > 0 && (
                        <section className={styles.related_container}>
                            <header className={styles.section_two_header}>
                                <h2 className={styles.section_two_header_text}>You might also like</h2>
                                <div className={styles.section_two_header_line} />
                            </header>
                            {/* Changed from div to ul/li list for better SEO ranking of related items */}
                            <ul
                                style={{
                                    gridTemplateColumns: postOfTheWeek ? "grid-template-columns: repeat(3, 1fr)" : "grid-template-columns: repeat(4, 1fr)"
                                }}
                                className={styles[`${mobileClass}section_two_contents`]}
                            >
                                {(data as any).related.slice(0, 12).map((sp: Post) => (
                                    <li key={sp.post_id} style={{ listStyle: 'none' }}>
                                        <HorizontalCard data={sp} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
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

        const sanitizedDescription = DOMPurify.sanitize(data.description || "", {
            FORBID_TAGS: ['img', 'audio', 'video', 'a', 'h1', 'h2', 'h3', 'hr', 'script'],
            FORBID_CONTENTS: ['img', 'audio', 'video', 'a', 'h1', 'h2', 'h3', 'hr', 'script'],
        });

        //const { data: similarPosts } = await getPosts({ content_type: data.content_type, title: slug.split("-")[0] } as PostFilter);
        const { data: trendingPosts } = await getPosts({ is_trending: true, limit: 12 });

        const { data: postOfTheWeek } = await getPosts({ post_of_the_week: true }) as Response<APIArrayResponse<Post[]>>
        const POTW = postOfTheWeek?.results[0] as Post | undefined;

        return { props: { data, sanitizedDescription, /*similarPosts, */trendingPosts, postOfTheWeek: POTW } };

    } catch (e) {
        return {
            notFound: true
        };
    }
};

export default MusicView;