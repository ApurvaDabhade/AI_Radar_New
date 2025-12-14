import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, User, Bell, Shield, Globe, Store } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-foreground hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">⚙️ Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account & preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Settings */}
        <Card className="bg-card border-primary/30 p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-card-foreground">Profile Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Business Name</Label>
              <Input defaultValue="Sharma's Food Corner" className="bg-muted border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Owner Name</Label>
                <Input defaultValue="Rajesh Sharma" className="bg-muted border-border" />
              </div>
              <div>
                <Label className="text-foreground">Phone Number</Label>
                <Input defaultValue="+91 98765 43210" className="bg-muted border-border" />
              </div>
            </div>
            <div>
              <Label className="text-foreground">Email</Label>
              <Input defaultValue="rajesh@example.com" className="bg-muted border-border" />
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
          </div>
        </Card>

        {/* Business Settings */}
        <Card className="bg-card border-accent/30 p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-accent" />
            <h3 className="text-xl font-bold text-card-foreground">Business Details</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Business Type</Label>
              <Input defaultValue="Street Food Vendor" className="bg-muted border-border" />
            </div>
            <div>
              <Label className="text-foreground">Location</Label>
              <Input defaultValue="Gateway of India, Mumbai" className="bg-muted border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Opening Time</Label>
                <Input type="time" defaultValue="09:00" className="bg-muted border-border" />
              </div>
              <div>
                <Label className="text-foreground">Closing Time</Label>
                <Input type="time" defaultValue="22:00" className="bg-muted border-border" />
              </div>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Update Business</Button>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="bg-card border-secondary/30 p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-secondary" />
            <h3 className="text-xl font-bold text-card-foreground">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when inventory is low</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Customer Reviews</p>
                <p className="text-sm text-muted-foreground">Notifications for new feedback</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sales Reports</p>
                <p className="text-sm text-muted-foreground">Daily sales summary</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Festival Reminders</p>
                <p className="text-sm text-muted-foreground">Upcoming events and trends</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Language & Region */}
        <Card className="bg-card border-primary/30 p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-card-foreground">Language & Region</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Preferred Language</p>
                <p className="text-sm text-muted-foreground">Current: {language === 'en' ? 'English' : 'हिंदी'}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="border-primary text-primary hover:bg-primary/10"
              >
                Switch to {language === 'en' ? 'हिंदी' : 'English'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="bg-card border-destructive/30 p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-destructive" />
            <h3 className="text-xl font-bold text-card-foreground">Security</h3>
          </div>
          <div className="space-y-4">
            <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
              Change Password
            </Button>
            <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary/10">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full border-border text-muted-foreground hover:bg-muted">
              Privacy Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
