import { Comment } from '@/constants/types/comments.types';
import { FC, memo, ReactNode, useCallback, useRef, useState } from 'react';
import styles from "./css/comment.card.module.css";
import ImageViewer from './viewable_image';
import { HiBadgeCheck } from 'react-icons/hi';
import { formatDateProfessional } from '@/constants/variables/global.vars';
import { LiaAngleDownSolid, LiaAngleUpSolid } from 'react-icons/lia';
import ActivityIndicator from './activity.indicator';
import { getComments, toggleLike } from '@/constants/controllers/comments.controller';
import { APIArrayResponse } from '@/constants/types/global.types';
import { FaCaretRight } from 'react-icons/fa';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import DOMPurify from 'isomorphic-dompurify';
import { useGlobalProvider } from '@/constants/providers/global.provider';

/* ===================== CARD ===================== */

interface CardProps {
    commentData: Comment;
    isResponse?: boolean;
    replyingTo?: ({ id, name }: { id: string | null, name: string | null }) => void;
    setAncestor?: (id: string) => void;
}

const Card: FC<CardProps> = memo(({ commentData, isResponse, replyingTo, setAncestor }) => {

    const { setNote } = useGlobalProvider();
    const commenter_name = Object.values(commentData.user.name).join(" ");
    const repliedUserName = Object.values(commentData.userReplied?.name ?? {}).join(" ");
    const avatar = commentData.user.avatar;
    const isVerified = commentData.user.role === "admin";

    const isLiking = useRef(false);
    const [liked, setLiked] = useState(commentData.isLikedByMe);

    const handleLike = useCallback(async () => {
        if (isLiking.current) return;
        isLiking.current = true;
        setLiked(prev => !prev);

        try {
            await toggleLike({ comment_id: commentData.comment_id });
        } catch (err) {
            let msg = (err as any).message;
            msg = msg?.toLowerCase().includes("please") ? msg : "Plase try again later";
            //console.log("Error Liking Comment: ", msg);
            setNote({ type: "error", title: msg });
        }
        finally {
            isLiking.current = false;
        }
    }, [commentData.comment_id]);


    const purifiedComment = DOMPurify.sanitize(commentData.comment);

    return (
        <div className={styles.card_container}>
            <div className={styles.avatar_container}>
                <ImageViewer
                    src={avatar}
                    alt={commenter_name}
                    options={{
                        thumbnailClassName: styles.avatar,
                        rounded: false
                    }}
                />
            </div>

            <div className={styles.meta_container}>
                <div className={styles.name_replied_container}>
                    <div className={styles.commenter_name}>
                        <span>{commenter_name}</span>
                        {isVerified && (
                            <span className={styles.badge_container}>
                                <HiBadgeCheck color="green" size={18} />
                            </span>
                        )}
                    </div>

                    {isResponse && (
                        <div className={styles.response_user}>
                            <FaCaretRight />
                            {repliedUserName}
                        </div>
                    )}
                </div>

                <div
                    className={styles.comment_container}
                    dangerouslySetInnerHTML={{ __html: purifiedComment }}
                />

                <div className={styles.date_time_container}>
                    <span>{formatDateProfessional(commentData.created_at)}</span>
                    {!isResponse && (
                        <span
                            onClick={() => {
                                setAncestor?.(commentData.comment_id);
                                replyingTo?.({ id: commentData.comment_id, name: commenter_name });
                            }}
                            className={styles.reply_button}
                        >
                            Reply
                        </span>
                    )}
                </div>
            </div>

            <div onClick={handleLike} className={styles.like_container}>
                {liked ? <GoHeartFill color="red" size={20} /> : <GoHeart size={20} />}
                {commentData.totalLikes > 0 && commentData.totalLikes}
            </div>
        </div>
    );
});

/* ===================== COMMENT CARD ===================== */

interface Props {
    commentData: Comment;
    replyingTo?: ({ id, name }: { id: string | null, name: string | null }) => void;
    setAncestor?: (id: string) => void;
}

const CommentCard: FC<Props> = ({ commentData, replyingTo, setAncestor }): ReactNode => {
    const [replies, setReplies] = useState<Comment[]>([]);
    const [fetchingReplies, setFetchingReplies] = useState(false);

    const handleFetchReplies = useCallback(async () => {
        if (fetchingReplies) return;

        setFetchingReplies(true);
        try {
            const { data } = await getComments<APIArrayResponse>({
                parent_id: commentData.comment_id,
                post_id: commentData.post_id
            } as Comment);

            setReplies(data?.results ?? []);
        } finally {
            setFetchingReplies(false);
        }
    }, [commentData.comment_id, commentData.post_id, fetchingReplies]);

    return (
        <div className={styles.container}>
            <div className={styles.container_inner}>
                <Card
                    commentData={commentData}
                    replyingTo={replyingTo}
                    setAncestor={setAncestor}
                />

                {!fetchingReplies && replies.length === 0 && commentData.replyCount > 0 && (
                    <div onClick={handleFetchReplies} className={styles.view_replies}>
                        view replies ({commentData.replyCount})
                        <LiaAngleDownSolid size={18} />
                    </div>
                )}

                {fetchingReplies && (
                    <div className={styles.view_replies}>
                        <ActivityIndicator size="small" style="spin" />
                    </div>
                )}

                {replies.length > 0 && (
                    <>
                        <div className={styles.replies_container}>
                            {replies.map(reply => (
                                <Card
                                    key={reply.comment_id}
                                    isResponse
                                    commentData={reply}
                                />
                            ))}
                        </div>

                        <div
                            onClick={() => setReplies([])}
                            className={styles.hide_replies}
                        >
                            hide replies ({commentData.replyCount})
                            <LiaAngleUpSolid size={18} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default memo(CommentCard);
