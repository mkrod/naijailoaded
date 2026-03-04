import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { appLogo, clientURL, serverRequest } from "@/constants/variables/global.vars";
import { useGlobalProvider } from "@/constants/providers/global.provider";
import MobileHome from "./mobile";
import DesktopHome from "./desktop";
import { GetServerSideProps } from "next";
import { APIArrayResponse } from "@/constants/types/global.types";
import { FC } from "react";

{/*const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});*/}
export interface HomePageContentProps {
  trending: APIArrayResponse | undefined;
  music: APIArrayResponse | undefined;
  hotsong: APIArrayResponse | undefined;
  mixtape: APIArrayResponse | undefined;
  video: APIArrayResponse | undefined;
  news: APIArrayResponse | undefined;
  recommended: APIArrayResponse | undefined;
}

const Home: FC<HomePageContentProps> = (data) => {

  const { isMobile } = useGlobalProvider();


  return (
    <>
      <Head>
        <title>Naijailoaded | Nigeria's No. 1 Music & Video Entertainment Portal</title>
        <meta name="description" content="Get the latest Nigerian Music, Videos, Mixtapes, and Entertainment News. Download trending Afrobeat songs and viral videos daily on Naijailoaded." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={appLogo} />

        {/* Open Graph for Social Media Sharing */}
        <meta property="og:title" content="Naijailoaded | Latest Nigerian Music & Videos" />
        <meta property="og:description" content="Streaming and downloading the best of Afrobeats, News, and Videos." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={clientURL} />
        <meta property="og:image" content={`${clientURL}/NL_logo.png`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "name": "Naijailoaded",
                  "url": clientURL,
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${clientURL}/search?q={search_term_string}`,
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "name": "Naijailoaded",
                  "url": clientURL,
                  "logo": appLogo
                }
              ]
            })
          }}
        />

        <link rel="canonical" href={clientURL} />
      </Head>
      {isMobile ? <MobileHome data={data} /> : <DesktopHome data={data} />}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Inside try { ... }
    context.res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );
    // Fire all requests simultaneously
    const [
      trendingRes,
      musicRes,
      mixtapeRes,
      videoRes,
      newsRes,
      recommendedRes
    ] = await Promise.all([
      serverRequest("get", "/posts", { is_trending: true, limit: 5 }),
      serverRequest("get", "/posts", { content_type: "music", limit: 12 }),
      serverRequest("get", "/posts", { category_id: "mix-tape", limit: 12 }),
      serverRequest("get", "/posts", { content_type: "video", limit: 2 }),
      serverRequest("get", "/posts", { content_type: "news", limit: 12 }),
      serverRequest("get", "/posts", {})
    ]);

    return {
      props: {
        trending: trendingRes.data || undefined,
        music: musicRes.data || undefined,
        mixtape: mixtapeRes.data || undefined,
        video: videoRes.data || undefined,
        news: newsRes.data || undefined,
        recommended: recommendedRes.data || undefined,
      }
    };
  } catch (err) {
    console.error("Error fetching home page data:", err);
    return {
      props: {
        trending: undefined,
        music: undefined,
        video: undefined,
        news: undefined,
        recommended: undefined,
      },
      notFound: true
    };
  }
}

export default Home;