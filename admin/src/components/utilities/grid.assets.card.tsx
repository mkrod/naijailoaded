import { useEffect, useState, type FC, type ReactNode } from "react";
import styles from "./css/grid.assets.card.module.css";
import type { MediaLibrary } from "@/constants/types/media.library.types";
import { LuDot } from "react-icons/lu";
import { formatTime } from "@/constants/variables/global.vars";
import { MdMusicNote } from "react-icons/md";
import { IoIosVideocam } from "react-icons/io";
import ImageViewer from "./viewable_image";
import { useRouter } from "@/constants/utilities/useRouter";

interface Props {
    library: MediaLibrary;
}

const GridAssetCard: FC<Props> = ({ library }): ReactNode => {
    const { library_name, library_url, library_type } = library;
    const mediaStrParts = library_url.split(".");
    const mediaExt = `${mediaStrParts[mediaStrParts.length - 1]}`.toUpperCase();
    const finalExt = `${mediaExt.split("&")[0]}`;
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
        if (library_type !== "image") return;

        const img = new Image();

        img.onload = () => {
            setDimensions(`${img.naturalWidth} x ${img.naturalHeight}`);
        };
        img.src = library_url;
    }, [library_url]);
    useEffect(() => {
        if (library_type !== "music" && library_type !== "video") return;
        getDuration(library_url, (dur: number) => {
            setDuration(`${formatTime(dur)}`);
        });
    }, [library_url]);

    const title = library_name ?? "Media";
    const router = useRouter();

    return (
        <div
            className={styles.container}
            onClick={() => router.push(`/library/${library.library_id}`, { library })}
        >
            <div title={title} className={styles.top_container}>
                {library_type === "music" && (
                    <div className={styles.type_wrapper}>
                        <MdMusicNote size={50} color="var(--border-fade)" />
                    </div>
                )}
                {library_type === "video" && (
                    <div className={styles.type_wrapper}>
                        <IoIosVideocam size={50} color="var(--border-fade)" />
                    </div>
                )}
                {library_type === "image" && (
                    <div className={styles.type_wrapper}>
                        <ImageViewer
                            alt={title}
                            src={library_url}
                            options={{
                                thumbnailClassName: styles.image,
                                height: "100%",
                                width: "100%",
                                canView: false
                            }}
                        />
                    </div>
                )}
            </div>

            <div className={styles.meta_container}>
                <div className={styles.meta_left}>
                    <div className={styles.meta_title}>
                        {title}
                    </div>
                    <div className={styles.meta_ext_dimension}>
                        {finalExt}
                        <LuDot />
                        {dimensions ?? duration}
                    </div>
                </div>
                <div className={styles.meta_right}>
                    <span className={styles.meta_type}>{library_type.toUpperCase()}</span>
                </div>
            </div>
        </div>
    )
}

export default GridAssetCard