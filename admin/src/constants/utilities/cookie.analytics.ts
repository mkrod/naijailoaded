import { facebookPixelID, googleAnalyticsID, googleAdsID } from "../variables/global.vars";

// analytics.ts
export function loadAnalytics() {
    // GOOGLE ANALYTICS
    const ga = document.createElement("script");
    ga.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsID}`;
    ga.async = true;

    const gaInit = document.createElement("script");
    gaInit.textContent =
        "window.dataLayer = window.dataLayer || [];" +
        "function gtag(){dataLayer.push(arguments);}" +
        `gtag('js', new Date());` +
        `gtag('config', '${googleAnalyticsID}');`;

    // GOOGLE ADS
    const ads = document.createElement("script");
    ads.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsID}`;
    ads.async = true;

    const adsInit = document.createElement("script");
    adsInit.textContent =
        "window.dataLayer = window.dataLayer || [];" +
        "function gtag(){dataLayer.push(arguments);}" +
        `gtag('js', new Date());` +
        `gtag('config', '${googleAdsID}');`;

    // META PIXEL
    const meta = document.createElement("script");
    meta.textContent =
        `!function(f,b,e,v,n,t,s){` +
        `if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};` +
        `if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];` +
        `t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)` +
        `}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');` +
        `fbq('init', '${facebookPixelID}');` +
        `fbq('track', 'PageView');`;

    // Append all scripts to head
    document.head.append(ga, gaInit, ads, adsInit, meta);
}
