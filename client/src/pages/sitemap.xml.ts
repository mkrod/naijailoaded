// src/pages/sitemap.xml.ts
import { GetServerSideProps } from "next";
import { getAllPosts } from "@/constants/controllers/posts.controller";
import { PostContent } from "@/constants/types/post.type";
import { clientURL } from "@/constants/variables/global.vars";

const Sitemap = () => null; // no React UI

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { data } = await getAllPosts() as { data: PostContent[] };

  const posts = data?.map(post => `
    <url>
      <loc>${clientURL}/${post.content_type}/${post.slug}</loc>
      <lastmod>${new Date(post.created_at).toISOString()}</lastmod>
    </url>
  `).join("");

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${clientURL}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
      ${posts}
    </urlset>
  `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap.trim());
  res.end();

  return { props: {} };
};

export default Sitemap;
