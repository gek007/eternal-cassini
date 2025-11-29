
const fetch = require('node-fetch'); // Need to check if node-fetch is available or use native fetch if node 18+

async function testFeed() {
    try {
        const response = await fetch('http://localhost:3000/api/fetch-feed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://lenta.ru/rss/' })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testFeed();
