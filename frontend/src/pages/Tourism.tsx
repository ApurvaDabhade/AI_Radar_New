import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, TrendingUp, Bell, ChefHat } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';

const Tourism = () => {
  const navigate = useNavigate();

  const touristHotspots = [
    { name: 'Gateway of India', distance: '2.5 km', footfall: 'Very High', trend: '+35%' },
    { name: 'Marine Drive', distance: '3.1 km', footfall: 'Very High', trend: '+42%' },
    { name: 'Colaba Market', distance: '1.8 km', footfall: 'Medium', trend: '+18%' },
  ];

  const upcomingEvents = [
    { name: 'Ganesh Chaturthi', date: 'Sep 7-17', impact: 'Very High', preparation: '15 days' },
    { name: 'Navratri', date: 'Oct 3-12', impact: 'High', preparation: '20 days' },
    { name: 'Diwali', date: 'Nov 1', impact: 'Very High', preparation: '25 days' },
  ];

  const trendingItems = [
    { item: 'Vada Pav', demand: '↑ 45%', reason: 'Tourist favorite' },
    { item: 'Masala Chai', demand: '↑ 38%', reason: 'Cold weather coming' },
    { item: 'Pav Bhaji', demand: '↑ 32%', reason: 'Evening demand' },
    { item: 'Coconut Water', demand: '↑ 28%', reason: 'Tourist preference' },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto">
          <MobileSidebarTrigger />

          {/* Header */}
          <header className="sticky top-0 z-40 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between pt-10 md:pt-0">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className="text-foreground hover:bg-primary/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-primary">🗺️ Tourism Insights</h1>
                  <p className="text-sm text-muted-foreground">Visitor traffic and opportunities</p>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Visitor Traffic Forecast */}
            <section className="animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <Users className="h-6 w-6 text-primary" />
                Visitor Traffic
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {touristHotspots.map((spot, index) => (
                  <Card
                    key={index}
                    className="bg-card border-border p-6 card-hover shadow-lg hover:shadow-primary/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{spot.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {spot.distance}
                        </p>
                      </div>
                      <Badge className={
                        spot.footfall === 'Very High' ? 'bg-accent' :
                          spot.footfall === 'High' ? 'bg-primary' :
                            'bg-secondary'
                      }>
                        {spot.footfall}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-accent font-bold">{spot.trend}</span>
                      <span className="text-muted-foreground text-sm">from last week</span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Upcoming Events */}
            <section className="animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <Calendar className="h-6 w-6 text-secondary" />
                Upcoming Festivals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingEvents.map((event, index) => (
                  <Card
                    key={index}
                    className="bg-card border-border p-6 card-hover shadow-lg hover:shadow-secondary/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="h-5 w-5 text-secondary" />
                      <h3 className="text-lg font-bold text-foreground">{event.name}</h3>
                    </div>
                    <p className="text-muted-foreground mb-2">📅 {event.date}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Business Impact:</span>
                      <Badge className={
                        event.impact === 'Very High' ? 'bg-destructive' :
                          'bg-secondary'
                      }>
                        {event.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-primary">⏱️ Prepare in {event.preparation}</p>
                    <Button
                      className="w-full mt-4 bg-secondary hover:bg-secondary/90"
                    >
                      <ChefHat className="h-4 w-4 mr-2" />
                      Prepare Menu
                    </Button>
                  </Card>
                ))}
              </div>
            </section>

            {/* Trending Items */}
            <section className="animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <TrendingUp className="h-6 w-6 text-accent" />
                What Tourists Want
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingItems.map((item, index) => (
                  <Card
                    key={index}
                    className="bg-card border-border p-6 card-hover shadow-lg hover:shadow-accent/10"
                  >
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.item}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-accent">{item.demand}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{item.reason}</p>
                    <Button
                      size="sm"
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      Add to Menu
                    </Button>
                  </Card>
                ))}
              </div>
            </section>

            {/* Smart Recommendations */}
            <section className="animate-fade-in-up">
              <Card className="bg-card border-primary/30 p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-primary p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-foreground">Smart Suggestions</h3>
                    <p className="text-muted-foreground mb-4">
                      Based on tourist preferences and upcoming Ganesh Chaturthi, you should prepare:
                      <strong className="text-primary"> Modak, Coconut Barfi, and Festival Thali</strong>
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-primary">+60% demand expected</Badge>
                      <Badge className="bg-secondary">Peak: Sep 7-10</Badge>
                      <Badge className="bg-accent">High profit</Badge>
                    </div>
                    <div className="flex gap-3">
                      <Button className="bg-primary hover:bg-primary/90">
                        Apply Suggestion
                      </Button>
                      <Button variant="outline" className="border-border text-foreground hover:bg-primary/10">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Tourism;
