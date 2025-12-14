import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Image as ImageIcon, Share2, Copy, Sparkles, Play, ExternalLink, Phone, Instagram, Youtube, Lightbulb, Menu as MenuIcon, Film, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const templateCategories = [
  { id: 'festival', label: 'Festival', emoji: '🎉' },
  { id: 'offers', label: 'Offers', emoji: '💸' },
  { id: 'food', label: 'Food Items', emoji: '🍽️' },
  { id: 'menu', label: 'Menu', emoji: '📋' },
  { id: 'special', label: 'Special of the Day', emoji: '⭐' },
];

const colorThemes = [
  { id: 'orange', color: 'hsl(30, 90%, 50%)', label: 'Orange' },
  { id: 'red', color: 'hsl(0, 70%, 50%)', label: 'Red' },
  { id: 'green', color: 'hsl(140, 50%, 40%)', label: 'Green' },
  { id: 'white', color: 'hsl(0, 0%, 95%)', label: 'White' },
  { id: 'black', color: 'hsl(0, 0%, 15%)', label: 'Black' },
];

const autoCaptions = [
  "🔥 Fresh & Delicious! Order now! 🍛 #FoodLovers #LocalVendor #TastyFood",
  "✨ Today's Special - Don't Miss Out! 🎉 #DailySpecial #FreshFood #OrderNow",
  "🌟 Made with Love, Served with Care! ❤️ #HomemadeFood #LocalBusiness #Yummy",
];

// Food bloggers data
const localBloggers = [
  { name: 'Street Food Stories', platform: 'Instagram', followers: '50K', contact: '+91 98765 43210', handle: '@streetfoodstories' },
  { name: 'Mumbai Food Vlogger', platform: 'YouTube', followers: '120K', contact: '+91 87654 32109', handle: '@mumbaifoodvlog' },
  { name: 'Desi Khana Reviews', platform: 'Instagram', followers: '35K', contact: '+91 76543 21098', handle: '@desikhanareviews' },
];

// Daily tips
const dailyTips = [
  "💡 Offer a combo deal during lunch hours (12-2 PM) for more sales",
  "📱 Post food photos at 7 PM - that's when people decide dinner",
  "🎉 Festival week = best time for special offers, start preparing now!",
];

