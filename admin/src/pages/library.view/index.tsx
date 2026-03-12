import { useState, type FC, type ReactNode } from 'react'
import styles from "./css/library.view.module.css";
import { useGlobalProvider } from '@/constants/providers/global.provider';
import type { MediaLibrary } from '@/constants/types/media.library.types';
import { useRouter } from '@/constants/utilities/useRouter';
import { RiDeleteBin5Line } from 'react-icons/ri';


const ViewLibrary: FC = (): ReactNode => {

    const router = useRouter();
    const state = router.state as { library?: MediaLibrary };

    const { isMobile } = useGlobalProvider();
    const mobileClass = isMobile ? "mobile_" : "";
    const [media, _] = useState<MediaLibrary | undefined>(state.library);
    const mediaPart = media?.library_url.split("/") ?? [];
    const mediaName = media?.library_name ?? mediaPart[mediaPart?.length - 1] ?? "Untitled Media";


    return (
        <div className={styles.container}>
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
                        title='Delete'
                        className={`${styles.action_button} ${styles.action_button_delete}`}
                    >
                        <RiDeleteBin5Line size={20} />
                    </div>
                </div>
            </div>
            <div className={styles.main_container}>
                <div className={styles[`${mobileClass}inner_scroll_container`]}>

                </div>
            </div>
        </div>
    )
}

export default ViewLibrary;