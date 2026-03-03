import React, { FC, ReactNode, useState } from 'react'
import styles from "./css/footer.module.css"
import Link from 'next/link'
import { appLogo, subLinks } from '@/constants/variables/global.vars'
import { useGlobalProvider } from '@/constants/providers/global.provider'
import InputField from './input.field'
import { LuDot } from 'react-icons/lu'
import { FaFacebookSquare } from 'react-icons/fa'
import { FaInstagram, FaSquareXTwitter } from 'react-icons/fa6'

const miscLink = [
    {
        name: "Privacy Policy",
        path: "https://naijailoaded.com.ng/privacy-policy"
    },
    {
        name: "About us",
        path: "https://naijailoaded.com.ng/about-us/"
    },
    {
        name: "Advertisement",
        path: "https://naijailoaded.com.ng/advertise/"
    },
    {
        name: "Contact us",
        path: "https://naijailoaded.com.ng/contact-us"
    },
    {
        name: "Post Submission",
        path: "https://naijailoaded.com.ng/write-post"
    }
]

const miscLink2 = [
    {
        name: "DMCA",
        path: "https://naijailoaded.com.ng/privacy-policy"
    },
    {
        name: "Partnership",
        path: "https://naijailoaded.com.ng/about-us/"
    },
    {
        name: "Content Creation",
        path: "https://naijailoaded.com.ng/advertise/"
    },
    {
        name: "Interview",
        path: "https://naijailoaded.com.ng/contact-us"
    },
    {
        name: "Post Review",
        path: "https://naijailoaded.com.ng/write-post"
    }
]
const Footer: FC = (): ReactNode => {

    const { isMobile } = useGlobalProvider();
    const mobileClass = isMobile ? "mobile_" : ""
    const [email, setEmail] = useState<string>("");



    return (
        <footer className={styles.container}>
            <div className={styles.new_letter_container}>
                <span className={styles.subscribe_text}>Subscribe to our newsletter</span>
                <div className={styles.input_submit}>
                    <InputField
                        style={{ width: "80%", height: "100%" }}
                        label='Email Address'
                        value={email}
                        setValue={(email) => setEmail(email)}
                        autocomplete='off'
                        labelStyle={{ backgroundColor: "var(--background-sec)" }}
                    />
                    <button className={styles.submit_button}>
                        Send
                    </button>
                </div>

            </div>

            <div className={styles[`${mobileClass}content_container`]}>
                <div className={styles[`${mobileClass}company_meta`]}>
                    <div className={styles.company_name_logo}>
                        <img src={appLogo} alt="site logo" className={styles.logo} />
                        <span className={styles.name}>Naijailoaded</span>
                    </div>
                    <div className={styles.all_right}>
                        &copy; Copyright {new Date().getFullYear()} <LuDot /> All Right Reserved
                    </div>
                    <nav className={styles.social_links}>
                        <Link
                            target="_blank"
                            className={styles.social_link}
                            href="https://www.facebook.com"
                        >
                            <FaFacebookSquare size="100%" color='#1877F2' />
                        </Link>
                        <Link
                            target="_blank"
                            className={styles.social_link}
                            href="https://www.instagram.com"
                        >
                            <FaInstagram size="100%" color='#d62976' />
                        </Link>
                        <Link
                            target="_blank"
                            className={styles.social_link}
                            href="https://www.x.com"
                        >
                            <FaSquareXTwitter size="100%" color='var(--color)' />
                        </Link>
                    </nav>
                </div>
                <div className={styles[`${mobileClass}others`]}>
                    <div className={styles.links}>
                        <span className={styles.links_header}>Categories</span>
                        {subLinks.map((sl, idx) => (
                            <Link key={idx} href={sl.path} className={styles.link}>{sl.name}</Link>
                        ))}
                    </div>

                    <div className={styles.links}>
                        <span className={styles.links_header}>Routes</span>
                        {miscLink.map((sl, idx) => (
                            <Link key={idx} href={sl.path} className={styles.link}>{sl.name}</Link>
                        ))}
                    </div>

                    <div className={styles.links}>
                        <span className={styles.links_header}>Navigations</span>
                        {miscLink2.map((sl, idx) => (
                            <Link key={idx} href={sl.path} className={styles.link}>{sl.name}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer