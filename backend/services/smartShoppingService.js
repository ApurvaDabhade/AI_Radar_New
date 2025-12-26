const fs = require('fs');
const path = require('path');
const IngredientPrice = require('../models/IngredientPrice');

// Load JSON Datasets (Cached in memory for performance, or reload on request)
const blinkitPath = path.join(__dirname, '../dataset_blinkit-product-scraper_2025-12-25_07-58-49-634.json');
const zeptoPath = path.join(__dirname, '../dataset_zepto-scraper_2025-12-25_08-03-09-336.json');
const menuPath = path.join(__dirname, '../data/menu.csv');

let blinkitData = [];
let zeptoData = [];
let menuData = [];

// Helper to load data
const loadData = () => {
    try {
        if (fs.existsSync(blinkitPath)) {
            blinkitData = JSON.parse(fs.readFileSync(blinkitPath, 'utf8'));
        }
        if (fs.existsSync(zeptoPath)) {
            zeptoData = JSON.parse(fs.readFileSync(zeptoPath, 'utf8'));
        }
        if (fs.existsSync(menuPath)) {
            const lines = fs.readFileSync(menuPath, 'utf8').split('\n');
            const headers = lines[0].split(',');
            menuData = lines.slice(1).map(line => {
                const values = line.split(','); // Simple CSV split, might break on quoted commas but sufficient for now as per view_file output
                // Better CSV parsing for quoted fields:
                // Actually the view_file showed quoted arrays like "['Cheese', 'Tomato']" which contain commas.
                // Simple split won't work perfectly. Let's do a basic regex match or logic.
                // For MVP, since we search by dish name, we can try to find the line that starts with our dish.
                return line;
            });
        }
    } catch (e) {
        console.error("Error loading datasets:", e);
    }
};

loadData();

// Fuzzy Search Helper
const findProduct = (data, query) => {
    if (!data || !query) return null;
    const lowerQuery = query.toLowerCase();

    // Sort by relevance (exact match > contains match) and then price
    const matches = data.filter(item => {
        const name = (item.name || '').toLowerCase();
        const sub = (item.sub_category || '').toLowerCase();
        return name.includes(lowerQuery) || sub.includes(lowerQuery);
    });

    if (matches.length === 0) return null;

    // Normalize prices to per KG/L roughly if possible, else take absolute price
    // We want the CHEAPEST valid option.
    // Let's simplified sort by 'price'. Ideally we calculate price per unit.
    matches.sort((a, b) => a.price - b.price);

    return matches[0]; // Return cheapest match
};

