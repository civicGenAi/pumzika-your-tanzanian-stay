import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Save,
    Check,
    X,
    Home,
    MapPin,
    Info,
    DollarSign,
    ImageIcon,
    Loader2,
    Wifi,
    Tv,
    Wind,
    Waves,
    Car,
    Coffee,
    Utensils,
    Lock,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SmartImageUpload } from '@/components/SmartImageUpload';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { destinations } from '@/data/sampleData';

const STEPS = [
    { title: 'Base Info', icon: Info, description: 'Title and basic description' },
    { title: 'Pricing & Category', icon: DollarSign, description: 'Set your rates and type' },
    { title: 'Location', icon: MapPin, description: 'Where is your property?' },
    { title: 'Amenities', icon: Wifi, description: 'What do you offer?' },
    { title: 'Photos', icon: ImageIcon, description: 'Professional visuals' },
    { title: 'Quality Promise', icon: CheckCircle2, description: 'Agree to standards' },
    { title: 'Review', icon: Check, description: 'Final check' },
];

const COMMON_AMENITIES = [
    { id: 'wifi', label: 'High-speed Wifi', icon: Wifi },
    { id: 'ac', label: 'Air Conditioning', icon: Wind },
    { id: 'kitchen', label: 'Full Kitchen', icon: Utensils },
    { id: 'tv', label: 'Smart TV', icon: Tv },
    { id: 'pool', label: 'Swimming Pool', icon: Waves },
    { id: 'parking', label: 'Free Parking', icon: Car },
    { id: 'coffee', label: 'Coffee Maker', icon: Coffee },
    { id: 'security', label: '24/7 Security', icon: Lock },
];

