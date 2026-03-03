import { useState, type FC, type ReactNode } from 'react'
import styles from "./css/content.uploader.module.css";
import { IoCloudUploadSharp, IoLink } from 'react-icons/io5';
import ImageViewer from './viewable_image';
import { MdOutlineFilePresent } from 'react-icons/md';
import type { Content, Post } from '@/constants/types/post.type';
import MusicPlayer from './music.player';
import VideoPlayer from './video.player';
import { TbCode } from 'react-icons/tb';
import { useDropzone } from 'react-dropzone'; // Use the hook version
import { removeAndReorder, validateMediaLink } from '@/constants/variables/global.vars';
import InputFieldStatic from './input.field.static';
import { BsFileEarmarkPlay } from 'react-icons/bs';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import EditableInput from './input';
import { useGlobalProvider } from '@/constants/providers/global.provider';
import { brandMusic, brandVideo } from '@/constants/controllers/misc.controller';

interface Props {
    index: number;
    post: Post;
    updatePost: (payload: Partial<Post>) => void;
    //contentPreview?: string | null;
    allContents: Content[];
    allAlbum: Post[];
    postContent: Content | undefined;
    //setFile: (file: File, index?: number) => void;
    //removeFile: (index?: number) => void;
    title?: string;
    subtitle?: string;
    type: Post['content_type'];

    tagMeta: boolean;
    tagMedia: boolean;
}

