import { useNavigate, useLocation } from 'react-router-dom';
import { Home, IndianRupee, Image as ImageIcon, Bot, Menu } from 'lucide-react';

export function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { title: 'Home', url: '/dashboard', icon: Home },
        { title: 'Sales', url: '/sales-tracker', icon: IndianRupee },
        { title: 'Poster', url: '/poster-maker', icon: ImageIcon },
        { title: 'Mitra', url: '/startup-mitra', icon: Bot },
        // Using Menu icon for Inventory/Stock or similar key feature, or sidebar trigger? 
        // Let's us Inventory as it is a key business tool.
        // Or actually, let's keep it simple. The sidebar trigger is already floating on top left.
        // Let's add 'Reels' since we just worked on it and it's flashy.
        // Actually, the plan said "Tools (Startup Mitra)" and "More". 
        // Let's stick to a balanced mix.
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-lg border-t border-border z-50 flex items-center justify-around px-2 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                    <button
                        key={item.url}
                        onClick={() => navigate(item.url)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-primary/10 scale-110' : ''}`}>
                            <item.icon className={`h-5 w-5 ${isActive ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-[10px] font-medium">{item.title}</span>
                    </button>
                );
            })}

            {/* "More" button acting as a link to All Features or just Sidebar Trigger logic if we could accesses it. 
                For now, let's link to '/inventory' as a placeholder for the 5th item 
                OR we can create a simple drawer. 
                Let's stick to 4 priority items + 1 'Menu' link that goes to a grid page? 
                Actually, let's just use 4 items for cleaner look or 5. 
                Let's add 'Stock' as 5th.
            */}
            <button
                onClick={() => navigate('/inventory')}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/inventory' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
                <div className={`p-1 rounded-full transition-all ${location.pathname === '/inventory' ? 'bg-primary/10 scale-110' : ''}`}>
                    <Menu className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium">Stock</span>
            </button>
        </div>
    );
}
