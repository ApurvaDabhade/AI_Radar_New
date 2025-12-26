import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, TrendingUp, Bell, ChefHat, Loader2 } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';

const Tourism = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Retrieve vendor location from localStorage
        const userStr = localStorage.getItem('user');
        let city = 'Mumbai';
        let state = 'Maharashtra';

        if (userStr) {
          try {
            const user = JSON.parse(userStr);

            // Parse single 'location' string from registration (e.g. "Pune, Maharashtra")
            if (user.location) {
              const parts = user.location.split(',').map((s: string) => s.trim());
              if (parts.length >= 2) {
                city = parts[0];
                state = parts[1];
              } else if (parts.length === 1 && parts[0]) {
                city = parts[0];
                // Keep default state 'Maharashtra' if not provided, or prompt user in real app
              }
            }
            console.log(`📍 Using vendor location: ${city}, ${state}`);
          } catch (e) {
            console.warn("Error parsing user data for location", e);
          }
        }

        const response = await fetch('http://localhost:8000/api/tourism', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            city: city,
            state: state,
            date: today,
          }),
        });
        const result = await response.json();
        if (!result.error) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch tourism data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : data ? (
              <>
                {/* Visitor Traffic Forecast */}
                <section className="animate-fade-in-up">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
                    <Users className="h-6 w-6 text-primary" />
                    Visitor Traffic (Top Spots)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.Top_Tourist_Spots?.map((spot: any, index: number) => (
                      <Card
                        key={index}
                        className="bg-card border-border p-6 card-hover shadow-lg hover:shadow-primary/10"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{spot['Name Place']}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              Rank: {spot['Rank_in_City']}
                            </p>
                          </div>
                          <Badge className="bg-primary">
                            Rating: {spot['Rating']}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-accent" />
                          <span className="text-accent font-bold">High Footfall</span>
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
                  {data.Upcoming_Events && data.Upcoming_Events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {data.Upcoming_Events.map((event: any, index: number) => (
                        <Card
                          key={index}
                          className="bg-card border-border p-6 card-hover shadow-lg hover:shadow-secondary/10"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Bell className="h-5 w-5 text-secondary" />
                            <h3 className="text-lg font-bold text-foreground">{event.event}</h3>
                          </div>
                          <p className="text-muted-foreground mb-2">📅 {event.date}</p>
                          <p className="text-sm text-primary">In {event.days_away} days</p>
                          <Button
                            className="w-full mt-4 bg-secondary hover:bg-secondary/90"
                          >
                            <ChefHat className="h-4 w-4 mr-2" />
                            Plan Menu
                          </Button>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No upcoming festivals in the next 30 days.</p>
                  )}
                </section>

                {/* Trending Items (Mock for now, can be linked to trends API) */}
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

                {/* Smart Recommendations (AI) */}
                <section className="animate-fade-in-up">
                  <Card className="bg-card border-primary/30 p-8 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-foreground">Smart Suggestions (AI)</h3>
                        <div className="text-muted-foreground mb-4 whitespace-pre-line leading-relaxed">
                          {data.AI_Insights}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className="bg-primary">Weather: {data['Temp(°C)']}°C, {data['Conditions']}</Badge>
                          <Badge className="bg-secondary">Season: {data['Season']}</Badge>
                        </div>
                        <div className="flex gap-3">
                          <Button className="bg-primary hover:bg-primary/90">
                            Apply Suggestion
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              </>
            ) : (
              <div className="text-center text-red-500">Failed to load data. API might be down.</div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Tourism;
