import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Check, FileDown, Camera, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const licenses = [
  {
    id: 'fssai',
    name: 'FSSAI Food License',
    emoji: '🍽️',
    description: 'Required for food business',
    steps: 4,
    fee: 'FREE',
  },
  {
    id: 'shop',
    name: 'Shop Act Registration',
    emoji: '🪪',
    description: 'Business registration',
    steps: 3,
    fee: 'FREE',
  },
  {
    id: 'udyam',
    name: 'Udyam Registration',
    emoji: '🏭',
    description: 'MSME certificate',
    steps: 3,
    fee: 'FREE',
  },
];

const schemes = [
  {
    id: 'svanidhi',
    name: 'PM SVANidhi',
    emoji: '💰',
    benefit: 'Loan up to ₹50,000',
    description: 'Working capital for street vendors',
  },
  {
    id: 'pmegp',
    name: 'PMEGP',
    emoji: '📈',
    benefit: 'Subsidy up to 35%',
    description: 'For new micro enterprises',
  },
  {
    id: 'mudra',
    name: 'Mudra Loan',
    emoji: '🏦',
    benefit: 'Loan up to ₹10 Lakh',
    description: 'For small businesses',
  },
  {
    id: 'pmfme',
    name: 'PMFME',
    emoji: '🍱',
    benefit: 'Credit up to ₹10 Lakh',
    description: 'For food processing units',
  },
];

const documents = [
  { id: 'aadhaar', name: 'Aadhaar Card', emoji: '🪪', required: true },
  { id: 'pan', name: 'PAN Card', emoji: '🧾', required: false },
  { id: 'photo', name: 'Passport Photo', emoji: '🖼️', required: true },
  { id: 'address', name: 'Address Proof', emoji: '📮', required: true },
];

const LicenseHelp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const handleUploadDoc = (docId: string) => {
    setTimeout(() => {
      setUploadedDocs([...uploadedDocs, docId]);
      toast({ title: '✅ Document Uploaded!', description: 'Successfully uploaded' });
    }, 500);
  };

  const handleSubmit = () => {
    toast({
      title: '🎉 Application Submitted!',
      description: 'Your application has been submitted successfully. You will receive updates via SMS.'
    });
    setSelectedLicense(null);
    setCurrentStep(1);
    setUploadedDocs([]);
  };

  const canSubmit = documents.filter(d => d.required).every(d => uploadedDocs.includes(d.id));

  if (selectedLicense) {
    const license = licenses.find(l => l.id === selectedLicense);
    const progress = (uploadedDocs.length / documents.length) * 100;

    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background text-foreground">
          <AppSidebar />

          <main className="flex-1 p-4 md:p-8">
            <MobileSidebarTrigger />

            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-12 md:pt-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLicense(null)}
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {license?.emoji} {license?.name}
                </h1>
                <p className="text-sm text-muted-foreground">Complete your application</p>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              {/* Progress */}
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Progress</span>
                    <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </CardContent>
              </Card>

              {/* Step Progress */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4].slice(0, license?.steps).map((step, idx) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                      ${idx < currentStep ? 'bg-accent text-accent-foreground' :
                        idx === currentStep - 1 ? 'bg-primary text-primary-foreground' :
                          'bg-muted text-muted-foreground'}
                    `}>
                      {idx < currentStep - 1 ? <Check className="h-5 w-5" /> : step}
                    </div>
                    {idx < (license?.steps || 4) - 1 && (
                      <div className={`w-8 h-1 mx-1 ${idx < currentStep - 1 ? 'bg-accent' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Documents Checklist */}
              <Card className="bg-card border-primary/30 shadow-lg">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-card-foreground">📄 Required Documents</h3>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${uploadedDocs.includes(doc.id)
                            ? 'bg-accent/10 border-accent'
                            : 'bg-muted border-border'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{doc.emoji}</span>
                          <div>
                            <span className="font-medium text-card-foreground">{doc.name}</span>
                            {doc.required && (
                              <Badge variant="outline" className="ml-2 text-xs">Required</Badge>
                            )}
                          </div>
                        </div>
                        {uploadedDocs.includes(doc.id) ? (
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                            <Check className="h-5 w-5 text-accent-foreground" />
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleUploadDoc(doc.id)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="bg-accent/10 border-accent/30 shadow-lg">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3 text-accent">📝 Steps to Follow</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">1</span>
                      Upload all required documents
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">2</span>
                      Submit application form
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">3</span>
                      Verification will be done
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">4</span>
                      License will be sent via email 🎉
                    </li>
                  </ol>
                </CardContent>
              </Card>

              {/* Fee Info */}
              <Card className="bg-secondary/10 border-secondary/30 shadow-lg">
                <CardContent className="p-4 text-center">
                  <span className="text-3xl">🎉</span>
                  <p className="text-lg font-bold text-secondary mt-2">FREE - Registration is completely free!</p>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full h-14 text-lg font-bold rounded-xl ${canSubmit
                    ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                Submit Application
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />

        <main className="flex-1 p-4 md:p-8">
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
                📄 License Help
              </h1>
              <p className="text-sm text-muted-foreground">Complete your applications step by step</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Licenses Section */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">📋 Your Licenses</h2>
              <div className="space-y-3">
                {licenses.map((license) => (
                  <Card
                    key={license.id}
                    className="bg-card border-border shadow-lg cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]"
                    onClick={() => setSelectedLicense(license.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <span className="text-3xl">{license.emoji}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-card-foreground">{license.name}</h3>
                            <p className="text-sm text-muted-foreground">{license.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{license.steps} Steps</Badge>
                              <Badge className="bg-accent text-accent-foreground text-xs">{license.fee}</Badge>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Government Schemes */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">🏛️ Government Schemes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schemes.map((scheme) => (
                  <Card
                    key={scheme.id}
                    className="bg-card border-border shadow-lg cursor-pointer hover:border-secondary/50 transition-all active:scale-[0.98]"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{scheme.emoji}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-card-foreground">{scheme.name}</h3>
                          <p className="text-sm text-muted-foreground">{scheme.description}</p>
                          <Badge className="mt-2 bg-secondary/20 text-secondary border-0">
                            {scheme.benefit}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 border-secondary text-secondary hover:bg-secondary/10"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LicenseHelp;
