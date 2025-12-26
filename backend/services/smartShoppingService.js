const fs = require('fs');
const path = require('path');
const IngredientPrice = require('../models/IngredientPrice');

// Load JSON Datasets (Cached in memory for performance, or reload on request)
const blinkitPath = path.join(__dirname, '../dataset_blinkit-product-scraper_2025-12-25_07-58-49-634.json');
const zeptoPath = path.join(__dirname, '../dataset_zepto-scraper_2025-12-25_08-03-09-336.json');
const indianMenuPath = path.join(__dirname, '../data/200_indian_menu_main_ingredients.csv');

let blinkitData = [];
let zeptoData = [];
let menuData = [];
let indianMenuData = [];

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
            menuData = lines.slice(1);
        }
        if (fs.existsSync(indianMenuPath)) {
            // Handle potential CSV quoting issues with a smarter split if needed, 
            // but for line-by-line search, raw lines are fine.
            const lines = fs.readFileSync(indianMenuPath, 'utf8').split('\n');
            // Skip header: Menu,Main Ingredients
            indianMenuData = lines.slice(1);
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

// Improved Regex/Parsing Helper (for menu.csv bracket format)
const extractIngredients = (line) => {
    // Strategy: Look for array-like structures [...]
    // The CSV structure uses strings like "['A', 'B']" or ['A', 'B']
    const arrayMatches = line.match(/\[.*?\]/g);

    if (arrayMatches && arrayMatches.length > 0) {
        let raw = arrayMatches[0];
        return raw.replace(/[\[\]'"]/g, '').split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
};

// Helper for 200_indian_menu format (Dish,"ing1, ing2")
const extractIngredientsSimple = (line) => {
    // Format: Dish Name,"ing1, ing2, ing3" OR Dish Name,ing1,ing2
    // We split by first comma to separate Dish Name
    const firstCommaIndex = line.indexOf(',');
    if (firstCommaIndex === -1) return [];

    const ingredientsPart = line.substring(firstCommaIndex + 1).trim();
    // Remove quotes if present
    const cleanIngredients = ingredientsPart.replace(/^"|"$/g, '');

    return cleanIngredients.split(',').map(s => s.trim()).filter(s => s);
};

// Main Service Function
const analyzeDishIngredients = async (dishName) => {
    // 1. Identify Ingredients
    let ingredientsSet = new Set();
    const normalizedDishName = dishName.toLowerCase().trim();

    // A. Search in menu.csv (Existing)
    const matchingMenuLines = menuData.filter(line => {
        const parts = line.split(',');
        // parts[1] is typically Dish Name in menu.csv based on previous usage
        // But let's be safe and check if the line contains the dish name prominently
        return (parts[1] && parts[1].toLowerCase().trim() === normalizedDishName) ||
            line.toLowerCase().includes(normalizedDishName);
    });

    matchingMenuLines.forEach(line => {
        const list = extractIngredients(line);
        list.forEach(item => ingredientsSet.add(item));
    });

    // B. Search in 200_indian_menu_main_ingredients.csv (New)
    const matchingIndianMenuLines = indianMenuData.filter(line => {
        // Format: Dish Name, Ingredients...
        // Check if line starts with Dish Name (case insensitive)
        const lineLower = line.toLowerCase();
        return lineLower.startsWith(normalizedDishName + ',') || lineLower.startsWith('"' + normalizedDishName + '"');
    });

    matchingIndianMenuLines.forEach(line => {
        const list = extractIngredientsSimple(line);
        list.forEach(item => ingredientsSet.add(item));
    });

    // Convert Set to Array
    let ingredients = Array.from(ingredientsSet);

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
