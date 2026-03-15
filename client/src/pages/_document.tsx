// pages/_document.tsx
import { appLogo, siteDescription, siteKeyWord, siteName } from "@/constants/variables/global.vars";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script src="https://5gvci.com/act/files/tag.min.js?z=9001571" data-cfasync="false" async></script>
        {/* Favicon */}
        <link rel="icon" href={appLogo} />
        <link rel="icon" href={appLogo} type="image/png" />
        <link rel="apple-touch-icon" href={appLogo} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Bungee&family=Lilita+One&family=Playpen+Sans:wght@100..800&family=Quicksand:wght@300..700&family=Rye&family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

        {/* Basic SEO */}
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content={siteKeyWord} />
        <meta name="author" content="Mk Tech Ltd" />
        <meta name="robots" content="index, follow" />

        {/* OpenGraph */}
        {/* <meta property="og:title" content={siteName} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteURL} />
        <meta property="og:image" content="/og-image.png" />*/}

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