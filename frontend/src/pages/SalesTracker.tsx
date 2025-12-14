import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Check, Plus, TrendingUp, TrendingDown, Receipt, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const saleCategories = [
  { id: 'cash', label: 'Cash', emoji: '💵' },
  { id: 'upi', label: 'UPI/Online', emoji: '📱' },
  { id: 'card', label: 'Card', emoji: '💳' },
];

const expenseCategories = [
  { id: 'vegetables', label: 'Vegetables', emoji: '🥬' },
  { id: 'gas', label: 'Gas/Fuel', emoji: '⛽' },
  { id: 'packaging', label: 'Packaging', emoji: '📦' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'rent', label: 'Rent', emoji: '🏠' },
  { id: 'other', label: 'Other', emoji: '📝' },
];

const quickAmounts = [50, 100, 200, 500, 1000, 2000];

interface Transaction {
  id: string;
  type: 'sale' | 'expense';
  amount: number;
  category: string;
  timestamp: Date;
  note?: string;
}

const SalesTracker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'sale' | 'expense'>('sale');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [note, setNote] = useState('');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/finances');
      if (res.ok) {
        const data = await res.json();
        const txns = data.map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) }));
        setTransactions(txns);
        calculateTodayTotals(txns);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  const calculateTodayTotals = (txns: Transaction[]) => {
    const todayStr = new Date().toDateString();
    const todayTxns = txns.filter(t => t.timestamp.toDateString() === todayStr);

    const sales = todayTxns.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
    const expenses = todayTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    setTodaySales(sales);
    setTodayExpense(expenses);
  };

  const handleQuickAmount = (amt: number) => {
    setAmount(amt.toString());
  };

  const handleSubmit = async () => {
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      toast({ title: '⚠️ Invalid Amount', description: 'Please enter a valid amount' });
      return;
    }

    if (!selectedCategory) {
      toast({ title: '⚠️ Select Category', description: 'Please select a category' });
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: addType,
          amount: amtNum,
          category: selectedCategory,
          note: note
        })
      });

      if (res.ok) {
        await fetchTransactions(); // Refresh list
        toast({
          title: addType === 'sale' ? '✅ Sale Added!' : '✅ Expense Added!',
          description: `₹${amtNum} recorded successfully`
        });

        // Reset form
        setAmount('');
        setSelectedCategory('');
        setNote('');
        setShowAddModal(false);
      } else {
        toast({ variant: "destructive", title: 'Error', description: 'Failed to save transaction' });
      }

    } catch (error) {
      toast({ variant: "destructive", title: 'Connection Error', description: 'Could not connect to server' });
    }
  };

  const handleExport = () => {
    window.open('http://localhost:5001/api/finances/export', '_blank');
  };

  const profit = todaySales - todayExpense;
  const transactionCount = transactions.filter(t =>
    new Date(t.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <MobileSidebarTrigger />

          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-12 md:pt-0">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  💰 Sales & Expense Tracker
                </h1>
                <p className="text-sm text-muted-foreground">Track your daily business 📊</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="hidden md:flex bg-green-600 hover:bg-green-700 text-white border-green-700">
              <Receipt className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" size="icon" onClick={handleExport} className="flex md:hidden bg-green-600 hover:bg-green-700 text-white border-green-700">
              <Receipt className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Period Tabs */}
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className={`flex-1 h-12 rounded-lg ${activeTab === tab.id
                    ? 'bg-card shadow-md text-card-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-accent/10 border-accent/30">
                <CardContent className="p-4 text-center">
                  <span className="text-2xl">💵</span>
                  <p className="text-xs text-muted-foreground mt-1">Total Sale</p>
                  <p className="text-xl font-bold text-accent">₹{todaySales}</p>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/30">
                <CardContent className="p-4 text-center">
                  <span className="text-2xl">📉</span>
                  <p className="text-xs text-muted-foreground mt-1">Total Expense</p>
                  <p className="text-xl font-bold text-destructive">₹{todayExpense}</p>
                </CardContent>
              </Card>
              <Card className={`${profit >= 0 ? 'bg-accent/10 border-accent/30' : 'bg-destructive/10 border-destructive/30'}`}>
                <CardContent className="p-4 text-center">
                  <span className="text-2xl">🟢</span>
                  <p className="text-xs text-muted-foreground mt-1">Net Profit</p>
                  <p className={`text-xl font-bold ${profit >= 0 ? 'text-accent' : 'text-destructive'}`}>₹{profit}</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/10 border-secondary/30">
                <CardContent className="p-4 text-center">
                  <span className="text-2xl">📝</span>
                  <p className="text-xs text-muted-foreground mt-1">Transactions</p>
                  <p className="text-xl font-bold text-secondary">{transactionCount}</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => { setAddType('sale'); setShowAddModal(true); }}
                className="h-16 text-lg font-bold rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Sale
              </Button>
              <Button
                onClick={() => { setAddType('expense'); setShowAddModal(true); }}
                variant="outline"
                className="h-16 text-lg font-bold rounded-xl border-destructive text-destructive hover:bg-destructive/10"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Expense
              </Button>
            </div>

            {/* Peak Hours Insight */}
            <Card className="bg-primary/10 border-primary/30 shadow-lg">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peak Hours Insight</p>
                  <p className="font-semibold text-foreground">12 PM - 2 PM sees maximum sales 🍽️🔥</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">📋 Recent Transactions</h3>
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No transactions yet. Add your first sale!</p>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((txn) => {
                      const catData = txn.type === 'sale'
                        ? saleCategories.find(c => c.id === txn.category)
                        : expenseCategories.find(c => c.id === txn.category);

                      return (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{catData?.emoji || '💰'}</span>
                            <div>
                              <p className="font-medium text-card-foreground">{catData?.label || txn.category}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <span className={`font-bold text-lg ${txn.type === 'sale' ? 'text-accent' : 'text-destructive'
                            }`}>
                            {txn.type === 'sale' ? '+' : '-'}₹{txn.amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Entry Modal */}
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">
                  {addType === 'sale' ? '📈 Add Sale' : '📉 Add Expense'}
                </DialogTitle>
              </DialogHeader>

              {/* Type Tabs */}
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                <Button
                  onClick={() => { setAddType('sale'); setSelectedCategory(''); }}
                  className={`flex-1 h-12 rounded-lg ${addType === 'sale'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-muted'
                    }`}
                >
                  Sale
                </Button>
                <Button
                  onClick={() => { setAddType('expense'); setSelectedCategory(''); }}
                  className={`flex-1 h-12 rounded-lg ${addType === 'expense'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-muted'
                    }`}
                >
                  Expense
                </Button>
              </div>

              {/* Amount Input */}
              <div className="relative">
                <IndianRupee className={`absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 ${addType === 'sale' ? 'text-accent' : 'text-destructive'
                  }`} />
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-16 text-2xl pl-12 text-center font-bold rounded-xl bg-muted border-border"
                />
              </div>

              {/* Quick Amounts */}
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    onClick={() => handleQuickAmount(amt)}
                    className={`h-12 rounded-xl border-border text-foreground hover:bg-muted ${amount === amt.toString() ? 'bg-muted' : ''
                      }`}
                  >
                    ₹{amt}
                  </Button>
                ))}
              </div>

              {/* Category Selection */}
              <div>
                <p className="text-sm font-medium mb-2 text-foreground">Select Category</p>
                <div className="grid grid-cols-3 gap-2">
                  {(addType === 'sale' ? saleCategories : expenseCategories).map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`h-16 flex-col rounded-xl ${selectedCategory === cat.id
                        ? addType === 'sale'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-destructive text-destructive-foreground'
                        : 'border-border text-foreground hover:bg-muted'
                        }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-xs mt-1">{cat.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <Input
                placeholder="Add a note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-12 rounded-xl bg-muted border-border"
              />

              {/* Save Button */}
              <Button
                onClick={handleSubmit}
                className={`w-full h-14 text-lg font-bold rounded-xl ${addType === 'sale'
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                  : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  }`}
              >
                <Check className="h-5 w-5 mr-2" />
                Save Entry
              </Button>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SalesTracker;
