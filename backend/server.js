const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const natural = require('natural'); // Import natural library
const multer = require('multer');
const bcrypt = require('bcryptjs'); // Import bcryptjs
const mongoose = require('mongoose'); // Import mongoose
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const app = express();
const port = process.env.PORT || 5001;

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

// Import Models
const User = require('./models/User');
const Post = require('./models/Post');
const Discussion = require('./models/Discussion');
const Inventory = require('./models/Inventory');
const IngredientPrice = require('./models/IngredientPrice'); // Import Price Model

// Initialize Classifier
const classifier = new natural.BayesClassifier();

// Define Templates for different categories
const TEMPLATES = {
    "Urgent & Hype": [
        "🔥 FLASH DEAL! {offerType} on {cuisine} at {businessName}! Only {price}. Hurry! ⏳",
        "🛑 STOP SCROLLING! {offerType} is LIVE. Best {cuisine} in {location}. Grab it now! 🏃‍♂️",
        "🚨 URGENT: {businessName} Special! {cuisine} for just {price}. Offer ends soon! ⏰",
        "💥 BOOM! Price Drop! {cuisine} now only {price}. Visit {businessName} today! 📉",
        "⚡ LIGHTNING SALE! {offerType} on all items at {businessName}. Don't miss out! ⚡"
    ],
    "Elegant & Minimal": [
        "✨ Simply Delicious. {cuisine} by {businessName}. {location}.",
        "🌿 Authentic. Fresh. {cuisine}. Experience it at {businessName}.",
        "🍽️ The Art of Eating. {offerType} at {businessName}. Starting {price}.",
        "🕯️ Pure Taste. {cuisine} Redefined. {businessName}, {location}.",
        "🥗 Minimalist Flavors. Maximum Taste. {cuisine} @ {price}. {businessName}."
    ],
    "Community & Trust": [
        "❤️ Your Neighborhood Favorite, {businessName}. Serving fresh {cuisine} since always.",
        "🤝 Trust the taste of home. {cuisine} just like Mom makes. Only at {businessName}.",
        "🏘️ {location}'s Best Kept Secret: {businessName}. Special {offerType} for locals!",
        "👨‍👩‍👧‍👦 Bring the family! Authentic {cuisine} at {businessName}. Good food, good times.",
        "🏆 Voted Best in {location}! Try our {cuisine} today. {businessName} guarantees quality."
    ],
    "Direct Offer": [
        "💰 SAVE BIG! {offerType} at {businessName}. {cuisine} starting at {price}.",
        "🏷️ BEST PRICE: {cuisine} for {price}. Only at {businessName} in {location}.",
        "💸 VALUE DEAL: {offerType}. Eat more, pay less at {businessName}!",
        "📉 PRICE DROP: {cuisine} is now just {price}. Order at {businessName}.",
        "💲 {offerType} Alert! Get your favorite {cuisine} at unbeatable prices."
    ],
    "Short & Catchy": [
        "😋 Yum Alert! {cuisine} @ {price}.",
        "🚀 Blast of Flavor! {businessName}.",
        "🤑 Eat Cheap. Eat Good. {price}.",
        "🤤 Craving {cuisine}? We got you.",
        "📍 {location}'s Best {cuisine}. Period."
    ]
};

// Train the Model on Startup
const trainModel = () => {
    // Urgent & Hype
    classifier.addDocument('limited time offer', 'Urgent & Hype');
    classifier.addDocument('hurry', 'Urgent & Hype');
    classifier.addDocument('flash sale', 'Urgent & Hype');
    classifier.addDocument('act fast', 'Urgent & Hype');
    classifier.addDocument('today only', 'Urgent & Hype');

    // Elegant & Minimal
    classifier.addDocument('authentic', 'Elegant & Minimal');
    classifier.addDocument('traditional', 'Elegant & Minimal');
    classifier.addDocument('premium', 'Elegant & Minimal');
    classifier.addDocument('luxury', 'Elegant & Minimal');
    classifier.addDocument('gourmet', 'Elegant & Minimal');

    // Community & Trust
    classifier.addDocument('family', 'Community & Trust');
    classifier.addDocument('home style', 'Community & Trust');
    classifier.addDocument('local', 'Community & Trust');
    classifier.addDocument('neighborhood', 'Community & Trust');
    classifier.addDocument('trusted', 'Community & Trust');

    // Direct Offer
    classifier.addDocument('discount', 'Direct Offer');
    classifier.addDocument('save', 'Direct Offer');
    classifier.addDocument('value', 'Direct Offer');
    classifier.addDocument('cheap', 'Direct Offer');
    classifier.addDocument('price', 'Direct Offer');

    // Short & Catchy
    classifier.addDocument('snack', 'Short & Catchy');
    classifier.addDocument('quick', 'Short & Catchy');
    classifier.addDocument('tasty', 'Short & Catchy');
    classifier.addDocument('yum', 'Short & Catchy');

    classifier.train();
    console.log('🧠 Natural AI Model Trained Successfully!');
};

