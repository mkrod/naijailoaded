import { Post } from '@/constants/types/post.type'
import React, { FC, ReactNode } from 'react'
import styles from "./css/share.module.css";
import { MdShare } from 'react-icons/md';
import { LiaFacebookF } from 'react-icons/lia';
import { FaPrint, FaXTwitter } from 'react-icons/fa6';
import { IoMail } from 'react-icons/io5';
import { FaFacebookF } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { clientURL } from '@/constants/variables/global.vars';
import { useGlobalProvider } from '@/constants/providers/global.provider';


interface Props {
    data?: Post;
}


const Share: FC<Props> = ({ data }): ReactNode => {
    const { isMobile } = useGlobalProvider();
    const mobileClass = isMobile ? "mobile_" : "";


    const shareURI = `${clientURL}/${data?.content_type}/${data?.slug}`;
    //"mailto:?subject=Sface Delivers Raw South London Energy in ‘Stolen Flow’ | Spinex Music&body="
    return (
        <div className={styles[`${mobileClass}container`]}>
            {!isMobile && (
                <header title='Share' className={styles.header}>
                    <MdShare size={20} />
                </header>
            )}
            <main className={styles[`${mobileClass}body`]}>
                <Link
                    href={`https://www.facebook.com/sharer.php?u=${shareURI}`}
                    target='_blank'
                    title='Facebook'
                    className={styles.share_option_icon}
                >
                    <FaFacebookF size={20} color='#163bcb' />
                </Link>
                <Link
                    href={`https://twitter.com/intent/tweet?text=${data?.title}&url=${shareURI}`}
                    target='_blank'
                    title='Twitter X'
                    className={styles.share_option_icon}
                >
                    <FaXTwitter size={18} color='var(--color)' />
                </Link>
                <Link
                    href={`mailto:?subject=${data?.title}&body=I found this article interesting and thought of sharing it with you. Check it out:%0A%0A${clientURL}%2F${data?.content_type}%2F${data?.slug}`}
                    target='_blank'
                    title='Mail'
                    className={styles.share_option_icon}
                >
                    <IoMail size={20} color='#cd7f3b' />
                </Link>
                <Link
                    href="javascript:if(window.print)window.print()"
                    target='_blank'
                    title='Print'
                    className={styles.share_option_icon}
                >
                    <FaPrint size={20} color='#232385' />
                </Link>
            </main>
        </div>
    )
}

export default Share