import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Assuming these exist
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Plus, Minus, Utensils } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Mock data fetcher (Replace with backend call in real app)
// For this demo, we can fallback to localStorage if on same device or mock data
const getMockMenu = () => [
    { id: 1, name: 'Vada Pav', price: 15, category: 'Snacks', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60' },
    { id: 2, name: 'Masala Chai', price: 10, category: 'Beverages', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60' },
    { id: 3, name: 'Pav Bhaji', price: 60, category: 'Meals', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60' },
    { id: 4, name: 'Samosa', price: 20, category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60' },
];

const DigitalMenu = () => {
    const { vendorId } = useParams();
    const { toast } = useToast();
    const [cart, setCart] = useState<{ [key: number]: number }>({});

    // Load menu from localStorage (simulating backend fetch)
    const [menuItems, setMenuItems] = useState<any[]>([]);

    React.useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                if (user.menuItems && Array.isArray(user.menuItems) && user.menuItems.length > 0) {
                    // Normalize data structure
                    const formattedMenu = user.menuItems.map((item: any, index: number) => ({
                        id: index + 1,
                        name: item.name,
                        price: Number(item.price) || 0,
                        category: item.category || 'General',
                        image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
                    }));
                    setMenuItems(formattedMenu);
                    return;
                }
            } catch (e) {
                console.error("Error loading menu", e);
            }
        }
        // Fallback
        setMenuItems(getMockMenu());
    }, []);

    const addToCart = (id: number) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const removeFromCart = (id: number) => {
        if (!cart[id]) return;
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[id] > 1) newCart[id]--;
            else delete newCart[id];
            return newCart;
        });
    };

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = menuItems.find(i => i.id === Number(id));
        return sum + (item ? item.price * qty : 0);
    }, 0);

    const handlePlaceOrder = () => {
        if (totalItems === 0) return;

        // Construct WhatsApp message
        let message = `Hello! I would like to place an order:%0A`;
        Object.entries(cart).forEach(([id, qty]) => {
            const item = menuItems.find(i => i.id === Number(id));
            if (item) message += `- ${item.name} x ${qty} (₹${item.price * qty})%0A`;
        });
        message += `%0A*Total: ₹${totalPrice}*`;

        const orderData = {
            id: Date.now(),
            customerName: "Table 1", // Mock for now, could be input
            items: Object.entries(cart).map(([id, qty]) => {
                const item = menuItems.find(i => i.id === Number(id));
                return { name: item?.name, qty, price: item?.price };
            }),
            total: totalPrice,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        // Save to localStorage for Dashboard to pick up
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        localStorage.setItem('pendingOrders', JSON.stringify([orderData, ...existingOrders]));

        // Redirect to WhatsApp (Assuming vendor has number)
        // For demo, just toast
        toast({
            title: "Order Placed! 🚀",
            description: "Your order has been sent to the kitchen.",
        });

        // window.open(`https://wa.me/919999999999?text=${message}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-orange-600 p-4 text-white sticky top-0 z-10 shadow-md">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Utensils className="h-6 w-6" />
                    Vada Pav Center
                </h1>
                <p className="text-sm opacity-90">Taste of Mumbai • Open Now</p>
            </div>

            {/* Menu List */}
            <div className="p-4 space-y-4 max-w-md mx-auto">
                {menuItems.map(item => (
                    <Card key={item.id} className="overflow-hidden border-none shadow-sm flex items-center p-2 gap-3 h-24">
                        <img src={item.image} className="w-20 h-20 rounded-lg object-cover bg-gray-200" alt={item.name} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-500">₹{item.price}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            {cart[item.id] ? (
                                <div className="flex items-center gap-2 bg-orange-100 rounded-lg px-2 py-1">
                                    <button onClick={() => removeFromCart(item.id)} className="text-orange-600"><Minus className="h-4 w-4" /></button>
                                    <span className="font-bold text-orange-700">{cart[item.id]}</span>
                                    <button onClick={() => addToCart(item.id)} className="text-orange-600"><Plus className="h-4 w-4" /></button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" className="border-orange-500 text-orange-600 h-8" onClick={() => addToCart(item.id)}>
                                    ADD
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Bottom Cart Bar */}
            {totalItems > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
                    <div className="max-w-md mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">{totalItems} ITEMS</p>
                            <p className="font-bold text-lg">₹{totalPrice}</p>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700 text-white px-8" onClick={handlePlaceOrder}>
                            Place Order <ShoppingCart className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalMenu;
