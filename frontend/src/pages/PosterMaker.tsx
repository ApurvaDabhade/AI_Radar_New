import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Image as ImageIcon, Share2, Copy, Sparkles, Play, ExternalLink, Phone, Instagram, Youtube, Lightbulb, Menu as MenuIcon, Film, Users, Tag, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

const designFormats = [
  { id: 'poster', label: 'Poster', ratio: 'aspect-[3/4]', icon: '🖼️' },
  { id: 'menu', label: 'Menu Card', ratio: 'aspect-[1/1.414]', icon: '📋' },
  { id: 'banner', label: 'Banner', ratio: 'aspect-[3/1]', icon: '🚩' },
  { id: 'standee', label: 'Standee', ratio: 'aspect-[9/16]', icon: '🧍' },
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
  const [selectedFormat, setSelectedFormat] = useState('poster');
  const [selectedTheme, setSelectedTheme] = useState('orange');
  const [businessName, setBusinessName] = useState('');
  const [foodType, setFoodType] = useState('');
  const [location, setLocation] = useState('');
  const [offerText, setOfferText] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [tagline, setTagline] = useState('');
  const [imageUploaded, setImageUploaded] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(''); // Store the uploaded image URL

  const [generatingSlogans, setGeneratingSlogans] = useState(false);
  const [suggestedSlogans, setSuggestedSlogans] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]); // Store fetched menu items

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const posterRef = React.useRef<HTMLDivElement>(null);

  // Auto-fill from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.stallName) setBusinessName(user.stallName);
        if (user.location && user.location !== 'Unknown') {
          setAddress(user.location);
          setLocation(user.location);
        }
        if (user.specialty) setFoodType(user.specialty);
        if (user.menuItems) setMenuItems(user.menuItems); // Load menu items
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleGenerateSlogans = async () => {
    setGeneratingSlogans(true);
    try {
      const response = await fetch('http://localhost:5001/api/poster-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          cuisine: foodType,
          location: address,
          offerType: offerText || selectedCategory,
          price,
          designFormat: designFormats.find(f => f.id === selectedFormat)?.label
        })
      });

      const data = await response.json();
      if (data.suggestions) {
        setSuggestedSlogans(data.suggestions);
        if (data.suggestions.length > 0) {
          setTagline(data.suggestions[0]); // Auto-select first one
        }
        toast({ title: "✨ Slogans Generated", description: "Select a slogan to use on your poster." });
      }
    } catch (error) {
      console.error("Error generating slogans", error);
      toast({ title: "Error", description: "Could not generate slogans right now.", variant: "destructive" });
    } finally {
      setGeneratingSlogans(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageUploaded(true);
        toast({ title: '✅ Photo Uploaded!', description: 'Your dish photo is ready' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneratePoster = () => {
    if (!businessName || !price) {
      toast({ title: '⚠️ Required Fields', description: 'Please enter business name and price' });
      return;
    }
    // Logic for unify view: Just notify user it's ready (visual feedback only as view is always visible)
    toast({ title: '🎨 Design Ready!', description: 'You can now download your design.' });
  };

  // This tool call was intending to use multi_replace but I selected replace_file_content. 
  // I will abort and use multi_replace_file_content in the next turn as it's cleaner.
  // Wait, I can't abort comfortably. I will just update the function here and do imports in a second call.
  // Function update:
  const handleDownload = async () => {
    if (!posterRef.current) return;
    toast({ title: '📥 Downloading...', description: 'Generating high-quality image...' });

    try {
      // Dynamic import to avoid SSR issues if any, though standard import is fine here
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(posterRef.current, {
        scale: 2, // High resolution
        useCORS: true, // Handle cross-origin images
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.download = `${businessName || 'Poster'}-${selectedFormat}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({ title: '✅ Downloaded!', description: 'Your design has been saved.' });
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: '❌ Error', description: 'Could not download image. Try again.', variant: 'destructive' });
    }
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

          {/* Global File Input for Ref */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-primary">
                  🎨 Merchandise Studio
                </h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>RasoiMitra’s Merchandise Studio auto-fills vendor details, suggests professional slogans, and lets vendors edit anytime to create print-ready banners and menu cards in minutes.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">Professional designs for your business</p>
            </div>
          </div>

          {/* Grow Your Business Banner */}
          <Card className="bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 mb-6 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Design Like a Pro!
                  </h2>
                  <p className="text-muted-foreground">
                    Auto-fill your details, get AI slogans, and print ready in minutes.
                  </p>
                </div>
                <span className="text-6xl hidden md:block">🎨</span>
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

            {/* POSTER MAKER TAB - KOLAM INSPIRED LAYOUT */}
            <TabsContent value="poster" className="space-y-6">

              <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">

                {/* LEFT PANEL: PRODUCT SELECTION & CONTROLS */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">

                  {/* 1. SELECT PRODUCT */}
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">1. Select Product</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                      {designFormats.map((format) => (
                        <div
                          key={format.id}
                          onClick={() => setSelectedFormat(format.id)}
                          className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${selectedFormat === format.id
                            ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-[1.02]'
                            : 'border-border hover:border-primary/50 hover:bg-muted'
                            }`}
                        >
                          <span className="text-3xl filter drop-shadow-md">{format.icon}</span>
                          <span className={`text-sm font-bold ${selectedFormat === format.id ? 'text-primary' : 'text-muted-foreground'}`}>
                            {format.label}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* 2. CUSTOMIZE */}
                  <Card className="bg-card border-border shadow-sm flex-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">2. Customize</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                      {/* Image Upload Area */}
                      <div
                        onClick={triggerImageUpload}
                        className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group ${imageUploaded ? 'border-green-500 bg-green-500/10' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'
                          }`}
                      >
                        {imageUploaded ? (
                          <>
                            <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center mb-2 shadow-lg">
                              <span className="text-xl">✓</span>
                            </div>
                            <span className="text-sm font-semibold text-green-600">Photo Added</span>
                            <span className="text-xs text-muted-foreground">Click to change</span>
                          </>
                        ) : (
                          <>
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Upload Your Dish</span>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Business Name</Label>
                          <Input
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Name"
                            className="h-9 bg-muted/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price</Label>
                          <Input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="₹"
                            type="number"
                            className="h-9 bg-muted/50 font-bold text-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Cuisine / Item</Label>
                        <Input
                          value={foodType}
                          onChange={(e) => setFoodType(e.target.value)}
                          placeholder="e.g. Masala Dosa"
                          className="h-9 bg-muted/50"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs">Catchy Offer / Slogan</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleGenerateSlogans}
                            disabled={generatingSlogans}
                            className="h-6 text-[10px] px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {generatingSlogans ? <span className="animate-spin mr-1">⏳</span> : <Sparkles className="h-3 w-3 mr-1" />}
                            AI Suggest
                          </Button>
                        </div>
                        <Input
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          placeholder="AI can write this for you..."
                          className="h-9 bg-muted/50"
                        />
                      </div>

                      {/* Color Picker */}
                      <div className="pt-2">
                        <Label className="text-xs mb-2 block">Theme Color</Label>
                        <div className="flex gap-2 justify-between">
                          {colorThemes.map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => setSelectedTheme(theme.id)}
                              className={`w-8 h-8 rounded-full shadow-sm transition-transform ${selectedTheme === theme.id ? 'scale-125 ring-2 ring-offset-2 ring-foreground' : 'hover:scale-110'}`}
                              style={{ backgroundColor: theme.color }}
                            />
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleDownload}
                        className="w-full h-12 mt-4 text-base font-bold shadow-lg shadow-primary/20 bg-green-600 hover:bg-green-700"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Download Design
                      </Button>

                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT PANEL: REALISTIC PREVIEW (KOLAM STYLE) */}
                <div className="lg:col-span-8 flex flex-col gap-6 relative">

                  {/* 3D Environment Container */}
                  <div
                    className="flex-1 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-border shadow-inner relative overflow-hidden flex items-center justify-center p-8 md:p-12 group"
                    style={{ perspective: '1200px' }}
                  >

                    {/* Background Ambience (Blurred) */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80')] bg-cover bg-center blur-sm" />

                    {/* The Product (3D Transformed) */}
                    <div
                      className={`relative transition-all duration-700 ease-out transform-gpu hover:scale-[1.02]
                          ${designFormats.find(f => f.id === selectedFormat)?.ratio || 'aspect-[3/4]'}
                          ${selectedFormat === 'banner' ? 'w-[320px] md:w-[480px]' : selectedFormat === 'standee' ? 'w-[200px] md:w-[280px]' : 'w-[280px] md:w-[380px]'}
                        `}
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: 'rotateY(-12deg) rotateX(5deg)',
                        boxShadow: '25px 35px 60px -15px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.5)'
                      }}
                    >
                      {/* Glossy Overlay */}
                      <div className="absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none rounded-lg" />

                      {/* Actual Design Content */}
                      <div
                        ref={posterRef}
                        className="absolute inset-0 bg-white rounded-lg overflow-hidden flex flex-col shadow-sm"
                        style={{
                          border: `8px solid white`,
                        }}
                      >
                        {/* Color Header/Footer bar */}
                        <div className="h-3 w-full" style={{ backgroundColor: colorThemes.find(t => t.id === selectedTheme)?.color }} />

                        <div className="flex-1 flex flex-col relative overflow-hidden bg-white h-full">

                          {selectedFormat === 'standee' ? (
                            /* STANDEE LAYOUT (Full Bleed, Premium) */
                            <div className="flex-1 relative flex flex-col">
                              {/* Background Image */}
                              <div className="absolute inset-0 bg-gray-900">
                                {imageUploaded && imagePreview ? (
                                  <img src={imagePreview} className="w-full h-full object-cover opacity-90" alt="Background" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 opacity-20">
                                    <ImageIcon className="h-16 w-16 mb-2" />
                                    <span className="text-xl font-bold uppercase tracking-widest">Add Photo</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/60" />
                              </div>

                              {/* Top Header */}
                              <div className="relative z-10 p-6 text-center pt-8">
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                  {businessName || 'BRAND'}
                                </h2>
                                <div className="mt-3 inline-block bg-primary text-primary-foreground px-4 py-1 font-bold text-xs rounded-full uppercase tracking-wider shadow-lg">
                                  Premium
                                </div>
                              </div>

                              <div className="flex-1" />

                              {/* Bottom Glass Card */}
                              <div className="relative z-10 p-6 pb-12">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-center shadow-2xl">
                                  <p className="text-primary font-bold text-sm uppercase mb-2 tracking-widest">{offerText || 'Special Offer'}</p>
                                  <h3 className="text-2xl font-bold leading-tight mb-4 text-white drop-shadow-md">
                                    "{tagline || 'Taste the Magic'}"
                                  </h3>
                                  <div className="flex justify-center items-center gap-3">
                                    <span className="text-white/70 text-sm font-medium uppercase">Only</span>
                                    <span className="text-5xl font-black text-white drop-shadow-lg scale-110" style={{ color: colorThemes.find(t => t.id === selectedTheme)?.color }}>
                                      ₹{price || '99'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : selectedFormat === 'banner' ? (
                            /* BANNER LAYOUT (Split Horizontal with Diagonal Cut) */
                            <div className="flex-1 relative flex flex-row overflow-hidden bg-white">
                              {/* Left: Image (55% with diagonal cut) */}
                              <div
                                className="w-[55%] relative h-full bg-muted z-10"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
                              >
                                {imageUploaded && imagePreview ? (
                                  <img src={imagePreview} className="w-full h-full object-cover" alt="Banner" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                                    <ImageIcon className="h-10 w-10" />
                                  </div>
                                )}
                                {/* Price Badge (Moved to insure visibility) */}
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-white/50">
                                  <span className="text-[10px] font-bold uppercase block text-gray-400 leading-none">Only</span>
                                  <span className="text-xl font-black leading-none" style={{ color: colorThemes.find(t => t.id === selectedTheme)?.color }}>₹{price || '99'}</span>
                                </div>
                              </div>

                              {/* Right: Content (45% + overlap compensation) */}
                              <div className="flex-1 p-5 pl-2 flex flex-col justify-center items-start text-left bg-gradient-to-br from-white via-gray-50 to-gray-100 relative">
                                {/* Pattern Overlay */}
                                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]" />

                                <div className="relative z-10 w-full">
                                  <span className="inline-block py-1 px-2 rounded-md bg-black/5 text-[8px] font-bold tracking-widest uppercase text-gray-600 mb-2">
                                    {offerText || "Exclusive Deal"}
                                  </span>
                                  <h2 className="text-2xl md:text-3xl font-extrabold leading-none mb-2 tracking-tight" style={{ color: '#1a1a1a' }}>
                                    {businessName || 'Brand'}
                                  </h2>
                                  <p className="text-xs md:text-sm font-medium text-gray-500 mb-4 leading-normal line-clamp-2">
                                    {tagline || 'Experience the best food in town. Taste the difference today.'}
                                  </p>
                                  <div className="mt-2 pt-3 border-t border-dashed border-gray-300 w-full flex justify-between items-center">
                                    <div className="flex items-center text-[9px] text-gray-500 font-medium">
                                      <span className="mr-1">📍</span> {address || 'City Center'}
                                    </div>
                                    <div
                                      className="px-4 py-1.5 text-white text-[10px] font-bold rounded-full shadow-md uppercase tracking-wide transform transition-transform hover:scale-105"
                                      style={{ backgroundColor: colorThemes.find(t => t.id === selectedTheme)?.color || '#000' }}
                                    >
                                      Order Now
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* WRAPPER FOR POSTER & MENU (Padded) */
                            <div className="flex-1 p-4 flex flex-col relative overflow-hidden h-full">
                              {/* Background Pattern/Texture (Subtle) */}
                              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                              {/* Header */}
                              <div className="text-center z-10 mb-2">
                                <h2 className="font-extrabold text-xl md:text-2xl leading-tight" style={{ color: '#1a1a1a' }}>
                                  {businessName || 'Your Brand'}
                                </h2>
                                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-semibold">{selectedFormat === 'menu' ? 'Menu Card' : 'Premium Quality'}</p>
                              </div>

                              {selectedFormat === 'menu' ? (
                                /* MENU CARD LAYOUT (With Images) */
                                <div className="flex-1 rounded-lg border border-dashed border-gray-300 bg-white/50 p-3 mb-2 overflow-y-auto custom-scrollbar z-10">
                                  <div className="space-y-3">
                                    {(menuItems && menuItems.length > 0 ? menuItems : [
                                      { name: 'Masala Chai', price: '20', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=100&q=80' },
                                      { name: 'Vada Pav', price: '15', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=100&q=80' },
                                      { name: 'Samosa', price: '15', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=100&q=80' },
                                      { name: 'Poha', price: '30', image: 'https://images.unsplash.com/photo-1595865725048-1375d394a5d5?auto=format&fit=crop&w=100&q=80' },
                                      { name: 'Bun Maska', price: '25' },
                                      { name: 'Coffee', price: '30' }
                                    ]).map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-3 border-b border-gray-200 pb-2 last:border-0 hover:bg-white/80 p-1 rounded-lg transition-colors">
                                        {/* Menu Item Image */}
                                        <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                          {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px]">🍽️</div>
                                          )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-gray-800 truncate pr-2">{item.name || item}</span>
                                            <span className="text-sm font-bold whitespace-nowrap" style={{ color: colorThemes.find(t => t.id === selectedTheme)?.color }}>
                                              ₹{item.price || Math.floor(Math.random() * 50) + 10}
                                            </span>
                                          </div>
                                          {item.desc && <p className="text-[9px] text-gray-500 truncate">{item.desc}</p>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                /* STANDARD POSTER LAYOUT (Modern Framed Card) */
                                <div className="flex-1 w-full relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group mb-3 border-[6px] border-white ring-1 ring-gray-200">
                                  {/* Dynamic Background Image */}
                                  {imageUploaded && imagePreview ? (
                                    <div className="w-full h-full relative overflow-hidden">
                                      <img
                                        src={imagePreview}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt="Food"
                                      />
                                      {/* Gradient Overlay for Text Readability */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                      <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                                      <span className="text-xs uppercase font-bold tracking-widest opacity-50">Preview Area</span>
                                    </div>
                                  )}

                                  {/* Top Left Badge (New) */}
                                  <div className="absolute top-4 left-0 bg-yellow-400 text-black text-[10px] font-black px-3 py-1 shadow-lg rounded-r-full uppercase tracking-wider transform -translate-x-1 group-hover:translate-x-0 transition-transform">
                                    Top Choice
                                  </div>

                                  {/* Floating Price Circle */}
                                  <div className="absolute bottom-4 right-4 bg-white rounded-full h-16 w-16 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-white group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-[8px] text-gray-400 font-bold uppercase -mb-0.5">At</span>
                                    <span className="text-xl font-black" style={{ color: colorThemes.find(t => t.id === selectedTheme)?.color }}>
                                      ₹{price || '99'}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Content / Tagline */}
                              <div className="z-10 text-center">
                                <h3 className="font-bold text-lg leading-tight mb-1" style={{ color: '#333' }}>
                                  {tagline || (selectedFormat === 'menu' ? 'Authentic Tastes' : (offerText || 'Delicious Food Awaits You!'))}
                                </h3>
                                {address && (
                                  <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 mt-2 bg-gray-50 py-1 rounded-full px-2 inline-flex mx-auto border border-gray-100">
                                    <span>📍</span> {address}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                        <div className="h-3 w-full" style={{ backgroundColor: colorThemes.find(t => t.id === selectedTheme)?.color }} />
                      </div>

                    </div>

                    {/* Reflection/Shadow Floor */}
                    <div className="absolute bottom-0 text-center text-sm text-muted-foreground/30 font-medium">
                      3D Preview Mode
                    </div>
                  </div>

                  {/* AI Suggestions Drawer */}
                  {suggestedSlogans.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 z-30">
                      <div className="bg-background/95 backdrop-blur border border-border rounded-xl shadow-xl p-4 animate-in slide-in-from-bottom-5">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Suggestions
                          </h4>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setSuggestedSlogans([])}>×</Button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
                          {suggestedSlogans.map((slogan, idx) => (
                            <div
                              key={idx}
                              onClick={() => setTagline(slogan)}
                              className="min-w-[200px] bg-muted/50 border border-border rounded-lg p-3 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors snap-center text-center flex items-center justify-center shadow-sm"
                            >
                              "{slogan}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>

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
                    <div className="aspect-video bg-black rounded-xl mb-4 overflow-hidden border border-border shadow-inner">
                      <video
                        controls
                        className="w-full h-full object-contain"
                      >
                        <source src="/zomato_guide.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
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
                    <div className="aspect-video bg-black rounded-xl mb-4 overflow-hidden border border-border shadow-inner">
                      <video
                        controls
                        className="w-full h-full object-contain"
                      >
                        <source src="/swiggy_guide.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
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
