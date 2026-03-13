import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import styles from "./css/grid.assets.card.module.css";
import type { MediaLibrary } from "@/constants/types/media.library.types";
import { LuDot } from "react-icons/lu";
import { formatTime } from "@/constants/variables/global.vars";
import { MdMusicNote } from "react-icons/md";
import { IoIosVideocam } from "react-icons/io";
import ImageViewer from "./viewable_image";
import { useRouter } from "@/constants/utilities/useRouter";
import { Checkbox } from "@mui/material";

interface Props {
    library: MediaLibrary;
    isSelected: boolean;
    onSelected?: ({ id, value }: { id: string; value: boolean }) => void;
    selectedMediaIdLength: number;
}

const GridAssetCard: FC<Props> = ({
    library,
    isSelected,
    onSelected,
    selectedMediaIdLength
}): ReactNode => {

    const { library_url, library_type } = library;

    const router = useRouter();

    const [dimensions, setDimensions] = useState<string | null>(null);
    const [duration, setDuration] = useState<string | null>(null);

    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggered = useRef(false);

    const mediaStrParts = library_url.split(".");
    const mediaExt = mediaStrParts[mediaStrParts.length - 1].toUpperCase();
    const finalExt = mediaExt.split("&")[0];

    const mediaPart = library_url.split("/");
    const title = library.library_name ?? mediaPart[mediaPart.length - 1] ?? "Untitled Media";

    const selectThis = () => {
        onSelected?.({
            id: library.library_id,
            value: !isSelected
        });
    };

    const getDuration = (url: string, next: (dur: number) => void) => {
        const player = new Audio(url);

        player.addEventListener("durationchange", function () {
            if (this.duration !== Infinity) {
                const duration = this.duration;
                player.remove();
                next(duration);
            }
        });
    };

    useEffect(() => {
        if (library_type !== "image") return;

        const img = new Image();

        img.onload = () => {
            setDimensions(`${img.naturalWidth} x ${img.naturalHeight}`);
        };

        img.src = library_url;

    }, [library_url, library_type]);

    useEffect(() => {
        if (library_type !== "music" && library_type !== "video") return;

        getDuration(library_url, (dur) => {
            setDuration(formatTime(dur));
        });

    }, [library_url, library_type]);

    const handlePointerDown = () => {
        longPressTriggered.current = false;

        timer.current = setTimeout(() => {
            longPressTriggered.current = true;
            selectThis();
        }, 700);
    };

    const handlePointerUp = () => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
    };

    const handleClick = () => {
        if (longPressTriggered.current) return;

        if (selectedMediaIdLength > 0) {
            selectThis();
        } else {
            router.push(`/library/${library.library_id}`, { library });
        }
    };

    return (
        <div
            className={styles.container}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onClick={handleClick}
            onContextMenu={(e) => e.preventDefault()}
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
                    <span className={styles.meta_type}>
                        {library_type.toUpperCase()}
                    </span>
                </div>
            </div>

            {selectedMediaIdLength > 0 && (
                <div className={styles.checkbox_container}>
                    <Checkbox
                        checked={isSelected}
                        onChange={(_, value) => {
                            onSelected?.({
                                id: library.library_id,
                                value
                            });
                        }}
                    />
                </div>
            )}

        </div>
    );
};

export default GridAssetCard;