// Run Training
// Run Training
trainModel();

// Start Price Scheduler
const { startScheduler } = require('./services/priceScheduler');
startScheduler();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Ollama
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const prompt = `You are "Vyapari Dada", an experienced local business mentor for small street food vendors in India.
    
    TONE & STYLE:
    - Use STRICTLY ENGLISH language only.
    - Be friendly, encouraging, and talk like an experienced business mentor.
    - Start response with: "Hello Entrepreneur! �"
    
    FORMATTING:
    - Use clearly numbered steps.
    - Keep language simple and easy to understand.
    - Use bullet points (-) for lists.
    - IMPORTANT: Receive the output in short and concise (under 60 words if possible).
    - IMPORTANT: Do NOT use the phrase "Kaljee naka karu".
    
    Original user query: ${message}`;

        // Call Ollama API
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(OLLAMA_API_KEY ? { 'Authorization': `Bearer ${OLLAMA_API_KEY}` } : {})
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.response;

        res.json({
            text: text,
            suggestions: ['Detailed Plan', 'Cost Breakdown', 'Legal Requirements']
        });

    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'Failed to generate response. Ensure Ollama is running.' });
    }
});

app.post('/api/poster-assistant', async (req, res) => {
    try {
        const { businessName, cuisine, location, offerType, price, designFormat, keywords } = req.body;

        // Classify the intent based on keywords or offerType
        let category = 'Direct Offer'; // Default category

        if (keywords && keywords.length > 0) {
            const keywordString = keywords.join(' ');
            category = classifier.classify(keywordString);
        } else if (offerType) {
            // Simple classification based on offerType if no keywords
            if (offerType.toLowerCase().includes('limited') || offerType.toLowerCase().includes('flash')) {
                category = 'Urgent & Hype';
            } else if (offerType.toLowerCase().includes('special') || offerType.toLowerCase().includes('discount')) {
                category = 'Direct Offer';
            } else if (offerType.toLowerCase().includes('authentic') || offerType.toLowerCase().includes('traditional')) {
                category = 'Elegant & Minimal';
            }
        }

        const selectedTemplates = TEMPLATES[category] || TEMPLATES['Direct Offer']; // Fallback

        const suggestions = selectedTemplates.map(template => {
            let filledTemplate = template
                .replace(/{businessName}/g, businessName || 'Our Shop')
                .replace(/{cuisine}/g, cuisine || 'Delicious Food')
                .replace(/{location}/g, location || 'Here')
                .replace(/{offerType}/g, offerType || 'Special Offer');

            if (price) {
                filledTemplate = filledTemplate.replace(/{price}/g, `₹${price}`);
            } else {
                filledTemplate = filledTemplate.replace(/{price}/g, 'Best Price');
            }
            return filledTemplate;
        });

        res.json({
            suggestions: suggestions
        });

    } catch (error) {
        console.error('Error generating poster slogans:', error);
        res.status(500).json({
            suggestions: [
                "Error generating suggestions. Please try again.",
                `Fresh ${req.body.cuisine || 'Food'}, Great Taste!`,
                `Special Offer at ${req.body.businessName || 'Our Shop'}!`,
                `Visit us in ${req.body.location || 'your area'} today!`,
                "We're here to help your business shine!"
            ]
        });
    }
});