const PosterMaker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('poster');
  const [selectedCategory, setSelectedCategory] = useState('festival');
  const [selectedTheme, setSelectedTheme] = useState('orange');
  const [businessName, setBusinessName] = useState('');
  const [offerText, setOfferText] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [tagline, setTagline] = useState('');
  const [imageUploaded, setImageUploaded] = useState(false);
  const [posterReady, setPosterReady] = useState(false);

  const handleImageUpload = () => {
    setTimeout(() => {
      setImageUploaded(true);
      toast({ title: '✅ Photo Uploaded!', description: 'Your dish photo is ready' });
    }, 500);
  };

  const handleGeneratePoster = () => {
    if (!businessName || !price) {
      toast({ title: '⚠️ Required Fields', description: 'Please enter business name and price' });
      return;
    }
    setPosterReady(true);
    toast({ title: '🎨 Poster Ready!', description: 'Your poster is ready to download' });
  };

  const handleDownload = () => {
    toast({ title: '📥 Downloading...', description: 'Your poster is being downloaded' });
  };

  const handleShare = (platform: string) => {
    toast({ title: `📤 Sharing to ${platform}`, description: 'Opening share dialog...' });
  };

  const handleCopyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast({ title: '📋 Copied!', description: 'Caption copied to clipboard' });
  };

  const handleContactBlogger = (blogger: typeof localBloggers[0]) => {
    toast({ title: '📞 Contact Info', description: `Call ${blogger.name}: ${blogger.contact}` });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <MobileSidebarTrigger />

          {/* Header */}
          <div className="flex items-center gap-4 mb-6 pt-12 md:pt-0">
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
                🚀 Grow Your Business
              </h1>
              <p className="text-sm text-muted-foreground">Marketing tools & business growth</p>
            </div>
          </div>

          {/* Grow Your Business Banner */}
          <Card className="bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 mb-6 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Good Evening! 👋 Ready to grow?
                  </h2>
                  <p className="text-muted-foreground">
                    Improve your online presence and earn more customers
                  </p>
                </div>
                <span className="text-6xl hidden md:block">📈</span>
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-muted">
              <TabsTrigger value="poster" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                🎨 Poster
              </TabsTrigger>
              <TabsTrigger value="platforms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                🌐 Platforms
              </TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                🧰 Tools
              </TabsTrigger>
              <TabsTrigger value="tips" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                💡 Tips
              </TabsTrigger>
            </TabsList>

            {/* POSTER MAKER TAB */}
            <TabsContent value="poster" className="space-y-6">
              {!posterReady ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Template Categories */}
                  <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-3 text-card-foreground">📂 Select Template</h3>
                      <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex gap-3">
                          {templateCategories.map((cat) => (
                            <Button
                              key={cat.id}
                              variant={selectedCategory === cat.id ? 'default' : 'outline'}
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`flex-shrink-0 h-16 px-6 rounded-xl ${selectedCategory === cat.id
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                : 'border-border text-foreground hover:bg-muted'
                                }`}
                            >
                              <span className="text-2xl mr-2">{cat.emoji}</span>
                              {cat.label}
                            </Button>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: Form */}
                    <Card className="bg-card border-primary/30 shadow-lg">
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-card-foreground">✏️ Customize Your Poster</h3>

                        {/* Image Upload */}
                        <Button
                          onClick={handleImageUpload}
                          variant={imageUploaded ? 'secondary' : 'outline'}
                          className={`w-full h-20 rounded-xl border-2 border-dashed ${imageUploaded
                            ? 'bg-accent/10 border-accent'
                            : 'border-primary/50 hover:bg-primary/5'
                            }`}
                        >
                          {imageUploaded ? (
                            <div className="flex items-center text-accent">
                              <span className="text-2xl mr-3">✅</span>
                              <span>Photo Uploaded</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-muted-foreground">
                              <ImageIcon className="h-6 w-6 mr-3" />
                              <span>Upload Food Photo</span>
                            </div>
                          )}
                        </Button>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-muted-foreground">
                            🏪 Business Name *
                          </label>
                          <Input
                            placeholder="e.g. Sharma's Kitchen"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="h-12 rounded-xl bg-muted border-border"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-muted-foreground">
                            🎁 Offer Text
                          </label>
                          <Input
                            placeholder="e.g. 20% OFF Today!"
                            value={offerText}
                            onChange={(e) => setOfferText(e.target.value)}
                            className="h-12 rounded-xl bg-muted border-border"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-muted-foreground">
                            💰 Price *
                          </label>
                          <Input
                            type="number"
                            placeholder="₹ 99"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="h-12 rounded-xl bg-muted border-border"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-muted-foreground">
                            📍 Address
                          </label>
                          <Input
                            placeholder="e.g. Near Railway Station"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="h-12 rounded-xl bg-muted border-border"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-muted-foreground">
                            ✨ Tagline
                          </label>
                          <Input
                            placeholder="e.g. Taste the tradition!"
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                            className="h-12 rounded-xl bg-muted border-border"
                          />
                        </div>

                        {/* Color Themes */}
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-muted-foreground">
                            🎨 Color Theme
                          </label>
                          <div className="flex gap-2">
                            {colorThemes.map((theme) => (
                              <button
                                key={theme.id}
                                onClick={() => setSelectedTheme(theme.id)}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${selectedTheme === theme.id ? 'border-primary scale-110' : 'border-transparent'
                                  }`}
                                style={{ backgroundColor: theme.color }}
                                title={theme.label}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Right: Preview */}
                    <Card className="bg-card border-secondary/30 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-card-foreground">👁️ Live Preview</h3>

                        <div className="border-4 border-primary/30 rounded-2xl overflow-hidden shadow-xl">
                          <div
                            className="p-6 text-center"
                            style={{
                              background: `linear-gradient(135deg, ${colorThemes.find(t => t.id === selectedTheme)?.color || 'hsl(30, 90%, 50%)'}, hsl(45, 85%, 55%))`
                            }}
                          >
                            <div className="bg-card/90 backdrop-blur rounded-xl p-4">
                              <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center border border-border">
                                {imageUploaded ? (
                                  <span className="text-5xl">🍛</span>
                                ) : (
                                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                )}
                              </div>

                              <h4 className="text-xl font-bold text-card-foreground">
                                {businessName || 'Your Business Name'}
                              </h4>

                              {offerText && (
                                <Badge className="mt-2 bg-destructive text-destructive-foreground">
                                  {offerText}
                                </Badge>
                              )}

                              <p className="text-3xl font-bold text-primary mt-2">
                                ₹{price || '99'}
                              </p>

                              {tagline && (
                                <p className="text-sm text-muted-foreground mt-1 italic">
                                  "{tagline}"
                                </p>
                              )}

                              {address && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  📍 {address}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleGeneratePoster}
                          className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                        >
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generate Poster
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                /* Poster Ready View */
                <div className="max-w-md mx-auto space-y-6">
                  <Card className="border-4 border-primary overflow-hidden shadow-2xl">
                    <div
                      className="p-6"
                      style={{
                        background: `linear-gradient(135deg, ${colorThemes.find(t => t.id === selectedTheme)?.color || 'hsl(30, 90%, 50%)'}, hsl(45, 85%, 55%))`
                      }}
                    >
                      <div className="bg-card rounded-xl p-6">
                        <div className="w-full h-40 bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 flex items-center justify-center border border-border">
                          <span className="text-6xl">🍛</span>
                        </div>

                        <h3 className="text-2xl font-bold text-center text-card-foreground mb-2">
                          {businessName}
                        </h3>

                        {offerText && (
                          <div className="text-center mb-2">
                            <Badge className="bg-destructive text-destructive-foreground text-lg px-4 py-1">
                              {offerText}
                            </Badge>
                          </div>
                        )}

                        <p className="text-4xl font-bold text-center text-primary mb-2">
                          ₹{price}
                        </p>

                        {tagline && (
                          <p className="text-center text-muted-foreground italic mb-2">
                            "{tagline}"
                          </p>
                        )}

                        {address && (
                          <p className="text-center text-muted-foreground text-sm">
                            📍 {address}
                          </p>
                        )}

                        <div className="mt-4 pt-4 border-t border-border text-center">
                          <p className="text-xs text-muted-foreground">Made with RasoiMitra 🍛</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownload}
                      className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Poster
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleShare('WhatsApp')}
                        variant="outline"
                        className="h-12 rounded-xl border-accent text-accent hover:bg-accent/10"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        onClick={() => handleShare('Instagram')}
                        variant="outline"
                        className="h-12 rounded-xl border-secondary text-secondary hover:bg-secondary/10"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                    </div>

                    <Button
                      onClick={() => setPosterReady(false)}
                      variant="ghost"
                      className="w-full"
                    >
                      ← Create Another Poster
                    </Button>
                  </div>

                  {/* Auto Captions */}
                  <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-3 text-card-foreground">📝 Ready-to-Use Captions</h3>
                      <div className="space-y-3">
                        {autoCaptions.map((caption, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-3 p-3 bg-muted rounded-xl"
                          >
                            <p className="text-sm text-muted-foreground flex-1">{caption}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyCaption(caption)}
                              className="flex-shrink-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* JOIN ONLINE PLATFORMS TAB */}
            <TabsContent value="platforms" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Zomato Card */}
                <Card className="bg-card border-border shadow-xl overflow-hidden">
                  <CardHeader className="bg-red-500/10 border-b border-border">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <span className="text-3xl">🍽️</span>
                      Join Zomato
                    </CardTitle>
                    <CardDescription>
                      Get more customers through online orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="aspect-video bg-muted rounded-xl mb-4 flex items-center justify-center border border-border">
                      <div className="text-center">
                        <Play className="h-16 w-16 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Watch: How to join Zomato</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p>✅ Step 1: Register with your PAN & FSSAI</p>
                      <p>✅ Step 2: Upload your menu with photos</p>
                      <p>✅ Step 3: Start receiving orders!</p>
                    </div>
                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Register on Zomato
                    </Button>
                  </CardContent>
                </Card>

                {/* Swiggy Card */}
                <Card className="bg-card border-border shadow-xl overflow-hidden">
                  <CardHeader className="bg-orange-500/10 border-b border-border">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <span className="text-3xl">🛵</span>
                      Join Swiggy
                    </CardTitle>
                    <CardDescription>
                      Reach more customers in your area
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="aspect-video bg-muted rounded-xl mb-4 flex items-center justify-center border border-border">
                      <div className="text-center">
                        <Play className="h-16 w-16 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Watch: How to join Swiggy</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p>✅ Step 1: Fill the partner form</p>
                      <p>✅ Step 2: Verify your documents</p>
                      <p>✅ Step 3: Go live & earn daily!</p>
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Register on Swiggy
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* GROWTH TOOLS TAB */}
            <TabsContent value="tools" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Digital Menu */}
                <Card className="bg-card border-border shadow-lg hover:shadow-primary/20 transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
                        <MenuIcon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Digital Menu</h3>
                        <p className="text-sm text-muted-foreground">Create QR menu for customers</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      No printing costs! Customers scan & see your menu on their phone.
                    </p>
                    <Button className="w-full text-foreground" variant="outline">
                      Create Menu →
                    </Button>
                  </CardContent>
                </Card>

                {/* Make Reels */}
                <Card className="bg-card border-border shadow-lg hover:shadow-primary/20 transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-secondary/20 rounded-xl flex items-center justify-center">
                        <Film className="h-8 w-8 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Make Reels</h3>
                        <p className="text-sm text-muted-foreground">Auto-create promotional videos</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      Upload your food video - we add music & captions automatically!
                    </p>
                    <Button className="w-full text-foreground" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </Button>
                  </CardContent>
                </Card>

                {/* Find Bloggers */}
                <Card className="bg-card border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent" />
                      Find Food Bloggers
                    </CardTitle>
                    <CardDescription>Connect with local influencers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {localBloggers.map((blogger, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div className="flex items-center gap-3">
                          {blogger.platform === 'Instagram' ? (
                            <Instagram className="h-5 w-5 text-pink-500" />
                          ) : (
                            <Youtube className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{blogger.name}</p>
                            <p className="text-xs text-muted-foreground">{blogger.handle} • {blogger.followers} followers</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleContactBlogger(blogger)}>
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Today's Promotion */}
                <Card className="bg-card border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Today's Promotion Ideas
                    </CardTitle>
                    <CardDescription>Quick sales ideas for your stall</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start h-14 text-foreground">
                      <span className="text-xl mr-3">🎁</span>
                      Combo Offer - Thali + Drink
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-14 text-foreground">
                      <span className="text-xl mr-3">⏰</span>
                      Happy Hours (2-4 PM discount)
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-14 text-foreground">
                      <span className="text-xl mr-3">🎉</span>
                      Festival Special Menu
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* DAILY TIPS TAB */}
            <TabsContent value="tips" className="space-y-6">
              <Card className="bg-card border-border shadow-xl">
                <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 border-b border-border">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Lightbulb className="h-8 w-8 text-accent" />
                    Aaj Ke Tips (Daily Tips)
                  </CardTitle>
                  <CardDescription className="text-base">
                    Practical advice to grow your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {dailyTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-muted rounded-xl border-l-4 border-primary"
                      >
                        <p className="text-lg text-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-accent/10 rounded-xl border border-accent/20">
                    <h4 className="font-bold text-accent mb-2">📊 Today's Best Time to Post</h4>
                    <p className="text-muted-foreground">
                      Post your food photos at <strong className="text-foreground">7:00 PM</strong> today for maximum reach!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PosterMaker;