// Improved Regex/Parsing Helper
const extractIngredients = (line) => {
    // Strategy: Look for array-like structures [...]
    // The CSV structure uses strings like "['A', 'B']" or ['A', 'B']
    const arrayMatches = line.match(/\[.*?\]/g);

    // We expect at least one array. Usually the first one is toppings/ingredients.
    // If multiple, we might want to merge them or pick the largest? 
    // For now, let's pick the first one found, as it maps to 'available_toppings' which has veggies.
    if (arrayMatches && arrayMatches.length > 0) {
        // Use the first match
        let raw = arrayMatches[0];
        // Clean: remove brackets, both single/double quotes
        return raw.replace(/[\[\]'"]/g, '').split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
};

// Main Service Function
const analyzeDishIngredients = async (dishName) => {
    // 1. Identify Ingredients
    let ingredients = [];

    // Find ALL matching lines in Menu CSV
    const matchingLines = menuData.filter(line => {
        const parts = line.split(',');
        return (parts[1] && parts[1].toLowerCase().trim() === dishName.toLowerCase().trim()) ||
            line.toLowerCase().includes(dishName.toLowerCase());
    });

    if (matchingLines.length > 0) {
        // Parse ingredients for all matches and pick the longest list
        let bestList = [];
        matchingLines.forEach(line => {
            const list = extractIngredients(line);
            if (list.length > bestList.length) {
                bestList = list;
            }
        });
        ingredients = bestList;
    }

    // Fuzzy fallback not needed as we did a broad include check above


    // Default Fallback ingredients if still empty
    if (ingredients.length === 0) {
        if (dishName.toLowerCase().includes('pav bhaji')) ingredients = ['Potato', 'Tomato', 'Onion', 'Butter', 'Coriander', 'Pav'];
        else if (dishName.toLowerCase().includes('biryani')) ingredients = ['Rice', 'Onion', 'Tomato', 'Dahi', 'Coriander', 'Chicken', 'Spices'];
        else if (dishName.toLowerCase().includes('tea') || dishName.toLowerCase().includes('chai')) ingredients = ['Milk', 'Tea Leaf', 'Ginger', 'Sugar'];
        else ingredients = ['Onion', 'Tomato', 'Potato']; // Generic fallback
    }

    // Add generic base items
    if (!ingredients.includes('Oil') && !ingredients.includes('Butter')) ingredients.push('Oil');

    const analysis = [];
    let totalBlinkit = 0;
    let totalZepto = 0;
    let totalGovt = 0;

    // 2. Fetch Govt Prices from DB
    const govtPrices = await IngredientPrice.find({});

    for (const ingredient of ingredients) {
        const reqQty = "1 kg"; // Default assumption

        // Blinkit
        const blinkitItem = findProduct(blinkitData, ingredient);
        const blinkitPrice = blinkitItem ? blinkitItem.price : 0;
        const blinkitStr = blinkitItem ? `₹${blinkitPrice}` : "Not Available";
        if (blinkitItem) totalBlinkit += blinkitPrice;

        // Zepto
        const zeptoItem = findProduct(zeptoData, ingredient);
        const zeptoPrice = zeptoItem ? zeptoItem.price : 0;
        const zeptoStr = zeptoItem ? `₹${zeptoPrice}` : "Not Available";
        if (zeptoItem) totalZepto += zeptoPrice;

        // Govt
        // Fuzzy match DB name
        const govtItem = govtPrices.find(p => p.name.toLowerCase().includes(ingredient.toLowerCase()));
        const govtPrice = govtItem ? govtItem.marketPrice : (blinkitPrice || zeptoPrice || 50); // Fallback to market average if missing
        const govtStr = `₹${govtPrice}`;
        totalGovt += govtPrice;

        // determine cheapest
        let cheapest = "Govt Ref";
        let minPrice = govtPrice;

        if (blinkitItem && blinkitPrice < minPrice) {
            minPrice = blinkitPrice;
            cheapest = "Blinkit";
        }
        if (zeptoItem && zeptoPrice < minPrice) {
            minPrice = zeptoPrice;
            cheapest = "Zepto";
        }

        // Price Diff % (vs Govt benchmark)
        const diff = govtPrice > 0 ? Math.round(((govtPrice - minPrice) / govtPrice) * 100) : 0;
        const diffStr = diff > 0 ? `-${diff}%` : `+${Math.abs(diff)}%`;

        analysis.push({
            ingredient: ingredient,
            required_quantity: reqQty,
            blinkit_price: blinkitStr,
            zepto_price: zeptoStr,
            gov_reference_price: govtStr,
            cheapest_source: cheapest,
            price_difference_percent: diffStr
        });
    }

    // Recommendation Logic
    let recommended = "Govt Mandi (Direct)";
    if (totalBlinkit > 0 && totalBlinkit < totalZepto && totalBlinkit < totalGovt * 1.5) recommended = "Blinkit";
    else if (totalZepto > 0 && totalZepto < totalBlinkit && totalZepto < totalGovt * 1.5) recommended = "Zepto";

    const totalSavings = Math.round(((Math.max(totalBlinkit, totalZepto) - Math.min(totalBlinkit, totalZepto)) / Math.max(totalBlinkit, totalZepto)) * 100);

    return {
        dish_name: dishName,
        ingredients_analysis: analysis,
        summary: {
            total_cost_blinkit: `₹${totalBlinkit}`,
            total_cost_zepto: `₹${totalZepto}`,
            total_gov_reference_cost: `₹${totalGovt} (Est.)`,
            recommended_platform: recommended,
            final_savings_percent: `${totalSavings}%`
        },
        recommendation: `For ${dishName}, ${recommended} is the most cost-effective option based on current inventory.`
    };
};

const { triggerScraper } = require('./apifyService');

const getIngredientDetails = async (ingredientName) => {
    // 1. Fetch Govt Price (Reference)
    let avgMarketPrice = 40;
    let govtItem = null;
    try {
        govtItem = await IngredientPrice.findOne({ name: { $regex: ingredientName, $options: 'i' } });
        if (govtItem) avgMarketPrice = govtItem.marketPrice;
    } catch (e) { console.error("DB lookup error", e); }

    // 2. Search in Scrapers (Cached in Memory)
    let blinkitItem = findProduct(blinkitData, ingredientName);
    let zeptoItem = findProduct(zeptoData, ingredientName);

    // 🔬 DYNAMIC TRIGGER: If not found in cache OR older than 24h (mock check), trigger scraper
    const isCached = blinkitItem || zeptoItem;

    // For Demo: If NOT cached, trigger Apify and return "Pending" status
    if (!isCached) {
        console.log(`[SmartShop] Ingredient '${ingredientName}' not found. Triggering Scraper...`);
        triggerScraper(ingredientName); // Async trigger

        return {
            name: ingredientName,
            status: 'pending', // Frontend should handle this
            unit: "1 kg",
            marketPrice: avgMarketPrice,
            bestPrice: avgMarketPrice, // Temporary
            platform: "Fetching...",
            savings: 0,
            image: '⏳'
        };
    }

    const blinkitPrice = blinkitItem ? blinkitItem.price : Infinity;
    const zeptoPrice = zeptoItem ? zeptoItem.price : Infinity;

    // 3. Determine Best
    let bestPrice = avgMarketPrice;
    let platform = "Market";
    let savings = 0;

    if (blinkitItem && blinkitPrice < bestPrice) {
        bestPrice = blinkitPrice;
        platform = "Blinkit";
    }
    if (zeptoItem && zeptoPrice < bestPrice) {
        bestPrice = zeptoPrice;
        platform = "Zepto";
    }

    if (platform !== "Market") {
        savings = Math.round(((avgMarketPrice - bestPrice) / avgMarketPrice) * 100);
    }

    return {
        name: ingredientName,
        status: 'available',
        unit: blinkitItem?.quantity || zeptoItem?.quantity || "1 kg",
        marketPrice: avgMarketPrice,
        bestPrice: bestPrice,
        platform: platform,
        savings: savings > 0 ? savings : 0,
        image: '🥘'
    };
};

// Function called by Webhook to update DB/Cache
const updateIngredientPriceFromApify = async (items) => {
    console.log(`[SmartShop] Processing ${items.length} items from Apify Webhook...`);
    // Ideally update standard DB. For now, pushing to memory cache for immediate update if server running
    // In production, would save to MongoDB IngredientPrice
    items.forEach(item => {
        // Simplified mapping assuming structure matches our scraper
        // Assuming item has: name, price, quantity, platform
        const newItem = {
            name: item.name || item.title,
            price: item.price,
            quantity: item.quantity || item.weight,
            sub_category: item.category
        };

        // Push to memory cache for immediate search hits
        // Just mixing into blinkitData for simplicity in this demo environment
        blinkitData.push(newItem);
    });
    console.log(`[SmartShop] In-memory cache updated.`);
};

module.exports = { analyzeDishIngredients, getIngredientDetails, updateIngredientPriceFromApify };