// --- Video Reel Generator ---
app.post('/api/reel-generator', upload.single('video'), async (req, res) => {
    try {
        const { platform, video_duration_seconds, style_preference } = req.body;
        const videoFile = req.file;

        if (!videoFile) {
            return res.status(400).json({ error: 'Video file is required' });
        }

        // Initialize Gemini (Multimodal)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash for video processing
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Function to file to Generative Part
        function fileToGenerativePart(path, mimeType) {
            return {
                inlineData: {
                    data: fs.readFileSync(path).toString("base64"),
                    mimeType
                },
            };
        }

        const videoPart = fileToGenerativePart(videoFile.path, videoFile.mimetype);

        const prompt = `
        You are an AI assistant that helps food vendors automatically create short promotional video reels.
        
        Analyze this video content.
        
        INPUT:
        Duration Setting: ${video_duration_seconds} seconds
        Platform: ${platform}
        Requested Style/Theme: ${style_preference || 'General/Auto-Detect'}

        YOUR RESPONSIBILITIES:
        1. Identify the food category (Street food, Dessert, Beverage, Snack, Other) from the video visual.
        2. Decide the promotional tone based on the visual appeal AND the Requested Style (e.g. if Festival, make it festive).
        3. Select background music characteristics (Style, Tempo, Energy).
        4. Generate 2-3 short promotional captions based on what is shown.

        MUSIC RULES:
        - Street food -> energetic_beat, fast, high
        - Dessert -> soft_instrumental, slow, low
        - Beverage -> refreshing_chill, medium, medium
        - Snack -> neutral_upbeat, medium, medium

        CAPTION RULES:
        - Max 1 line per caption
        - Max 1 emoji per caption
        - Simple, friendly language
        - No slang or exaggerated claims
        - Focus on taste, freshness
        - No prices/phone numbers

        OUTPUT FORMAT (STRICT JSON ONLY, NO MARKDOWN):
        {
          "food_type": "string",
          "tone": "string",
          "music": {
            "music_style": "string",
            "tempo": "string",
            "energy": "string"
          },
          "captions": ["string", "string"]
        }`;

        const result = await model.generateContent([prompt, videoPart]);
        const responseText = await result.response.text();

        // Check for cleanup
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);

        // Clean up uploaded file
        fs.unlinkSync(videoFile.path);

        res.json(jsonResponse);

    } catch (error) {
        console.error('Error generating reel plan:', error);

        // Clean up file if exists and error occurred
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Randomized Fallback Scenarios to ensure variety
        const FALLBACK_SCENARIOS = [
            {
                food_type: "Street Food",
                tone: "Energetic",
                music: { music_style: "upbeat_pop", tempo: "fast", energy: "high" },
                captions: ["Burst of flavors! 💥", "Street food craving? We got you! 😋"]
            },
            {
                food_type: "Cafe Specials",
                tone: "Chill",
                music: { music_style: "lofi_chill", tempo: "slow", energy: "low" },
                captions: ["Vibes and good food. ☕", "Perfect spot to relax. ✨"]
            },
            {
                food_type: "Gourmet Dish",
                tone: "Elegant",
                music: { music_style: "cinematic", tempo: "medium", energy: "medium" },
                captions: ["Plating perfection. 🍽️", "Taste the elegance. 🍷"]
            },
            {
                food_type: "Desi Masala",
                tone: "Spicy",
                music: { music_style: "indian_classical", tempo: "medium", energy: "high" },
                captions: ["Spicy goodness! 🌶️", "Authentic desi taste. ❤️"]
            },
            {
                food_type: "Sweet Treats",
                tone: "Delightful",
                music: { music_style: "jazz_cafe", tempo: "medium", energy: "medium" },
                captions: ["Sweet carvings? 🍰", "Indulge in sweetness. 🍩"]
            }
        ];

        const randomScenario = FALLBACK_SCENARIOS[Math.floor(Math.random() * FALLBACK_SCENARIOS.length)];

        res.json({
            error: 'Failed to generate plan',
            isFallback: true,
            ...randomScenario
        });
    }
});

// --- Community & User Data Storage (Moved to MongoDB) ---

// --- Community Posts (Moved to MongoDB) ---

// --- Discussions (Moved to MongoDB) ---

