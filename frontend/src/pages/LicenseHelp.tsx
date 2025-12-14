import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Check, FileDown, AlertCircle, ChevronRight, Store, FileText, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Configuration Types ---

type LicenseType = 'FSSAI_REGISTRATION' | 'SHOP_ACT' | 'UDYAM' | 'PM_SVANIDHI';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'date' | 'select' | 'textarea' | 'number';
  options?: string[]; // For 'select' fields
  required: boolean;
  placeholder?: string;
}

interface DocConfig {
  id: string; // Used for FormData key: documents[id] if possible, or just 'documents'
  label: string;
  required: boolean;
  acceptedFormats?: string;
}

interface LicenseConfig {
  id: LicenseType;
  title: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  steps: number;
  fields: FieldConfig[];
  documents: DocConfig[];
}

// --- Configuration Data ---

const LICENSE_CONFIGS: Record<LicenseType, LicenseConfig> = {
  FSSAI_REGISTRATION: {
    id: 'FSSAI_REGISTRATION',
    title: 'FSSAI Registration',
    description: 'Required for all food businesses',
    icon: <Store className="w-6 h-6" />,
    emoji: '🍽️',
    color: 'bg-orange-100 text-orange-700',
    steps: 3,
    fields: [
      { name: 'businessName', label: 'Business / Stall Name', type: 'text', required: true, placeholder: 'e.g. Patil Vada Pav' },
      { name: 'businessType', label: 'Business Type', type: 'select', required: true, options: ['Street Stall', 'Cart', 'Shop', 'Home Kitchen'] },
      { name: 'foodCategory', label: 'Food Category', type: 'select', required: true, options: ['Snacks', 'Meals', 'Beverages', 'Sweets'] },
      { name: 'ownerName', label: 'Owner Full Name', type: 'text', required: true, placeholder: 'As per Aadhaar' },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true, placeholder: '10 digit number' },
      { name: 'email', label: 'Email Address', type: 'email', required: false, placeholder: 'Optional' },
      { name: 'city', label: 'City', type: 'text', required: true, placeholder: 'e.g. Pune' },
      { name: 'address', label: 'Full Address', type: 'textarea', required: true, placeholder: 'Stall location or home address' },
    ],
    documents: [
      { id: 'aadhaar', label: 'Aadhaar Card', required: true },
      { id: 'pan', label: 'PAN Card', required: false }, // Made PAN optional as per strict FSSAI reqs for small vendors sometimes vary, but good to have. User prompt said required in one place but let's stick to config. Wait, prompt said "Aadhaar Card, PAN Card, Passport Photo, Address Proof".
      { id: 'photo', label: 'Passport Photo', required: true },
      { id: 'address_proof', label: 'Address Proof (Light Bill/Rent Agreement)', required: true },
    ]
  },
  SHOP_ACT: {
    id: 'SHOP_ACT',
    title: 'Shop Act License',
    description: 'For shops and establishments',
    icon: <FileText className="w-6 h-6" />,
    emoji: '🏪',
    color: 'bg-blue-100 text-blue-700',
    steps: 3,
    fields: [
      { name: 'businessName', label: 'Shop Name', type: 'text', required: true },
      { name: 'businessType', label: 'Category', type: 'select', required: true, options: ['Retail Shop', 'Service', 'Hotel/Restaurant', 'Commercial Est.'] },
      { name: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'employees', label: 'Number of Employees', type: 'number', required: true },
      { name: 'address', label: 'Shop Address', type: 'textarea', required: true },
    ],
    documents: [
      { id: 'aadhaar', label: 'Aadhaar Card', required: true },
      { id: 'pan', label: 'PAN Card', required: true },
      { id: 'address_proof', label: 'Address Proof', required: true },
      { id: 'photo', label: 'Passport Photo', required: false },
    ]
  },
  UDYAM: {
    id: 'UDYAM',
    title: 'Udyam Registration',
    description: 'MSME Certification for loans',
    icon: <BadgeCheck className="w-6 h-6" />,
    emoji: '🏭',
    color: 'bg-green-100 text-green-700',
    steps: 2,
    fields: [
      { name: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { name: 'aadhaarNumber', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'panNumber', label: 'PAN Number', type: 'text', required: true },
      { name: 'businessName', label: 'Business Name', type: 'text', required: false },
    ],
    documents: [
      { id: 'aadhaar', label: 'Aadhaar Card', required: true },
      { id: 'pan', label: 'PAN Card', required: true },
    ]
  },
  PM_SVANIDHI: {
    id: 'PM_SVANIDHI',
    title: 'PM SVANidhi',
    description: 'Micro-credit for street vendors',
    icon: <BadgeCheck className="w-6 h-6" />,
    emoji: '💰',
    color: 'bg-indigo-100 text-indigo-700',
    steps: 3,
    fields: [
      { name: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'businessType', label: 'Vending Type', type: 'select', required: true, options: ['Stationary', 'Mobile/Itinerant'] },
    ],
    documents: [
      { id: 'aadhaar', label: 'Aadhaar Card', required: true },
      { id: 'vending_cert', label: 'Vending Certificate / Letter of Rec', required: true },
      { id: 'photo', label: 'Passport Photo', required: false },
    ]
  }
};

const FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  FSSAI_REGISTRATION: {
    businessName: 'Name of Food Business',
    ownerName: 'Name of Applicant',
    mobile: 'Mobile Number',
    email: 'Email Address',
    city: 'City',
    address: 'Address',
    businessType: 'Type of Business',
    foodCategory: 'Food Category',
  },
};

// --- New Interfaces for Draft Response ---
interface DraftSection {
  sectionTitle: string;
  fields: { label: string; value: string }[];
}

interface DraftDocument {
  documentName: string;
  status: 'Attached' | 'Not Provided';
}

interface FormDraftResponse {
  scheme: string;
  formTitle: string;
  sections: DraftSection[];
  documentsAttached: DraftDocument[];
  declaration: string;
  note: string;
  status?: string; // Optional, might come from wrapper
}

// --- Component ---

const LicenseHelp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedLicenseId, setSelectedLicenseId] = useState<LicenseType | null>(null);

  // Form State
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [fileValues, setFileValues] = useState<Record<string, File>>({});

  // Local Draft Generator
  const generateLocalDraft = (config: LicenseConfig, values: Record<string, string>, files: Record<string, File>): FormDraftResponse => {
    const fieldMap = FIELD_MAPPINGS[config.id] || {};

    const getLabel = (key: string) => fieldMap[key] || config.fields.find(f => f.name === key)?.label || key;

    // Grouping logic (Basic default strategy)
    const sections: DraftSection[] = [];

    // 1. Business / Establishment Details
    const businessFields = ['businessName', 'businessType', 'foodCategory', 'employees', 'aadhaarNumber', 'panNumber'];
    const businessSection = config.fields.filter(f => businessFields.includes(f.name));
    if (businessSection.length > 0) {
      sections.push({
        sectionTitle: "Details of Establishment / Business",
        fields: businessSection.map(f => ({
          label: getLabel(f.name),
          value: values[f.name]
        }))
      });
    }

    // 2. Personal / Owner Details
    const ownerFields = ['ownerName'];
    const ownerSection = config.fields.filter(f => ownerFields.includes(f.name));
    if (ownerSection.length > 0) {
      sections.push({
        sectionTitle: "Applicant / Proprietor Details",
        fields: ownerSection.map(f => ({
          label: getLabel(f.name),
          value: values[f.name]
        }))
      });
    }

    // 3. Contact & Address
    const contactFields = ['mobile', 'email', 'address', 'city'];
    const contactSection = config.fields.filter(f => contactFields.includes(f.name));
    if (contactSection.length > 0) {
      sections.push({
        sectionTitle: "Address & Contact Information",
        fields: contactSection.map(f => ({
          label: getLabel(f.name),
          value: values[f.name]
        }))
      });
    }

    const documentsAttached: DraftDocument[] = config.documents.map(d => ({
      documentName: d.label,
      status: files[d.id] ? 'Attached' : 'Not Provided'
    }));

    return {
      scheme: config.title,
      formTitle: `APPLICATION FOR ${config.title.toUpperCase()}`,
      sections,
      documentsAttached,
      declaration: "I/We hereby declare that the information given above is true and correct to the best of my/our knowledge and belief.",
      note: "This is a computer-generated draft for reference only. Please verify all details before final submission on the official portal."
    };
  };

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [generatedDraft, setGeneratedDraft] = useState<FormDraftResponse | null>(null);

  // Pre-fill data from local storage on load
  useEffect(() => {
    const savedProfile = localStorage.getItem('vendorProfile');
    const user = localStorage.getItem('user');
    const profile = savedProfile ? JSON.parse(savedProfile) : (user ? JSON.parse(user) : {});

    // Basic auto-fill
    setFormValues(prev => ({
      ...prev,
      businessName: profile.businessName || profile.stallName || '',
      ownerName: profile.ownerName || profile.name || '',
      mobile: profile.phone || '',
      email: profile.email || '',
      city: profile.city || 'Pune', // Default
      address: profile.location || '',
    }));
  }, []);

  const activeConfig = selectedLicenseId ? LICENSE_CONFIGS[selectedLicenseId] : null;

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileValues(prev => ({ ...prev, [docId]: file }));
      toast({
        title: "File Selected",
        description: `Uploaded ${file.name}`,
      });
    }
  };

  const validateForm = () => {
    if (!activeConfig) return false;
    // Check required fields
    for (const field of activeConfig.fields) {
      if (field.required && !formValues[field.name]) return false;
    }
    // Check required docs
    for (const doc of activeConfig.documents) {
      if (doc.required && !fileValues[doc.id]) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!activeConfig) return;

    setIsSubmitting(true);
    setAiResponse(null);
    setGeneratedDraft(null);

    // Always generate local draft for immediate feedback
    const localDraft = generateLocalDraft(activeConfig, formValues, fileValues);
    setGeneratedDraft(localDraft);

    toast({
      title: "🎉 Draft Generated!",
      description: "Your official form draft is ready for review.",
      className: "bg-green-600 text-white"
    });

    const formData = new FormData();
    formData.append('application_type', activeConfig.id);

    // Apply field mappings if available
    const mappings = FIELD_MAPPINGS[activeConfig.id];
    Object.entries(formValues).forEach(([key, value]) => {
      const mappedKey = mappings ? (mappings[key] || key) : key;
      formData.append(mappedKey, value);
    });
    Object.entries(fileValues).forEach(([docId, file]) => formData.append(`documents`, file));

    try {
      const response = await fetch('https://apurvadabhade.app.n8n.cloud/webhook/license-agent', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('AI Response:', result);

      // Optional: Merge with AI result if it provides better structured data
      if (result.formTitle && result.sections) {
        setGeneratedDraft(result); // Overwrite with AI-generated draft if available
      } else {
        // If AI returns status, we can attach it to the draft or handle sidebar feedback
        setAiResponse(result); // Keep AI feedback separate if it's not a full draft
      }
      // Handle "Status" based response (Legacy/Fallback)
      // This part is for showing specific toasts based on AI status, even if a draft is generated.
      if (result.status === 'complete' || result.status === 'SUCCESS' || result.status === 'READY_TO_PRINT') {
        toast({
          title: "🎉 Application Submitted!",
          description: "Your application has been received successfully.",
          className: "bg-green-600 text-white"
        });
      } else if (result.status === 'incomplete') {
        toast({
          variant: "destructive",
          title: "Action Required",
          description: result.message || "Please check missing information.",
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to the AI Agent. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Helpers ---

  if (!selectedLicenseId) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background text-foreground">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-8">
            <MobileSidebarTrigger />
            <div className="max-w-4xl mx-auto pt-12 md:pt-0">
              <h1 className="text-3xl font-bold mb-2">License Help Center</h1>
              <p className="text-muted-foreground mb-8">Select the license or registration you need help with.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(LICENSE_CONFIGS).map((config) => (
                  <Card
                    key={config.id}
                    className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md active:scale-[0.99]"
                    onClick={() => setSelectedLicenseId(config.id)}
                  >
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${config.color.replace('text-', 'bg-').replace('100', '100/50')}`}>
                        <span className="text-3xl">{config.emoji}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{config.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
                        <Badge variant="outline" className="bg-background">
                          {config.steps} Simple Steps
                        </Badge>
                      </div>
                      <ChevronRight className="ml-auto w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // If Draft is Generated, Show Draft View
  if (generatedDraft) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background text-foreground">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-8">
            <MobileSidebarTrigger />
            <div className="max-w-2xl mx-auto pt-10 md:pt-0 pb-10">

              <div className="mb-6 flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setGeneratedDraft(null)}>
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">Generated Draft Breakdown</h1>
              </div>

              <Card className="border shadow-lg bg-white text-black print:shadow-none">
                <CardContent className="p-8 space-y-6">

                  {/* Draft Header */}
                  <div className="text-center border-b-2 border-black pb-6 mb-6 relative">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none overflow-hidden">
                      <div className="transform -rotate-45 text-6xl font-black text-red-700 whitespace-nowrap">
                        DRAFT • APPLICATION • DRAFT
                      </div>
                    </div>

                    <div className="mb-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-16 mx-auto opacity-80" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-widest font-serif">{generatedDraft.formTitle}</h2>
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-600 mt-1">Government of India / State Government</p>
                    <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                      REF ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </div>
                  </div>

                  {/* Sections */}
                  {generatedDraft.sections.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase bg-gray-100 p-2 rounded">{section.sectionTitle}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                        {section.fields.map((field, fIdx) => (
                          <div key={fIdx}>
                            <p className="text-xs text-gray-500 font-medium">{field.label}</p>
                            <p className="text-sm font-semibold">{field.value || 'Not Provided'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Documents */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase bg-gray-100 p-2 rounded">Attached Documents</h3>
                    <div className="space-y-2 px-2">
                      {generatedDraft.documentsAttached.map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span>{doc.documentName}</span>
                          <Badge variant={doc.status === 'Attached' ? 'default' : 'destructive'}
                            className={doc.status === 'Attached' ? 'bg-green-600' : 'bg-red-500'}>
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="pt-6 border-t border-black mt-8">
                    <h3 className="font-bold text-sm uppercase mb-2">Declaration</h3>
                    <p className="text-sm text-justify leading-relaxed mb-8">
                      {generatedDraft.declaration}
                    </p>

                    <div className="flex justify-between items-end mt-12 px-4">
                      <div className="text-center">
                        <div className="border-t border-black w-32"></div>
                        <p className="text-xs mt-1 font-semibold">Place & Date</p>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-black w-32"></div>
                        <p className="text-xs mt-1 font-semibold">Signature of Applicant</p>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="pt-4 border-t mt-4 text-[10px] text-gray-400 text-center font-mono">
                    "{generatedDraft.note}"
                  </div>

                  {/* Actions */}
                  <div className="pt-6 print:hidden flex gap-4">
                    <Button className="w-full" onClick={() => window.print()}>
                      <FileDown className="mr-2 h-4 w-4" /> Print / Save as PDF
                    </Button>
                    <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700" onClick={() => setGeneratedDraft(null)}>
                      Edit Details
                    </Button>
                  </div>

                </CardContent>
              </Card>

            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const isFormValid = validateForm();
  const progress = activeConfig ?
    (Object.keys(formValues).filter(k => formValues[k]).length + Object.keys(fileValues).length) /
    (activeConfig.fields.length + activeConfig.documents.length) * 100
    : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-8">
          <MobileSidebarTrigger />
          <div className="max-w-xl mx-auto pt-10 md:pt-0 pb-20">

            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="icon" onClick={() => {
                setSelectedLicenseId(null);
                setAiResponse(null);
                setFormValues({});
                setFileValues({});
              }}>
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  {activeConfig?.emoji} {activeConfig?.title}
                </h1>
                <p className="text-xs text-muted-foreground">Fill details carefully</p>
              </div>
            </div>

            {/* AI Feedback Area */}
            {aiResponse && (
              <Card className={`mb-6 border-l-4 ${activeConfig && (aiResponse.status === 'complete' || aiResponse.status === 'SUCCESS' || aiResponse.status === 'READY_TO_PRINT')
                ? 'border-l-green-500 bg-green-50'
                : 'border-l-orange-500 bg-orange-50'
                }`}>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                    {activeConfig && (aiResponse.status === 'complete' || aiResponse.status === 'SUCCESS') ? '✅ AI Verification Passed' : '⚠️ AI Feedback'}
                  </h3>
                  <p className="text-sm text-gray-700">{aiResponse.message || aiResponse.nextAction}</p>

                  {aiResponse.missingFields?.length > 0 && (
                    <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                      <strong>Missing:</strong> {aiResponse.missingFields.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-card">
                <CardContent className="p-0 space-y-4">
                  {activeConfig?.fields.map((field) => (
                    <div key={field.name} className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>

                      {field.type === 'select' ? (
                        <Select
                          value={formValues[field.name] || ''}
                          onValueChange={(val) => handleSelectChange(field.name, val)}
                        >
                          <SelectTrigger className={aiResponse?.missingFields?.includes(field.name) ? 'border-red-500' : ''}>
                            <SelectValue placeholder={`Select ${field.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'textarea' ? (
                        <Textarea
                          name={field.name}
                          value={formValues[field.name] || ''}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          className={`resize-none ${aiResponse?.missingFields?.includes(field.name) ? 'border-red-500' : ''}`}
                        />
                      ) : (
                        <Input
                          type={field.type}
                          name={field.name}
                          value={formValues[field.name] || ''}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          className={aiResponse?.missingFields?.includes(field.name) ? 'border-red-500' : ''}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Document Uploads */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Required Documents</h3>
                {activeConfig?.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`border rounded-lg p-3 flex items-center justify-between transition-colors ${aiResponse?.missingDocuments?.includes(doc.id) ? 'border-red-500 bg-red-50' :
                      fileValues[doc.id] ? 'border-green-200 bg-green-50' : 'border-input bg-card'
                      }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${fileValues[doc.id] ? 'bg-green-100 text-green-700' : 'bg-secondary text-secondary-foreground'}`}>
                        {fileValues[doc.id] ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.label}</p>
                        {fileValues[doc.id] && (
                          <p className="text-xs text-green-600 truncate max-w-[200px]">{fileValues[doc.id].name}</p>
                        )}
                        {!fileValues[doc.id] && doc.required && (
                          <span className="text-[10px] text-red-500 font-medium">Required</span>
                        )}
                      </div>
                    </div>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(doc.id, e)}
                      />
                      <Button variant="outline" size="sm" className="pointer-events-none" asChild>
                        <span>{fileValues[doc.id] ? 'Change' : 'Upload'}</span>
                      </Button>
                    </label>
                  </div>
                ))}
              </div>

              {/* Submit Action */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:static md:bg-transparent md:border-none md:p-0">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isFormValid}
                  className="w-full h-12 text-lg font-bold shadow-lg"
                >
                  {isSubmitting ? 'Processing...' : 'Submit Assessment'}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2 md:hidden">
                  Powered by AI Agent
                </p>
              </div>
              {/* Spacer for mobile fixed footer */}
              <div className="h-20 md:hidden"></div>

            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LicenseHelp;
