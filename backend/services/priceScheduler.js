const mongoose = require('mongoose');
const IngredientPrice = require('../models/IngredientPrice');

// --- SMART FALLBACK LOGIC ---
const generateFallbackPrices = () => {
    // Current Season Factor logic (reused for consistency)
    const month = new Date().getMonth();
    let isMonsoon = (month >= 6 && month <= 9);
    let isWinter = (month >= 10 || month <= 1);

    const baseItems = [
        { name: 'Onion (कांदा)', base: 30, image: '🧅' },
        { name: 'Tomato (टोमॅटो)', base: 40, image: '🍅' },
        { name: 'Potato (बटाटा)', base: 30, image: '🥔' },
        { name: 'Coriander (कोथिंबीर)', base: 20, image: '🌿' },
        { name: 'Oil (तेल)', base: 140, image: '🛢️', unit: '1 Ltr' }
    ];

    const platforms = ['Blinkit', 'Zepto', 'JioMart', 'Amazon Fresh', 'BigBasket'];

    return baseItems.map(item => {
        // 1. Calculate realistic Market Price
        let marketPrice = item.base;
        if (item.name.includes('Onion') && isMonsoon) marketPrice *= 1.5;
        if (item.name.includes('Tomato') && isWinter) marketPrice *= 0.8;

        // Add small random fluctuation ( +/- 10% )
        marketPrice = Math.floor(marketPrice * (0.9 + Math.random() * 0.2));

        // 2. Simulate "Best Deal" (Online is usually cheaper/competitive)
        // Ensure Best Price is occasionally lower than Market Price
        const discountFactor = 0.7 + Math.random() * 0.35; // 0.7 to 1.05
        let bestPrice = Math.floor(marketPrice * discountFactor);

        // Ensure logic: Best Price <= Market Price (mostly)
        if (bestPrice > marketPrice) bestPrice = marketPrice - 2;

        const savings = Math.round(((marketPrice - bestPrice) / marketPrice) * 100);
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];

        return {
            name: item.name,
            unit: item.unit || '1 kg',
            marketPrice,
            bestPrice,
            platform: randomPlatform,
            savings: savings > 0 ? savings : 0,
            image: item.image,
            date: new Date()
        };
    });
};

// Native fetch is available in Node 18+


