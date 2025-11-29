import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';

const app = express();
const parser = new Parser({
    customFields: {
        item: ['media:thumbnail', 'media:content', 'enclosure']
    }
});

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'RSS Reader API is running' });
});

// Fetch and parse RSS feed
app.post('/api/fetch-feed', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Feed URL is required' });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        console.log(`Fetching RSS feed: ${url}`);

        // Parse the RSS feed
        const feed = await parser.parseURL(url);

        // Extract and format the feed data
        const feedData = {
            title: feed.title || 'Untitled Feed',
            description: feed.description || '',
            link: feed.link || url,
            items: feed.items.map(item => ({
                title: item.title || 'Untitled',
                link: item.link || '',
                pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
                description: item.contentSnippet || item.content || item.description || '',
                author: item.creator || item.author || '',
                // Try to extract thumbnail/image
                image: extractImage(item),
                guid: item.guid || item.link || Math.random().toString(36)
            }))
        };

        console.log(`Successfully parsed feed: ${feedData.title} (${feedData.items.length} items)`);
        res.json(feedData);

    } catch (error) {
        console.error('Error fetching RSS feed:', error.message);

        if (error.message.includes('Status code')) {
            return res.status(404).json({ error: 'Feed not found or not accessible' });
        }

        if (error.message.includes('Invalid XML') || error.message.includes('Non-whitespace')) {
            return res.status(400).json({ error: 'Invalid RSS/Atom feed format' });
        }

        res.status(500).json({
            error: 'Failed to fetch or parse RSS feed',
            details: error.message
        });
    }
});

// Helper function to extract image from various RSS formats
function extractImage(item) {
    // Try media:thumbnail
    if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
        return item['media:thumbnail'].$.url;
    }

    // Try media:content
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
        return item['media:content'].$.url;
    }

    // Try enclosure
    if (item.enclosure && item.enclosure.url) {
        return item.enclosure.url;
    }

    // Try to extract from content/description
    if (item.content || item.description) {
        const content = item.content || item.description;
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) {
            return imgMatch[1];
        }
    }

    return null;
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 RSS Reader API Server running on http://localhost:${PORT}`);
    console.log(`📡 Ready to fetch RSS feeds!\n`);
});
