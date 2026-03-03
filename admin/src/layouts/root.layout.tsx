import { useGlobalProvider } from "../constants/providers/global.provider";
import styles from "./css/root.layout.module.css";
import { MdCheckCircle, MdError } from "react-icons/md";
//import { useEffect } from "react";
//import { checkSession } from "@/constants/controllers/user.controller";
//import { useRouter } from "@/constants/utilities/useRouter";
import { Outlet } from "react-router";
import MobileNavbar from "@/components/mobile/nav.bar";
import DesktopNavbar from "@/components/desktop/nav.bar";

const RootLayout = () => {
    const { note, snackNote, prompt, setPrompt, isMobile } = useGlobalProvider();
    //const router = useRouter();

    /*
        useEffect(() => {
            const gotoAuth = (authPath: string) => {
                const currentLocation: string = router.pathname;
                //save path to restore after login and clear it
                pathHelper.current = currentLocation;
                router.replace(authPath);
            }
            checkSession()
                .then((res) => {
                    if (res.message !== "PONG") {
                        gotoAuth("/auth/login");
                        return;
                    }
                    const resumePage = localStorage.getItem("resume_page");
                    router.replace(resumePage && resumePage !== "/" ? resumePage : "/app");
                })
                .catch((err) => {
                    console.log("Session Error: ", err);
                    gotoAuth("/auth/login");
                })
        }, []);
    */
    return (
        <div className={styles.container}>
            <div className={`${styles.alert_container} ${note ? styles.alert_container_active : ""}`}>
                <div className={styles.alert_type_icon}>
                    {(note?.type === "error" || note?.type === "warning") && (
                        <MdError size={15} color={note.type === "error" ? "red" : "#c9af1a"} />
                    )}
                    {note?.type === "success" && (
                        <MdCheckCircle size={15} color="green" />
                    )}
                </div>
                <div className={styles.alert_text_container}>
                    <span className={styles.alert_title}>{note?.title}</span>
                    {note?.body && <span className={styles.alert_desc}>{note.body}</span>}
                </div>
            </div>
            {prompt && (
                <div className={styles.prompt_container}>
                    <div className={styles.prompt}>
                        <div className={styles.prompt_content}>
                            <span className={styles.prompt_title}>{prompt.title}</span>
                            {prompt.description && <span className={styles.prompt_desc}>{prompt.description}</span>}
                        </div>
                        <div className={styles.prompt_buttons}>
                            <button
                                onClick={() => {
                                    prompt.onAccept();
                                    setPrompt(undefined);
                                }}
                                className={`${styles.prompt_button} ${styles.prompt_accept}`}
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => {
                                    prompt.onDecline?.();
                                    setPrompt(undefined);
                                }}
                                className={`${styles.prompt_button} ${styles.prompt_decline}`}
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isMobile ? (
                <MobileNavbar>
                    <Outlet />
                </MobileNavbar>
            ) : (
                <DesktopNavbar>
                    <Outlet />
                </DesktopNavbar>
            )}
            {snackNote && (
                <div className={styles.snackBar_container}>
                    {snackNote.message}
                </div>
            )}
        </div>
    );
}

export default RootLayout