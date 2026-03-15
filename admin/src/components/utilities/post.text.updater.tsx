import type { Content, Post, PostOtherMetaData } from "@/constants/types/post.type";
import styles from "./css/post.text.updater.module.css";
import { type FC } from 'react'
import EditableInput from "./input";
import InputFieldStatic from "./input.field.static";
import Dropdown from "./dropdown";
import { useCategoryProvider } from "@/constants/providers/categories.provider";
import { decodeHTML } from "@/constants/variables/global.vars";

interface Props {
    post: Post;
    updatePost: (value: Partial<Post>) => void;
    error: (e?: string) => void
    albumList?: Post[];
}
const PostTextUpdater: FC<Props> = ({ post, updatePost, error, albumList = [] }) => {

    const postOthers: PostOtherMetaData = typeof post.others === "string" ? JSON.parse(post.others) : post.others;
    const descStyles = {
        backgroundColor: "var(--background-sec)",
        borderRadius: "0.3rem"
    };
    const { categories, contentTypes } = useCategoryProvider();

    return (
        <div className={styles.container}>
            <div className={styles.input_section}>
                <InputFieldStatic
                    value={post.title ?? ""}
                    label='Title'
                    placeholder='Add a title (e.g Artist - Title)'
                    setValue={(title) => {
                        const c: Content[] = post.content?.map((c) => ({ ...c, title: title }))
                        updatePost({ title, content: c })
                    }}
                    autocomplete="off"
                />
            </div>
            <div className={styles.input_section}>
                <InputFieldStatic
                    value={post.artist?.displayName ?? ""}
                    label='Artist'
                    placeholder='Artist stage name'
                    setValue={(displayName) => {
                        const a = { ...post.artist || {}, displayName };
                        const c: Content[] = post.content?.map((c) => ({ ...c, artist: { ...post.artist, displayName } }))
                        updatePost({ artist: a, content: c })
                    }}
                    autocomplete="off"
                />
            </div>
            <div className={styles.input_section}>
                <InputFieldStatic
                    value={postOthers?.producer ?? ""}
                    label='Producer'
                    placeholder='Media producer (optional)'
                    setValue={(producer) => {
                        const o = { ...postOthers || {}, producer };
                        updatePost({ others: o })
                    }}
                    autocomplete="off"
                />
            </div>
            {!post.is_album && (
                <div className={styles.input_section}>
                    <Dropdown
                        options={albumList.map((l) => ({ id: l.post_id, name: l.title }))}
                        placeholder="Select Album"
                        value={post.parent_id}
                        onChange={(v) => updatePost({ parent_id: v })}
                        width="100%"
                        height="2.5rem"
                    />
                </div>
            )}
            <div className={styles.input_section}>
                <Dropdown
                    options={contentTypes.map((l) => ({ id: l.code, name: l.name }))}
                    placeholder="Select Media Type"
                    value={post.content_type}
                    onChange={(v) => {
                        updatePost({
                            content: v !== post.content_type ? undefined : post.content,
                            content_type: v as Post['content_type'],
                        })
                    }}
                    width="100%"
                    height="2.5rem"
                />
            </div>
            <div className={styles.input_section}>
                <Dropdown
                    options={categories.map((l) => ({ id: l.category_id, name: l.name }))}
                    placeholder="Select Category"
                    value={post.category_id ?? ""}
                    onChange={(v) => updatePost({ category_id: v })}
                    width="100%"
                    height="2.5rem"
                    isSearchable={false}
                />
            </div>
            <div className={styles.input_section}>
                <InputFieldStatic
                    value={postOthers?.genre ?? ""}
                    label='Genre'
                    placeholder='Media genre (optional)'
                    setValue={(genre) => {
                        const o = { ...postOthers || {}, genre };
                        updatePost({ others: o });
                    }}
                    autocomplete="off"
                />
            </div>
            <div className={styles.input_section}>
                <EditableInput
                    value={post.description ?? "".trim()}
                    onChange={(description) => {
                        const decoded = decodeHTML(description);
                        updatePost({ description: decoded })
                    }}
                    label='Description'
                    placeholder="Enter Post Description"
                    style={descStyles}
                    CantUseCase={post.content_type === "music" ? 'Title and artist is Required' : "Title is Required"}
                    error={(e) => error(e)}
                    prompt={(post.title?.trim() && (post.content_type === "music" ? post.artist?.displayName?.trim() : true)) ? `
                        - Give me a short-length content description for ${post.title} ${post.artist?.displayName ? `by ${post.artist?.displayName}` : ""} ${post.content_type ? `in context of ${post.content_type}` : ""}.
                            Requirements:
                        - Output HTML only (no Markdown, no explanations)
                        - Use <strong>, <em>, <u>, <p>, <br/>, <ul>, <li> where appropriate
                        - Do not wrap in code blocks
                        - Max 2000 words (important take note)
                        `: undefined
                    }

                />
            </div>

        </div>
    )
}

export default PostTextUpdater