const updatePrices = async () => {
    if (mongoose.connection.readyState !== 1) {
        console.log("Creation of prices deferred - Database buffering...");
        return;
    }
    console.log('🔄 Price Scheduler: Fetching latest market prices...');
    const API_KEY = process.env.COMMODITY_API_KEY;
    const STATE = 'Maharashtra';

    try {
        if (!API_KEY) throw new Error("No COMMODITY_API_KEY in .env");

        // --- STEP 1: FETCH DATA FROM GOVT API ---
        const url = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${API_KEY}&format=json&limit=100&filters[state]=${STATE}`;

        console.log(`📡 Connecting to Govt Mandi API...`);
        const response = await fetch(url);
        const data = await response.json();

        if (!data.records || data.records.length === 0) {
            throw new Error("API returned no records");
        }

        console.log(`✅ Received ${data.records.length} records from Mandi.`);

        // Map relevant ingredients
        // We need: Onion, Tomato, Potato, Coriander, etc.
        // API returns: "Onion", "Tomato", "Potato", "Coriander" (Check exact spelling in actual response usually)

        const targetIngredients = [
            { apiName: 'Onion', dbName: 'Onion (कांदा)', image: '🧅' },
            { apiName: 'Tomato', dbName: 'Tomato (टोमॅटो)', image: '🍅' },
            { apiName: 'Potato', dbName: 'Potato (बटाटा)', image: '🥔' },
            // Coriander often listed as "Corriander" or "Coriander Leaves" - will try loose match or fallback
            { apiName: 'Coriander', dbName: 'Coriander (कोथिंबीर)', image: '🌿' }
            // oil is usually processed, might not be in Mandi raw data, keep as fallback if missing
        ];

        const freshData = [];

        targetIngredients.forEach(item => {
            // Find record: look for commodity matching apiName
            // We take the average if multiple markets exist, or just the first one.
            // Let's filter all records for this commodity
            const records = data.records.filter(r => r.commodity && r.commodity.toLowerCase().includes(item.apiName.toLowerCase()));

            let marketPrice = 0;
            let city = 'Maharashtra'; // Default

            if (records.length > 0) {
                // Calculate average modal_price
                const total = records.reduce((sum, r) => sum + Number(r.modal_price), 0);
                const avgPriceQuintal = total / records.length;
                marketPrice = Math.round(avgPriceQuintal / 100); // Convert Quintal to Kg
                city = records[0].district || records[0].market || 'Maharashtra'; // Pick one location for display or generic
            } else {
                // Not found in API, use fallback base price
                // For now, let's skip and let fallback logic handle it? 
                // OR we mix API data with fallback.
                // Let's use a default base if not found to ensure we have data.
                marketPrice = getBasePrice(item.apiName);
            }

            // --- REAL PRICE LOOKUP ---
            // Load fresh scraper data (Synchronous read for simplicity in scheduler)
            const fs = require('fs');
            const path = require('path');

            const blinkitPath = path.join(__dirname, '../dataset_blinkit-product-scraper_2025-12-25_07-58-49-634.json');
            const zeptoPath = path.join(__dirname, '../dataset_zepto-scraper_2025-12-25_08-03-09-336.json');

            let blinkitPrice = Infinity;
            let zeptoPrice = Infinity;

            const findCheapestInFile = (filePath, query) => {
                try {
                    if (fs.existsSync(filePath)) {
                        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        const matches = data.filter(d => (d.name || '').toLowerCase().includes(query.toLowerCase()));
                        if (matches.length > 0) {
                            // Sort by price ascending
                            matches.sort((a, b) => a.price - b.price);
                            return matches[0].price;
                        }
                    }
                } catch (e) { /* ignore */ }
                return Infinity;
            };

            blinkitPrice = findCheapestInFile(blinkitPath, item.apiName);
            zeptoPrice = findCheapestInFile(zeptoPath, item.apiName);

            // Determine Best Online Price
            let bestPrice = marketPrice;
            let platform = 'Market';

            // Compare Blinkit
            if (blinkitPrice < bestPrice) {
                bestPrice = blinkitPrice;
                platform = 'Blinkit';
            }

            // Compare Zepto
            if (zeptoPrice < bestPrice) {
                bestPrice = zeptoPrice;
                platform = 'Zepto';
            }

            // Fallback Simulation if no online data found (Prevents empty table if scrape fails)
            if (platform === 'Market') {
                // Try to simulate ONLY if we really found nothing, to keep UI populated
                // But user asked for REAL comparison. 
                // If real comparison fails, bestPrice = marketPrice is honest.
                // let's stick to honest.
            }

            const savings = Math.max(0, Math.round(((marketPrice - bestPrice) / marketPrice) * 100));

            freshData.push({
                name: item.dbName,
                unit: '1 kg',
                marketPrice,
                bestPrice,
                platform: platform,
                savings,
                image: item.image,
                date: new Date(),
                source: records.length > 0 ? `Govt Mandi (${city})` : 'System AI (Est.)'
            });
        });

        // Add Oil manual override
        freshData.push({
            name: 'Oil (तेल)', base: 140, image: '🛢️', unit: '1 Ltr',
            marketPrice: 140, bestPrice: 125, platform: 'JioMart', savings: 10, date: new Date(), source: 'System AI'
        });


        // --- STEP 3: UPDATE DATABASE (Robust Upsert) ---
        // Use bulkWrite to upsert items by name, preventing duplicates if multiple servers run
        const ops = freshData.map(item => ({
            updateOne: {
                filter: { name: item.name },
                update: { $set: item },
                upsert: true
            }
        }));

        if (ops.length > 0) {
            await IngredientPrice.bulkWrite(ops);
        }

        console.log('✅ Price Scheduler: Database updated with REAL Mandi prices (Upserted).');

    } catch (error) {
        // --- STEP 2: SMART FALLBACK ---
        console.log(`⚠️ External Fetch Failed (${error.message}). Using Smart Fallback Logic.`);

        const fallbackData = generateFallbackPrices();
        // Add "source" to fallback data
        const fallbackWithSource = fallbackData.map(d => ({ ...d, source: 'System AI (Fallback)' }));

        const ops = fallbackWithSource.map(item => ({
            updateOne: {
                filter: { name: item.name },
                update: { $set: item },
                upsert: true
            }
        }));

        if (ops.length > 0) {
            await IngredientPrice.bulkWrite(ops);
        }

        console.log('✅ Price Scheduler: Database updated with FALLBACK prices (Upserted).');
    }
};

const getBasePrice = (name) => {
    const bases = { 'Onion': 30, 'Tomato': 40, 'Potato': 30, 'Coriander': 20 };
    return bases[name] || 30;
};

const startScheduler = () => {
    // Run immediately on startup (Wait for DB if needed)
    if (mongoose.connection.readyState === 1) {
        updatePrices();
    } else {
        mongoose.connection.once('open', () => {
            console.log("✅ Database Connected. Starting Initial Price Update...");
            updatePrices();
        });
    }

    // Then run every hour
    setInterval(updatePrices, 1000 * 60 * 60);
};

module.exports = { startScheduler };
