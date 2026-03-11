import { IoClose } from "react-icons/io5";
import styles from "./css/scrapper.module.css";
import { useCallback, useState, type FC } from "react";
import InputFieldStatic from "./input.field.static";
import { Checkbox } from "@mui/material";
import { useGlobalProvider } from "@/constants/providers/global.provider";
import { scrapPage } from "@/constants/controllers/misc.controller";
import { initPostObj } from "@/constants/variables/posts.vars";
import { useRouter } from "@/constants/utilities/useRouter";


interface Props {
    close?: () => void;
}
interface Form {
    page: string;
    options: string[];
}
const PageScrapper: FC<Props> = ({ close }) => {

    const { setNote } = useGlobalProvider();
    const router = useRouter();
    const [isScrapping, setIsScrapping] = useState<boolean>(false);
    const [form, setForm] = useState<Form>({ page: "", options: ["title", "artist", "thumbnail", "description", "content"] });

    const handleStart = useCallback(async () => {
        if (isScrapping) return;

        try {
            setIsScrapping(true);

            const response = await scrapPage(form);

            const data = response.data as {
                title?: string;
                artist?: string;
                description?: string;
                thumbnail?: string;
                audios?: string[];
                videos?: string[];
                images?: string[];
            };
            if (!data) {
                setNote({ type: "warning", title: "data is empty! try again" });
                return;
            }

            const post = initPostObj;

            const validMedia = ((data.audios || []).length > 0 ? data.audios : data.videos) || [];

            post.title = data.title || "";
            post.artist = { displayName: data.artist || "" };
            post.description = data.description || "";
            post.content_thumbnail = [{ id: crypto.randomUUID(), url: data.thumbnail || "" }];
            post.content_type = (data.audios || []).length > 0 ? "music" : (data.videos || []).length > 0 ? "video" : "others";
            post.content = post.content_type === "others" ? (data.images || []).map((i) => ({ id: crypto.randomUUID(), url: i })) : [{ id: crypto.randomUUID(), url: validMedia[0] }];

            //redirect to create post with the post object in state
            router.push(`/posts/create`, { state: post })

        } catch (err) {
            console.log("Error Scrapping Page: ", (err as any).message);
            setNote({ type: "error", title: "Something went wrong! try again" });
        } finally {
            setIsScrapping(false);
        }
        //console.log(form);
    }, [form]);
    return (
        <div className={styles.container}>
            <div className={styles.content_container}>
                <div className={styles.header}>
                    <div className={styles.header_text_content}>
                        <span className={styles.header_title}>Page Scrapper</span>
                        <span className={styles.header_sub_title}>Extract content from web page</span>
                    </div>
                    <div
                        onClick={close}
                        className={styles.close}
                    >
                        <IoClose size={20} />
                    </div>
                </div>
                <div className={styles.content}>
                    <div className={styles.input_box}>
                        <InputFieldStatic
                            placeholder="Enter page link to scrap"
                            disabled={isScrapping}
                            value={form.page}
                            setValue={(page) => setForm((prev) => ({ ...prev, page }))}
                        />
                    </div>
                    <span className={styles.options_header}>Options</span>
                    <div className={styles.option_container}>
                        <div className={styles.option}>
                            <Checkbox
                                checked={form.options.includes("title")}
                                onChange={() => setForm((prev) => ({ ...prev, options: prev.options.includes("title") ? [...prev.options.filter((o) => o !== "title")] : [...prev.options, "title"] }))}
                            />
                            <span className={styles.option_label}>Title</span>
                        </div>
                        <div className={styles.option}>
                            <Checkbox
                                checked={form.options.includes("artist")}
                                onChange={() => setForm((prev) => ({ ...prev, options: prev.options.includes("artist") ? [...prev.options.filter((o) => o !== "artist")] : [...prev.options, "artist"] }))}
                            />
                            <span className={styles.option_label}>Artist</span>
                        </div>
                        <div className={styles.option}>
                            <Checkbox
                                checked={form.options.includes("thumbnail")}
                                onChange={() => setForm((prev) => ({ ...prev, options: prev.options.includes("thumbnail") ? [...prev.options.filter((o) => o !== "thumbnail")] : [...prev.options, "thumbnail"] }))}
                            />
                            <span className={styles.option_label}>Thumbnail</span>
                        </div>
                        <div className={styles.option}>
                            <Checkbox
                                checked={form.options.includes("description")}
                                onChange={() => setForm((prev) => ({ ...prev, options: prev.options.includes("description") ? [...prev.options.filter((o) => o !== "description")] : [...prev.options, "description"] }))}
                            />
                            <span className={styles.option_label}>Description</span>
                        </div>
                        <div className={styles.option}>
                            <Checkbox
                                checked={form.options.includes("content")}
                                onChange={() => setForm((prev) => ({ ...prev, options: prev.options.includes("content") ? [...prev.options.filter((o) => o !== "content")] : [...prev.options, "content"] }))}
                            />
                            <span className={styles.option_label}>Media Content</span>
                        </div>
                    </div>
                </div>
                <div className={styles.footer_container}>
                    <button
                        onClick={handleStart}
                        className={`${styles.start_button} ${isScrapping ? styles.start_loading : ""}`}
                    >
                        {!isScrapping && (
                            <span className={styles.start_text}>Start</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PageScrapper