const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

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

        const prompt = `You are Startup Mitra, a helpful and knowledgeable business assistant for small business owners in India. 
    You help with starting focused businesses like food stalls, trucks, providing licensing info (FSSAI), and pricing strategies.
    Keep your answers concise, encouraging, and easy to understand.
    IMPORTANT: Provide the response in SIMPLE PLAIN TEXT format. 
    - Use bullet points (-) for lists.
    - Keep it concise but helpful.
    - Structure your answer clearly.
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

// --- Community & User Data Storage (In-Memory) ---
const users = [
    { id: '1', name: 'Ramesh Kumar', stallName: 'Sharma Tea Stall', specialty: 'Tea, Snacks', phone: '+91 98765 43210', isVerified: true, location: 'Mumbai' },
    { id: '2', name: 'Priya Patel', stallName: 'Priya Chaat Corner', specialty: 'Chaat, Pani Puri', phone: '+91 87654 32109', isVerified: true, location: 'Pune' },
    { id: '3', name: 'Amit Verma', stallName: 'Verma Sweets', specialty: 'Sweets, Namkeen', phone: '+91 76543 21098', isVerified: false, location: 'Delhi' },
];

// --- Community Posts ---
// Mock Initial Posts with expanded structure
const communityPosts = [
    {
        id: '1',
        author: 'Ramesh Kumar',
        content: 'Tomatoes are cheap today at Sabzi Mandi - ₹30/kg! Go buy now.',
        timestamp: new Date(Date.now() - 3600000),
        likes: 12,
        replies: 5,
        type: 'update',
        comments: [
            { id: 'c1', author: 'Suresh', text: 'Thanks for the info!', timestamp: new Date(Date.now() - 1000000) }
        ]
    },
    {
        id: '2',
        author: 'Priya Patel',
        content: 'Just got my FSSAI license! If anyone needs help, ask me.',
        timestamp: new Date(Date.now() - 7200000),
        likes: 25,
        replies: 8,
        type: 'update',
        comments: []
    },
];

// Mock Discussions
const discussions = [
    { id: '1', title: 'How to apply for FSSAI license?', author: 'New Vendor', replies: 15, category: 'license', timestamp: new Date() },
    { id: '2', title: 'Zomato registration - is it worth it?', author: 'Tea Shop Owner', replies: 23, category: 'platform', timestamp: new Date() },
];

// --- User Registration ---
app.post('/api/register', (req, res) => {
    const { name, phone, businessName, businessType, location, email, password } = req.body;

    if (!name || !phone || !businessName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if phone or email already exists
    if (users.some(u => u.phone === phone || (email && u.email === email))) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
        id: (users.length + 1).toString(),
        name,
        phone,
        email: email || '',
        password: password || '123456', // Default mock password if not provided
        stallName: businessName,
        specialty: businessType,
        location: location || 'Unknown',
        menuItems: req.body.menuItems || [], // Store menu items
        isVerified: false
    };

    users.push(newUser);
    res.json({ success: true, user: newUser });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and Password required' });
    }

    // Find user by email
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// --- Get Vendors/Users ---
app.get('/api/users', (req, res) => {
    // In a real app, we would support filtering by location
    // For now, return all users but add a random distance for UI simulation
    const usersWithDistance = users.map(u => ({
        ...u,
        distance: (Math.random() * 5).toFixed(1) // Random distance 0-5 km
    }));
    res.json(usersWithDistance);
});

// --- Community Posts ---
app.get('/api/community/posts', (req, res) => {
    // Sort by newest first
    const sortedPosts = [...communityPosts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sortedPosts);
});

app.post('/api/community/posts', (req, res) => {
    const { author, content, type } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const newPost = {
        id: (communityPosts.length + 1).toString(),
        author: author || 'Guest User',
        content,
        type: type || 'question',
        timestamp: new Date(),
        likes: 0,
        replies: 0,
        comments: []
    };

    communityPosts.unshift(newPost); // Add to beginning
    res.json({ success: true, post: newPost });
});

app.post('/api/community/posts/:id/like', (req, res) => {
    const { id } = req.params;
    const post = communityPosts.find(p => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.likes += 1;
    res.json({ success: true, likes: post.likes });
});

app.post('/api/community/posts/:id/comment', (req, res) => {
    const { id } = req.params;
    const { author, text } = req.body;
    const post = communityPosts.find(p => p.id === id);

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!text) return res.status(400).json({ error: 'Comment text required' });

    const newComment = {
        id: Date.now().toString(),
        author: author || 'Guest',
        text,
        timestamp: new Date()
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);
    post.replies = post.comments.length; // Update reply count

    res.json({ success: true, comment: newComment, replies: post.replies });
});

// --- Discussions ---
app.get('/api/community/discussions', (req, res) => {
    res.json(discussions);
});

app.post('/api/community/discussions', (req, res) => {
    const { title, author, category } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const newDiscussion = {
        id: (discussions.length + 1).toString(),
        title,
        author: author || 'Guest',
        category: category || 'general',
        replies: 0,
        timestamp: new Date()
    };

    discussions.push(newDiscussion);
    res.json({ success: true, discussion: newDiscussion });
});

// --- Inventory Management ---
// Mock Inventory Data
const inventory = [
    { id: '1', name: 'Paneer', quantity: 5, unit: 'kg', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), category: 'raw', lowStockThreshold: 10 },
    { id: '2', name: 'Tomato', quantity: 15, unit: 'kg', expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), category: 'raw', lowStockThreshold: 10 },
    { id: '3', name: 'Onion', quantity: 2, unit: 'kg', expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), category: 'raw', lowStockThreshold: 5 },
    { id: '4', name: 'Rice', quantity: 20, unit: 'kg', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), category: 'preserved', lowStockThreshold: 10 },
    { id: '5', name: 'Oil', quantity: 5, unit: 'L', expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), category: 'preserved', lowStockThreshold: 5 },
    { id: '6', name: 'Spices', quantity: 1, unit: 'kg', expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), category: 'preserved', lowStockThreshold: 2 },
];

app.get('/api/inventory', (req, res) => {
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const inventoryWithStatus = inventory.map(item => {
        let status = 'good';
        const expiryDate = new Date(item.expiryDate);
        const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        // Check Low Stock (Custom Thresholds: 5 and 3)
        // User requested: "threshold 5 - 3"
        // Interpretation: Warning at 5, Critical at 3
        if (item.quantity <= 3) {
            status = 'critical';
        } else if (item.quantity <= 5) {
            status = 'low';
        }

        // Check Expiry
        if (daysToExpiry <= 3) {
            status = 'critical'; // Expiring very soon (3 days)
        } else if (daysToExpiry <= 7 && status !== 'critical') {
            status = 'low'; // Expiring soon (7 days)
        }

        return {
            ...item,
            status,
            expiryDays: daysToExpiry,
            // Simple logic for Marathi name placeholder
            marathiName: item.name
        };
    });

    const alerts = {
        lowStock: inventoryWithStatus.filter(i => i.status === 'low' || i.status === 'critical'),
        expiringSoon: inventoryWithStatus.filter(i => i.expiryDays <= 7)
    };

    res.json({ items: inventoryWithStatus, alerts });
});

app.post('/api/inventory', (req, res) => {
    const { name, quantity, unit, expiryDays, category } = req.body;

    if (!name || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const expiryDate = new Date();
    // Default to 30 days if not provided
    const daysToAdd = expiryDays ? parseInt(expiryDays) : 30;
    expiryDate.setDate(expiryDate.getDate() + daysToAdd);

    const newItem = {
        id: Date.now().toString(),
        name,
        quantity: parseFloat(quantity),
        unit: unit || 'kg',
        expiryDate,
        category: category || 'raw',
        lowStockThreshold: 5 // Default
    };

    inventory.push(newItem);
    res.json({ success: true, item: newItem });
});

const fs = require('fs');
const path = require('path');

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

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
            'Poha': { cost: 18, price: 40, ingredients: ['Rice Flakes', 'Onion', 'Peanuts', 'Oil'] },
            'Tea': { cost: 8, price: 20, ingredients: ['Milk', 'Tea Leaf', 'Ginger', 'Sugar'] },
        };
    }
};

loadMenuData();

// --- Dynamic Pricing Logic ---
const getDynamicIngredientPrice = (ingredientName) => {
    // Base prices (mock)
    const basePrices = {
        'Onion': 30, 'Tomato': 40, 'Potato': 25, 'Cheese': 400,
        'Butter': 500, 'Paneer': 350, 'Chicken': 200, 'Oil': 140,
        'Milk': 60, 'Ginger': 80, 'Garlic': 100, 'Chili': 40
    };

    // Default price if not found
    let price = basePrices[ingredientName] || 100;

    // Seasonality Factor
    const month = new Date().getMonth(); // 0-11 (Dec = 11)

    // Winter (Nov-Feb): Green veggies cheaper, some fruits expensive
    // Summer (Mar-Jun): Milk/Dairy might fluctuate
    // Monsoon (Jul-Oct): Leafy veggies expensive

    let seasonFactor = 1.0;

    if (month >= 10 || month <= 1) { // Winter
        if (ingredientName === 'Peas' || ingredientName === 'Carrot') seasonFactor = 0.8; // Cheaper
        if (ingredientName === 'Tomato') seasonFactor = 1.2; // Slightly up
    } else if (month >= 2 && month <= 5) { // Summer
        if (ingredientName === 'Lemon') seasonFactor = 1.5; // Demand up
    } else { // Monsoon
        if (ingredientName === 'Onion') seasonFactor = 1.4; // Wet onions spoil
        if (ingredientName === 'Coriander') seasonFactor = 2.0; // Hard to grow
    }

    // Random Daily Fluctuation (+- 5%)
    const fluctuation = 0.95 + Math.random() * 0.10;

    return Math.round(price * seasonFactor * fluctuation);
};

// --- Dashboard Analytics Data ---
app.get('/api/market-prices', (req, res) => {
    // Generate dynamic market prices for top ingredients found in CSV
    const topIngredients = Array.from(allIngredients).slice(0, 10);
    if (topIngredients.length === 0) {
        topIngredients.push('Onion', 'Tomato', 'Potato', 'Cheese', 'Butter');
    }

    const prices = topIngredients.map(name => {
        const currentPrice = getDynamicIngredientPrice(name);
        const yesterdayPrice = getDynamicIngredientPrice(name); // Simulating trend
        const change = ((currentPrice - yesterdayPrice) / yesterdayPrice * 100).toFixed(1);

        return {
            name,
            unit: '1kg', // Simplification
            price: currentPrice,
            trend: parseFloat(change)
        };
    });

    res.json({
        prices,
        tip: "Seasonal Trend: Prices fluctuate based on local supply!",
        lastUpdated: new Date()
    });
});

app.get('/api/dashboard/insights/:userId', (req, res) => {
    const { userId } = req.params;
    // For demo, we might find by ID or name, but let's just find the latest user if ID doesn't match directly
    // or simulate based on local storage ID. For now, assuming user exists in our mock array.
    const user = users.find(u => u.id === userId) || users[users.length - 1]; // Fallback to last user

    if (!user) return res.status(404).json({ error: 'User not found' });

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
                // This is a simplification. Real recipes need quantities.
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
        }

        return {
            name: dishName,
            cost: masterDish ? masterDish.cost : Math.floor(Math.random() * 20) + 10, // Mock cost if unknown
            recommendedPrice: masterDish ? masterDish.cost * 2 : 0, // Rough margin
            ingredients: ingredientsDetails
        };
    });

    // Recommendations Strategy: "Easy Additions"
    // Find dishes that share the MOST ingredients with the current menu
    // This minimizes new stock requirements.

    // 1. Gather all current ingredients
    const userIngredients = new Set();
    const currentDishNames = new Set();

    menuToAnalyze.forEach(item => {
        let name = typeof item === 'string' ? item : item.name;
        currentDishNames.add(name);

        // Find master dish data
        const masterDish = dishDatabase[name] || dishDatabase[Object.keys(dishDatabase).find(k => k.includes(name))];
        if (masterDish && masterDish.ingredients) {
            masterDish.ingredients.forEach(ing => userIngredients.add(ing));
        }
    });

    // 2. Score other dishes based on overlap
    const recommendations = Object.entries(dishDatabase)
        .filter(([name, data]) => !currentDishNames.has(name)) // Exclude existing
        .map(([name, data]) => {
            // Count matching ingredients
            const matchCount = data.ingredients.filter(ing => userIngredients.has(ing)).length;
            const totalIngredients = data.ingredients.length;

            // Calculate "Ease Score" (higher is better)
            // We want high overlap, low new ingredients
            const score = matchCount / (totalIngredients || 1);

            return {
                name,
                estimatedCost: data.cost,
                matchCount,
                score,
                reason: matchCount > 0
                    ? `Uses ${matchCount} of your existing ingredients!`
                    : 'Popular high-margin item'
            };
        })
        .sort((a, b) => b.score - a.score) // Sort by best match
        .slice(0, 3) // Top 3
        .map(item => ({
            name: item.name,
            estimatedCost: item.estimatedCost,
            reason: item.reason
        }));

    res.json({
        costBreakdown,
        recommendations
    });
});

// --- Sales & Expense Tracker (Persistence) ---
const financesFile = path.join(__dirname, 'data', 'finances.json');
let finances = [];

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

const saveFinances = () => {
    try {
        fs.writeFileSync(financesFile, JSON.stringify(finances, null, 2));
    } catch (error) {
        console.error('Error saving finances:', error);
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


