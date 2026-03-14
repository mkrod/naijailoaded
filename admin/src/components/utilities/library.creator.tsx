import { useState, type FC } from 'react'
import styles from "./css/library.creator.module.css";
import { IoClose, IoCloudUploadSharp, IoLink } from 'react-icons/io5';
import { BsFileEarmarkPlay } from 'react-icons/bs';
import { useGlobalProvider } from '@/constants/providers/global.provider';
import { useDropzone } from 'react-dropzone';
import type { Post } from '@/constants/types/post.type';
import { brandImage, brandMusic, brandVideo } from '@/constants/controllers/misc.controller';
import { useMediaLibraryProvider } from '@/constants/providers/media.library.provider';
import InputFieldStatic from './input.field.static';
import { validateMediaLink } from '@/constants/variables/global.vars';
import { MdAudiotrack } from 'react-icons/md';
import { IoIosVideocam } from 'react-icons/io';
import { FaImage } from 'react-icons/fa6';

interface Props {
    close: () => void;
}
const LibraryCreator: FC<Props> = ({ close }) => {
    const { setFetchingLibrary } = useMediaLibraryProvider();
    const { setNote } = useGlobalProvider();
    const [type, setType] = useState<Post['content_type']>("others");
    const [processingMedia, setProcessingMedia] = useState<boolean>(false);
    const [ContentMode, setContentMode] = useState<"link" | "file">("file");
    const [link, setLink] = useState<string>("");

    async function handleModifyMedia({ files, link }: { files?: File[], link?: string }) {
        if (processingMedia) return;
        setProcessingMedia(true);

        try {
            const formData = new FormData();

            formData.append("watermark", "false");
            formData.append("librarySave", "true"); //should save

            // 2. Add File OR Link to FormData
            if (files && files.length > 0) {
                formData.append("file", files[0]);
            } else if (link) {
                formData.append("link", link);
            } else {
                return; // Exit if nothing to process
            }


            // 3. Call the backend
            const response = type === "video"
                ? await brandVideo(formData)
                : type === "music"
                    ? await brandMusic(formData)
                    : await brandImage(formData);


            if (response) {
                //console.log(response);
                const { id, url } = response.data;

                if (!id || !url) throw Error("Upload failed!");

                setNote({ type: "success", title: "Upload successful!" });
                setFetchingLibrary(true);
                close();
            }

        } catch (err) {
            console.error("Error Uploading!: ", err);
            setNote({
                type: "error",
                title: (err as any).response?.data?.message || (err as any).message || "Processing failed"
            });
        } finally {
            setProcessingMedia(false);
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: type?.toLowerCase() === "music" ? { "audio/*": [] } : type?.toLowerCase() === "video" ? { "video/*": [] } : { "image/*": [] },
        multiple: false,
        onDrop: (files) => handleModifyMedia({ files }),
    });

    return (
        <div className={styles.container}>
            <div className={styles.content_container}>
                <div className={styles.header}>
                    <div className={styles.header_text_content}>
                        <span className={styles.header_title}>Add Media</span>
                        <span className={styles.header_sub_title}>create a media entry from your local computer or link</span>
                    </div>
                    <div
                        onClick={close}
                        className={styles.close}
                    >
                        <IoClose size={20} />
                    </div>
                </div>
                <div className={styles.content}>
                    <div className={styles.media_uploader_header}>
                        <div className={`${styles.mode_switch_container} ${styles.type}`}>
                            <div
                                onClick={() => {
                                    //removeFile(); //remove file
                                    setType("music");
                                }}
                                className={styles.mode}
                            >
                                <MdAudiotrack />
                            </div>
                            <div
                                onClick={() => {
                                    //updatePost({ content: removeAndReorder(allContents, index) }); //remove link
                                    setType("others");
                                }}
                                className={styles.mode}
                            >
                                <FaImage />
                            </div>
                            <div
                                onClick={() => {
                                    //updatePost({ content: removeAndReorder(allContents, index) }); //remove link
                                    setType("video");
                                }}
                                className={styles.mode}
                            >
                                <IoIosVideocam />
                            </div>
                            <div className={`${styles.active_mode} ${styles[type]}`}>
                                {type === "music" ? <MdAudiotrack /> : type === "video" ? <IoIosVideocam /> : <FaImage />}
                            </div>
                        </div>


                        <div style={{ marginLeft: "auto" }} className={styles.mode_switch_container}>
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
                        {processingMedia && (
                            <div
                                className={styles.upload_progress}
                            />
                        )}
                    </div>
                    <div className={styles.media_uploader_content}>
                        {ContentMode === "file" && (
                            <div className={styles.uploader_container}>
                                <div {...getRootProps()} className={styles.thumbnanil_uploader}>
                                    <IoCloudUploadSharp size={25} color='var(--color-fade)' />
                                    <span style={{ textAlign: "center", width: "100%" }}>{isDragActive ? "Drop here..." : "Click to upload or drag and drop"}</span>
                                    <input {...getInputProps()} />
                                </div>
                            </div>
                        )}
                        {ContentMode === "link" && (
                            <div className={styles.thumbnail_input_field}>
                                <InputFieldStatic
                                    value={link}
                                    placeholder='Enter Direct content Link'
                                    setValue={(link) => {
                                        //update this to be content url;
                                        setLink(link)
                                        if (validateMediaLink(link, type)) {
                                            handleModifyMedia({ link })
                                        }
                                    }}
                                    disabled={processingMedia}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LibraryCreator;