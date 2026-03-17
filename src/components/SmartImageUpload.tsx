import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, Loader2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import imageCompression from 'browser-image-compression';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SmartImageUploadProps {
    images: { url: string; file?: File; isPrimary: boolean }[];
    onChange: (images: { url: string; file?: File; isPrimary: boolean }[]) => void;
}

export const SmartImageUpload = ({ images, onChange }: SmartImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (images.length + files.length > 6) {
            toast.error('Maximum 6 images allowed');
            return;
        }

        setIsUploading(true);
        const newImages = [...images];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Compression options
                const options = {
                    maxSizeMB: 0.8,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                    onProgress: (p: number) => setCompressionProgress(p)
                };

                const compressedFile = await imageCompression(file, options);
                const url = URL.createObjectURL(compressedFile);

                newImages.push({
                    url,
                    file: new File([compressedFile], file.name, { type: file.type }),
                    isPrimary: newImages.length === 0
                });
            }
            onChange(newImages);
        } catch (error) {
            console.error('Compression error:', error);
            toast.error('Failed to process some images');
        } finally {
            setIsUploading(false);
            setCompressionProgress(0);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        // If we removed the primary, set the first one as primary
        if (images[index].isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true;
        }
        onChange(newImages);
    };

    const setPrimary = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isPrimary: i === index
        }));
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-[#1A6B4A]">Property Photos</h3>
                    <p className="text-xs text-muted-foreground">Upload 1-6 high-quality photos. First photo is the cover.</p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    {images.length}/6 Images
                </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                    <div key={index} className={cn(
                        "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                        img.isPrimary ? "border-[#E8A838]" : "border-transparent"
                    )}>
                        <img src={img.url} className="h-full w-full object-cover" alt={`Upload ${index}`} />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            {!img.isPrimary && (
                                <Button size="sm" variant="secondary" className="h-7 text-[10px] rounded-full" onClick={() => setPrimary(index)}>
                                    Make Primary
                                </Button>
                            )}
                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => removeImage(index)}>
                                <X size={14} />
                            </Button>
                        </div>

                        {img.isPrimary && (
                            <div className="absolute top-2 left-2">
                                <Badge className="bg-[#E8A838] text-[#1A6B4A] hover:bg-[#E8A838] text-[9px] font-bold px-2 py-0 border-none">
                                    Primary
                                </Badge>
                            </div>
                        )}

                        <div className="absolute bottom-2 right-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={16} className="text-white" />
                        </div>
                    </div>
                ))}

                {images.length < 6 && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-[#1A6B4A] hover:bg-[#1A6B4A]/5 transition-all group"
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-[#1A6B4A]" />
                                <span className="text-[10px] font-bold text-[#1A6B4A] uppercase">{compressionProgress}%</span>
                            </div>
                        ) : (
                            <>
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-2 group-hover:bg-[#1A6B4A]/10">
                                    <Upload size={20} className="text-muted-foreground group-hover:text-[#1A6B4A]" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
                multiple
            />

            {isUploading && (
                <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase text-center">Optimizing images for faster loading...</p>
                    <Progress value={compressionProgress} className="h-1" />
                </div>
            )}
        </div>
    );
};

const Badge = ({ children, variant, className }: any) => (
    <span className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === 'outline' ? "text-foreground" : "bg-primary text-primary-foreground border-transparent",
        className
    )}>
        {children}
    </span>
);
