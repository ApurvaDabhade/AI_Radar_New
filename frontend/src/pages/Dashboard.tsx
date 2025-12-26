import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import {
  TrendingUp,
  Package,
  MessageSquare,
  Users,
  Gift,
  MapPin,
  Bot,
  Bell,
  Settings,
  LogOut,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  Clock
} from 'lucide-react';
import foodStallBg from '@/assets/food-stall-bg.jpg';
import indianThali from '@/assets/indian-thali.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedDish, setSelectedDish] = useState<string | null>(null);

  // Stock market style price tracker data
  // State for dashboard data
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [marketTip, setMarketTip] = useState('');
  const [costBreakdown, setCostBreakdown] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIngredient, setNewIngredient] = useState('');
  const [addingIng, setAddingIng] = useState(false);

  const handleAddIngredient = async () => {
    if (!newIngredient.trim()) return;
    setAddingIng(true);
    try {
      const res = await fetch('http://localhost:5001/api/market-prices/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient: newIngredient })
      });
      if (res.ok) {
        const data = await res.json();
        // Prepend new item
        setMarketPrices(prev => [data, ...prev]);
        setNewIngredient('');
      }
    } catch (e) {
      console.error("Failed to add ingredient", e);
    } finally {
      setAddingIng(false);
    }
  };

  const [metricsData, setMetricsData] = useState<any>({
    sales: { value: '-', change: '-', trend: 'neutral' },
    waste: { value: '-', change: '-', trend: 'neutral' },
    topItem: { value: '-', change: '-', trend: 'neutral' },
    event: { value: '-', change: '-', trend: 'neutral' }
  });

  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  // Poll for new orders (simulating websocket/real-time)
  useEffect(() => {
    const checkOrders = () => {
      const orders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      setPendingOrders(orders);
    };
    checkOrders(); // Initial check
    const interval = setInterval(checkOrders, 3000); // Check every 3s
    return () => clearInterval(interval);
  }, []);

  const handleCompleteOrder = (id: number) => {
    const remainingOrders = pendingOrders.filter(o => o.id !== id);
    setPendingOrders(remainingOrders);
    localStorage.setItem('pendingOrders', JSON.stringify(remainingOrders));
    // Optional: Move to 'completedOrders' history
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Market Prices from Backend
        const pricesRes = await fetch('http://localhost:5001/api/market-prices');
        if (pricesRes.ok) {
          const data = await pricesRes.json();
          setMarketPrices(data.prices || []);
          if (data.tip) setMarketTip(data.tip);
        } else {
          // Fallback to mock if API fails
          setMarketPrices([
            { name: 'Onion (कांदा)', unit: '1 kg', marketPrice: 40, bestPrice: 32, platform: 'Blinkit', savings: 20, image: '🧅' },
            { name: 'Tomato (टोमॅटो)', unit: '1 kg', marketPrice: 35, bestPrice: 28, platform: 'Zepto', savings: 20, image: '🍅' },
          ]);
        }

        // Fetch user insights
        // In a real app, we get ID from auth context. Here we check localStorage or use a default '1'
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : { id: '1' };

        const insightsRes = await fetch(`http://localhost:5001/api/dashboard/insights/${user.id}`);
        if (insightsRes.ok) {
          const data = await insightsRes.json();
          setCostBreakdown(data.costBreakdown);
          setRecommendations(data.recommendations);
          if (data.metrics) setMetricsData(data.metrics);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default/safe values on error
        setMetricsData({
          sales: { value: '₹0', change: '0%', trend: 'neutral' },
          waste: { value: '0%', change: '0%', trend: 'neutral' },
          topItem: { value: 'N/A', change: '', trend: 'neutral' },
          event: { value: 'None', change: '', trend: 'neutral' }
        });
      } finally {
        setLoading(false);
      }
    };


    fetchDashboardData();
  }, [t]);

  // Polling for Pending Scrapes
  useEffect(() => {
    const pendingItems = marketPrices.filter(i => i.status === 'pending');
    if (pendingItems.length === 0) return;

    const interval = setInterval(async () => {
      const updatedPrices = await Promise.all(marketPrices.map(async (item) => {
        if (item.status === 'pending') {
          try {
            const res = await fetch('http://localhost:5001/api/market-prices/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ingredient: item.name }) // Re-search
            });
            if (res.ok) {
              return await res.json();
            }
          } catch (e) { console.error("Poll error", e); }
        }
        return item;
      }));

      // Only update if there's a change to avoid re-renders? 
      // Actually react state diffing handles it, but let's check deep equality or just set it.
      // If status changed from pending -> available, it will update.
      setMarketPrices(updatedPrices);

    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [marketPrices]);

  // Convert metricsData object to array for rendering
  const metrics = [
    { label: t('dashboard.sales'), ...metricsData.sales },
    { label: t('dashboard.waste'), ...metricsData.waste },
    { label: t('dashboard.topItem'), ...metricsData.topItem },
    { label: t('dashboard.nextEvent'), ...metricsData.event },
  ];

  const quickActions = [
    {
      icon: Bot,
      title: 'Startup Mitra',
      desc: 'Business guidance & advice',
      color: 'from-purple-600 to-purple-800',
      route: '/startup-mitra',
    },
    {
      icon: Bot,
      title: 'ChefGuru',
      desc: 'Kitchen intelligence assistant',
      color: 'from-indigo-600 to-indigo-800',
      route: '/chef-guru',
    },
    {
      icon: Package,
      title: t('dashboard.inventory'),
      desc: t('dashboard.inventoryDesc'),
      color: 'from-blue-600 to-blue-800',
      route: '/inventory',
    },
    {
      icon: MessageSquare,
      title: t('dashboard.reviews'),
      desc: t('dashboard.reviewsDesc'),
      color: 'from-green-600 to-green-800',
      route: '/reviews',
    },
    {
      icon: Users,
      title: t('dashboard.community'),
      desc: t('dashboard.communityDesc'),
      color: 'from-orange-600 to-orange-800',
      route: '/community-hub',
    },

    {
      icon: MapPin,
      title: t('dashboard.tourism'),
      desc: t('dashboard.tourismDesc'),
      color: 'from-cyan-600 to-cyan-800',
      route: '/tourism',
    },
  ];

  // Helper to get emoji for random dish
  const getEmojiForDish = (name: string) => {
    if (name.includes('Tea')) return '☕';
    if (name.includes('Poha')) return '🍚';
    if (name.includes('Vada')) return '🥔';
    if (name.includes('Samosa')) return '🥟';
    if (name.includes('Dosa')) return '🥞';
    if (name.includes('Idli')) return '🍘';
    return '🍲';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 relative">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src={foodStallBg} alt="Food stall background" className="w-full h-full object-cover opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background"></div>
          </div>

          <MobileSidebarTrigger />
          {/* Header */}
          <header className="sticky top-0 z-40 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div>


              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10"
                  onClick={() => navigate('/')}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Welcome back! 👋</h2>
                  <p className="text-lg text-primary font-serif italic mb-2">"पुन्हा स्वागत आहे!"</p>

                </div>
                <div className="hidden md:flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shadow-lg">
                    <img src={indianThali} alt="Indian Thali" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">🥗</span>
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">🍕</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚨 LIVE ORDER QUEUE (New Feature) */}
            <div className="mb-8">
              <Card className="bg-card border-border shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-red-50 border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3 text-orange-700">
                      <span className="text-3xl animate-pulse">🔔</span>
                      Live Order Queue
                      <span className="block text-sm font-normal text-orange-600/80 font-serif ml-2">("प्रलंबित ऑर्डर्स")</span>
                    </CardTitle>

                  </div>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {pendingOrders.length} Pending
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingOrders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground bg-muted/20">
                      <p className="text-lg">No pending orders</p>
                      <p className="text-sm">Scan your QR to test!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {pendingOrders.map((order: any) => (
                        <div key={order.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between bg-card hover:bg-accent transition-colors gap-4">
                          {/* Order Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-bold">
                                {order.customerName}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(order.id).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-2 text-sm">
                                  <span className="font-bold text-gray-700">{item.qty}x</span>
                                  <span>{item.name}</span>
                                </div>
                              ))}
                            </div>
                            <p className="mt-2 font-bold text-lg text-green-700">Total: ₹{order.total}</p>
                          </div>

                          {/* Actions */}
                          <Button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            Mark Ready ✅
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {metrics.map((metric, index) => (
                <Card key={index} className="bg-card border-border p-6 relative overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow">
                  <div className="absolute top-2 right-2 opacity-20">
                    {index === 0 && <span className="text-2xl">💰</span>}
                    {index === 1 && <span className="text-2xl">♻️</span>}
                    {index === 2 && <span className="text-2xl">🍽️</span>}
                    {index === 3 && <span className="text-2xl">🎉</span>}
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <Badge
                      variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'secondary' : 'outline'}
                      className={metric.trend === 'up' ? 'bg-accent text-accent-foreground' : metric.trend === 'down' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}
                    >
                      {metric.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">{metric.value}</p>
                </Card>
              ))}
            </div>

            {/* 📊 INGREDIENT PRICE TRACKER - Stock Market Style */}
            <div className="mb-8">
              <Card className="bg-card border-border shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        Ingredient Price Tracker
                        <span className="block text-sm font-normal text-primary/80 font-serif ml-2">("बाजारातील आजचे भाव")</span>
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        Today's market prices • Updated just now
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add ingredient..."
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                        className="bg-background border border-input rounded-md px-3 py-1 text-sm w-32 md:w-48"
                      />
                      <Button size="sm" onClick={handleAddIngredient} disabled={addingIng}>
                        {addingIng ? '...' : '+'}
                      </Button>
                      <Badge className="bg-primary/20 text-primary text-lg px-4 py-2 hidden md:flex">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Comparison Grid Header */}
                  <div className="hidden md:grid grid-cols-12 bg-muted/50 px-6 py-3 border-b border-border text-sm font-semibold text-muted-foreground">
                    <span className="col-span-5">Ingredient</span>
                    <span className="col-span-3 text-center">Market Rate</span>
                    <span className="col-span-4 text-center">Best Deal Found</span>
                  </div>

                  {/* Price rows */}
                  <div className="divide-y divide-border">
                    {marketPrices.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 hover:bg-muted/30 transition-colors items-center gap-4 animate-in fade-in slide-in-from-top-2"
                      >
                        {/* Ingredient Name */}
                        <div className="col-span-5 flex items-center gap-4">
                          <span className={`text-3xl bg-muted/20 p-2 rounded-lg border border-border/50 ${item.status === 'pending' ? 'animate-pulse' : ''}`}>
                            {item.image}
                          </span>
                          <div>
                            <p className="font-bold text-lg leading-none flex items-center gap-2">
                              {item.name}
                              {item.status === 'pending' && <span className="text-xs text-orange-500 font-normal animate-pulse">(Finding prices...)</span>}
                            </p>
                            <p className="text-sm text-muted-foreground">{item.unit}</p>
                          </div>
                        </div>

                        {/* Market Price Ref */}
                        <div className="col-span-3 text-center flex md:flex-col items-center justify-between md:justify-center gap-2">
                          <span className="md:hidden text-sm text-muted-foreground">Market:</span>
                          <div>
                            <span className="text-lg font-medium text-foreground">
                              ₹{item.marketPrice}
                            </span>

                          </div>
                        </div>

                        {/* Best Deal */}
                        <div className={`col-span-4 flex items-center justify-between md:justify-center gap-4 p-2 rounded-lg border ${item.status === 'pending' ? 'bg-orange-50 border-orange-200' : 'bg-green-500/5 border-green-500/20'}`}>
                          {item.status === 'pending' ? (
                            <div className="w-full text-center py-1">
                              <p className="text-sm font-semibold text-orange-600 flex items-center justify-center gap-2">
                                <span className="animate-spin text-xl">⏳</span>
                                Scraping Live Prices...
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">This may take 10-30s</p>
                            </div>
                          ) : (
                            <>
                              <div className="text-left">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Best Price</p>
                                <p className="text-xl font-bold text-green-600">₹{item.bestPrice}</p>
                              </div>

                              <div className="text-right">
                                <Badge className="mb-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground border-none text-xs px-2 py-0.5 whitespace-nowrap shadow-sm">
                                  {item.platform}
                                </Badge>
                                {item.savings > 0 && (
                                  <p className="text-[10px] text-green-600 font-bold">Save {item.savings}%</p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick insight */}
                  <div className="bg-accent/10 border-t border-accent/20 px-6 py-4">
                    <p className="text-accent font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      💡 Tip: {marketTip}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 🍛 RECIPE BREAKDOWN */}
            <div className="mb-8">
              <Card className="bg-card border-border shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 border-b border-border">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <span className="text-3xl">🍛</span>
                    Recipe Cost Breakdown
                    <span className="block text-sm font-normal text-primary/80 font-serif ml-2">("पाककृती खर्च विश्लेषण")</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Tap a dish to see ingredient cost per plate
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Dish selector - big tap targets */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {costBreakdown.map((recipe) => (
                      <Button
                        key={recipe.name}
                        onClick={() => setSelectedDish(selectedDish === recipe.name ? null : recipe.name)}
                        variant={selectedDish === recipe.name ? 'default' : 'outline'}
                        className={`h-24 flex flex-col items-center justify-center gap-2 text-lg ${selectedDish === recipe.name
                          ? 'bg-primary text-primary-foreground'
                          : 'border-2 border-border text-foreground hover:border-primary hover:text-primary'
                          }`}
                      >
                        <span className="text-3xl">{getEmojiForDish(recipe.name)}</span>
                        <span className="font-semibold">{recipe.name}</span>
                        <span className="text-sm opacity-80">₹{recipe.cost}/plate</span>
                      </Button>
                    ))}
                  </div>

                  {/* Selected recipe cost details */}
                  {selectedDish && (
                    <div className="bg-muted/50 rounded-xl p-6 animate-fade-in">
                      <div className="text-center p-4">
                        <p className="text-lg font-bold">Cost Breakdown for {selectedDish}</p>
                        <p className="text-muted-foreground">Estimated Cost: <span className="text-primary font-bold">₹{costBreakdown.find(c => c.name === selectedDish)?.cost}</span></p>
                        <p className="text-muted-foreground">Recommended Price: <span className="text-green-600 font-bold">₹{costBreakdown.find(c => c.name === selectedDish)?.recommendedPrice}</span></p>

                        {/* Ingredient Details List */}
                        <div className="mt-4 bg-background rounded-lg border border-border overflow-hidden">
                          <div className="grid grid-cols-3 bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                            <span className="text-left">Ingredient</span>
                            <span className="text-center">Qty</span>
                            <span className="text-right">Cost</span>
                          </div>
                          <div className="divide-y divide-border">
                            {costBreakdown.find(c => c.name === selectedDish)?.ingredients?.map((ing: any, idx: number) => (
                              <div key={idx} className="grid grid-cols-3 px-4 py-2 text-sm">
                                <span className="text-left font-medium">{ing.name}</span>
                                <span className="text-center text-muted-foreground">{ing.qty}</span>
                                <span className="text-right font-bold">₹{ing.cost}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 🍽️ DISH RECOMMENDATIONS */}
            <div className="mb-8">
              <Card className="bg-card border-border shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-accent/10 to-secondary/10 border-b border-border">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <span className="text-3xl">🍽️</span>
                    Easy Dish Recommendations
                    <span className="block text-sm font-normal text-primary/80 font-serif ml-2">("सोप्या पाककृतींच्या शिफारसी")</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Add these to your menu - no new equipment needed!
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{getEmojiForDish(rec.name)}</span>
                          <div>
                            <p className="text-lg font-bold text-foreground">
                              Add <span className="text-primary">{rec.name}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {rec.reason} • Est Cost: ₹{rec.estimatedCost}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-1">Quick Actions</h3>
              <p className="text-sm text-muted-foreground mb-4 font-serif">"जलद कृती" (Shortcuts)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <Card
                    key={index}
                    className="bg-card border-border p-6 cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-primary/20"
                    onClick={() => navigate(action.route)}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold mb-2 text-card-foreground">{action.title}</h4>
                    <p className="text-muted-foreground text-sm">{action.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
