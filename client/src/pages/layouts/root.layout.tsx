import React, { FC, ReactNode } from 'react'
import styles from "./css/root.layout.module.css";
import { useGlobalProvider } from '@/constants/providers/global.provider';
import MobileNavbar from '@/components/mobile/nav.bar';
import DesktopNavbar from '@/components/desktop/nav.bar';
import Footer from '@/components/utilities/footer';

interface Props {
    children: ReactNode;
}


const RootLayout: FC<Props> = ({ children }): ReactNode => {
    const { isMobile } = useGlobalProvider();


    return (
        <div className={styles.layout_container}>
            {isMobile ? (
                <>
                    <MobileNavbar>
                        {children}
                    </MobileNavbar>
                    <Footer />
                </>
            ) : (
                <>
                    <DesktopNavbar>
                        {children}
                    </DesktopNavbar>
                    <Footer />
                </>
            )}
        </div>
    )
}

export default RootLayout