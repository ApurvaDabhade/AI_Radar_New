import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Mic, TrendingUp, Calendar, Package, BarChart3, ChefHat, Star, Eye, Heart, MessageCircle } from 'lucide-react';
import chufGuruBg from '@/assets/chefguru_bg.png';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  buttons?: Array<{ label: string; value: string; icon?: string }>;
}

interface ChatFlowData {
  dishName?: string;
  date?: string;
  optionType?: 'topping' | 'addon' | 'both';
  language?: 'english' | 'marathi';
  step: number;
}

const ChefGuru = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'selection' | 'chat' | 'trends'>('selection');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I can help you find the best toppings or add-ons for your dish 🍛',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatFlowData, setChatFlowData] = useState<ChatFlowData>({ step: 1 });

  // Popularity data state fetching from backend
  const [popularityData, setPopularityData] = useState<
    Array<{
      dish_name: string;
      views: number;
      likes: number;
      comments_count: number;
      popularity_score: number;
    }>
  >([]);

  // Fetch Trends from Python Backend
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/food-trends');
        const result = await response.json();
        if (result.status === 'success') {
          // Map backend data to frontend structure
          const mappedData = result.data.map((item: any) => ({
            dish_name: item.dish_name,
            views: item.views,
            likes: item.likes,
            comments_count: Math.round(item.views * 0.005),
            popularity_score: item.popularity_score
          }));
          setPopularityData(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch trends:", error);
      }
    };

    fetchTrends();
  }, []);

  // Festival and seasonal add-ons with Marathi options
  const festivalAddOns = {
    // ... (Keep existing data structures if used, though they were static constants in previous file)
    diwali: ['Gulab Jamun', 'Rasgulla', 'Kaju Katli', 'Besan Ladoo', 'Anar Dana Chutney', 'Sweet Tamarind Chutney'],
    holi: ['Thandai', 'Gujiya', 'Bhang Pakora', 'Puran Poli', 'Mango Chutney', 'Mint Chutney'],
    eid: ['Sheer Khurma', 'Biryani', 'Kebabs', 'Phirni', 'Date Chutney', 'Yogurt Dip'],
    christmas: ['Plum Cake', 'Eggnog', 'Roasted Nuts', 'Cranberry Sauce', 'Honey Mustard', 'Garlic Aioli'],
    'naraka chaturdasi': ['आले-लसूण चटणी', 'तिखट हिरवी चटणी', 'बारीक चिरलेला कांदा', 'शेव', 'ताजी कोथिंबीर'],
    monsoon: ['Pakoras', 'Samosa', 'Tea', 'आले-लसूण चटणी', 'तिखट हिरवी चटणी', 'बारीक चिरलेला कांदा', 'शेव', 'ताजी कोथिंबीर'],
    summer: ['Lassi', 'Aam Panna', 'Cucumber Raita', 'Mint Chutney', 'Lemon Chutney', 'Coconut Chutney'],
    winter: ['Gajar Halwa', 'Hot Chocolate', 'Ginger Tea', 'Garlic Chutney', 'Red Chutney', 'Onion Chutney'],
  };

  const quickActions = [
    { icon: TrendingUp, label: 'Upselling Suggestions', color: 'from-green-600 to-green-800' },
    { icon: Calendar, label: 'Festival Mode', color: 'from-orange-600 to-orange-800' },
    { icon: Package, label: 'Stock Alerts', color: 'from-blue-600 to-blue-800' },
    { icon: BarChart3, label: 'Trend Analysis', color: 'from-purple-600 to-purple-800' },
  ];

  // ---------------- HELPER FOR DATES ----------------
  const getFormattedDate = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const getNextWeekend = () => {
    const d = new Date();
    const day = d.getDay(); // 0 is Sunday, 6 is Saturday
    const diff = 6 - day; // Days until Saturday
    const daysToAdd = diff <= 0 ? diff + 7 : diff;
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().split('T')[0];
  };

  const handleChatFlow = async (userInput: string, buttonValue?: string) => {
    const currentStep = chatFlowData.step;
    const input = buttonValue || userInput;

    switch (currentStep) {
      case 1: // Step 1 - Dish Name
        setChatFlowData((prev) => ({ ...prev, dishName: input, step: 2 }));
        return {
          content: 'When is this order for?',
          buttons: [
            { label: 'Today', value: 'today', icon: '📅' },
            { label: 'Tomorrow', value: 'tomorrow', icon: '☀️' },
            { label: 'This Weekend', value: 'weekend', icon: '🎉' },
          ],
        };

      case 2: // Step 2 - Date Input
        let selectedDate = input;

        // SmartDate Handling
        if (input.toLowerCase() === 'today') {
          selectedDate = getFormattedDate(0);
        } else if (input.toLowerCase() === 'tomorrow') {
          selectedDate = getFormattedDate(1);
        } else if (input.toLowerCase() === 'weekend') {
          selectedDate = getNextWeekend();
        }

        setChatFlowData((prev) => ({ ...prev, date: selectedDate, step: 3 }));
        return {
          content: `Date set to ${selectedDate}. Choose option type:`,
          buttons: [
            { label: 'Topping', value: 'topping', icon: '👨‍🍳' },
            { label: 'Add-on', value: 'addon', icon: '📦' },
          ],
        };

      case 3: // Step 3 - Choose Option Type
        setChatFlowData((prev) => ({ ...prev, optionType: input as 'topping' | 'addon', step: 4 }));
        return {
          content: 'Choose language:',
          buttons: [
            { label: 'GB English', value: 'english' },
            { label: 'IN Marathi', value: 'marathi' },
          ],
        };

      case 4: // Step 4 - Choose Language
        setChatFlowData((prev) => ({ ...prev, language: input as 'english' | 'marathi', step: 5 }));
        return {
          content: 'Ready to predict!',
          buttons: [{ label: 'Predict', value: 'predict', icon: '🌐' }],
        };

      case 5: // Step 5 - Predict
        if (input === 'predict') {
          setChatFlowData((prev) => ({ ...prev, step: 6 }));
          try {
            return await fetchPrediction();
          } catch (error) {
            return { content: "Sorry, I couldn't fetch the suggestions. Please try again.", buttons: undefined };
          }
        }
        break;

      default:
        return {
          content: 'Hello! I can help you find the best toppings or add-ons for your dish 🍛\n\nPlease enter the name of your dish.',
          buttons: undefined,
        };
    }
    return { content: "I didn't understand that.", buttons: undefined };
  };

  const fetchPrediction = async () => {
    const { dishName, date, optionType, language } = chatFlowData;
    const validDate = date || new Date().toISOString().split('T')[0];

    try {
      const response = await fetch('http://localhost:8000/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dish_name: dishName,
          order_date: validDate,
          option: optionType || 'both',
          language: language || 'English'
        })
      });

      const data = await response.json();

      if (data.error) {
        return { content: `Error: ${data.error}`, buttons: undefined };
      }

      const season = data.season || 'Unknown';
      const festival = data.festival !== 'None' ? data.festival : 'No specific festival';
      const toppings = data.toppings || [];
      const addons = data.addons || [];

      let resultText = `🍽️ **Prediction Results for ${dishName}**\n\n📅 **Date:** ${validDate}\n🌧️ **Season:** ${season}\n🎉 **Festival:** ${festival}\n\n`;

      if (optionType === 'topping' || optionType === 'both') {
        resultText += `🧂 **Suggested Toppings:**\n${toppings.map((t: string) => `• ${t}`).join('\n')}\n\n`;
      }

      if (optionType === 'addon' || optionType === 'both') {
        resultText += `📦 **Suggested Add-ons:**\n${addons.map((a: string) => `• ${a}`).join('\n')}\n\n`;
      }

      resultText += `💡 *Based on AI analysis of trends and seasonality*`;

      return { content: resultText, buttons: undefined };

    } catch (error) {
      console.error("Prediction API Error:", error);
      return { content: "Failed to connect to the Chef Intelligence System.", buttons: undefined };
    }
  };


  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    setTimeout(async () => {
      const response = await handleChatFlow(currentInput);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        buttons: response.buttons,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleButtonClick = (buttonValue: string) => {
    console.log('Button clicked:', buttonValue);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: buttonValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(async () => {
      const response = await handleChatFlow('', buttonValue);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        buttons: response.buttons,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleQuickAction = (label: string) => {
    setInputValue(label);
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInputValue('Tell me about sales trends');
      }, 2000);
    }
  };

  const handleBack = () => {
    if (viewMode === 'selection') {
      navigate('/dashboard');
    } else {
      setViewMode('selection');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="text-foreground hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">ChefGuru</h1>
                <p className="text-sm text-muted-foreground">Your Intelligent Kitchen Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">

        {/* SELECTION VIEW */}
        {viewMode === 'selection' && (
          <div className="flex flex-col items-center justify-center h-full flex-1 gap-8 mt-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                How can I help you today?
              </h2>
              <p className="text-muted-foreground mt-2">Select an option to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <Card
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-primary/20 hover:border-primary/50 bg-gradient-to-br from-card to-background"
                onClick={() => setViewMode('chat')}
              >
                <CardContent className="flex flex-col items-center justify-center p-10 h-64 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <StartChatIcon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">Chat Assistant</h3>
                  <p className="text-muted-foreground">
                    Get AI suggestions for toppings, add-ons, and seasonal specials for your prospective menu.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-secondary/20 hover:border-secondary/50 bg-gradient-to-br from-card to-background"
                onClick={() => setViewMode('trends')}
              >
                <CardContent className="flex flex-col items-center justify-center p-10 h-64 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-10 h-10 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">Trend Analysis</h3>
                  <p className="text-muted-foreground">
                    Deep dive into data insights, performing dishes, and customer engagement metrics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* CHAT VIEW */}
        {viewMode === 'chat' && (
          <div className="flex flex-col h-full flex-1 animate-in fade-in zoom-in-95 duration-300">
            {/* Chat Area */}
            <ScrollArea className="flex-1 min-h-[400px] mb-4 border rounded-xl bg-card/50 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <Card
                      className={`max-w-[80%] p-4 shadow-md ${message.type === 'user'
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white border-none'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                        }`}
                    >
                      <p className={`whitespace-pre-line text-sm ${message.type === 'user' ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>{message.content}</p>
                      {message.buttons && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.buttons.map((button, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="secondary"
                              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-100 dark:border-zinc-600"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleButtonClick(button.value);
                              }}
                            >
                              {button.icon && <span className="mr-1">{button.icon}</span>}
                              {button.label}
                            </Button>
                          ))}
                        </div>
                      )}

                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Quick Prompts */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {['Masala Puri', 'Pav Bhaji', 'Paneer Tikka', 'Masala Dosa'].map((dish) => (
                <Button
                  key={dish}
                  size="sm"
                  variant="outline"
                  className="whitespace-nowrap rounded-full border-primary/50 text-primary hover:bg-primary/10"
                  onClick={() => handleQuickAction(dish)}
                >
                  {dish}
                </Button>
              ))}
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-background pt-2">
              <div className="flex gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  className={`border-primary ${isRecording ? 'bg-destructive text-destructive-foreground' : 'text-primary'}`}
                  onClick={handleVoiceInput}
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask ChefGuru anything..."
                  className="flex-1 bg-muted border-primary/20 focus-visible:ring-primary"
                />
                <Button size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSendMessage}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TRENDS VIEW */}
        {viewMode === 'trends' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Dishes */}
              <Card className="bg-card border-primary/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-card-foreground">🏆 Top Performing Dishes</CardTitle>
                  <CardDescription className="text-muted-foreground">Based on popularity data analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {popularityData.slice(0, 15).map((dish, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${index < 3 ? 'bg-yellow-500 text-white' : 'bg-primary/20 text-primary'}`}>
                              <span className="font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <div className="text-card-foreground font-medium">{dish.dish_name}</div>
                              <div className="text-xs text-muted-foreground">Score: {dish.popularity_score}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-card-foreground">{dish.views.toLocaleString()} views</div>
                            <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                              <Heart className="w-3 h-3 text-red-500" /> {dish.likes.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Engagement Analysis */}
              <Card className="bg-card border-secondary/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-card-foreground">📈 Engagement Analysis</CardTitle>
                  <CardDescription className="text-muted-foreground">Views, likes, and comments breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-6">
                      {/* Bar Chart for Engagement Metrics */}
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {popularityData.slice(0, 10).map((dish, index) => {
                            const maxViews = popularityData.length ? Math.max(...popularityData.map((d) => d.views)) : 1;
                            return (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-card-foreground">{dish.dish_name}</span>
                                  <span className="text-xs text-muted-foreground">{dish.popularity_score} score</span>
                                </div>
                                <div className="space-y-1">
                                  {/* Views Bar */}
                                  <div className="flex items-center">
                                    <Eye className="h-3 w-3 text-primary mr-2" />
                                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                                      <div
                                        className="bg-gradient-to-r from-primary to-primary/70 h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(dish.views / maxViews) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            {/* Gap Analysis */}
            <Card className="bg-card border-primary/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-card-foreground">🎯 Gap Analysis & Recommendations</CardTitle>
                <CardDescription className="text-muted-foreground">Opportunities to improve your menu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-card-foreground mb-3">📊 Performance Gaps</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
                        <div className="text-secondary font-medium">Low Engagement Items</div>
                        <div className="text-sm text-muted-foreground">Masala Dosa: High views but low engagement ratio</div>
                      </div>
                      <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
                        <div className="text-accent font-medium">High Potential</div>
                        <div className="text-sm text-muted-foreground">Paneer Tikka: Strong performance, consider expanding</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-card-foreground mb-3">💡 Action Items</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-card-foreground font-medium">1. Menu Optimization</div>
                        <div className="text-sm text-muted-foreground">Focus on top 5 performing dishes</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-card-foreground font-medium">2. Add Seasonal Items</div>
                        <div className="text-sm text-muted-foreground">Introduce winter specials and festival items</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

// Helper Icon Component
function StartChatIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </svg>
  )
}

export default ChefGuru;
