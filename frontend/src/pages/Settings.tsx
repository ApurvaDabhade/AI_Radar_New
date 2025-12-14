import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Bell, Shield, Globe, Store, LogOut, Save } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();

  // State for form fields
  const [profile, setProfile] = useState({
    businessName: "Sharma's Food Corner",
    ownerName: "Rajesh Sharma",
    phone: "+91 98765 43210",
    email: "rajesh@example.com",
    businessType: "Street Food Vendor",
    location: "Gateway of India, Mumbai",
    openTime: "09:00",
    closeTime: "22:00"
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vendorProfile');
    if (saved) {
      setProfile(JSON.parse(saved));
    } else {
      // If no profile, try to load from 'user' (set during registration)
      const regUser = localStorage.getItem('user');
      if (regUser) {
        const u = JSON.parse(regUser);
        setProfile(prev => ({
          ...prev,
          ownerName: u.name || prev.ownerName,
          businessName: u.stallName || prev.businessName,
          phone: u.phone || prev.phone,
          businessType: u.specialty || prev.businessType, // approximation
          location: u.location || prev.location
        }));
      }
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('vendorProfile', JSON.stringify(profile));
    // Also update main user object if needed, but keeping separate for safety
    toast({
      title: "Settings Saved ✅",
      description: "Your profile details have been updated."
    });
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('user');
    toast({
      title: "Logged Out",
      description: "See you soon!"
    });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-foreground hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">⚙️ Settings</h1>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
            <Button variant="destructive" size="icon" onClick={handleLogout} className="flex md:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        
        {/* Profile Settings */}
        <Card className="bg-card border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-card-foreground">Profile Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Business Name</Label>
              <Input 
                value={profile.businessName} 
                onChange={(e) => handleChange('businessName', e.target.value)} 
                className="bg-muted"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Owner Name</Label>
                <Input 
                  value={profile.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input 
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="bg-muted"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="bg-muted"
              />
            </div>
          </div>
        </Card>

        {/* Business Settings */}
        <Card className="bg-card border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Store className="h-5 w-5 text-accent" />
            <h3 className="text-xl font-bold text-card-foreground">Business Details</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Business Type</Label>
              <Input 
                value={profile.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input 
                value={profile.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="bg-muted"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Opening Time</Label>
                <Input 
                  type="time" 
                  value={profile.openTime}
                  onChange={(e) => handleChange('openTime', e.target.value)}
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Closing Time</Label>
                <Input 
                  type="time" 
                  value={profile.closeTime}
                  onChange={(e) => handleChange('closeTime', e.target.value)}
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90">
          <Save className="mr-2 h-5 w-5" /> Save Changes
        </Button>

        {/* Language & Region */}
        <Card className="bg-card border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-secondary" />
            <h3 className="text-xl font-bold text-card-foreground">Language</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">App Language</p>
              <p className="text-sm text-muted-foreground">Current: {language === 'en' ? 'English' : 'हिंदी'}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            >
              Switch to {language === 'en' ? 'हिंदी' : 'English'}
            </Button>
          </div>
        </Card>

        {/* Notifications (Mock) */}
        <Card className="bg-card border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-xl font-bold text-card-foreground">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Stock Alerts</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Sales Reports</Label>
              <Switch />
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Settings;
