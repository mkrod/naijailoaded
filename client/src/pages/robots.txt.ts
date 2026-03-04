import { GetServerSideProps } from "next";
import { clientURL } from "@/constants/variables/global.vars";

const Robots = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    // Define which paths bots should NOT crawl
    // Common examples: /admin, /api, /dashboard
    const disallowedPaths = ["/admin", "/api", "/dashboard", "/login"];

    const robots = [
        "User-agent: *",
        "Allow: /",
        ...disallowedPaths.map((path) => `Disallow: ${path}`),
        "",
        `Sitemap: ${clientURL}/sitemap.xml`,
    ].join("\n");

    res.setHeader("Content-Type", "text/plain");
    // Cache for 24 hours
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=43200");

    res.write(robots);
    res.end();

    return { props: {} };
};

export default Robots;