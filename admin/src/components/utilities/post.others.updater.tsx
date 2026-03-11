import { useCallback, useState, type Dispatch, type FC, type ReactNode, type SetStateAction } from "react"
import styles from "./css/post.others.updater.module.css";
import { Checkbox, Radio } from "@mui/material";
import type { Post } from "@/constants/types/post.type";
import type { Schedule } from "@/pages/post.create";
import { clientURL, formatDate, formatTimeHM } from "@/constants/variables/global.vars";
import DateTimeSelector from "./date.time.selector";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { LuClock } from "react-icons/lu";
import { Link } from "react-router";


interface Props {
    autoSave?: boolean;
    updateAutoSave?: (state: boolean) => void;
    post: Post;
    updatePost: (value: Partial<Post>) => void;

    platformToShare: string[];
    setPlatformToShare: Dispatch<SetStateAction<string[]>>;

    schedule: Schedule;
    setSchedule: Dispatch<SetStateAction<Schedule>>;

    tagMeta?: boolean;
    updateTagMeta?: (value: boolean) => void;

    tagMedia?: boolean;
    updateTagMedia?: (value: boolean) => void;
}

const PostOthersUpdater: FC<Props> = ({ tagMeta, updateTagMeta, tagMedia, updateTagMedia, autoSave, updateAutoSave, post, updatePost, platformToShare, setPlatformToShare, schedule, setSchedule }): ReactNode => {


    const [openDateSelector, setOpenDateSelector] = useState<boolean>(false);

    const postLink = useCallback((post: Post): { link: string | undefined, message: string } => {
        if (!post.post_id && (!post.content_type || !post.slug)) {
            return {
                link: undefined,
                message: "select content type and enter title",
            };
        }

        const link = `${clientURL}/${post.content_type}/${post.slug}`;
        return { link, message: link };
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.section_contents_container}>
                <div className={styles.media_uploader_header}>
                    <span className={styles.media_uploader_header_label}>Post Visibility</span>
                </div>
                <div className={styles.section_contents}>
                    <div className={styles.radio_container}>
                        <Radio
                            checked={post?.status === "active"}
                            onChange={() => updatePost({ status: "active" })}
                        />
                        <span>Public</span>
                    </div>
                    <div className={styles.radio_container}>
                        <Radio
                            checked={post?.status === "draft"}
                            onChange={() => updatePost({ status: "draft" })}
                        />
                        <span>Draft</span>
                    </div>
                    <div className={styles.radio_container}>
                        <Radio
                            checked={post?.status === "private"}
                            onChange={() => updatePost({ status: "private" })}
                        />
                        <span>Private</span>
                    </div>
                    {post.post_id && (
                        <div className={styles.radio_container}>
                            <Radio
                                checked={post?.status === "disabled"}
                                onChange={() => updatePost({ status: "disabled" })}
                            />
                            <span>Disable</span>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.section_contents_container}>
                <div className={styles.media_uploader_header}>
                    <span className={styles.media_uploader_header_label}>Share to other platform</span>
                </div>
                <div className={styles.section_contents}>
                    <div className={styles.radio_container}>
                        <Checkbox
                            value="facebook"
                            checked={platformToShare.includes("facebook")}
                            onChange={(e) => {
                                const value = e.target.value
                                setPlatformToShare((prev) =>
                                    e.target.checked
                                        ? [...prev, value]
                                        : prev.filter((p) => p !== value)
                                )
                            }}
                        />
                        <span>Facebook</span>
                    </div>
                    <div className={styles.radio_container}>
                        <Checkbox
                            value="x"
                            checked={platformToShare.includes("x")}
                            onChange={(e) => {
                                const value = e.target.value
                                setPlatformToShare((prev) =>
                                    e.target.checked
                                        ? [...prev, value]
                                        : prev.filter((p) => p !== value)
                                )
                            }}
                        />
                        <span>Twitter/X</span>
                    </div>
                    <div className={styles.radio_container}>
                        <Checkbox
                            value="instagram"
                            checked={platformToShare.includes("instagram")}
                            onChange={(e) => {
                                const value = e.target.value
                                setPlatformToShare((prev) =>
                                    e.target.checked
                                        ? [...prev, value]
                                        : prev.filter((p) => p !== value)
                                )
                            }}
                        />
                        <span>Instagram</span>
                    </div>
                </div>
            </div>
            <div className={styles.section_contents_container}>
                <div className={styles.media_uploader_header}>
                    <span className={styles.media_uploader_header_label}>Permissions</span>
                </div>
                <div className={styles.section_contents}>
                    <div className={styles.radio_container}>
                        <Checkbox
                            checked={Boolean(post?.comment_enabled)}
                            onChange={(_, state) => updatePost({ comment_enabled: state ? 1 : 0 })}
                        />
                        <span>Allow Comment</span>
                    </div>
                </div>
                <div className={styles.section_contents}>
                    <div className={styles.radio_container}>
                        <Checkbox
                            checked={Boolean(post?.is_album)}
                            onChange={(_, state) => {
                                updatePost({
                                    is_album: state ? 1 : 0,
                                    content: state ? undefined : post.content
                                })
                            }}
                            disabled={Boolean(post.post_id)}
                        />
                        <span>Album Post</span>
                    </div>
                </div>

                <div className={styles.section_contents}>
                    <div className={styles.radio_container}>
                        <Checkbox
                            checked={Boolean(post?.is_trending)}
                            onChange={(_, state) => {
                                updatePost({
                                    is_trending: state ? 1 : 0,
                                })
                            }}
                        />
                        <span>Trending Post</span>
                    </div>
                </div>

                <div className={styles.section_contents}>
                    <div className={styles.radio_container}>
                        <Checkbox
                            checked={Boolean(tagMeta)}
                            onChange={(_, state) => {
                                updateTagMeta?.(state);
                            }}
                            disabled
                        />
                        <span>Meta Tag</span>
                    </div>
                </div>

                <div className={styles.section_contents}>
                    <div className={styles.radio_container}>
                        <Checkbox
                            checked={Boolean(tagMedia)}
                            onChange={(_, state) => {
                                updateTagMedia?.(state);
                            }}
                        />
                        <span>Watermark</span>
                    </div>
                </div>
            </div>


            <div className={styles.section_contents}>
                <div className={styles.radio_container}>
                    <Checkbox
                        checked={Boolean(autoSave)}
                        onChange={(_, state) => {
                            updateAutoSave?.(state);
                        }}
                    />
                    <span>Auto save progress</span>
                </div>
            </div>

            <div className={styles.section_contents_container}>
                <div
                    className={styles.media_uploader_header}
                >
                    <span className={styles.media_uploader_header_label}>Schedule Post</span>

                </div>
                <div onClick={() => setOpenDateSelector(true)} className={styles.section_contents_row}>
                    <div style={{ width: "65%" }} className={styles.scheduled_date_time}>
                        <MdOutlineCalendarMonth size={20} />
                        {!schedule.date && (
                            <span>
                                Date
                            </span>
                        )}
                        {formatDate(schedule.date || "")}
                    </div>
                    <div style={{ width: "30%" }} className={styles.scheduled_date_time}>
                        <LuClock size={20} />
                        {!schedule.time && (
                            <span>
                                Time
                            </span>
                        )}
                        {formatTimeHM(schedule.time)}
                    </div>
                </div>
            </div>

            <div className={styles.section_contents_container}>
                <div className={styles.media_uploader_header}>
                    <span className={styles.media_uploader_header_label}>Link path</span>
                    <span className={styles.media_uploader_header_sub_label}>{post.post_id ? "Post is accessible at the below path" : "Post will be accessible at the below path"}</span>
                </div>
                <div className={styles.section_contents}>
                    <Link
                        target="_blank"
                        referrerPolicy="no-referrer"
                        to={postLink(post).link ?? ""}
                        className={`${styles.slug} ${postLink(post).link ? styles.slug_link : ""}`}
                    >
                        {postLink(post).message}
                    </Link>
                </div>
            </div>



            {openDateSelector && (
                <DateTimeSelector
                    data={schedule}
                    dataSetter={setSchedule}
                    close={() => setOpenDateSelector(false)}
                    past={false}
                />
            )}
        </div>
    )
}

export default PostOthersUpdater