const ContentUploader: FC<Props> = ({ tagMedia, tagMeta, index, allContents, post, updatePost, title, postContent, /*contentPreview, removeFile,*/ type, allAlbum }): ReactNode => {

    const { setNote } = useGlobalProvider();
    const [processingMedia, setProcessingMedia] = useState<boolean>(false);

    /**
     * @param files if input is a file
     * @param link if input is a public link to the file 
     */
    async function handleModifyMedia({ files, link }: { files?: File[], link?: string }) {
        try {
            const formData = new FormData();

            // 1. Handle Metadata logic
            if (tagMeta) {
                if (post.title) formData.append("title", post.title);
                if (post.artist?.displayName) formData.append("artist", post.artist.displayName);
                if (post.parent_id) {
                    const albumTitle = allAlbum.find(a => a.post_id === post.parent_id)?.title;
                    if (albumTitle) formData.append("album", albumTitle);
                }
                if (post.others?.genre) formData.append("genre", post.others.genre);
                if (post.description) formData.append("description", post.description);
                if (post.others?.producer) formData.append("producer", post.others.producer);
            }

            formData.append("watermark", tagMedia ? "true" : "false");

            // 2. Add File OR Link to FormData
            if (files && files.length > 0) {
                formData.append("file", files[0]);
            } else if (link) {
                formData.append("link", link);
            } else {
                return; // Exit if nothing to process
            }

            setProcessingMedia(true);

            // 3. Call the backend
            const response = type === "video"
                ? await brandVideo(formData)
                : type === "music"
                    ? await brandMusic(formData)
                    : null;

            // 4. Update State with the Response Object
            if (response) {
                console.log(response);
                const { id, url } = response.data;
                //update this to be content url and id;
                const lc = { ...postContent, id, url } as Content;

                const modifiedContent = allContents?.map((c) => c.id === postContent?.id ? lc : c);

                updatePost({ content: modifiedContent })
            }

        } catch (err) {
            console.error("Error Branding: ", err);
            setNote({
                type: "error",
                title: (err as any).response?.data?.message || (err as any).message || "Processing failed"
            });
        } finally {
            setProcessingMedia(false);
        }
    }


    // Internal Dropzone logic to avoid hook-in-loop error in parent
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: type?.toLowerCase() === "music" ? { "audio/*": [] } : type?.toLowerCase() === "video" ? { "video/*": [] } : { "image/*": [] },
        multiple: false,
        onDrop: (files) => handleModifyMedia({ files }),
    });

    const getPlayer = (type: Post['content_type'], data: Content) => {
        if (type === "music") return <MusicPlayer data={data} />;
        if (type === "video") return <VideoPlayer data={data} />;
        return <ImageViewer src={postContent?.url} options={{ thumbnailClassName: styles.thumbnail }} />;
    };

    const [ContentMode, setContentMode] = useState<"link" | "file">("file");
    const source = Boolean(postContent?.is_embeded) ? "embeded" : "direct";

    return (
        <div className={styles.media_uploader_container}>
            <div className={styles.media_uploader_header}>
                <div className={styles.media_uploader_header_label}>
                    {title}

                    <div
                        onClick={() => {

                        }}
                        className={`${styles.add_watermark} ${styles.is_watermark}`}
                    >

                    </div>
                    {source === "direct" && (
                        <div className={styles.mode_switch_container}>
                            <div
                                onClick={() => {
                                    //removeFile(); //remove file
                                    setContentMode("link");
                                }}
                                className={styles.mode}
                            >
                                <IoLink />
                            </div>
                            <div
                                onClick={() => {
                                    //updatePost({ content: removeAndReorder(allContents, index) }); //remove link
                                    setContentMode("file");
                                }}
                                className={styles.mode}
                            >
                                <BsFileEarmarkPlay />
                            </div>
                            <div className={`${styles.active_mode} ${styles[ContentMode]}`}>
                                {ContentMode === "file" ? <BsFileEarmarkPlay /> : <IoLink />}
                            </div>
                        </div>
                    )}
                    <div
                        onClick={() => {
                            //update this to be embeded specific;
                            const newState = source === "embeded" ? 0 : 1;
                            const lc = { ...postContent, is_embeded: newState } as Content;

                            const modifiedContent = allContents?.map((c) => c.id === lc?.id ? lc : c);

                            updatePost({ content: modifiedContent })
                        }}
                        className={`${styles.remove_slot}  ${!Boolean(postContent?.is_embeded) ? styles.not_embed : ""}`}
                    >
                        <TbCode />
                    </div>
                    <div
                        onClick={() => {

                            updatePost({ content: removeAndReorder(allContents, index) });
                        }}
                        className={styles.remove_slot}
                    >
                        <RiDeleteBin5Fill />
                    </div>
                    {processingMedia && (
                        <div className={styles.upload_progress}

                        />
                    )}
                </div>
                <span className={styles.media_uploader_header_sub_label}>
                    {`ID: ${postContent?.id ? postContent?.id : "-"}`}
                </span>
            </div>



            {source === "direct" && ContentMode === "file" && (/*!contentPreview &&*/ !postContent?.url) && (
                <div className={styles.uploader_container}>
                    <div {...getRootProps()} className={styles.thumbnanil_uploader}>
                        <IoCloudUploadSharp size={25} color='var(--color-fade)' />
                        <span style={{ textAlign: "center", width: "100%" }}>{isDragActive ? "Drop here..." : "Click to upload or drag and drop"}</span>
                        <input {...getInputProps()} />
                    </div>
                </div>
            )}
            {source === "direct" && ContentMode === "link" && (
                <div className={styles.thumbnail_input_field}>
                    <InputFieldStatic
                        value={postContent?.url ?? ""}
                        placeholder='Enter Direct content Link'
                        setValue={(link) => {
                            //update this to be content url;
                            const lc = { ...postContent, url: link } as Content;

                            const modifiedContent = allContents?.map((c) => c.id === lc?.id ? lc : c);

                            updatePost({ content: modifiedContent })

                            if (validateMediaLink(link, type)) {
                                handleModifyMedia({ link })
                            }
                        }}
                        disabled={processingMedia}
                    />
                </div>
            )}

            {source === "embeded" && (
                <div className={styles.thumbnail_input_field}>
                    <EditableInput
                        value={postContent?.url ?? ""}
                        placeholder='Enter Embeded code'
                        onChange={(e) => {
                            //update this to be content url;
                            const lc = { ...postContent, url: e } as Content;

                            const modifiedContent = allContents?.map((c) => c.id === lc?.id ? lc : c);

                            updatePost({ content: modifiedContent })
                        }}
                        AIdisabled
                        disableFormatting

                    />
                </div>
            )}
            {!postContent?.is_embeded && (/*!contentPreview &&*/ postContent?.url) && (
                <div className={styles.uploaded_container}>
                    {getPlayer(type, postContent)}
                    {(!post.is_album) && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                //removeFile();
                            }}
                            className={styles.thumbnail_replace_button}
                            {...getRootProps()}
                        >
                            <MdOutlineFilePresent size={15} />
                            Replace
                            <input {...getInputProps()} />
                        </button>
                    )}
                </div>
            )}

            {/*!postContent?.is_embeded && (contentPreview) && (
                <div className={styles.uploaded_container}>
                    {getPlayer(type, { ...postContent, url: contentPreview } as Content)}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFile();
                        }}
                        className={styles.thumbnail_remove_button}
                    >
                        <TbTrash size={15} />
                    </button>
                </div>
            )*/}
        </div>
    )
}

export default ContentUploader;