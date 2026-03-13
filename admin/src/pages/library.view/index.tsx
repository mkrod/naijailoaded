import { useEffect, useState, type FC, type ReactNode } from 'react'
import styles from "./css/library.view.module.css";
import { useGlobalProvider } from '@/constants/providers/global.provider';
import type { MediaLibrary } from '@/constants/types/media.library.types';
import { useRouter } from '@/constants/utilities/useRouter';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { useMediaLibraryProvider } from '@/constants/providers/media.library.provider';
import ImageViewer from '@/components/utilities/viewable_image';
import VideoPlayer from '@/components/utilities/video.player';
import MusicPlayer from '@/components/utilities/music.player';
import { formatDateProfessional, formatTime, getFileSize } from '@/constants/variables/global.vars';
import { HiOutlineDownload } from 'react-icons/hi';
import { deleteMedia } from '@/constants/controllers/media.library.controller';


const ViewLibrary: FC = (): ReactNode => {

    const router = useRouter();
    const state = router.state as { library?: MediaLibrary };
    const { id } = router.params;

    const { isMobile, setNote, setPrompt } = useGlobalProvider();
    const { library, setFetchingLibrary } = useMediaLibraryProvider();
    const mobileClass = isMobile ? "mobile_" : "";
    const [media, setMedia] = useState<MediaLibrary | undefined>(state?.library);

    useEffect(() => {
        if (media) return;
        if (!id) router.back();
        //console.log(id);
        const thisMedia = library.find((l) => l.library_id === id);
        //console.log(thisMedia)
        setMedia(thisMedia);
    }, [state, id, library]);

    const mediaPart = media?.library_url.split("/") ?? [];
    const mediaName = media?.library_name ?? mediaPart[mediaPart?.length - 1] ?? "Untitled Media";


    const mediaStrParts = media?.library_url.split(".") ?? [];
    const mediaExt = `${mediaStrParts[mediaStrParts.length - 1]}`;
    const finalExt = `${mediaExt.split("&")[0]}`;

    const [mediaSize, setMediaSize] = useState<string>("Loading...");
    const [mediaLocation, setMediaLocation] = useState<string>("Loading...");
    const [dimensions, setDimensions] = useState<string | null>(null);
    const [duration, setDuration] = useState<string | null>(null);
    var getDuration = function (url: string, next: any) {
        var _player = new Audio(url);
        _player.addEventListener("durationchange", function () {
            if (this.duration != Infinity) {
                var duration = this.duration
                _player.remove();
                next(duration);
            };
        }, false);
    };

    useEffect(() => {
        if (!media) return;
        if (media.library_type !== "image") return;

        const img = new Image();

        img.onload = () => {
            setDimensions(`${img.naturalWidth} x ${img.naturalHeight}`);
        };
        img.src = media.library_url;
    }, [media]);
    useEffect(() => {
        if (!media) return;
        if (media.library_type !== "music" && media.library_type !== "video") return;
        getDuration(media.library_url, (dur: number) => {
            setDuration(`${formatTime(dur)}`);
        });
    }, [media]);
    useEffect(() => {
        if (!media) return;
        const url = new URL(media.library_url);
        //console.log(url)
        const path = url.pathname;
        setMediaLocation(path)
    }, [media])
    useEffect(() => {
        if (!media) return;
        getFileSize(media.library_url)
            .then((size) => {
                setMediaSize(size);
            })
    }, [media]);

    const handleDownload = () => {
        if (!media?.library_url) return;
        const a = document.createElement("a");
        a.target = "_blank";
        a.href = media?.library_url;
        a.download = mediaName;
        a.click();

        document.removeChild(a);
    }

    const [deleting, setDeleting] = useState<boolean>(false);
    const handleDelete = async () => {
        if (!media) return;
        if (deleting) return;

        setDeleting(true);

        try {
            const response = await deleteMedia(media);
            if (response.status !== 200) throw Error("Fail to delete Media");
            setNote({ type: "success", title: "Media Deleted" });
            setFetchingLibrary(true);
            router.back();
        } catch (err) {
            setNote({ type: "error", title: (err as any).message });
        } finally {
            setDeleting(false);
        }

    }


    return (
        <div className={styles[`${mobileClass}container`]}>
            <div className={styles[`${mobileClass}header_container`]}>
                <div className={styles.header_left}>
                    <span className={styles.header_title}>
                        Media Manager
                    </span>
                    <span className={styles.header_sub_title}>
                        {mediaName}
                    </span>
                </div>
                <div className={styles[`${mobileClass}header_right`]}>
                    <div
                        onClick={() => {
                            if (!media?.library_url) return;
                            setPrompt({
                                title: `Delete ${mediaName}`,
                                description: "Deleting this media will render linked post without this media, Proceed anyways?",
                                onAccept: handleDelete
                            })
                        }}
                        title='Delete'
                        className={`${styles.action_button} ${styles.action_button_delete}`}
                    >
                        <RiDeleteBin5Line size={20} />
                    </div>
                    <div
                        title='Download'
                        className={`${styles.action_button}`}
                        onClick={handleDownload}
                    >
                        <HiOutlineDownload size={20} />
                    </div>
                </div>
            </div>
            <div className={styles[`${mobileClass}main_container`]}>
                <div className={styles[`${mobileClass}inner_scroll_container`]}>
                    <div className={styles[`${mobileClass}media_preview_section`]}>
                        {media?.library_type === "image" && (
                            <div className={styles.image_preview_container}>
                                <ImageViewer
                                    src={media.library_url}
                                    options={{
                                        thumbnailClassName: styles.image,
                                        canView: true,
                                        height: "100%",
                                    }}
                                />
                            </div>
                        )}
                        {media?.library_type === "video" && (
                            <div className={styles.image_preview_container}>
                                <VideoPlayer
                                    data={{
                                        id: media.library_id,
                                        url: media.library_url
                                    }}
                                />
                            </div>
                        )}
                        {media?.library_type === "music" && (
                            <div className={styles.music_preview_container}>
                                <MusicPlayer
                                    data={{
                                        id: media.library_id,
                                        url: media.library_url
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className={styles[`${mobileClass}media_meta_action_container`]}>
                        <div className={styles.meta_container}>
                            <span className={styles.meta_label}>Filename</span>
                            <span className={styles.meta_value}>{mediaName}</span>
                        </div>
                        <div className={styles.meta_container}>
                            <span className={styles.meta_label}>File type</span>
                            <span className={styles.meta_value}>{media?.library_type}/{finalExt}</span>
                        </div>
                        {media?.library_type === "image" && (
                            <div className={styles.meta_container}>
                                <span className={styles.meta_label}>Dimensions</span>
                                <span className={styles.meta_value}>{dimensions}</span>
                            </div>
                        )}
                        <div className={styles.meta_container}>
                            <span className={styles.meta_label}>Path</span>
                            <span className={styles.meta_value}>{mediaLocation}</span>
                        </div>
                        <div className={styles.meta_container}>
                            <span className={styles.meta_label}>Size</span>
                            <span className={styles.meta_value}>{mediaSize}</span>
                        </div>
                        {(media?.library_type === "music" || media?.library_type === "video") && (
                            <div className={styles.meta_container}>
                                <span className={styles.meta_label}>Duration</span>
                                <span className={styles.meta_value}>{duration ?? "Loading..."}</span>
                            </div>
                        )}
                        <div className={styles.meta_container}>
                            <span
                                className={styles.meta_label}
                            >
                                File Url
                            </span>
                            <span
                                title='Copy Link'
                                style={{ cursor: "pointer", color: "var(--accent)", textDecoration: "underline" }}
                                onClick={() => {
                                    if (!media) return;
                                    navigator.clipboard.writeText(media?.library_url)
                                        .then(() => {
                                            setNote({ type: "success", title: "Copied" })
                                        })
                                        .catch(() => {
                                            setNote({ type: "error", title: "Fail to copy link" })
                                        })
                                }}
                                className={styles.meta_value}
                            >
                                {media?.library_url}
                            </span>
                        </div>
                        <div className={styles.meta_container}>
                            <span className={styles.meta_label}>Last Modified</span>
                            <span className={styles.meta_value}>{formatDateProfessional(media?.updated_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewLibrary;