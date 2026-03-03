import type { Content } from "@/constants/types/post.type";
import styles from "./css/music.player.module.css";
import { type FC, memo, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import ImageViewer from "./viewable_image";
import { appLogo, defaultContentDt, formatTime } from "@/constants/variables/global.vars";
import { IoPause, IoPlay, IoPlaySkipBack, IoPlaySkipForward } from "react-icons/io5";
import { useGlobalProvider } from "@/constants/providers/global.provider";

interface Props {
    thumbnail?: string | null;
    data?: Content; //the actual array[activeTrack]
    totalTrack?: number; //length of the array
    activeTrack?: number; //index of the active track in the array
    setTrack?: (trackIndex: number) => void //return the next index
}

const MusicPlayer: FC<Props> = ({ thumbnail, data, totalTrack = 1, activeTrack = 0, setTrack }): ReactNode => {


    const { setNote } = useGlobalProvider();
    const [artistName, setArtistName] = useState<string>("")
    const [title, setTitle] = useState<string>("");


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
            data?.title?.split(/\s*[-–]\s*/)[0] ?? "";

        // Title name: second part of title (after - or –) or full title
        const titleSource =
            data?.title?.split(/\s*[-–]\s*/)[1] ?? data?.title ?? "";

        setArtistName(format(artistSource));
        setTitle(format(titleSource));
    }, [activeTrack, data?.title]);


    const [playingState, setPlayingState] = useState<"playing" | "paused">("paused");
    const [_, setIsLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState<number>(0);
    const [elapsed, setElapsed] = useState<string>("0:00");

    const [duration, setDuration] = useState<number>(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);

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
        const audio = new Audio(data?.url as string | undefined);
        getDuration(data?.url as string, function (duration: any) {
            setDuration(duration);
        });

        if (duration === 0) return;
        audioRef.current = audio;

        audio.addEventListener("loadedmetadata", () => {
            setIsLoading(false);
        });

        audio.addEventListener("timeupdate", () => {
            setProgress((audio.currentTime / duration) * 100);
            setElapsed(formatTime(audio.currentTime));
        });

        audio.addEventListener("ended", () => {
            setPlayingState("paused");
            setProgress(100);
            if (!cantNext) {
                setTrack?.(activeTrack + 1);
            }

        });

        //togglePlay(); //auto play

        return () => {
            audio.pause();
            audioRef.current = null;
            //setTrack?.(0);
            setDuration(0)
            setElapsed("0:00")
            setProgress(0);
            setPlayingState("paused");
        };
    }, [data?.url, activeTrack, duration]);

    const togglePlay = useCallback(() => {
        if (duration === 0) {
            setNote({ type: "warning", title: "Audio is loading..." })
            return;
        }
        const audio = audioRef.current;
        if (!audio) return;

        if (playingState === "paused") {
            audio.play();
            setPlayingState("playing");
        } else {
            audio.pause();
            setPlayingState("paused");
        }
    }, [duration, playingState, audioRef.current]);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = (parseFloat(e.target.value) / 100) * duration;
        audio.currentTime = newTime;
        setProgress(parseFloat(e.target.value));
    }, [audioRef.current]);

    // 1. Correct the disabled states for 0-based indexing
    const cantPrev = activeTrack < 1;
    const cantNext = activeTrack >= (totalTrack - 1);


    return data?.is_embeded ?
        (
            <div
                dangerouslySetInnerHTML={{ __html: data.url }}
                className={`${styles.container}`}
            />
        ) : (
            <div className={styles.container}>
                <div className={styles.image_container}>
                    {<ImageViewer
                        src={thumbnail ?? defaultContentDt}
                        alt={data?.title}
                        options={{
                            thumbnailClassName: styles.image,
                            canView: true
                        }}

                    />}
                </div>
                <img
                    alt="App Logo"
                    className={styles.logo}
                    src={appLogo}
                />
                <div className={styles.title_artist}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.artist}>{artistName}</span>
                </div>
                <div className={styles.player_control}>
                    <div className={styles.track_container}>
                        <input
                            min={0}
                            max={100}
                            step={1}
                            value={progress}
                            onChange={handleSeek}
                            type="range"
                            className={styles.track}
                        />
                        <div className={styles.track_label}>
                            <span>{elapsed}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    <div className={styles.controllers}>
                        {totalTrack > 1 && (
                            <button
                                disabled={cantPrev}
                                className={styles.control_button}
                                onClick={() => {
                                    // If activeTrack is 0, we can't go back
                                    if (!cantPrev) setTrack?.(activeTrack - 1);
                                }}
                            >
                                <IoPlaySkipBack size={20} color={cantPrev ? "#3a3a3a" : "whitesmoke"} />
                            </button>
                        )}
                        {playingState !== "playing" ? (
                            <button
                                onClick={togglePlay}
                                className={styles.control_button}
                            >
                                <IoPlay size={20} color={"whitesmoke"} />
                            </button>
                        ) : (
                            <button
                                onClick={togglePlay}
                                className={styles.control_button}
                            >
                                <IoPause size={20} color={"whitesmoke"} />
                            </button>
                        )}
                        {totalTrack > 1 && (
                            <button
                                disabled={cantNext}
                                className={styles.control_button}
                                onClick={() => {
                                    // If activeTrack is totalTrack - 1, we can't go forward
                                    if (!cantNext) setTrack?.(activeTrack + 1);
                                }}
                            >
                                <IoPlaySkipForward size={20} color={cantNext ? "#3a3a3a" : "whitesmoke"} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
}

export default memo(MusicPlayer)