// --- User Registration ---
app.post('/api/register', async (req, res) => {
    try {
        const { name, phone, businessName, businessType, location, email, password, menuItems } = req.body;

        if (!name || !phone || !businessName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if phone or email already exists
        const existingUser = await User.findOne({
            $or: [{ phone }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || '123456', salt);

        const newUser = await User.create({
            id: new mongoose.Types.ObjectId().toString(), // Generate ID
            name,
            phone,
            email: email || undefined, // Send undefined if empty to avoid unique constraint if sparse
            password: hashedPassword,
            stallName: businessName,
            specialty: businessType,
            location: location || 'Unknown',
            menuItems: menuItems || [],
            isVerified: false
        });

        res.json({ success: true, user: newUser });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and Password required' });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// --- Get Vendors/Users ---
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        // Add random distance for UI simulation
        const usersWithDistance = users.map(u => ({
            ...u.toObject(),
            distance: (Math.random() * 5).toFixed(1)
        }));
        res.json(usersWithDistance);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// --- Community Posts ---
app.get('/api/community/posts', async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ timestamp: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/community/posts', async (req, res) => {
    try {
        const { author, content, type } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const newPost = await Post.create({
            id: Date.now().toString(),
            author: author || 'Guest User',
            content,
            type: type || 'question'
        });

        res.json({ success: true, post: newPost });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/community/posts/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findOne({ id });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.likes += 1;
        await post.save();
        res.json({ success: true, likes: post.likes });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/community/posts/:id/comment', async (req, res) => {
    try {
        const { id } = req.params;
        const { author, text } = req.body;
        const post = await Post.findOne({ id });

        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (!text) return res.status(400).json({ error: 'Comment text required' });

        const newComment = {
            id: Date.now().toString(),
            author: author || 'Guest',
            text,
            timestamp: new Date()
        };

        post.comments.push(newComment);
        post.replies = post.comments.length;
        await post.save();

        res.json({ success: true, comment: newComment, replies: post.replies });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// --- Discussions ---
app.get('/api/community/discussions', async (req, res) => {
    try {
        const discussions = await Discussion.find({}).sort({ timestamp: -1 });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/community/discussions', async (req, res) => {
    try {
        const { title, author, category } = req.body;
        if (!title) return res.status(400).json({ error: 'Title required' });

        const newDiscussion = await Discussion.create({
            id: Date.now().toString(),
            title,
            author: author || 'Guest',
            category: category || 'general'
        });

        res.json({ success: true, discussion: newDiscussion });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// --- Inventory Management (Moved to MongoDB) ---

app.get('/api/inventory', async (req, res) => {
    try {
        const inventory = await Inventory.find({});
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        const inventoryWithStatus = inventory.map(item => {
            const itemObj = item.toObject();
            let status = 'good';
            const expiryDate = new Date(itemObj.expiryDate);
            const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

            if (itemObj.quantity <= 3) {
                status = 'critical';
            } else if (itemObj.quantity <= 5) {
                status = 'low';
            }

            if (daysToExpiry <= 3) {
                status = 'critical';
            } else if (daysToExpiry <= 7 && status !== 'critical') {
                status = 'low';
            }

            return {
                ...itemObj,
                status,
                expiryDays: daysToExpiry,
                marathiName: itemObj.name
            };
        });

        const alerts = {
            lowStock: inventoryWithStatus.filter(i => i.status === 'low' || i.status === 'critical'),
            expiringSoon: inventoryWithStatus.filter(i => i.expiryDays <= 7)
        };

        res.json({ items: inventoryWithStatus, alerts });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const { name, quantity, unit, expiryDays, category } = req.body;

        if (!name || !quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const expiryDate = new Date();
        const daysToAdd = expiryDays ? parseInt(expiryDays) : 30;
        expiryDate.setDate(expiryDate.getDate() + daysToAdd);

        const newItem = await Inventory.create({
            id: Date.now().toString(),
            name,
            quantity: parseFloat(quantity),
            unit: unit || 'kg',
            expiryDate,
            category: category || 'raw',
            lowStockThreshold: 5
        });

        res.json({ success: true, item: newItem });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

const path = require('path');

// app.listen moved to end of file
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

// --- Dynamic Data Loading (CSV) ---
let dishDatabase = {};
let allIngredients = new Set();

const loadMenuData = () => {
    try {
        const csvPath = path.join(__dirname, 'data', 'menu.csv');
        const data = fs.readFileSync(csvPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim() !== '');

        // Skip header
        const headers = lines[0].split(',');

        // Simple regex to handle quoted array strings like "['A', 'B', 'C']"
        // Matches: integer, string, category, price, quoted_array, quoted_array
        const rowRegex = /^(\d+),([^,]+),([^,]+),(\d+),("\[.*?\]"|\[.*?\]),("\[.*?\]"|\[.*?\])/;

        lines.slice(1).forEach(line => {
            const match = line.match(rowRegex);
            if (match) {
                const [_, id, name, category, price, toppingsRaw, addonsRaw] = match;

                // Clean up the array string: remove quotes, brackets, and split
                const cleanArray = (str) => {
                    return str.replace(/^"|"$/g, '') // Remove outer quotes if present
                        .replace(/[\[\]']/g, '') // Remove brackets and single quotes
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s !== '');
                };

                const ingredients = cleanArray(toppingsRaw);
                ingredients.forEach(i => allIngredients.add(i));

                // Store in DB (Index by Name for easier lookup)
                dishDatabase[name] = {
                    cost: Math.floor(parseInt(price) * 0.4), // Estimate making cost as 40% of base price
                    price: parseInt(price),
                    category: category.trim(),
                    ingredients: ingredients
                };
            }
        });
        console.log(`Loaded ${Object.keys(dishDatabase).length} dishes from CSV.`);
        console.log(`Found ${allIngredients.size} unique ingredients.`);

    } catch (error) {
        console.error('Error loading menu.csv:', error);
        // Fallback to hardcoded if CSV fails
        dishDatabase = {
            'Poha': { cost: 18, price: 40, category: 'Breakfast', ingredients: ['Rice Flakes', 'Onion', 'Peanuts', 'Oil'] },
            'Tea': { cost: 8, price: 20, category: 'Beverage', ingredients: ['Milk', 'Tea Leaf', 'Ginger', 'Sugar'] },
        };
    }
};

loadMenuData();

// --- Dynamic Pricing Logic ---
const getDynamicIngredientPrice = (ingredientName) => {
    // Realistic Base Prices (₹ per kg/litre) - Standard Indian Market Rates
    const basePrices = {
        'Onion': 30, 'Tomato': 40, 'Potato': 30, 'Cheese': 450,
        'Butter': 520, 'Paneer': 380, 'Chicken': 220, 'Oil': 140,
        'Milk': 64, 'Ginger': 120, 'Garlic': 150, 'Chili': 60,
        'Rice': 55, 'Wheat Flour': 45, 'Sugar': 42, 'Tea Leaf': 400,
        'Tur Dal': 160, 'Moong Dal': 130, 'Besan': 90, 'Maida': 40,
        'Cumin': 600, 'Mustard Seeds': 120, 'Turmeric': 200, 'Coriander': 80,
        'Rice Flakes': 60, 'Peanuts': 120, 'Curry Leaves': 100 // approx per kg
    };

    // Default price if not found
    let price = basePrices[ingredientName] || 100;

    // Seasonality Factor
    const month = new Date().getMonth(); // 0-11 (Dec = 11)

    // Winter (Nov-Feb): Green veggies cheaper
    // Summer (Mar-Jun): Lemon/Dairy expensive
    // Monsoon (Jul-Oct): Onions expensive

    let seasonFactor = 1.0;

    if (month >= 10 || month <= 1) { // Winter
        if (ingredientName === 'Peas' || ingredientName === 'Carrot') seasonFactor = 0.8;
        if (ingredientName === 'Tomato') seasonFactor = 1.1;
    } else if (month >= 2 && month <= 5) { // Summer
        if (ingredientName === 'Lemon') seasonFactor = 1.5;
        if (ingredientName === 'Milk') seasonFactor = 1.1;
    } else { // Monsoon
        if (ingredientName === 'Onion') seasonFactor = 1.6;
        if (ingredientName === 'Coriander') seasonFactor = 2.0;
    }

    // Return Exact Calculated Price (No Random Fluctuation)
    return Math.round(price * seasonFactor);
};

// --- Dashboard Analytics Data ---
app.get('/api/market-prices', async (req, res) => {
    try {
        // Fetch real data from MongoDB (populated by the scheduler)
        const prices = await IngredientPrice.find({});

        // If DB is empty for some reason (rare race condition on first boot), return empty or fallback
        if (!prices || prices.length === 0) {
            return res.json({ prices: [], tip: "Loading fresh market data..." });
        }

        res.json({
            prices: prices,
            // Generate a dynamic tip based on the biggest savings
            tip: "Check online platforms for bulk discounts on Oil & Onions!",
            lastUpdated: new Date()
        });
    } catch (error) {
        console.error('Error fetching market prices:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Import the service
const { analyzeDishIngredients, getIngredientDetails, updateIngredientPriceFromApify } = require('./services/smartShoppingService');
const { fetchDataset } = require('./services/apifyService'); // Import apify service

// --- Apify Webhook ---
app.post('/api/webhook/apify', async (req, res) => {
    try {
        console.log("[Webhook] Received Apify event:", req.body);
        const { eventType, resource } = req.body;

        if (eventType === 'ACTOR.RUN.SUCCEEDED' || eventType === 'ACTOR.RUN.FINISHED') {
            const datasetId = resource.defaultDatasetId;
            console.log(`[Webhook] Fetching dataset ${datasetId}...`);

            // Fetch items
            const items = await fetchDataset(datasetId);

            // Process items (Assuming they are blinkit/zepto product structures)
            if (items && items.length > 0) {
                await updateIngredientPriceFromApify(items);
            }
        }
        res.status(200).send('OK');
    } catch (error) {
        console.error("[Webhook] Error processing:", error);
        res.status(500).send('Error');
    }
});

app.post('/api/market-prices/search', async (req, res) => {
    try {
        const { ingredient } = req.body;
        if (!ingredient) return res.status(400).json({ error: "Ingredient name required" });

        const result = await getIngredientDetails(ingredient);
        res.json(result);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

app.get('/api/dashboard/insights/:userId', async (req, res) => {
    const { userId } = req.params;
    // For demo, we might find by ID or name, but let's just find the latest user if ID doesn't match directly
    // or simulate based on local storage ID. For now, assuming user exists in our mock array.
    try {
        let user = null;
        try {
            // Try fetching from DB, fallback to any user
            user = await User.findOne({ id: userId }) || await User.findOne({});
        } catch (e) { console.log("User lookup failed, using mock"); }

        // if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user) {
            // Mock user for dashboard if no user is registered yet
            user = {
                id: 'demo_user',
                stallName: 'My New Stall',
                menuItems: ['Poha', 'Tea', 'Vada Pav']
            };
        }

        // Cost Breakdown
        // Match user's menu items to our DB. If not found, generate a random realistic cost.
        const registeredMenu = user.menuItems || [];
        // Fallback menu if empty
        const menuToAnalyze = registeredMenu.length > 0 ? registeredMenu : ['Poha', 'Tea', 'Vada Pav'];

        const costBreakdown = menuToAnalyze.map(item => {
            let dishName = typeof item === 'string' ? item : item.name; // Handle if object
            const masterDish = dishDatabase[dishName] || dishDatabase[Object.keys(dishDatabase).find(k => k.includes(dishName))] || null;

            let ingredientsDetails = [];
            if (masterDish && masterDish.ingredients) {
                ingredientsDetails = masterDish.ingredients.map(ingName => {
                    const pricePerKg = getDynamicIngredientPrice(ingName);
                    // Assume ~50g per ingredient for a plate calculation to be rough but realistic
                    const estCost = Math.round((pricePerKg / 1000) * 50);

                    // Calculate trend
                    const prevPrice = getDynamicIngredientPrice(ingName); // Simulating fluctuation
                    const change = ((pricePerKg - prevPrice) / prevPrice * 100);
                    const trend = change > 0 ? 'up' : (change < 0 ? 'down' : 'neutral');

                    return {
                        name: ingName,
                        qty: '50g', // Mock quantity
                        cost: Math.max(1, estCost), // Min 1 rs
                        trend: trend
                    };
                });
            } else {
                // Fallback for unknown dishes: Generate generic ingredients based on name
                const genericIngredients = ['Spices', 'Oil', 'Main Ingredient', 'Garnish'];
                ingredientsDetails = genericIngredients.map(ingName => {
                    return {
                        name: ingName,
                        qty: 'Variable',
                        cost: Math.floor(Math.random() * 10) + 5,
                        trend: 'neutral'
                    };
                });
            }

            return {
                name: dishName,
                cost: masterDish ? masterDish.cost : ingredientsDetails.reduce((sum, i) => sum + i.cost, 0),
                recommendedPrice: masterDish ? masterDish.cost * 2 : (ingredientsDetails.reduce((sum, i) => sum + i.cost, 0) * 2),
                ingredients: ingredientsDetails
            };
        });

        // Recommendations Strategy: "Easy Additions"
        // Find dishes that share the MOST ingredients with the current menu
        // This minimizes new stock requirements.

        // 1. Gather all current ingredients AND dominant categories
        const userIngredients = new Set();
        const currentDishNames = new Set();
        const categoryCounts = {};

        menuToAnalyze.forEach(item => {
            let name = typeof item === 'string' ? item : item.name;
            currentDishNames.add(name);

            // Find master dish data
            const masterDish = dishDatabase[name] || dishDatabase[Object.keys(dishDatabase).find(k => k.includes(name))];
            if (masterDish) {
                if (masterDish.ingredients) masterDish.ingredients.forEach(ing => userIngredients.add(ing));
                if (masterDish.category) {
                    categoryCounts[masterDish.category] = (categoryCounts[masterDish.category] || 0) + 1;
                }
            }
        });

        // Find top categories
        const dominantCategories = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2) // Top 2 categories
            .map(entry => entry[0]);

        // 2. Score other dishes based on overlap AND category match
        const recommendations = Object.entries(dishDatabase)
            .filter(([name, data]) => !currentDishNames.has(name)) // Exclude existing
            .map(([name, data]) => {
                // A. Ingredient Overlap Score (0-1)
                const matchCount = data.ingredients.filter(ing => userIngredients.has(ing)).length;
                const totalIngredients = data.ingredients.length;
                const ingredientScore = matchCount / (totalIngredients || 1);

                // B. Category Match Score (0 or 1)
                const isCategoryMatch = data.category && dominantCategories.includes(data.category);
                const categoryScore = isCategoryMatch ? 1.0 : 0.0;

                // Final Score (Weighted: 40% Ingredient Ease, 60% Category Fit)
                // We weigh Category higher to ensure "similar" dishes as requested
                const finalScore = (ingredientScore * 0.4) + (categoryScore * 0.6);

                let reason = 'Popular Item';
                if (isCategoryMatch && matchCount > 0) reason = `Perfect fit! ${data.category} dish using your ingredients.`;
                else if (isCategoryMatch) reason = `Great addition to your ${data.category} menu.`;
                else if (matchCount > 0) reason = `Easy to add! Uses ${matchCount} existing ingredients.`;

                return {
                    name,
                    estimatedCost: data.cost,
                    matchCount,
                    score: finalScore,
                    reason: reason
                };
            })
            .sort((a, b) => b.score - a.score) // Sort by best match
            .slice(0, 3) // Top 3
            .map(item => ({
                name: item.name,
                estimatedCost: item.estimatedCost,
                reason: item.reason
            }));

        // --- Metrics Calculation ---

        // 1. Daily Sales
        const today = new Date();
        const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

        // Ensure finances is accessible (if declared below, this relies on hoisting of the scope, which works in callbacks)
        // Fallback if finances undefined
        const safeFinances = (typeof finances !== 'undefined') ? finances : [];

        // Calculate total sales for today (Mock data dates might need adjustment to test "today")
        // For demo: If no sales today, show a mock realistic number or sum of all "recent" sales
        const todaysSales = safeFinances
            .filter(t => t.type === 'sale' && isSameDay(new Date(t.timestamp), today))
            .reduce((sum, t) => sum + t.amount, 0);

        // If 0 (likely in dev), show a realistic placeholder based on user's menu pricing
        const displaySales = todaysSales > 0 ? todaysSales : 2450;
        const salesTrend = todaysSales > 0 ? '+12%' : '+5%'; // Mock trend

        // 2. Waste Percentage
        let inventoryItems = [];
        try {
            inventoryItems = await Inventory.find({}) || [];
        } catch (e) { console.log("Inventory DB error, using empty list"); }

        const totalInventory = inventoryItems.length;
        let criticalItems = 0;
        inventoryItems.forEach(item => {
            const expiryDate = new Date(item.expiryDate);
            const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            if (daysToExpiry <= 3 || item.quantity <= item.lowStockThreshold) criticalItems++;
        });
        const wastePercent = totalInventory > 0 ? Math.round((criticalItems / totalInventory) * 100) : 0;
        const wasteChange = wastePercent > 10 ? '+2%' : '-1%';

        // 3. Top Item (Mock - randomly select one from menu)
        const menuNames = menuToAnalyze.map(m => (typeof m === 'string' ? m : m.name));
        const randomTopItem = menuNames[Math.floor(Math.random() * menuNames.length)] || 'Masala Chai';
        const randomSold = Math.floor(Math.random() * 200) + 50;

        // 4. Next Event
        const events = [
            { name: 'Diwali', date: new Date(today.getFullYear(), 9, 20) }, // Oct 20 (Approximation)
            { name: 'Holi', date: new Date(today.getFullYear() + 1, 2, 14) }, // Mar 14 next year
            { name: 'Ganesh Chaturthi', date: new Date(today.getFullYear(), 8, 7) }, // Sept 7
            { name: 'Independence Day', date: new Date(today.getFullYear(), 7, 15) }, // Aug 15
            { name: 'Christmas', date: new Date(today.getFullYear(), 11, 25) }, // Dec 25
            { name: 'New Year', date: new Date(today.getFullYear() + 1, 0, 1) } // Jan 1
        ];

        // Sort logic to find next one
        events.sort((a, b) => a.date - b.date);
        let nextEvent = events.find(e => e.date > today);
        if (!nextEvent) nextEvent = events[0]; // Fallback loop

        const daysToEvent = Math.ceil((nextEvent.date - today) / (1000 * 60 * 60 * 24));

        const metrics = {
            sales: { value: `₹${displaySales.toLocaleString('en-IN')}`, change: salesTrend, trend: 'up' },
            waste: { value: `${wastePercent}%`, change: wasteChange, trend: wastePercent > 15 ? 'up' : 'down' },
            topItem: { value: randomTopItem, change: `${randomSold} sold`, trend: 'neutral' },
            event: { value: nextEvent.name, change: `in ${daysToEvent} days`, trend: 'neutral' }
        };

        res.json({
            costBreakdown,
            recommendations,
            metrics
        });
    } catch (error) {
        console.error('Insights Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// --- Sales & Expense Tracker (Persistence) ---
const financesFile = path.join(__dirname, 'data', 'finances.json');
let finances = [];

const saveFinances = () => {
    try {
        fs.writeFileSync(financesFile, JSON.stringify(finances, null, 2));
    } catch (error) {
        console.error('Error saving finances:', error);
    }
};

const loadFinances = () => {
    try {
        if (fs.existsSync(financesFile)) {
            const data = fs.readFileSync(financesFile, 'utf8');
            finances = JSON.parse(data);
        }

        // Seed mock data if empty
        if (finances.length === 0) {
            console.log('Seeding mock financial data...');
            finances = [
                { id: '1', type: 'sale', amount: 500, category: 'cash', note: 'Morning Start', timestamp: new Date(Date.now() - 86400000) },
                { id: '2', type: 'expense', amount: 200, category: 'vegetables', note: 'Bought Onions', timestamp: new Date(Date.now() - 82800000) },
                { id: '3', type: 'sale', amount: 1500, category: 'upi', note: 'Lunch Rush', timestamp: new Date(Date.now() - 4000000) },
                { id: '4', type: 'expense', amount: 50, category: 'transport', note: 'Auto rickshaw', timestamp: new Date(Date.now() - 3000000) }
            ];
            saveFinances();
        }
        console.log(`Loaded ${finances.length} transactions.`);
    } catch (error) {
        console.error('Error loading finances:', error);
    }
};

loadFinances();

app.get('/api/finances', (req, res) => {
    // Sort by newest first
    const sorted = [...finances].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sorted);
});

app.post('/api/finances', (req, res) => {
    const { type, amount, category, note } = req.body;

    if (!type || !amount || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTxn = {
        id: Date.now().toString(),
        type,
        amount: parseFloat(amount),
        category,
        note: note || '',
        timestamp: new Date()
    };

    finances.push(newTxn);
    saveFinances();
    res.json({ success: true, transaction: newTxn });
});

app.get('/api/finances/export', (req, res) => {
    // Generate CSV
    const header = 'Date,Time,Type,Category,Amount,Note\n';
    const rows = finances.map(t => {
        const d = new Date(t.timestamp);
        const dateStr = d.toLocaleDateString();
        const timeStr = d.toLocaleTimeString();
        return `${dateStr},${timeStr},${t.type},${t.category},${t.amount},"${t.note || ''}"`;
    }).join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('finances.csv'); // Tells browser to download
    res.send(header + rows);
});

// --- SMART SHOPPING ROUTES ---

app.post('/api/smart-shopping/analyze', async (req, res) => {
    try {
        const { dish_name } = req.body;
        if (!dish_name) return res.status(400).json({ error: "Dish name required" });

        const result = await analyzeDishIngredients(dish_name);
        res.json(result);
    } catch (error) {
        console.error("Smart Shopping Error:", error);
        res.status(500).json({ error: "Analysis failed" });
    }
});

// --- ADMIN: Deduplicate Ingredients Endpoint ---
app.post('/api/admin/deduplicate', async (req, res) => {
    try {
        console.log("Checking for duplicates via Admin API...");
        const allDocs = await IngredientPrice.find({}).sort({ date: -1 });
        const seen = new Set();
        const duplicates = [];

        for (const doc of allDocs) {
            const name = doc.name;
            if (seen.has(name)) {
                duplicates.push(doc._id);
            } else {
                seen.add(name);
            }
        }

        if (duplicates.length > 0) {
            await IngredientPrice.deleteMany({ _id: { $in: duplicates } });
            res.json({ success: true, message: `Removed ${duplicates.length} duplicates.` });
        } else {
            res.json({ success: true, message: "No duplicates found." });
        }
    } catch (error) {
        console.error("Deduplication error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
