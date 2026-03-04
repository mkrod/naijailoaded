// src/pages/sitemap.xml.ts
import { GetServerSideProps } from "next";
import { getPosts } from "@/constants/controllers/posts.controller";
import { clientURL } from "@/constants/variables/global.vars";
import fs from "fs";
import path from "path";

const Sitemap = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // 1. Define folders to IGNORE in the file scan (because they are dynamic)
  // Add any folder name here that is already handled by your database
  const dynamicFolders = ["api", "css", "mobile", "desktop", "layouts", "music", "trending", "video", "search", "news", "others"];

  const getPaths = (dir: string, fileList: string[] = []) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      // Skip the folder entirely if it's in our "dynamicFolders" list
      if (isDirectory && dynamicFolders.includes(file)) return;

      if (isDirectory) {
        getPaths(filePath, fileList);
      } else if (
        file.endsWith(".tsx") &&
        !file.startsWith("_") &&
        !file.startsWith("[") && // Skip [slug].tsx
        !file.includes("sitemap") // Skip this sitemap file itself
      ) {
        let cleanPath = filePath
          .split("pages")[1]
          .replace(".tsx", "")
          .replace(/\\/g, "/")
          .replace(/\/index$/, "");

        if (cleanPath === "") cleanPath = "/";
        fileList.push(cleanPath);
      }
    });
    return fileList;
  };

  // 2. Run the scan for truly STATIC pages only
  const staticPages = getPaths(path.join(process.cwd(), "src/pages"));

  // 3. Fetch all DYNAMIC content from DB (Limit to avoid 50k crash)
  const { data } = await getPosts({ limit: 48000 }) as any;

  const postUrls = data?.results?.map((post: any) => `
    <url>
      <loc>${clientURL}/${post.content_type}/${post.slug}</loc>
      <lastmod>${new Date(post.updated_at || post.created_at).toISOString()}</lastmod>
      <priority>0.7</priority>
    </url>
  `).join("");

  const staticUrls = staticPages.map(p => `
    <url>
      <loc>${clientURL}${p}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <priority>${p === "/" ? "1.0" : "0.5"}</priority>
    </url>
  `).join("");

  // 4. Combine and send
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticUrls}
      ${postUrls}
    </urlset>
  `.trim();

  res.setHeader("Content-Type", "text/xml");
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default Sitemap;