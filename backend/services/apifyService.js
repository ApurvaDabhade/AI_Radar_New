// const fetch = require('node-fetch'); // Native fetch is used in Node 18+

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || 'your_apify_token_here';
const ACTOR_ID = process.env.APIFY_ACTOR_ID || 'leodog896~blinkit-scraper'; // Example Actor ID

const triggerScraper = async (ingredientName) => {
    try {
        console.log(`[ApifyService] Triggering scraper for: ${ingredientName}`);

        // Input configuration for the specific scraper
        const input = {
            "search": ingredientName,
            "maxItems": 5, // Limit items to save cost/time
            "location": "Mumbai", // Default location
            "startUrls": []
        };

        const response = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Apify Trigger Failed: ${err}`);
        }

        const data = await response.json();
        console.log(`[ApifyService] Run started. ID: ${data.data.id}, Dataset ID: ${data.data.defaultDatasetId}`);
        return {
            runId: data.data.id,
            datasetId: data.data.defaultDatasetId
        };
    } catch (error) {
        console.error('[ApifyService] Error triggering scraper:', error);
        return null; // Return null to indicate failure but not crash app
    }
};

const fetchDataset = async (datasetId) => {
    try {
        console.log(`[ApifyService] Fetching dataset: ${datasetId}`);
        const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`);

        if (!response.ok) {
            throw new Error('Failed to fetch dataset items');
        }

        const items = await response.json();
        console.log(`[ApifyService] Retrieved ${items.length} items.`);
        return items;
    } catch (error) {
        console.error('[ApifyService] Error fetching dataset:', error);
        return [];
    }
};

module.exports = { triggerScraper, fetchDataset };
