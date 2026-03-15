import React, { FC, memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styles from "./css/video.player.module.css";
import { Content, Post } from '@/constants/types/post.type';
import { IoPause, IoPlay } from 'react-icons/io5';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { formatTime } from '@/constants/variables/global.vars';
import { useGlobalProvider } from '@/constants/providers/global.provider';

interface Props {
    thumbnail: string | null;
    data?: Content; //the actual array[activeTrack]
    totalTrack?: number; //length of the array
    activeTrack?: number; //index of the active track in the array
    setTrack?: (trackIndex: number) => void //return the next index
}

const VideoPlayer: FC<Props> = ({ thumbnail, data, totalTrack = 1, activeTrack = 0, setTrack }): ReactNode => {

    const { setNote } = useGlobalProvider();
    const [isMounted, setIsMounted] = useState(false);
    const [playingState, setPlayingState] = useState<"playing" | "paused">("paused");

    const [progress, setProgress] = useState<number>(0);
    const [elapsed, setElapsed] = useState<string>("0:00");
    const [showingControls, setShowingControls] = useState<boolean>(true);
    const [duration, setDuration] = useState<number>(0);

    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            // Safety cleanup: Reset body if user navigates away while zoomed
            document.body.style.overflow = "auto";
        };
    }, []);

    // --- FULLSCREEN & ROTATION LOGIC ---
    /*const toggleFullscreen = useCallback(async () => {
        const newState = !isFullscreen;
        setIsFullscreen(newState);

        document.body.style.overflow = newState ? "hidden" : "auto";

        // Attempt Mobile Orientation Lock
        if (typeof screen !== "undefined" && screen.orientation) {
            try {
                if (newState) {
                    await (screen.orientation as any).lock("landscape").catch(() => { });
                } else {
                    screen.orientation.unlock();
                }
            } catch (e) {
                console.log("Orientation lock not supported on this device/browser.");
            }
        }
    }, [isFullscreen]);*/

    // --- VIDEO ENGINE CONTROLS ---
    const togglePlay = useCallback(() => {
        if (!duration || duration === 0) {
            return setNote({ type: "warning", title: "Video is loading..." })
        }
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setPlayingState("playing");
        } else {
            videoRef.current.pause();
            setPlayingState("paused");
        }
    }, [videoRef.current, duration]);

    const handleVideoClick = (e: React.MouseEvent) => {
        if (e.detail === 2) { // Double Tap
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (videoRef.current) {
                if (x < rect.width / 2) videoRef.current.currentTime -= 10;
                else videoRef.current.currentTime += 10;
            }
        } else {
            togglePlay();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const seekTo = (Number(e.target.value) / 100) * duration;
        video.currentTime = seekTo;
        setProgress(parseFloat(e.target.value))
    };

    var getDuration = function (url: string, next: any) {
        var _player = new Audio(url);
        _player.addEventListener("durationchange", function (e) {
            if (this.duration != Infinity) {
                var duration = this.duration
                _player.remove();
                next(duration);
            };
        }, false);
    };

    useEffect(() => { //Messed up
        const video = videoRef.current;
        //if (!video) return;

        //alert("Passed")
        getDuration(data?.url || "", (duration: any) => {
            //alert(duration)
            setDuration(duration)
        });

        if (duration === 0) return;
        //const onLoadedMetadata = () => setDuration(video.duration);
        const onTimeUpdate = () => {
            setProgress((video!.currentTime / video!.duration) * 100);
            setElapsed(formatTime(video!.currentTime));
        };
        const onEnded = () => setPlayingState("paused");

        //video.addEventListener("loadedmetadata", onLoadedMetadata);
        video!.addEventListener("timeupdate", onTimeUpdate);
        video!.addEventListener("ended", onEnded);

        return () => {
            //video.removeEventListener("loadedmetadata", onLoadedMetadata);
            video!.removeEventListener("timeupdate", onTimeUpdate);
            video!.removeEventListener("ended", onEnded);
            setDuration(0)
            setElapsed("0:00")
            setProgress(0);
            setPlayingState("paused");
        };
    }, [data?.url, activeTrack, duration, videoRef.current]);

    // Handle Escape Key
    /* useEffect(() => {
         const handleEsc = (e: KeyboardEvent) => {
             if (e.key === "Escape" && isFullscreen) toggleFullscreen();
         };
         window.addEventListener("keydown", handleEsc);
         return () => window.removeEventListener("keydown", handleEsc);
     }, [isFullscreen, toggleFullscreen]);*/

    if (!isMounted) return null;

    // 1. Correct the disabled states for 0-based indexing
    //const cantPrev = activeTrack < 1;
    //const cantNext = activeTrack >= (totalTrack - 1);
    // console.log("URL: ", data?.url);
    return data?.trailer?.trim() ?
        (
            <div
                dangerouslySetInnerHTML={{ __html: data.trailer }}
                className={`${styles.container}`}
            >

            </div>
        )
        : data?.is_embeded ?
            (
                <div
                    dangerouslySetInnerHTML={{ __html: data.url }}
                    className={`${styles.container}`}
                >

                </div >
            ) :
            (
                <div className={`${styles.container}`}>
                    <div className={styles.video_container} onClick={handleVideoClick}>
                        <video
                            ref={videoRef}
                            src={data?.url ?? undefined}
                            className={styles.video}
                            playsInline
                        />
                    </div>

                    <div
                        onMouseEnter={() => setShowingControls(true)}
                        onTouchStart={() => setShowingControls(true)}
                        onTouchCancel={() => setTimeout(() => setShowingControls(false), 5000)}
                        onMouseLeave={() => setTimeout(() => setShowingControls(false), 5000)}
                        className={`${styles.controls_container}  ${showingControls ? styles.controls_container_showing : ""}`}
                    >
                        <div onClick={togglePlay} className={styles.control_button}>
                            {playingState !== "playing" ? <IoPlay size={24} color="white" /> : <IoPause size={24} color="white" />}
                        </div>

                        <span className={styles.time_display}>{elapsed}</span>

                        <div className={styles.track_container}>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={0.1}
                                value={progress}
                                onChange={handleSeek}
                                className={styles.track}
                            />
                        </div>

                        <span className={styles.time_display}>{formatTime(duration)}</span>

                        <div onClick={(e) => {
                            videoRef.current?.requestFullscreen();
                        }} className={styles.fullscreen_button}>
                            <MdFullscreen size={28} color="white" />
                        </div>
                    </div>
                </div>
            );

    // return isFullscreen ? createPortal(playerUI, document.body) : playerUI;
}

export default memo(VideoPlayer);