export const ListingWizard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        base_price: '',
        category: 'beach',
        region: 'Zanzibar',
        destination: '',
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        status: 'draft',
        amenities: [],
        images: [], // { url, file, isPrimary }
        agreed_to_standards: false
    });

    useEffect(() => {
        if (id) fetchListing();
        else loadDraft();
    }, [id]);

    // Auto-save logic
    useEffect(() => {
        if (!id && formData.title) {
            const timer = setTimeout(() => {
                localStorage.setItem('pumzika_listing_draft', JSON.stringify(formData));
                toast.info('Draft auto-saved');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [formData, id]);

    const fetchListing = async () => {
        if (!id) return;
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*, listing_images(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    ...data,
                    images: data.listing_images.map((img: any) => ({
                        url: img.url,
                        isPrimary: img.is_primary,
                        id: img.id
                    }))
                });
            }
        } catch (error) {
            console.error('Error fetching listing:', error);
        }
    };

    const loadDraft = () => {
        const draft = localStorage.getItem('pumzika_listing_draft');
        if (draft) {
            try {
                setFormData(JSON.parse(draft));
                toast.success('Restored draft');
            } catch (e) {
                console.error('Error parsing draft');
            }
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(s => s - 1);
    };

    const syncImages = async (listingId: string) => {
        if (!listingId) return;

        // 1. Identify what to delete
        const { data: dbImages } = await supabase.from('listing_images').select('id, url').eq('listing_id', listingId);
        const currentUrls = formData.images.map((img: any) => img.url);
        const imagesToDelete = dbImages?.filter(dbImg => !currentUrls.includes(dbImg.url)) || [];

        if (imagesToDelete.length > 0) {
            await supabase.from('listing_images').delete().in('id', imagesToDelete.map(img => img.id));
        }

        // 2. Upload new and update existing
        for (const img of formData.images) {
            if (img.file) {
                // New image
                const ext = img.file.name.split('.').pop() || 'jpg';
                const safeName = (img.file.name || 'image').replace(/\s+/g, '_');
                const fileName = `${listingId}/${Date.now()}-${safeName}`;

                const { error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(fileName, img.file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(fileName);

                await supabase.from('listing_images').insert({
                    listing_id: listingId,
                    url: publicUrl,
                    is_primary: img.isPrimary
                });
            } else if (img.id) {
                // Existing image, sync primary status
                await supabase.from('listing_images').update({ is_primary: img.isPrimary }).eq('id', img.id);
            }
        }
    };

    const saveAsDraft = async () => {
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const draftPayload = {
                host_id: session.user.id,
                title: (formData.title || 'Untitled Draft').trim(),
                description: formData.description,
                base_price: Number(formData.base_price) || 0,
                category: formData.category,
                region: formData.region,
                destination: (formData.destination || '').trim(),
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                amenities: formData.amenities,
                agreed_to_standards: formData.agreed_to_standards,
                status: 'draft',
                updated_at: new Date().toISOString()
            };

            let listingId = id;
            if (id) {
                const { error } = await supabase.from('listings').update(draftPayload).eq('id', id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('listings').insert(draftPayload).select().single();
                if (error) throw error;
                listingId = data.id;
            }

            if (listingId) await syncImages(listingId);

            toast.success('Draft saved successfully');
            if (!id) {
                navigate(`/host-dashboard/listings/${listingId}/edit`, { replace: true });
            } else {
                fetchListing();
            }
        } catch (error: any) {
            console.error('Save Draft Error:', error);
            toast.error('Failed to save draft');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const listingPayload = {
                host_id: session.user.id,
                title: (formData.title || '').trim(),
                description: formData.description,
                base_price: Number(formData.base_price),
                category: formData.category,
                region: formData.region,
                destination: (formData.destination || '').trim(),
                guests: Number(formData.guests),
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                amenities: formData.amenities,
                agreed_to_standards: formData.agreed_to_standards,
                status: 'published',
                updated_at: new Date().toISOString()
            };

            let listingId = id;
            if (id) {
                const { error } = await supabase.from('listings').update(listingPayload).eq('id', id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('listings').insert(listingPayload).select().single();
                if (error) throw error;
                listingId = data.id;
            }

            if (listingId) await syncImages(listingId);

            toast.success(id ? 'Listing updated!' : 'Listing published!');
            localStorage.removeItem('pumzika_listing_draft');
            navigate('/host-dashboard/listings');
        } catch (error: any) {
            console.error('Submit Error:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsSaving(false);
        }
    };

    const StepIcon = STEPS[currentStep].icon;

    return (
        <div className="max-w-4xl mx-auto pb-20 mt-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-[#1A6B4A]/5">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#1A6B4A]/5 flex items-center justify-center text-[#1A6B4A]">
                        <StepIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#1A6B4A]">{STEPS[currentStep].title}</h2>
                        <p className="text-xs text-muted-foreground">{STEPS[currentStep].description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-1">
                        {STEPS.map((_, i) => (
                            <div key={i} className={cn(
                                "h-1.5 w-8 rounded-full transition-all",
                                i <= currentStep ? "bg-[#1A6B4A]" : "bg-[#1A6B4A]/10"
                            )} />
                        ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/host-dashboard/listings')} className="rounded-full h-8 w-8 p-0">
                        <X size={18} />
                    </Button>
                </div>
            </div>

            <div className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                                    <CardContent className="p-8 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1A6B4A]">Listing Title</label>
                                            <Input
                                                placeholder="e.g. Stunning Beach Villa in Nungwi"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="rounded-xl border-none bg-secondary/50 h-12 focus-visible:ring-[#1A6B4A]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1A6B4A]">Description</label>
                                            <Textarea
                                                placeholder="Describe your property, amenities, and what makes it special..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="rounded-xl border-none bg-secondary/50 min-h-[150px] focus-visible:ring-[#1A6B4A]"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                                    <CardContent className="p-8 grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1A6B4A]">Price per Night (TSh)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                <Input
                                                    type="number"
                                                    value={formData.base_price}
                                                    onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                                                    className="pl-10 rounded-xl border-none bg-secondary/50 h-12"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1A6B4A]">Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full rounded-xl border-none bg-secondary/50 h-12 px-4 text-sm"
                                            >
                                                <option value="beach">Beachfront</option>
                                                <option value="safari">Safari Stay</option>
                                                <option value="modern">Modern Apartment</option>
                                                <option value="heritage">Heritage Home</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 md:col-span-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Guests</label>
                                                <Input type="number" value={formData.guests} onChange={e => setFormData({ ...formData, guests: e.target.value })} className="rounded-xl border-none bg-secondary/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Bedrooms</label>
                                                <Input type="number" value={formData.bedrooms} onChange={e => setFormData({ ...formData, bedrooms: e.target.value })} className="rounded-xl border-none bg-secondary/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Bathrooms</label>
                                                <Input type="number" value={formData.bathrooms} onChange={e => setFormData({ ...formData, bathrooms: e.target.value })} className="rounded-xl border-none bg-secondary/50" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1A6B4A]">Region</label>
                                            <select
                                                value={formData.region}
                                                onChange={e => setFormData({ ...formData, region: e.target.value })}
                                                className="w-full rounded-xl border-none bg-secondary/50 h-12 px-4 text-sm"
                                            >
                                                {destinations.map(dest => (
                                                    <option key={dest.slug} value={dest.name}>{dest.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#1A6B4A]">Destination / Town</label>
                                            <Input
                                                value={formData.destination}
                                                placeholder="e.g. Nungwi or Serengeti Central"
                                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                                className="rounded-xl border-none bg-secondary/50 h-12"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                                <CardContent className="p-8">
                                    <h3 className="text-xl font-bold text-[#1A6B4A] mb-6 text-center">Select your amenities</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {COMMON_AMENITIES.map((amenity) => {
                                            const Icon = amenity.icon;
                                            const isSelected = formData.amenities.includes(amenity.id);
                                            return (
                                                <button
                                                    key={amenity.id}
                                                    onClick={() => {
                                                        const newAmenities = isSelected
                                                            ? formData.amenities.filter((a: string) => a !== amenity.id)
                                                            : [...formData.amenities, amenity.id];
                                                        setFormData({ ...formData, amenities: newAmenities });
                                                    }}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3",
                                                        isSelected
                                                            ? "border-[#1A6B4A] bg-[#1A6B4A]/5 text-[#1A6B4A]"
                                                            : "border-secondary/50 bg-secondary/20 text-muted-foreground hover:border-[#1A6B4A]/30"
                                                    )}
                                                >
                                                    <Icon size={24} />
                                                    <span className="text-xs font-bold">{amenity.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 4 && (
                            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                                <CardContent className="p-8">
                                    <SmartImageUpload
                                        images={formData.images}
                                        onChange={(images) => setFormData({ ...formData, images })}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 5 && (
                            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                                <CardContent className="p-8 space-y-8">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold text-[#1A6B4A]">Pumzika Quality Promise</h3>
                                        <p className="text-muted-foreground">To maintain our premium community standards, we require all hosts to commit to the following:</p>
                                    </div>

                                    <div className="grid gap-4 max-w-2xl mx-auto">
                                        {[
                                            { title: "Honest Representation", desc: "My photos and description accurately represent the property." },
                                            { title: "Essential Amenities", desc: "I provide clean linen, working utilities, and a safe environment." },
                                            { title: "Reliability", desc: "I will maintain my calendar and minimize cancellations." },
                                            { title: "Local Compliance", desc: "I have the legal right to host this property in my region." }
                                        ].map((item, index) => (
                                            <div key={index} className="flex gap-4 p-4 rounded-2xl bg-secondary/30 border border-[#1A6B4A]/5">
                                                <div className="h-6 w-6 rounded-full bg-[#1A6B4A] flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-[#1A6B4A]">{item.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3 p-6 rounded-2xl bg-[#1A6B4A]/5 border border-[#1A6B4A] max-w-2xl mx-auto cursor-pointer"
                                        onClick={() => setFormData({ ...formData, agreed_to_standards: !formData.agreed_to_standards })}>
                                        <div className={cn(
                                            "h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all",
                                            formData.agreed_to_standards ? "bg-[#1A6B4A] border-[#1A6B4A]" : "border-[#1A6B4A]"
                                        )}>
                                            {formData.agreed_to_standards && <Check className="text-white" size={16} />}
                                        </div>
                                        <span className="text-sm font-bold text-[#1A6B4A]">I agree to the Pumzika Quality Standards</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 6 && (
                            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                                        <Check className="text-emerald-600" size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1A6B4A]">Ready to Publish?</h3>
                                    <p className="text-muted-foreground mt-2 max-w-sm">Review all details. Once published, your listing will be visible to travelers worldwide.</p>

                                    <div className="mt-8 w-full bg-secondary/30 rounded-2xl p-6 text-left space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">Title</span>
                                            <span className="text-sm font-bold truncate max-w-[200px]">{formData.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">Price</span>
                                            <span className="text-sm font-bold">TSh {Number(formData.base_price).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">Photos</span>
                                            <span className="text-sm font-bold">{formData.images.length}/6</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">Amenities</span>
                                            <span className="text-sm font-bold">{(formData.amenities || []).length} selected</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-[#1A6B4A]/10 p-4 z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0 || isSaving}
                        className="rounded-xl gap-2 h-12"
                    >
                        <ChevronLeft size={20} /> Back
                    </Button>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="rounded-xl h-12 gap-2 hidden md:flex"
                            onClick={saveAsDraft}
                            disabled={isSaving}
                        >
                            <Save size={18} /> Save as Draft
                        </Button>

                        {currentStep === STEPS.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSaving || formData.images.length === 0 || !formData.agreed_to_standards}
                                className="rounded-xl h-12 px-8 bg-[#1A6B4A] hover:bg-[#1A6B4A]/90 gap-2 font-bold"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                {isSaving ? 'Publishing...' : 'Publish Listing'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={isSaving}
                                className="rounded-xl h-12 px-8 bg-[#1A6B4A] hover:bg-[#1A6B4A]/90 gap-2 font-bold"
                            >
                                Next Step <ChevronRight size={20} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
