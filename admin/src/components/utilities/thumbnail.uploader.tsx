import { useState, type FC, type ReactNode } from 'react'
import styles from "./css/thumbnail.uploader.module.css";
import { IoCloudUploadSharp, IoLink } from 'react-icons/io5';
import ImageViewer from './viewable_image';
import { MdImage, MdOutlineFilePresent } from 'react-icons/md';
import { useDropzone } from 'react-dropzone';
import type { Post, Thumbnail } from '@/constants/types/post.type';
import InputFieldStatic from './input.field.static';
import { brandImage } from '@/constants/controllers/misc.controller';
import { useGlobalProvider } from '@/constants/providers/global.provider';
import { validateMediaLink } from '@/constants/variables/global.vars';

interface Props {
    //thumbnailPreview: string | null;
    postThumbnail: string | undefined;
    //setFile: (file: File, index?: number) => void;
    //removeFile: (index?: number) => void;
    title?: string;
    subtitle?: string;

    //post: Post;
    updatePost: (payload: Partial<Post>) => void;
}

const ThumbnailUploader: FC<Props> = ({ updatePost, postThumbnail, /*thumbnailPreview, removeFile, setFile,*/ title, subtitle }): ReactNode => {
    const { setNote } = useGlobalProvider();
    const [processingMedia, setProcessingMedia] = useState<boolean>(false);

    /**
     * @param files if input is a file
     * @param link if input is a public link to the file 
     */
    async function handleModifyMedia({ files, link }: { files?: File[], link?: string }) {
        try {
            const formData = new FormData();

            // 1. Handle Metadata logic Not needed here
            /* if (tagMeta) {
                 if (post.title) formData.append("title", post.title);
                 if (post.artist?.displayName) formData.append("artist", post.artist.displayName);
                 if (post.parent_id) {
                     const albumTitle = allAlbum.find(a => a.post_id === post.parent_id)?.title;
                     if (albumTitle) formData.append("album", albumTitle);
                 }
                 if (post.others?.genre) formData.append("genre", post.others.genre);
                 if (post.description) formData.append("description", post.description);
                 if (post.others?.producer) formData.append("producer", post.others.producer);
             }*/

            formData.append("watermark", "false");

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
            const response = await brandImage(formData);

            // 4. Update State with the Response Object
            if (response) {
                console.log(response);
                const { id, url } = response.data;
                //update this to be thumbnail url and id;
                updatePost({ content_thumbnail: [{ id, url }] })
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


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        multiple: false,
        onDrop: (files) => handleModifyMedia({ files })

    })

    const [ContentMode, setContentMode] = useState<"link" | "file">("file");

    return (
        <div className={styles.media_uploader_container}>
            <div className={styles.media_uploader_header}>
                <div className={styles.media_uploader_header_label}>
                    {title}
                    <div className={styles.mode_switch_container}>
                        <div
                            onClick={() => {
                                //removeFile();
                                setContentMode("link");
                            }}
                            className={styles.mode}
                        >
                            <IoLink />
                        </div>
                        <div
                            onClick={() => {
                                //updatePost({ content_thumbnail: undefined });
                                setContentMode("file");
                            }}
                            className={styles.mode}
                        >
                            <MdImage />
                        </div>
                        <div className={`${styles.active_mode} ${styles[ContentMode]}`}>
                            {ContentMode === "file" ? <MdImage /> : <IoLink />}
                        </div>
                    </div>
                    {processingMedia && (
                        <div className={styles.upload_progress} />
                    )}
                </div>
                <span className={styles.media_uploader_header_sub_label}>
                    {subtitle}
                </span>
            </div>
            {ContentMode === "file" && (/*!thumbnailPreview &&*/ !postThumbnail) && (
                <div className={styles.uploader_container}>
                    <div {...getRootProps()} className={styles.thumbnanil_uploader}>
                        <IoCloudUploadSharp size={25} color='var(--color-fade)' />
                        <span style={{ textAlign: "center", width: "100%" }}>{isDragActive ? "Drop here..." : "Click to upload or drag and drop"}</span>
                        <input style={{ display: 'none' }} {...getInputProps()} />
                    </div>
                </div>
            )}
            {ContentMode === "link" && (
                <div className={styles.thumbnail_input_field}>
                    <InputFieldStatic
                        value={postThumbnail ?? ""}
                        placeholder='Enter Thumbnail Link'
                        setValue={(link) => {
                            updatePost({ content_thumbnail: [{ id: "1", url: link } as Thumbnail] });

                            if (validateMediaLink(link, "image")) {
                                handleModifyMedia({ link })
                            }
                        }}
                    />
                </div>
            )}

            {(/*!thumbnailPreview &&*/ postThumbnail) && (
                <div className={styles.uploaded_container}>
                    <ImageViewer
                        src={postThumbnail}
                        alt='Thumbnail Preview'
                        options={{
                            thumbnailClassName: styles.thumbnail,
                            rounded: false,
                            canView: true,
                        }}
                    />


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
                        <input style={{ display: 'none' }} {...getInputProps()} />
                    </button>
                </div>
            )}
            {/*(thumbnailPreview) && (
                <div className={styles.uploaded_container}>
                    <ImageViewer
                        src={thumbnailPreview}
                        alt='Thumbnail Preview'
                        options={{
                            thumbnailClassName: styles.thumbnail,
                            rounded: false,
                            canView: true

                        }}
                    />

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            //removeFile();
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

export default ThumbnailUploader