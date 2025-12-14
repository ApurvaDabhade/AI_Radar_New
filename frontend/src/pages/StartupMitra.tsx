import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Send,
  Lightbulb,
  MapPin,
  Users,
  BookOpen,
  Mic,
  Rocket,
  Calculator,
  FileCheck,
  X,
  PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import startupImage from '@/assets/startup_mitra_bg.png';
import aiAssistantImage from '@/assets/ai-assistant.jpg';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const StartupMitra = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  // State
  const [mode, setMode] = useState<'dashboard' | 'chat'>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mode]);

  const easyActions = [
    {
      title: 'Start New Business',
      subtitle: 'Step-by-step guide to open your stall',
      icon: Rocket,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      prompt: 'I want to start a new food business. Guide me step by step.'
    },
    {
      title: 'Fix Menu Prices',
      subtitle: 'Calculate cost & profit automatically',
      icon: Calculator,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      prompt: 'Help me price my menu items correctly.'
    },
    {
      title: 'Best Location',
      subtitle: 'Find where customers are',
      icon: MapPin,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      prompt: 'Where is the best location to set up my stall?'
    },
    {
      title: 'License Help',
      subtitle: 'FSSAI registration help',
      icon: FileCheck,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      prompt: 'What licenses do I need to start?'
    },
  ];

  const handleStartChat = (initialMessage?: string) => {
    setMode('chat');
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          content: 'Namaste! 🙏 I am Startup Mitra. How can I help you grow your business today?',
          timestamp: new Date(),
          suggestions: ['Start a Business', 'Get License', 'Find Suppliers']
        }
      ]);
    }

    if (initialMessage) {
      setTimeout(() => sendMessage(initialMessage), 500);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simulate AI Response
    // Simulate AI Response - converted to real async call
    // We add a small artificial delay only if response is super fast, 
    // but primarily we wait for the backend.
    setMessages(prev => [...prev, {
      id: 'loading',
      type: 'bot',
      content: 'Thinking...',
      timestamp: new Date()
    }]);

    try {
      const response = await generateResponse(text);

      setMessages(prev => {
        // Remove loading message and add real response
        const filtered = prev.filter(m => m.id !== 'loading');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response.text,
          timestamp: new Date(),
          suggestions: response.suggestions
        }];
      });
    } catch (err) {
      // Error handling usually inside generateResponse but safety net here
      setMessages(prev => prev.filter(m => m.id !== 'loading'));
    }
  };

  const generateResponse = async (input: string): Promise<{ text: string, suggestions?: string[] }> => {
    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Network response was not ok');
      }

      return {
        text: data.text,
        suggestions: data.suggestions || ['Ask another question', 'Business Ideas']
      };
    } catch (error: any) {
      console.error('Error fetching from backend:', error);
      let errorMessage = "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";

      if (error.message && (error.message.includes('Quota') || error.message.includes('429'))) {
        errorMessage = "⚠️ usage limit reached. Please try again later or check your API quota.";
      } else if (error.message) {
        // If we have a specific error from backend, usage might helpful to log or show generic if too technical
        // For now, let's stick to generic unless it's quota
      }

      return {
        text: errorMessage,
        suggestions: ['Try Again']
      };
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({ title: "Listening...", description: "Speak now in Hindi or English" });
      setTimeout(() => {
        setIsRecording(false);
        sendMessage("How do I increase my sales?");
      }, 2000);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <MobileSidebarTrigger />

          {/* Header */}
          <header className="flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-border z-10 relative">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 opacity-20">
              <img src={startupImage} className="w-full h-full object-cover" alt="header bg" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-background/50" />
            </div>

            <div className="container mx-auto px-4 py-4 relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-foreground hover:bg-white/20">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Startup Mitra</h1>
                  <p className="text-xs opacity-80">Simple Business Guide</p>
                </div>
              </div>

              {mode === 'chat' && (
                <Button variant="secondary" size="sm" onClick={() => setMode('dashboard')} className="shadow-sm">
                  <X className="h-4 w-4 mr-1" /> Close Chat
                </Button>
              )}
            </div>
          </header>

          {/* DASHBOARD MODE */}
          {mode === 'dashboard' && (
            <ScrollArea className="flex-1 bg-muted/20">
              <div className="container mx-auto px-4 py-6 max-w-4xl">

                {/* Welcome Card */}
                <div className="bg-gradient-to-br from-primary to-orange-600 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Namaste! 🙏</h2>
                    <p className="text-lg font-serif italic opacity-90 mb-2">"तुमचा वैयक्तिक बिजनेस कोच"</p>
                    <p className="text-lg opacity-90 mb-6 max-w-lg">
                      I am your personal business assistant. What is your goal today?
                    </p>
                    <Button
                      size="lg"
                      onClick={() => handleStartChat()}
                      className="bg-white text-primary hover:bg-gray-100 rounded-full font-bold shadow-lg"
                    >
                      <Mic className="w-5 h-5 mr-2" /> Ask Anything (Voice)
                    </Button>
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="absolute bottom-0 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>
                </div>

                {/* Main Action Grid */}
                <h3 className="text-lg font-bold mb-4 px-1">What do you want to do?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {easyActions.map((action, idx) => (
                    <Card
                      key={idx}
                      onClick={() => handleStartChat(action.prompt)}
                      className="p-6 cursor-pointer hover:shadow-md transition-all border hover:border-primary/50 group bg-card"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-xl ${action.color} group-hover:scale-105 transition-transform`}>
                          <action.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-1">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">{action.subtitle}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Quick Tips Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['🥗 Trending Menu', '📉 Reduce Waste', '🤝 Supplier List', '📢 Marketing Ads'].map((tip, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="h-auto py-3 text-sm font-medium border text-foreground hover:bg-muted"
                      onClick={() => handleStartChat(`tell me about ${tip}`)}
                    >
                      {tip}
                    </Button>
                  ))}
                </div>

              </div>
            </ScrollArea>
          )}

          {/* CHAT MODE */}
          {mode === 'chat' && (
            <div className="flex-1 flex flex-col bg-background">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6 max-w-3xl mx-auto pb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.type === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-secondary/10 border border-secondary/20 rounded-tl-none'
                          }`}
                      >
                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Bot Suggestions */}
                      {msg.suggestions && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.suggestions.map((sug, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="text-xs rounded-full border-primary/20 text-primary hover:bg-primary/5"
                              onClick={() => sendMessage(sug)}
                            >
                              {sug}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 bg-background border-t border-border">
                <div className="max-w-3xl mx-auto flex gap-3">
                  <Button
                    size="icon"
                    variant={isRecording ? 'destructive' : 'secondary'}
                    onClick={handleVoiceInput}
                    className={`rounded-full h-12 w-12 flex-shrink-0 ${isRecording ? 'animate-pulse shadow-red-500/50 shadow-lg' : ''}`}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                      placeholder="Type your message..."
                      className="h-12 rounded-full pl-5 pr-12 text-base shadow-sm border-2 focus-visible:ring-0 focus-visible:border-primary"
                    />
                    <Button
                      size="icon"
                      onClick={() => sendMessage(inputValue)}
                      className="absolute right-1 top-1 h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </SidebarProvider>
  );
};

export default StartupMitra;
