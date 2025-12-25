import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Package, AlertTriangle, Plus, Edit, Trash2, TrendingUp, Leaf, Archive } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'good' | 'low' | 'critical';
  expiryDays: number;
  category: 'raw' | 'preserved'; // Bifurcation
  marathiName?: string;
}

const Inventory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState({ lowStock: [] as InventoryItem[], expiringSoon: [] as InventoryItem[] });

  // Fetch from backend
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/inventory');
        if (response.ok) {
          const data = await response.json();
          setItems(data.items);
          setAlerts(data.alerts);

          // Show toast for critical alerts
          if (data.alerts.expiringSoon.length > 0 || data.alerts.lowStock.length > 0) {
            // In a real app we might show a specific toast, but the red banner is enough
          }
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };
    fetchInventory();
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', expiryDays: '', category: 'raw' });

  const handleAddItem = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        const data = await response.json();
        setItems(prev => [...prev, data.item]);
        setNewItem({ name: '', quantity: '', unit: '', expiryDays: '', category: 'raw' });
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-700 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'पुरेसे (Sufficient)';
      case 'low': return 'कमी (Low)';
      case 'critical': return 'संपत आले (Critical)';
      default: return status;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto">
          <MobileSidebarTrigger />

          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 border-b border-border backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between pt-10 md:pt-0">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-foreground hover:bg-muted">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                      📦 Stock Inventory (मालसाठा)
                    </h1>
                    <p className="text-sm text-green-600 font-medium italic">"अन्न हे पूर्णब्रह्म" (Food is Divinity)</p>
                  </div>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New (नवीन जोडा)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card text-foreground border-border">
                    <DialogHeader>
                      <DialogTitle>नवीन वस्तू जोडा (Add New Item)</DialogTitle>
                    </DialogHeader>
                    {/* Simplified Form */}
                    <div className="space-y-4">
                      <div>
                        <Label>Item Name (वस्तूचे नाव)</Label>
                        <Input
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="bg-background border-border"
                          placeholder="उदा. बटाटा (e.g. Potato)"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Quantity (प्रमाण)</Label>
                          <Input
                            type="number"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                            className="bg-background border-border"
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <Label>Unit (एकक)</Label>
                          <Input
                            value={newItem.unit}
                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                            className="bg-background border-border"
                            placeholder="kg/L"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Expiry Days (खराब होण्याची मुदत)</Label>
                        <Input
                          type="number"
                          value={newItem.expiryDays}
                          onChange={(e) => setNewItem({ ...newItem, expiryDays: e.target.value })}
                          className="bg-background border-border"
                          placeholder="e.g. 5 (Default 30)"
                        />
                      </div>
                      <div>
                        <Label>Category (प्रकार)</Label>
                        <select
                          className="w-full p-2 rounded-md border border-border bg-background"
                          value={newItem.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                          <option value="raw">Raw Material (कच्चा माल)</option>
                          <option value="preserved">Dry/Pantry (कोरडा माल)</option>
                        </select>
                      </div>
                      <Button onClick={handleAddItem} className="w-full bg-primary hover:bg-primary/90">
                        Save (जतन करा)
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">

            {/* Simple Status Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="bg-green-50 border-green-200 p-4 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">एकूण वस्तू</p>
                  <p className="text-2xl font-bold text-green-700">{items.length}</p>
                </div>
              </Card>
              <Card className="bg-red-50 border-red-200 p-4 flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Alerts (Low Stock / Expiring)</p>
                  <p className="text-2xl font-bold text-red-700">{alerts.lowStock.length + alerts.expiringSoon.length}</p>
                </div>
              </Card>
            </div>

            {/* Main Bifurcation Tabs */}
            <Tabs defaultValue="raw" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                <TabsTrigger value="raw" className="text-lg">🥕 Raw Material (कच्चा माल)</TabsTrigger>
                <TabsTrigger value="preserved" className="text-lg">🥫 Dry/Pantry (कोरडा माल)</TabsTrigger>
              </TabsList>

              <TabsContent value="raw">
                <div className="grid grid-cols-1 gap-4">
                  {items.filter(i => i.category === 'raw').map(item => (
                    <ItemCard key={item.id} item={item} getStatusColor={getStatusColor} getStatusText={getStatusText} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="preserved">
                <div className="grid grid-cols-1 gap-4">
                  {items.filter(i => i.category === 'preserved').map(item => (
                    <ItemCard key={item.id} item={item} getStatusColor={getStatusColor} getStatusText={getStatusText} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

// Simplified Item Card Component for reusability
const ItemCard = ({ item, getStatusColor, getStatusText }: { item: InventoryItem, getStatusColor: any, getStatusText: any }) => (
  <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow border-l-4 border-l-primary/50">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.category === 'raw' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
        {item.category === 'raw' ? <Leaf className="h-6 w-6" /> : <Archive className="h-6 w-6" />}
      </div>
      <div>
        <h3 className="text-lg font-bold">
          {item.marathiName || item.name} <span className="text-sm font-normal text-muted-foreground">({item.name})</span>
        </h3>
        <p className="text-sm text-muted-foreground">Exp: {item.expiryDays} days</p>
      </div>
    </div>

    <div className="text-right">
      <p className="text-xl font-bold">{item.quantity} <span className="text-sm font-normal">{item.unit}</span></p>
      <Badge variant="outline" className={`${getStatusColor(item.status)} border rounded-md px-2 py-0.5 mt-1`}>
        {getStatusText(item.status)}
      </Badge>
    </div>
  </Card>
);

export default Inventory;
