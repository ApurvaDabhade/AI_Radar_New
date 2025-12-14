import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  TrendingUp,
  PieChart,
  MessageSquare,
  MapPin,
  Languages,
  Star,
  Quote,
  ShieldCheck,
  Zap,
  Users,
  ChefHat,
  Truck
} from 'lucide-react';
import heroImage from '@/assets/hero-food-vendor.jpg';
import festivalImage from '@/assets/festival-food.jpg';
import analyticsImage from '@/assets/analytics-dashboard.jpg';
import communityImage from '@/assets/community-hub.jpg';
import startupImage from '@/assets/startup-journey.jpg';
import vendorStreet from '@/assets/vendor-street.png';
import vendorKitchen from '@/assets/vendor-kitchen.png';
import vendorTruck from '@/assets/vendor-truck.png';

const Index = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const features = [
    {
      icon: TrendingUp,
      title: t('landing.feature1.title'),
      description: t('landing.feature1.desc'),
      image: analyticsImage,
    },
    {
      icon: PieChart,
      title: t('landing.feature2.title'),
      description: t('landing.feature2.desc'),
      image: festivalImage,
    },
    {
      icon: MessageSquare,
      title: t('landing.feature3.title'),
      description: t('landing.feature3.desc'),
      image: communityImage,
    },
    {
      icon: MapPin,
      title: t('landing.feature4.title'),
      description: t('landing.feature4.desc'),
      image: startupImage,
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Street Food Vendor, Mumbai",
      content: "RasoiMitra changed how I plan my daily stock. No more wasted food!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      name: "Priya Sharma",
      role: "Home Baker, Delhi",
      content: "The trend insights helped me launch a new cake flavor that went viral.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      name: "Amit Patel",
      role: "Food Truck Owner, Bangalore",
      content: "Startup Mitra's advice on location was spot on. My sales doubled in a week.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  const vendorTypes = [
    {
      title: "Street Food Legends",
      description: "Empowering the heart of Indian culinary culture with digital tools.",
      image: vendorStreet,
      icon: Users
    },
    {
      title: "Modern Kitchens",
      description: "Helping professional chefs optimize operations and reduce waste.",
      image: vendorKitchen,
      icon: ChefHat
    },
    {
      title: "Food Truck Innovators",
      description: "Smart location intelligence for mobile food businesses.",
      image: vendorTruck,
      icon: Truck
    }
  ];

  const faqs = [
    {
      question: "Is RasoiMitra free to use?",
      answer: "Yes! We offer a generous free tier for small vendors. Premium features are available as your business scales."
    },
    {
      question: "Do I need technical skills?",
      answer: "Not at all. Our app is designed to be as simple as using WhatsApp. If you can use a smartphone, you can use RasoiMitra."
    },
    {
      question: "How accurate are the trend insights?",
      answer: "Our data is aggregated from thousands of local touchpoints and updated in real-time to give you the most accurate local market picture."
    },
    {
      question: "Can I connect with suppliers?",
      answer: "Absolutely. The Community Hub allows you to find and connect with verified local suppliers for better rates."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
              R
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-600">
                {t('app.name')}
              </h1>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 hidden sm:flex"
            >
              Login
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/registration')}
              className="border-primary/20 text-primary hover:bg-primary/5 hidden sm:flex"
            >
              Register
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (language === 'en') setLanguage('hi');
                else if (language === 'hi') setLanguage('mr');
                else setLanguage('en');
              }}
              className="rounded-full hover:bg-muted"
            >
              <Languages className="h-5 w-5 text-muted-foreground mr-1" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-orange-50/30 to-background dark:from-background dark:via-orange-900/10 dark:to-background">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float animation-delay-400"></div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <Badge className="mb-8 px-4 py-2 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-primary/20 text-primary animate-fade-in-up shadow-sm inline-flex">
                🚀 Empowering 1,000+ Local Food Vendors
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in-up tracking-tight leading-tight">
                Next Gen <br />
                <span className="text-gradient">Food Intelligence</span>
              </h1>

              {/* Marathi Tadka */}
              <div className="text-2xl font-bold text-orange-600 mb-6 animate-fade-in-up font-serif">
                "तुमची प्रगती, आमची जबाबदारी"
                <span className="block text-sm font-normal text-muted-foreground mt-1">(Your Progress, Our Responsibility)</span>
              </div>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-200 leading-relaxed">
                {t('landing.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start animate-fade-in-up animation-delay-400">
                <Button
                  size="lg"
                  onClick={() => navigate('/registration')}
                  className="bg-primary hover:bg-primary/90 text-white px-10 py-7 text-lg rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
                >
                  {t('landing.cta.start')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('video-showcase')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-muted bg-transparent hover:bg-muted text-foreground px-10 py-7 text-lg rounded-full transition-all"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:w-1/2 relative animate-fade-in-up animation-delay-400 hidden lg:block">
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white dark:border-white/5 rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img
                  src={vendorStreet}
                  alt="Happy Street Vendor"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary rounded-full">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Sales up by 40%</span>
                  </div>
                  <p className="text-white/80 text-sm">"RasoiMitra helped me optimize my menu"</p>
                </div>
              </div>

              {/* Floating Element */}
              <div className="absolute -bottom-10 -left-10 bg-white dark:bg-card p-4 rounded-2xl shadow-xl animate-float animation-delay-1000 z-30 max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Fast Growth</h4>
                    <p className="text-xs text-muted-foreground">Verified metrics</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="text-orange-600 font-bold text-xl mb-2 font-serif animate-fade-in-up">"व्यवसाय वाढीची गुरुकिल्ली"</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
              Features that <span className="text-primary">Scale</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage, grow, and optimize your culinary business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-3xl bg-secondary/5 border border-secondary/10 hover:bg-white dark:hover:bg-sidebar-accent hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/10 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW SECTION: Partner Vendors Gallery */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/5 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">Our Community</Badge>
              <div className="text-orange-600 font-bold text-xl mb-2 font-serif">"एकजुटीने प्रगतीकडे"</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Empowering <span className="text-primary">Every Vendor</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                From bustling street corners to professional kitchens, we support all food entrepreneurs.
              </p>
            </div>
            <Button variant="outline" className="rounded-full px-6">
              View All Success Stories
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vendorTypes.map((type, index) => (
              <div
                key={index}
                className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                <img
                  src={type.image}
                  alt={type.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white">
                    <type.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{type.title}</h3>
                  <p className="text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section id="video-showcase" className="py-32 bg-secondary/5 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 animate-slide-in-right">
              <Badge className="mb-6 bg-secondary text-secondary-foreground">🎥 See it in Action</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Master Your Business in <span className="text-primary">Minutes</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 text-justify">
                Watch how RasoiMitra transforms daily chaos into organized success.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <TrendingUp className="text-green-600 dark:text-green-400 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Real-time Analytics</h4>
                    <p className="text-sm text-muted-foreground">Track sales as they happen</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                    <Zap className="text-orange-600 dark:text-orange-400 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Lightning Fast</h4>
                    <p className="text-sm text-muted-foreground">Optimized for mobile performance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-3xl opacity-30 blur-2xl animate-pulse-glow"></div>
              <Card className="relative overflow-hidden rounded-3xl border-0 shadow-2xl bg-black aspect-video group cursor-pointer">
                <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-60 transition-opacity bg-[url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/50">
                    <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[24px] border-l-white border-b-[12px] border-b-transparent ml-2"></div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-6 mb-16 text-center">
          <Badge className="mb-6 bg-accent text-accent-foreground">❤️ Loved by Vendors</Badge>
          <h2 className="text-4xl font-bold">Community Success Stories</h2>
        </div>

        <div className="relative w-full">
          <div className="flex gap-8 animate-shimmer whitespace-nowrap px-4 hover:pause">
            {[...testimonials, ...testimonials].map((t, i) => (
              <Card key={i} className="inline-block w-[350px] p-8 shrink-0 bg-secondary/5 border-secondary/20 hover:border-primary/30 transition-colors whitespace-normal">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((_, starI) => (
                    <Star key={starI} className="w-4 h-4 text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={t.image} />
                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 bg-secondary/5">
        <div className="container mx-auto px-6">
          <div className="text-center text-orange-600 font-bold text-xl mb-2 font-serif">"यशाचा सोपा मार्ग"</div>
          <h2 className="text-4xl font-bold text-center mb-20">
            Tools Designed for <span className="text-secondary">Growth</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Main Featured Item - Startup Mitra (Span 2 cols) */}
            <div
              className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-red-700 p-10 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
              onClick={() => navigate('/startup-mitra')}
            >
              <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">✨ Smart Advisor</Badge>
                  <h3 className="text-4xl font-bold mb-4">{t('startup.title')}</h3>
                  <p className="text-white/70 text-lg max-w-md">Your personal AI business consultant.</p>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span>Explore Now</span> <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            {/* Community Hub (Span 1 col) */}
            <div
              className="group relative overflow-hidden rounded-3xl bg-white dark:bg-card border border-border p-8 cursor-pointer hover:border-accent hover:shadow-lg transition-all"
              onClick={() => navigate('/community-hub')}
            >
              <div className="absolute top-0 right-0 p-24 bg-accent/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="p-3 bg-accent/10 rounded-xl w-fit mb-4">
                  <Users className="text-accent h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{t('community.title')}</h3>
                  <p className="text-muted-foreground text-sm">Join the network.</p>
                </div>
              </div>
            </div>

            {/* Trend Insights (Span 1 col) */}
            <div
              className="group relative overflow-hidden rounded-3xl bg-white dark:bg-card border border-border p-8 cursor-pointer hover:border-secondary hover:shadow-lg transition-all"
              onClick={() => navigate('/trend-insights')}
            >
              <div className="absolute top-0 right-0 p-24 bg-secondary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="p-3 bg-secondary/10 rounded-xl w-fit mb-4">
                  <TrendingUp className="text-secondary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Trend Insights</h3>
                  <p className="text-muted-foreground text-sm">Stay ahead of the market.</p>
                </div>
              </div>
            </div>

            {/* More Tools (Span 2 cols) */}
            <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-100 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200/50 p-10 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-4">Inventory & More</h3>
                <p className="text-orange-800/80 dark:text-orange-200/80 max-w-sm">
                  Discover our full suite of tools including Inventory Management, Sales Tracking, and License Help.
                </p>
              </div>
              <div className="hidden md:block">
                <ShieldCheck className="w-32 h-32 text-orange-500/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-border/50">
                <AccordionTrigger className="text-left text-lg hover:no-underline hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Aesthetic CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-600 to-red-700 opacity-90"></div>

        <div className="container mx-auto px-6 relative z-10 text-center text-white">
          <div className="text-orange-200 font-bold text-2xl mb-4 font-serif animate-fade-in-up">"स्वप्न तुमचे, साथ आमची"</div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 animate-fade-in-up">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join thousands of food vendors already growing with RasoiMitra.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/registration')}
            className="bg-white text-primary hover:bg-gray-100 text-lg px-12 py-8 rounded-full shadow-2xl font-bold hover:scale-105 transition-transform"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold text-primary">{t('app.name')}</span>
              <p className="text-muted-foreground mt-2">© 2025 RasoiMitra. Intelligence for Food Vendors.</p>
            </div>
            <div className="flex gap-8 text-sm font-medium text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
