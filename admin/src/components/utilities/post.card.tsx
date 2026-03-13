import { useCallback, useEffect, useRef, useState, type Dispatch, type FC, type ReactNode, type RefObject, type SetStateAction } from 'react';
import styles from "./css/post.card.module.css";
import type { Post, Thumbnail } from '@/constants/types/post.type';
import { Checkbox } from '@mui/material';
import ImageViewer from './viewable_image';
import { defaultContentDt, formatDateProfessional, getTypeIcon } from '@/constants/variables/global.vars';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useGlobalProvider } from '@/constants/providers/global.provider';
import { useRouter } from '@/constants/utilities/useRouter';
import useClickOutside from '@/constants/utilities/useOutsideClick';
import { deletePosts } from '@/constants/controllers/posts.controller';
import { usePostProvider } from '@/constants/providers/posts.provider';


interface Props {
    sn?: string;
    isSelected?: boolean;
    data: Post;

    openedAction: string;
    setOpenedAction: Dispatch<SetStateAction<string>>;
    selected?: boolean;
    onSelected?: ({ id, value }: { id: string, value: boolean }) => void;

}
const PostCard: FC<Props> = ({ isSelected, data, sn, openedAction, setOpenedAction, onSelected }): ReactNode => {

    const { } = data;
    const [artistName, setArtistName] = useState<string>("Loading...")
    const [title, setTitle] = useState<string>("Loading...");
    const [thumbnail, setThumbnail] = useState<string>(defaultContentDt);
    const [type, setType] = useState<string>("");
    const [group, setGroup] = useState<Post['content_type'] | "Loading...">("Loading...");
    const [status, setStatus] = useState<Post['status']>("active");
    const [createdAt, setCreatedAt] = useState<string>("Loading...");
    const [updatedAt, setUpdatedAt] = useState<string>("Loading...");


    const { setPrompt, setNote, snackNoteSetter } = useGlobalProvider();

    const actionsRef = useRef<HTMLDivElement>(null); // dropdown container ref

    const closeAction = () => setOpenedAction("");

    const { setFetchingPosts } = usePostProvider();

    const openDirection: "top" | "bottom" = ((Number(sn) ?? 1) <= 3 ? "bottom" : "top");

    const router = useRouter();

    const closeOptions = () => {
        if (openedAction === data.post_id) setOpenedAction("");
    }

    useClickOutside(actionsRef as RefObject<Element>, closeOptions);



    useEffect(() => {
        const format = (str = "") =>
            str
                .replace(/[^a-zA-Z0-9 ]/g, " ") // remove special characters
                .replace(/\s+/g, " ")           // collapse multiple spaces
                .trim()
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");

        // Artist name: either displayName or first part of title
        const artistSource =
            data?.artist?.displayName ??
            data?.title?.split(/\s*[-–]\s*/)?.[0] ?? "";

        // Title name: second part of title (after - or –) or full title
        const titleSource =
            data?.title?.split(/\s*[-–]\s*/)[1] ?? data?.title ?? "";

        setArtistName(format(artistSource) === format(titleSource) ? "" : format(artistSource));
        setTitle(format(titleSource));

        const thumbnailSource: Thumbnail[] = typeof data.content_thumbnail === "string" ? JSON.parse(data?.content_thumbnail ?? "[]") : data.content_thumbnail;
        setThumbnail(thumbnailSource?.[0]?.url ?? "");
        setType(data.is_album ? "Album" : data.category_id?.trim() ? format(data.category_id) : "Single");
        setGroup(format(data.content_type) as Post['content_type']);
        setStatus(format(data.status) as Post['status']);
        setCreatedAt(formatDateProfessional(data.created_at));
        setUpdatedAt(formatDateProfessional(data.updated_at));
    }, [data.title, data.content_thumbnail]);



    const [isDeletingPost, setIsDeletingPost] = useState<boolean>(false);
    const deletePost = useCallback(async (data: { post_ids: string[] }) => {
        // Implement delete logic here, e.g., call an API to delete the post
        if (isDeletingPost) return;
        try {
            setIsDeletingPost(true);

            const response = await deletePosts(data);
            if (response.status !== 200) throw Error("Delete failed!.");
            //clean up
            setFetchingPosts(true); //refresh posts list;
            setNote({ type: "success", title: "Post deleted successfully" })

        } catch (err) {
            console.log("Failed too delete Post: ", (err as any).message);
            setNote({ type: "error", title: "Failed too delete Post" });
        } finally {
            setIsDeletingPost(false)
        }
    }, []);


    return (
        <div className={styles.container}>
            <div className={`${styles.table_col} ${styles.checkbox}`}>
                <Checkbox
                    checked={isSelected}
                    onChange={(_, value) => {
                        onSelected?.({ id: data.post_id, value });
                    }}
                />
            </div>
            <div className={`${styles.table_col} ${styles.sn}`}>
                {sn}
            </div>
            <div className={`${styles.table_col} ${styles.title}`}>
                <div className={styles.img_container}>
                    <ImageViewer
                        src={thumbnail.trim() ?? defaultContentDt}
                        alt={title}
                        //className={styles.image}
                        options={{
                            thumbnailClassName: styles.image,
                            rounded: false,
                            width: "100%",
                            height: "100%",
                            canView: thumbnail.trim() !== "",
                        }}
                    />
                </div>
                <div className={styles.title_artist}>
                    <span className={styles.title_text}>{title}</span>
                    <span className={styles.artist_text}>{artistName}</span>
                </div>
            </div>
            <div className={`${styles.table_col} ${styles.category}`}>
                {type}
            </div>
            <div className={`${styles.table_col} ${styles.group}`}>
                {getTypeIcon(group.toLowerCase() as Post['content_type'])}
                {group}
            </div>
            <div className={`${styles.table_col} ${styles.status} ${styles[status.toLowerCase()]}`}>
                {status}
            </div>
            <div className={`${styles.table_col} ${styles.created_at}`}>
                {createdAt}
            </div>
            <div className={`${styles.table_col} ${styles.updated_at}`}>
                {updatedAt}
            </div>
            <div className={`${styles.table_col} ${styles.actions}`}>
                <div
                    onClick={() => {
                        if (openedAction === data.post_id) return closeAction();
                        setOpenedAction(data.post_id);
                    }}
                    className={styles.icon_container}
                >
                    <BsThreeDotsVertical size={18} />
                </div>
                <div
                    ref={actionsRef}
                    className={`${styles.actions_container} ${data.post_id === openedAction ? styles.actions_opened : ""} ${styles[`actions_container_${openDirection}`]}`}
                >
                    <span
                        onClick={() => {
                            router.push("/posts/create", { post: data });
                        }}
                        className={styles.action_option}
                    >
                        View & Edit
                    </span>
                    <span
                        className={styles.action_option}
                        onClick={() => {
                            setPrompt({
                                title: `Delete Item`,
                                description: `Are you sure you want to delete ${data.title}?, Consider Un-publishing instead...`,
                                onAccept: () => {
                                    deletePost({ post_ids: [data.post_id] });
                                    closeAction();
                                },
                                onDecline() {
                                    snackNoteSetter({ message: "Aborted..." });
                                },
                            })
                        }}
                    >
                        Delete
                    </span>
                    {/*
                    <span className={styles.action_option}>
                        {data.status === "active" ? "Unpublish" : "Publish"}
                    </span>
                    */}
                </div>
            </div>
        </div>
    )
}

export default PostCard