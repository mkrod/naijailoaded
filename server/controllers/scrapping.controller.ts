import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";


export const scrapStaticPage = async (req: Request, res: Response) => {
    try {
        const q = req.query as Record<string, string | undefined>;
        const options = q.options;
        const page = q.page;

        if (!page) {
            return res.status(400).json({ message: "page link is required as query - page" });
        }
        if (!options) {
            return res.status(400).json({ message: "atleast one options is required" });
        }

        let params = options.split(",");


        if (params.length === 0) {
            return res.status(400).json({ message: "Atleast one param is required" })
        }

        const validParams = ["title", "description", "thumbnail", "artist", "producer", "content", "audios", "videos", "images"];

        if (params.some((p) => !validParams.includes(p))) {
            return res.status(400).json({ message: "Invalid param detected" });
        }

        /**
        * Can start scrapping
        */

        const { data } = await axios.get(page, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept":
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        const baseUrl = new URL(page as string).origin;

        // Helper to fix relative links
        const resolveUrl = (link?: string) => {
            if (!link) return null;
            if (link.startsWith('http')) return link;
            return new URL(link, baseUrl).href;
        };


        const $ = cheerio.load(data);

        const audioExt = ["mp3"];
        const videoExt = ["mp4", "mkv", "webm"];
        const imgExt = ["jpg", "jpeg", "png"];
        const results: any = {};

        console.log(params)
        for (const param of params) {

            switch (param) {

                case "title":
                    results.title = $("title").text().trim();
                    break;

                case "description":
                    //const container = $(".entry-content").clone();
                    const container =
                        ($(".entry-content") ||
                            $(".post-content") ||
                            $("article")).clone();
                    //container.find("script, style, img, iframe").remove();
                    results.description = container.text().replace(/\s+/g, " ").trim();
                    break;

                case "thumbnail":
                    const thumbnail =
                        $('meta[property="og:image"]').attr('content') ||
                        $('meta[name="twitter:image"]').attr('content') ||
                        $('link[rel="image_src"]').attr('href') ||
                        $('meta[itemprop="image"]').attr('content');

                    results.thumbnail = resolveUrl(thumbnail);
                    break;

                case "artist":
                    const title = $("title").text();
                    results.artist = title.split("–")[0]?.trim();
                    break;

                case "content":
                    results.audios = $("a")
                        .map((_, el) => $(el).attr("href"))
                        .get()
                        .filter((l) => l && (audioExt.some((ext) => l.endsWith(`.${ext}`)) || l.includes("googleusercontent")));

                    results.videos = $("a")
                        .map((_, el) => $(el).attr("href"))
                        .get()
                        .filter((l) => l && (videoExt.some((ext) => l.endsWith(`.${ext}`)) || l.includes("googleusercontent")));

                    // Target <img> tags, not just <a> tags
                    results.images = $("img")
                        .map((_, el) => $(el).attr("src") || $(el).attr("data-src"))
                        .get()
                        .filter((l) => l && imgExt.some((ext) => l.toLowerCase().includes(`.${ext}`)))
                        .map(l => resolveUrl(l));

            }

        }

        return res.status(200).json({ status: 200, message: "Scraped", data: results });
        /*
        const title = $("title").text();
        const thumbnail = $("img").attr("src");
        const links = $("a")
            .map((_, el) => $(el).attr("href"))
            .get();
        const description =
            $(".entry-content").text().trim() ||
            $(".post-content").text().trim() ||
            $("article").text().trim();

        return res.json({ title, thumbnail, links, description });
        */

    } catch (err) {
        console.log("Error scrapping link: ", (err as any).message);
        return res.status(500).json({ message: "Internal Server error" });
    }
}