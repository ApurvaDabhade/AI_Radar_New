import { useNavigate } from 'react-router-dom';
import { IndianRupee, FileText, Image as ImageIcon, Minus, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';

const RasoiHome = () => {
  const navigate = useNavigate();

  const mainActions = [
    {
      icon: Plus,
      title: 'आज की बिक्री डालें',
      subtitle: 'Enter Today\'s Sales',
      color: 'bg-primary hover:bg-primary/90',
      action: () => navigate('/sales-tracker?tab=sales'),
    },
    {
      icon: Minus,
      title: 'आज का खर्च डालें',
      subtitle: 'Enter Today\'s Expense',
      color: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
      action: () => navigate('/sales-tracker?tab=expense'),
    },
    {
      icon: Eye,
      title: 'नफ़ा देखें',
      subtitle: 'See Profit',
      color: 'bg-accent hover:bg-accent/90',
      action: () => navigate('/sales-tracker?tab=profit'),
    },
    {
      icon: FileText,
      title: 'लाइसेंस सहायता',
      subtitle: 'License Help',
      color: 'bg-muted hover:bg-muted/80 text-foreground border-2 border-border',
      action: () => navigate('/license-help'),
    },
    {
      icon: ImageIcon,
      title: 'पोस्टर बनाएं',
      subtitle: 'Make Poster',
      color: 'bg-muted hover:bg-muted/80 text-foreground border-2 border-border',
      action: () => navigate('/poster-maker'),
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 p-4 md:p-8">
          <MobileSidebarTrigger />
          
          {/* Header */}
          <div className="text-center mb-8 pt-12 md:pt-0">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-5xl">🍛</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              रसोई मित्र
            </h1>
            <p className="text-muted-foreground text-lg">
              आपका व्यापार साथी
            </p>
            <p className="text-muted-foreground/70 text-sm">
              Your Business Partner
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="max-w-md mx-auto space-y-4">
            {mainActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`w-full h-20 text-xl font-bold rounded-2xl shadow-lg transition-all duration-200 active:scale-95 ${action.color}`}
              >
                <action.icon className="h-8 w-8 mr-4" />
                <div className="flex flex-col items-start">
                  <span>{action.title}</span>
                  <span className="text-xs font-normal opacity-80">{action.subtitle}</span>
                </div>
              </Button>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-muted-foreground text-sm">
            <p>🙏 आसान • तेज़ • भरोसेमंद</p>
            <p className="text-xs mt-1">Simple • Fast • Reliable</p>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default RasoiHome;
