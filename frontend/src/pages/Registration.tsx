import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Upload, Mic, CheckCircle } from 'lucide-react';

type RegistrationStep = 'account' | 'business' | 'menu' | 'inventory';

interface MenuItem {
  name: string;
  price: string;
  ingredients: string;
}

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<RegistrationStep>('account');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessType: '',
    businessName: '',
    location: '',
    operatingHours: '',
    menuItems: [] as MenuItem[],
    initialStock: '',
  });

  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem>({
    name: '',
    price: '',
    ingredients: '',
  });

  const businessTypes = [
    'Street Food Vendor',
    'Small Restaurant',
    'Food Stall',
    'Boutique',
    'Handicraft',
    'Tourism',
    'Cafe',
  ];

  const steps: RegistrationStep[] = ['account', 'business', 'menu', 'inventory'];
  const stepIndex = steps.indexOf(currentStep);
  const stepLabels = ['Create Account', 'Business Info', 'Menu', 'Stock'];

  const handleNext = () => {
    if (currentStep === 'account') {
      if (!formData.name || !formData.phone) {
        toast({
          title: 'Incomplete Information',
          description: 'Please enter name and phone number',
          variant: 'destructive',
        });
        return;
      }
    }

    if (currentStep === 'business' && (!formData.businessType || !formData.businessName)) {
      toast({
        title: 'Incomplete Information',
        description: 'Please fill in business details',
        variant: 'destructive',
      });
      return;
    }

    const nextStepIndex = stepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex]);
    }
  };

  const handleBack = () => {
    const prevStepIndex = stepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex]);
    }
  };

  const handleAddMenuItem = () => {
    if (!currentMenuItem.name || !currentMenuItem.price) {
      toast({
        title: 'Incomplete Item',
        description: 'Please enter name and price',
        variant: 'destructive',
      });
      return;
    }

    setFormData({
      ...formData,
      menuItems: [...formData.menuItems, currentMenuItem],
    });

    setCurrentMenuItem({ name: '', price: '', ingredients: '' });

    toast({
      title: 'Menu Item Added!',
      description: `${currentMenuItem.name} added to menu`,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessType: formData.businessType,
          location: formData.location,
          menuItems: formData.menuItems
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save user to local storage for session simulation
        localStorage.setItem('user', JSON.stringify(data.user));

        toast({
          title: 'Registration Complete!',
          description: 'Welcome to RasoiMitra. Redirecting to dashboard...',
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast({
          title: 'Registration Failed',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: 'Could not connect to server',
        variant: 'destructive',
      });
    }
  };

  const handleVoiceInput = () => {
    toast({
      title: 'Voice Recording',
      description: 'Speak your menu items now...',
    });
  };

  const handleCSVUpload = () => {
    toast({
      title: 'CSV Upload',
      description: 'Select your menu CSV file',
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'account':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">Create Account</h2>
              <p className="text-muted-foreground">Start your business journey</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-muted-foreground">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="bg-card border-border text-lg py-6"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-muted-foreground">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="bg-card border-border text-lg py-6"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-muted-foreground">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="bg-card border-border"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-muted-foreground">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  className="bg-card border-border text-lg py-6"
                />
              </div>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">Business Information</h2>
              <p className="text-muted-foreground">Tell us about your business</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessType" className="text-muted-foreground">Business Type *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                >
                  <SelectTrigger className="bg-card border-border text-lg py-6">
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-foreground text-lg py-3">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="businessName" className="text-muted-foreground">Shop/Stall Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Mumbai Chaat Corner"
                  className="bg-card border-border text-lg py-6"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-muted-foreground">Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter address or use GPS"
                    className="bg-card border-border"
                  />
                  <Button variant="outline" className="border-border text-foreground px-6">
                    📍 GPS
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="operatingHours" className="text-muted-foreground">Operating Hours</Label>
                <Input
                  id="operatingHours"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                  placeholder="e.g. 10 AM - 10 PM"
                  className="bg-card border-border"
                />
              </div>
            </div>
          </div>
        );

      case 'menu':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">Menu / Products</h2>
              <p className="text-muted-foreground">Add your items</p>
            </div>

            {/* Input Methods */}
            <div className="flex gap-2">
              <Button
                onClick={handleVoiceInput}
                variant="outline"
                className="flex-1 border-border text-foreground py-6"
              >
                <Mic className="h-5 w-5 mr-2" />
                Add by Voice
              </Button>
              <Button
                onClick={handleCSVUpload}
                variant="outline"
                className="flex-1 border-border text-foreground py-6"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload File
              </Button>
            </div>

            {/* Manual Entry Form */}
            <Card className="bg-card border-border p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="itemName" className="text-muted-foreground">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={currentMenuItem.name}
                    onChange={(e) => setCurrentMenuItem({ ...currentMenuItem, name: e.target.value })}
                    placeholder="e.g. Paneer Roll"
                    className="bg-background border-border text-lg py-6"
                  />
                </div>

                <div>
                  <Label htmlFor="itemPrice" className="text-muted-foreground">Price (₹) *</Label>
                  <Input
                    id="itemPrice"
                    type="number"
                    value={currentMenuItem.price}
                    onChange={(e) => setCurrentMenuItem({ ...currentMenuItem, price: e.target.value })}
                    placeholder="50"
                    className="bg-background border-border text-lg py-6"
                  />
                </div>

                <Button
                  onClick={handleAddMenuItem}
                  className="w-full bg-primary hover:bg-primary/90 py-6 text-lg"
                >
                  Add to Menu
                </Button>
              </div>
            </Card>

            {/* Menu Items List */}
            {formData.menuItems.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Your Menu ({formData.menuItems.length} items)</h3>
                <div className="space-y-2">
                  {formData.menuItems.map((item, index) => (
                    <Card key={index} className="bg-card border-border p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-foreground">{item.name}</h4>
                          <p className="text-sm text-accent">₹{item.price}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-accent" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">Initial Stock</h2>
              <p className="text-muted-foreground">Set your initial stock (optional)</p>
            </div>

            <Card className="bg-card border-border p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="initialStock" className="text-muted-foreground">Stock Details</Label>
                  <Textarea
                    id="initialStock"
                    value={formData.initialStock}
                    onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                    placeholder="Example:&#10;Paneer - 10 kg&#10;Tomato - 20 kg&#10;Onion - 15 kg"
                    rows={6}
                    className="bg-background border-border"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  💡 Tip: You can also add this later from the dashboard.
                </p>

                <Button
                  onClick={() => {
                    setFormData({ ...formData, initialStock: '' });
                    toast({
                      title: 'Skipped',
                      description: 'You can add later from dashboard',
                    });
                  }}
                  variant="outline"
                  className="w-full border-border text-foreground"
                >
                  Skip for Now
                </Button>
              </div>
            </Card>

            {/* Summary */}
            <Card className="bg-accent/10 border-accent/30 p-4">
              <h3 className="text-xl font-bold mb-3 text-foreground">🎉 Your Information</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Business:</strong> {formData.businessName}</p>
                <p><strong>Type:</strong> {formData.businessType}</p>
                <p><strong>Menu Items:</strong> {formData.menuItems.length}</p>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => stepIndex > 0 ? handleBack() : navigate('/')}
              className="text-foreground hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-primary">Registration</h1>
              <p className="text-sm text-muted-foreground">Step {stepIndex + 1}/4 - {stepLabels[stepIndex]}</p>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-muted h-2">
        <div
          className="bg-primary h-2 transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${index <= stepIndex ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${index < stepIndex
                  ? 'bg-primary text-primary-foreground'
                  : index === stepIndex
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                {index < stepIndex ? <CheckCircle className="h-5 w-5" /> : index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-32">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent p-4 border-t border-border">
        <div className="container mx-auto max-w-4xl flex gap-4">
          {stepIndex > 0 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 border-border text-foreground py-6 text-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
          )}

          {stepIndex < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              className="flex-1 bg-primary hover:bg-primary/90 py-6 text-lg"
            >
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-accent hover:bg-accent/90 py-6 text-lg"
            >
              🎉 Complete Registration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;
