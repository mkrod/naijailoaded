// pages/_document.tsx
import { appLogo, siteDescription, siteKeyWord, siteName, siteURL } from "@/constants/variables/global.vars";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href={appLogo} />
        <link rel="icon" href={appLogo} type="image/png" />
        <link rel="apple-touch-icon" href={appLogo} />

        {/* REMOVED: Manual TTF Preload. 
            This was triggering the "not used within a few seconds" warning 
            and blocking the main thread.
        */}

        {/* Basic SEO */}
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content={siteKeyWord} />
        <meta name="author" content="Mk Tech Ltd" />
        <meta name="robots" content="index, follow" />

        {/* OpenGraph */}
        <meta property="og:title" content={siteName} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteURL} />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}