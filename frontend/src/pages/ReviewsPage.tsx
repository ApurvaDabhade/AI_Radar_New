import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown, Filter, Download, QrCode, Smartphone } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';

const Reviews = () => {
  const navigate = useNavigate();

  const [showQRCode, setShowQRCode] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showMobileLink, setShowMobileLink] = useState(false);
  const [sentimentData, setSentimentData] = useState<{
    overall: {
      positive: number,
      neutral: number,
      negative: number,
      total: number,
      averageRating: number | null,
    },
    trends: {
      positive: number,
      neutral: number,
      negative: number,
    },
    categories: Array<{
      name: string,
      positive: number,
      neutral: number,
      negative: number,
      trend: number,
    }>,
  } | null>(null);

  // Mock recent reviews
  const recentReviews = [
    {
      id: 1,
      customer: 'Rajesh Kumar',
      rating: 5,
      date: '2 hours ago',
      comment: 'Excellent food! Paneer Tikka was perfect and service was very fast. Will come again!',
      sentiment: 'positive',
      category: 'Food Quality'
    },
    {
      id: 2,
      customer: 'Priya Sharma',
      rating: 4,
      date: '5 hours ago',
      comment: 'Good food but a bit expensive. Taste was great but portion could be larger.',
      sentiment: 'neutral',
      category: 'Value for Money'
    },
    {
      id: 3,
      customer: 'Amit Singh',
      rating: 2,
      date: '1 day ago',
      comment: 'Service was very slow today. Had to wait 45 minutes. Food was cold.',
      sentiment: 'negative',
      category: 'Service Speed'
    },
    {
      id: 4,
      customer: 'Sneha Patel',
      rating: 5,
      date: '1 day ago',
      comment: 'Very clean place. Staff was very polite. Delicious food!',
      sentiment: 'positive',
      category: 'Staff Behavior'
    },
  ];

  useEffect(() => {
    // Mock data for sentiment analysis
    const mockData = {
      overall: {
        positive: 68,
        neutral: 22,
        negative: 10,
        total: 156,
        averageRating: 4.2,
      },
      trends: {
        positive: 5,
        neutral: -2,
        negative: -3,
      },
      categories: [
        { name: 'Food Quality', positive: 75, neutral: 18, negative: 7, trend: 8 },
        { name: 'Service Speed', positive: 55, neutral: 25, negative: 20, trend: -5 },
        { name: 'Staff Behavior', positive: 80, neutral: 15, negative: 5, trend: 12 },
        { name: 'Cleanliness', positive: 72, neutral: 20, negative: 8, trend: 3 },
      ],
    };

    setSentimentData(mockData);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-accent';
      case 'negative': return 'text-destructive';
      default: return 'text-secondary';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-accent';
      case 'negative': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-accent" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <div className="h-4 w-4" />;
  };

  const handleFilter = () => setShowFilter(!showFilter);

  const handleExport = () => {
    if (!sentimentData) return;

    const csvData = [
      ['Category', 'Positive %', 'Neutral %', 'Negative %', 'Trend'],
      ...sentimentData.categories.map(cat => [
        cat.name,
        cat.positive,
        cat.neutral,
        cat.negative,
        cat.trend
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentiment-analysis-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleMobileLink = () => setShowMobileLink(!showMobileLink);

  if (sentimentData === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto">
          <MobileSidebarTrigger />

          {/* Header */}
          <div className="sticky top-0 z-40 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between pt-10 md:pt-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className="text-foreground hover:bg-primary/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-primary">⭐ Customer Reviews</h1>
                  <p className="text-xs text-muted-foreground">Sentiment Analysis</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-primary/10"
                    onClick={handleFilter}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-primary/10"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border-accent/30 shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Positive Reviews</p>
                    <p className="text-2xl font-bold text-accent">{sentimentData.overall.positive}%</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(sentimentData.trends.positive)}
                      <span className="text-xs text-accent ml-1">+{sentimentData.trends.positive}%</span>
                    </div>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-accent" />
                </CardContent>
              </Card>

              <Card className="bg-card border-secondary/30 shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Neutral Reviews</p>
                    <p className="text-2xl font-bold text-secondary">{sentimentData.overall.neutral}%</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(sentimentData.trends.neutral)}
                      <span className="text-xs text-secondary ml-1">{sentimentData.trends.neutral}%</span>
                    </div>
                  </div>
                  <MessageSquare className="h-8 w-8 text-secondary" />
                </CardContent>
              </Card>

              <Card className="bg-card border-destructive/30 shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Negative Reviews</p>
                    <p className="text-2xl font-bold text-destructive">{sentimentData.overall.negative}%</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(sentimentData.trends.negative)}
                      <span className="text-xs text-destructive ml-1">{sentimentData.trends.negative}%</span>
                    </div>
                  </div>
                  <ThumbsDown className="h-8 w-8 text-destructive" />
                </CardContent>
              </Card>

              <Card className="bg-card border-primary/30 shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold text-primary">
                      {sentimentData.overall.averageRating !== null ? sentimentData.overall.averageRating : '-'} / 5
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-secondary fill-current" />
                      <span className="text-xs text-muted-foreground ml-1">{sentimentData.overall.total} reviews</span>
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-secondary" />
                </CardContent>
              </Card>
            </div>

            {/* QR Code Feedback Collection Section */}
            <Card className="bg-card border-primary/30 mb-8 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <QrCode className="h-8 w-8 text-primary mr-3" />
                      <h3 className="text-2xl font-bold text-foreground">Quick Feedback</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Easy feedback via QR code. Customers can scan and review instantly!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">QR Codes Created</div>
                        <div className="text-lg font-bold text-primary">24</div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Scans This Week</div>
                        <div className="text-lg font-bold text-accent">156</div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Response Rate</div>
                        <div className="text-lg font-bold text-secondary">68%</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => setShowQRCode(!showQRCode)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        {showQRCode ? 'Hide' : 'Create QR'}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-border text-foreground hover:bg-primary/10"
                        onClick={handleMobileLink}
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Mobile Link
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filter Panel */}
            {showFilter && (
              <Card className="bg-card border-border mb-6 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Filter Options</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setShowFilter(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Time Period</label>
                      <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground">
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Sentiment</label>
                      <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground">
                        <option value="all">All</option>
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                      <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground">
                        <option value="all">All</option>
                        <option value="food">Food Quality</option>
                        <option value="service">Service Speed</option>
                        <option value="cleanliness">Cleanliness</option>
                        <option value="staff">Staff Behavior</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button className="bg-primary hover:bg-primary/90">
                      Apply Filter
                    </Button>
                    <Button variant="outline" className="border-border text-foreground">
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs Content */}
            <Tabs defaultValue="reviews" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  📝 Recent Reviews
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  📊 Category Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reviews" className="space-y-4">
                {recentReviews.map((review) => (
                  <Card key={review.id} className="bg-card border-border shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-foreground">{review.customer}</h4>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-secondary fill-current' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                          <Badge className={getSentimentBg(review.sentiment)}>
                            {review.sentiment === 'positive' ? '👍' : review.sentiment === 'negative' ? '👎' : '😐'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{review.comment}</p>
                      <Badge variant="outline" className="text-primary border-primary">
                        {review.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sentimentData.categories.map((category, index) => (
                    <Card key={index} className="bg-card border-border shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-foreground">{category.name}</h4>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(category.trend)}
                            <span className={category.trend > 0 ? 'text-accent' : 'text-destructive'}>
                              {category.trend > 0 ? '+' : ''}{category.trend}%
                            </span>
                          </div>
                        </div>

                        {/* Progress bars */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-accent">Positive</span>
                              <span className="text-accent">{category.positive}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${category.positive}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-secondary">Neutral</span>
                              <span className="text-secondary">{category.neutral}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-secondary rounded-full" style={{ width: `${category.neutral}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-destructive">Negative</span>
                              <span className="text-destructive">{category.negative}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-destructive rounded-full" style={{ width: `${category.negative}%` }} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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

export default Reviews;
