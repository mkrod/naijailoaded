import { useCallback, useEffect, useReducer, useState, type FC } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import styles from "./css/video.view.module.css";
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
    replying_to: {
        id: null,
        name: null
    },
    comment_ancestor_id: null,
    commentText: "",
    comments: DefaultAPIArrayResponse,
    loadingComments: true,
    sending: false
};

const reducer = (state: State, action: Action): State => ({
    ...state,
    ...action
});


interface Props {
    data: Post;
    sanitizedDescription: string;
    similarPosts: APIArrayResponse;
}

const VideoPlayer = dynamic(() => import('@/components/utilities/video.player'), {
    ssr: false,
    loading: () => <div style={{ minHeight: '150px' }} />
});

const VideoView: FC<Props> = ({ data, sanitizedDescription, similarPosts }) => {
    const { isMobile, setNote } = useGlobalProvider();

    // Cleaner State Management
    const [state, setState] = useReducer(reducer, initialState);

    const mobileClass = isMobile ? "mobile_" : "";

    // Optimized Fetch
    const fetchComments = useCallback(async () => {
        try {
            const res = await getComments({ post_id: data.post_id } as Comment);
            setState({ comments: res.data, loadingComments: false });
        } catch (err) {
            console.error("Comments API Error:", err);
            setNote({ type: "error", title: String(err) });
            setState({ loadingComments: false });
        }
    }, [data.post_id]);

    useEffect(() => {
        setState({ isMounted: true });
        fetchComments();
    }, [fetchComments]);

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
                //setState({ commentText: "", loadingComments: true });
                setState({
                    commentText: "",
                    comment_ancestor_id: null,
                    replying_to: { id: null, name: null },
                    loadingComments: true
                })
                fetchComments();
            } else if (status === 401) {
                setNote({ type: "error", title: "Please sign in to comment" });
            }
        } catch (err: any) {
            const { message } = err as Response;
            setNote({ type: "error", title: message! });
        } finally {
            setState({ sending: false });
        }
    };
    const handleReplyingTo = useCallback(
        (comment: State['replying_to']) => setState({ replying_to: comment }),
        []
    );

    const handleSetAncestor = useCallback(
        (comment_id: string) => setState({ comment_ancestor_id: comment_id }),
        []
    );


    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "VideoRecording",
        "name": data.title,
        "image": data.content_thumbnail,
        "url": `${clientURL}/video/${data.slug}`,
        "datePublished": data.created_at,
        "description": data.title,
        "audio": data.content // Helps Google Audio search
    };


    const contents: Content[] = data.content;

    const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);

    const [createdAt, setCreatedAt] = useState<string | null>(null);
    useEffect(() => {

        setCreatedAt(formatDate(data.created_at));
    }, [data.created_at]);


    return (
        <>
            <Head>
                <title>{`${data.title} — Stream & Download | ${siteName}`}</title>
                <meta name="description" content={`Stream and download ${data.title}. Get the latest Videos, lyrics, and bio on ${siteName}.`} />
                <meta property="og:title" content={data.title} />
                <meta property="og:image" content={data.content_thumbnail} />
                <meta property="og:type" content="video.song" />
                <link rel="canonical" href={`${clientURL}/video/${data.slug}`} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            </Head>

            <main className={styles[`${mobileClass}container`]}>
                <section className={styles[`${mobileClass}content_container`]}>
                    <div className={styles[`${mobileClass}player_container`]}>
                        {state.isMounted ? (
                            <VideoPlayer
                                thumbnail={(JSON.parse(data.content_thumbnail) as Thumbnail[])?.[0]?.url}
                                data={contents[activeTrackIndex]}
                                totalTrack={contents.length}
                                activeTrack={activeTrackIndex}
                                setTrack={(trackIndex) => {
                                    //console.log(`Setting track to ${trackIndex}: `, contents[trackIndex]);
                                    setActiveTrackIndex(trackIndex)
                                }}
                            />
                        ) : (
                            <MusicPlayerPlaceholder data={data} />
                        )}
                    </div>

                    <article className={styles.content_details}>
                        {/* 4. Essential H1 for SEO Weight */}
                        <h1 className={styles.title}>{data.title}</h1>

                        {/* 5. Server-rendered sanitized HTML for indexing */}
                        <div
                            //style={{ fontSize: "var(--xs-font)  !important" }}
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                        />

                        <div className={styles.download_container}>
                            {Boolean(data.is_album)
                                && (contents.length > 0)
                                && contents.map((cnt, idx) => (
                                    <AlbumChildCard
                                        key={idx}
                                        idx={idx}
                                        data={cnt}
                                        activeIndex={activeTrackIndex}
                                        setActive={(trackIndex) => setActiveTrackIndex(trackIndex)}

                                    />
                                ))}
                            {!data.is_album && !Boolean(contents[activeTrackIndex].is_embeded) && contents.length === 1 ? (
                                <a
                                    className={styles.download_button}
                                    href={contents[activeTrackIndex].url}
                                    download={`${data.slug}.mp3`}
                                    target="_self"
                                    rel="noopener noreferrer"
                                >
                                    Download Now
                                </a>
                            ) : null}
                        </div>
                        <div className={styles.created_data}>
                            <span className={styles.created_at}>{createdAt ?? "--"}</span>
                            <span className={styles.created_at}>{`${contents.length} Videos`}</span>
                        </div>
                        {state.isMounted && (
                            <div className={styles.comment_section_container}>
                                {Boolean(data.comment_enabled)
                                    && (
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
                                    {state.loadingComments && (
                                        <ActivityIndicator
                                            size='small'
                                            style='spin'
                                            cover
                                        />
                                    )}
                                    {!state.loadingComments && state.comments?.results?.length === 0 && (
                                        <EmptyList
                                            title='Be the first to comment!...'
                                            margin='5rem 0'
                                        />
                                    )}
                                    {!state.loadingComments && (state.comments?.results || []).length > 0 && state.comments?.results?.map((comment, index) => (
                                        <CommentCard
                                            key={comment.comment_id}
                                            commentData={comment}
                                            replyingTo={handleReplyingTo}
                                            setAncestor={handleSetAncestor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>
                    <section className={styles[`${mobileClass}share_container`]}>
                        <Share
                            data={data}
                        />
                    </section>
                </section>

                {similarPosts?.results?.length > 0 && (
                    <section className={styles.others_container}>
                        <header className={styles.section_two_header}>
                            <span className={styles.section_two_header_text}>You might also like</span>
                            <div className={styles.section_two_header_line} />
                        </header>
                        <main className={styles[`${mobileClass}section_two_contents`]}>
                            {similarPosts?.results?.slice(0, 12)?.map((sp) => (
                                <li key={sp.post_id}>
                                    <HorizontalCard data={sp} />
                                </li>
                            ))}
                        </main>
                    </section>
                )}
            </main >
        </>
    );
};



export const getServerSideProps: GetServerSideProps = async (context) => {
    const slug = context.params?.slug as string;

    if (!slug) return { notFound: true };

    try {
        const { data, error } = await getPost({ slug });

        if (error || !data) {
            return { notFound: true }
        }

        // 6. Perform sanitization ON THE SERVER
        // This ensures Google sees the text content in the initial HTML
        const sanitizedDescription = DOMPurify.sanitize(data.description || "", {
            FORBID_TAGS: ['img', 'audio', 'video', 'h2', 'h3', 'hr', 'script'],
            FORBID_CONTENTS: ['img', 'audio', 'video', 'h1', 'h2', 'h3', 'hr', 'script'],
        });

        const { data: similarPosts } = await getPosts({ content_type: data.content_type, title: slug.split("-")[0] } as PostFilter);


        return {
            props: {
                data,
                sanitizedDescription,
                similarPosts
            }
        };
    } catch (e) {
        return {
            notFound: true
        }
    }

}

export default VideoView;