import { markFeedFetched, getNextFeedToFetch } from "./lib/db/queries/feeds";
import { getPostByUrl, createPost } from "./lib/db/queries/posts";
import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed>{
    const response = await fetch(feedURL, { method: 'GET', headers: { 'User-Agent': 'gator' } });
    if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }
    const text = await response.text();
    const parser = new XMLParser();
    const parsed = parser.parse(text);
    if (!parsed.rss || !parsed.rss.channel) {
        throw new Error("Invalid RSS feed format");
    }
    const items = []
    if (Array.isArray(parsed.rss.channel.item)) {
        for (const item of parsed.rss.channel.item) {
            if ( 'title' in item && 'link' in item && 'description' in item && 'pubDate' in item) {
                items.push({
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    pubDate: item.pubDate,
                });
            }
        }
    }
    return {
        channel: {
            title: parsed.rss.channel.title,
            link: parsed.rss.channel.link,
            description: parsed.rss.channel.description,
            item: items,
        }
    };
}

export async function scrapeFeeds() {
    const feed = await getNextFeedToFetch()
    if (feed === undefined){
        throw new Error("No feeds available");
    }
    await markFeedFetched(feed.id)
    const rssFeeds = await fetchFeed(feed.url);
    for (const item of rssFeeds.channel.item){
        const post = await getPostByUrl(item.link);
        if (!post){
            await createPost({
                title: item.title,
                url: item.link,
                description: item.description,
                publishedAt: new Date(item.pubDate),
                feedId: feed.id,
            })
        }
    }
}
