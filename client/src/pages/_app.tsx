"use client"
import { GlobalProvider } from "@/constants/providers/global.provider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import RootLayout from "./layouts/root.layout";
import CookieConsent, { Cookies } from "react-cookie-consent";
import { useEffect } from "react";
import { loadAnalytics } from "@/constants/utilities/cookie.analytics";
import { ThemeProvider } from "@mui/material";
import { theme } from "@/constants/variables/global.vars";
import { UserProvider } from "@/constants/providers/user.provider";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import 'nprogress/nprogress.css';


export default function App({ Component, pageProps }: AppProps) {

  const router = useRouter();

  useEffect(() => {
    if (Cookies.get("naijailoaded_cookie") === "true") {
      loadAnalytics();
    }
  }, []);

  useEffect(() => {
    const handleStart = () => nProgress.start();
    const handleStop = () => nProgress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);



  return (
    <ThemeProvider theme={theme}>
      <GlobalProvider>
        <UserProvider>
          <RootLayout>
            <Component {...pageProps} />
            <CookieConsent
              enableDeclineButton
              hideOnDecline
              location="bottom"
              buttonText="I Accept"
              cookieName="naijailoaded_cookie"
              style={{
                background: "var(--background-sec)",
                color: "var(--color)",
                textAlign: "center",
                padding: "1rem",
                fontWeight: 600,
                fontSize: "var(--sm-font)"
              }}
              declineButtonStyle={{
                color: "#fff",
                fontWeight: "bold",
                padding: "0.5rem 1rem",
                borderRadius: "0.3rem",
                marginLeft: "1rem",
              }}
              buttonStyle={{
                color: "#fff",
                background: "var(--accent)",
                fontWeight: "bold",
                padding: "0.5rem 1rem",
                borderRadius: "0.3rem",
                marginLeft: "1rem",
              }}
              expires={365} // cookie lasts 1 year
            >
              We use cookies to enhance your browsing experience,
              serve personalized ads or content, and analyze our traffic.
              By clicking <span style={{ fontWeight: "bolder" }}>I ACCEPT</span>, you consent to our use of cookies.
            </CookieConsent>
          </RootLayout>
        </UserProvider>
      </GlobalProvider>
    </ThemeProvider>
  );
}
