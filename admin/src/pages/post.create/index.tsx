import { useCallback, useEffect, useRef, useState, type FC, type ReactNode } from 'react'
import styles from "./css/post.create.module.css"
import { useRouter } from '@/constants/utilities/useRouter'
import type { Content, Post, Thumbnail } from '@/constants/types/post.type';
import { initPostObj, validatePost } from '@/constants/variables/posts.vars';
import { useGlobalProvider } from '@/constants/providers/global.provider';
import ThumbnailUploader from '@/components/utilities/thumbnail.uploader';
import ContentUploader from '@/components/utilities/content.uploader';
import PostTextUpdater from '@/components/utilities/post.text.updater';
import { usePostProvider } from '@/constants/providers/posts.provider';
import { getSlugFromString } from '@/constants/variables/global.vars';
import PostOthersUpdater from '@/components/utilities/post.others.updater';
import { createPost } from '@/constants/controllers/posts.controller';
import { useUserProvider } from '@/constants/providers/user.provider';

export interface Schedule {
    date: Date | null;
    time: number | null;
}

// 1. Define the unified state interface
export interface CreatePostFormState {
    autoSave: boolean;
    post: Post;
    platformToShare: string[];
    schedule: Schedule;
    tagMeta: boolean;
    tagMedia: boolean;
}

interface Uploading {
    progress: number;
    message?: string;
}

const CreatePost: FC = (): ReactNode => {

    const { isMobile, setNote, setPrompt } = useGlobalProvider();
    const { posts, setFetchingPosts } = usePostProvider();
    const router = useRouter();
    const state = router.state as { post?: Post };
    const mobileClass = isMobile ? "mobile_" : "";

    // 2. Initialize with the big state object
    const [formState, setFormState] = useState<CreatePostFormState>({
        autoSave: true, //local state, not needed on server
        post: state?.post ?? initPostObj,
        platformToShare: [],
        schedule: { date: null, time: null },
        tagMedia: true, //local state, not needed on server
        tagMeta: false //local state, not needed on server
    });

    const { tagMedia, tagMeta, autoSave, post, platformToShare, schedule } = formState;


    /**
     * Bridge functions to update specific parts of the big state
     */

    const updateAutoSave = (state: boolean) => {
        if (!state) {
            onCancelProgress();
        }
        setFormState(prev => ({
            ...prev,
            autoSave: state
        }));
    };

    const updateTagMeta = (state: boolean) => {
        setFormState(prev => ({
            ...prev,
            tagMeta: state
        }));
    };
    //auto set tag according to
    useEffect(() => {
        if ((post?.title?.length || 0) > 0 && (post.artist?.displayName?.length || 0) > 0 && (post?.description?.length || 0) >= 5) {
            updateTagMeta(true);
        } else {
            updateTagMeta(false);
        }
    }, [post]);

    const updateTagMedia = (state: boolean) => {

        setFormState(prev => ({
            ...prev,
            tagMedia: state
        }));
    };


    const updatePost = (payload: Partial<Post>) => {
        setFormState(prev => ({
            ...prev,
            post: { ...prev.post, ...payload }
        }));
    };

    const setPlatformToShare = (platforms: string[] | ((prev: string[]) => string[])) => {
        setFormState(prev => ({
            ...prev,
            platformToShare: typeof platforms === 'function' ? platforms(prev.platformToShare) : platforms
        }));
    };

    const setSchedule = (sched: Schedule | ((prev: Schedule) => Schedule)) => {
        setFormState(prev => ({
            ...prev,
            schedule: typeof sched === 'function' ? sched(prev.schedule) : sched
        }));
    };

    /**
     * ======================================================================
     * ================ THUMBNAIL & CONTENT HANDLERS ========================
     * ======================================================================
     */
    const postThumbnail = typeof post.content_thumbnail === "string" ? (JSON.parse(post?.content_thumbnail ?? "[]") as Thumbnail[])?.[0]?.url : (post.content_thumbnail as Thumbnail[])?.[0]?.url;

    const contents: Content[] = typeof post.content === "string" ? JSON.parse(post.content) : (post.content ?? []);
    const contentLength = contents.length;

    const albums = posts?.filter((p) => p.is_album);

    const { user } = useUserProvider();
    useEffect(() => {
        if (!user?.user_id) return;
        updatePost({ author_id: user.user_id })
    }, [user?.user_id]);

    //Up next: when file is dropped either thumnail or cotnent, instead of retaining it and preview with url.cre,
    // you should sav them straiight to server and insert into library table, so it has trace and admin can delete if not later used.
    //then return the link to the contetn and place it straight to the object url

    useEffect(() => {
        if (post.post_id?.trim()) return;
        const titlePart = getSlugFromString(post?.title);
        const artistPart = getSlugFromString(post?.artist?.displayName);
        //const slug = `${artistPart ? `${artistPart}-` : ""}${titlePart ? titlePart : ""}`;
        const s = [];
        if (titlePart) s.push(titlePart);
        if (artistPart) s.unshift(artistPart);

        const slug = s.join("-");

        const isExist = posts?.filter((p) => p?.slug === slug);
        if (isExist.length === 0) {
            updatePost({ slug })
        } else {
            updatePost({ slug: `${slug}-${isExist.length + 1}` });
        }
    }, [post.title, post.artist?.displayName, post.post_id]);



    const [uploading, setUploading] = useState<Uploading | undefined>(undefined);

    const handleUpload = useCallback(async () => {
        if (uploading) return setNote({ type: "error", title: "Upload in progress..." });

        try {
            const validate = validatePost(formState.post);
            if (validate.error) {
                throw Error(validate.message);
            }

            const handleProgress = (p: number) => {
                let message = "";
                if (p <= 20) {
                    message = "Please Wait..."
                } else if (p <= 50) {
                    message = "Processing..."
                } else if (p <= 75) {
                    message = "Finalizing..."
                } else if (p === 100) {
                    message = "Upload Done."
                } else {
                    message = "Finishing..."
                }

                setUploading({ progress: p, message })
            };

            //proceed
            const response = await createPost(formState, handleProgress);
            if (!response.status || ![200, 201].includes(response.status)) {
                throw Error(response.message);
            }

            //success
            const data = response.data as { post: Post }; //uploaded post
            //replace the entire post
            setFormState((prev) => ({ ...prev, post: data.post }))
            setNote({ type: "success", title: response.message || "Upload Successful" })
            setFetchingPosts(true); //refresh posts list


        } catch (err: any) {
            setNote({ type: "error", title: err?.message })
            return;
        } finally {
            setTimeout(() => setUploading(undefined), 2000);
        }

    }, [formState]);




    /* 
    =============================================================================
    =============================================================================
    =================== Progress Restore and Clearance ==========================
    =============================================================================
    =============================================================================
    */
    // 1. Add a ref to track initialization
    const isInitialized = useRef(false);

    const onRestoreProgress = useCallback(() => {
        updateAutoSave(true);
        const progress = localStorage.getItem("adding_post_progress");

        if (!progress) return;
        updatePost(JSON.parse(progress) as Post);
        setNote({ type: "success", title: "Progress Restored" });
    }, []);

    const onCancelProgress = useCallback(() => {
        localStorage.removeItem("adding_post_progress");
    }, []);

    // 2. Modify the Save Effect
    useEffect(() => {
        // ONLY save if we have moved past the initial mount/restore phase
        if (!formState.autoSave || !isInitialized.current) return;

        localStorage.setItem("adding_post_progress", JSON.stringify(post));
    }, [post, formState.autoSave]);


    // 3. Update your Prompt/Restore logic
    useEffect(() => {
        if (state && state.post) {
            isInitialized.current = true; // No prompt needed, start saving
            return;
        }

        const progress = localStorage.getItem("adding_post_progress");

        if (!progress) {
            isInitialized.current = true; // Nothing to restore, start saving fresh
            return;
        }

        setPrompt(() => ({
            title: "Progress!!!",
            description: "You have an unsaved post, do you want to continue editing?",
            onAccept: () => {
                onRestoreProgress();
                isInitialized.current = true; // Now we can start saving
            },
            onDecline: () => {
                onCancelProgress();
                isInitialized.current = true; // Now we can start saving (fresh)
            },
        }));
    }, []);

    /////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////


    return (
        <div className={styles[`${mobileClass}container`]}>
            {uploading && (
                <div className={styles.upload_progess}>
                    <div style={{ width: `${uploading.progress}%` }} className={styles.progress} />
                </div>
            )}
            <section className={styles[`${mobileClass}left`]}>
                <header className={styles[`${mobileClass}header_container`]}>
                    <div className={styles.header_label_container}>
                        <span className={styles.header_label}>{uploading?.message ?? "Create Post"}</span>
                        <span className={styles.header_sub_label}>
                            Craft and schedule your next post effortlessly
                        </span>
                    </div>
                </header>
                <main className={styles[`${mobileClass}left_contents`]}>
                    <div className={styles[`${mobileClass}left_content_section`]}>

                        <ThumbnailUploader
                            title='Thumbnail'
                            subtitle='Add a cover art to represent the post'
                            //post={post}
                            updatePost={updatePost}
                            postThumbnail={postThumbnail}
                        //thumbnailPreview={previews[thumbnailIndexInSlot]}
                        //setFile={(file) => setFileAtSlot(thumbnailIndexInSlot, file)}
                        //removeFile={() => removeFileAtSlot(thumbnailIndexInSlot)}
                        />

                        {!post.is_album && contentLength <= 4 &&
                            (
                                (["music", "video"].includes(post.content_type) && contentLength === 0) ||
                                (!["music", "video"].includes(post.content_type))
                            ) && (
                                <div className={styles.add_content_button}>
                                    <button
                                        onClick={() => {
                                            /*if (!post.title?.trim() || (post.content_type !== "others" && !post.artist?.displayName?.trim())) {
                                                setNote({ type: "warning", title: "Please Enter a title and artist first" });
                                                return;
                                            }*/
                                            if (!post.content_type?.trim()) {
                                                setNote({ type: "warning", title: "Please Select media type" });
                                                return;
                                            }
                                            const c = post.content ?? [];
                                            const newId = String(c.length + 1);
                                            c.push({ id: newId, title: post.title, artist: { ...post.artist, displayName: post.artist?.displayName }, url: "" });
                                            setNote({
                                                type: "warning",
                                                title: "Editing the media type will reset all added media",
                                            });
                                            updatePost({ content: c });
                                        }}
                                        className={styles.add_new_content}
                                    >
                                        Add Media
                                    </button>
                                </div>
                            )}


                        {contentLength > 0 && (
                            <div className={styles.media_uploader_other_container}>
                                <div className={styles.contents_sections_container}>
                                    {Array.from({ length: contentLength }).map((_, idx) => {
                                        const index = idx; //index is 0 based in post.content but starts at 1 in file slot because thumbnail take 0
                                        const contentObj = contents?.[index];
                                        //const indexInSlot = index + 1; //1 started from 1 inside the file slot

                                        return (
                                            <ContentUploader
                                                title={`Media`}
                                                index={index}
                                                post={post}
                                                updatePost={updatePost}
                                                allContents={contents}
                                                allAlbum={albums}
                                                key={index}
                                                //contentPreview={previews[indexInSlot]}
                                                postContent={contentObj}
                                                //removeFile={() => removeFileAtSlot(indexInSlot)}
                                                //setFile={(file) => setFileAtSlot(indexInSlot, file)}
                                                type={post.content_type}
                                                tagMedia={tagMedia}
                                                tagMeta={tagMeta}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles[`${mobileClass}left_content_section`]}>
                        <PostTextUpdater
                            post={post}
                            updatePost={updatePost}
                            error={(e) => setNote({ type: "warning", title: e ?? "Something went wrong" })}
                            albumList={albums}
                        />
                    </div>
                </main>
            </section>
            <section className={styles[`${mobileClass}right`]}>
                <PostOthersUpdater
                    post={post}
                    autoSave={autoSave}
                    updateAutoSave={updateAutoSave}
                    updatePost={updatePost}
                    platformToShare={platformToShare}
                    setPlatformToShare={setPlatformToShare}
                    schedule={schedule}
                    setSchedule={setSchedule}
                    tagMeta={tagMeta}
                    tagMedia={tagMedia}
                    updateTagMeta={updateTagMeta}
                    updateTagMedia={updateTagMedia}
                />
                <div className={styles.submit_container}>
                    {schedule.date && schedule.time && (
                        <button disabled={!!uploading} className={styles.upload_button}>
                            Schedule Post
                        </button>
                    )}
                    {(!schedule.date || !schedule.time) && (
                        <button
                            disabled={!!uploading}
                            onClick={handleUpload}
                            className={styles.upload_button}
                        >
                            {post.post_id ? `Update` : `Upload  ${post.status === "draft" ? "as private" : ""}`}
                        </button>
                    )}
                </div>
            </section>
        </div>
    )
}

export default CreatePost;