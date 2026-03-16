import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const StateFeedback = ({
    type = 'empty',
    title,
    message,
    actionLabel,
    onAction,
    icon: CustomIcon
}: {
    type?: 'empty' | 'error' | 'loading';
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: any;
}) => {
    if (type === 'loading') {
        return (
            <div className="w-full space-y-6 animate-pulse p-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48 rounded-full" />
                    <Skeleton className="h-12 w-32 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                </div>
                <Skeleton className="h-[400px] w-full rounded-3xl" />
            </div>
        );
    }

    const Icon = CustomIcon || (type === 'error' ? AlertCircle : Search);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl bg-white/50 p-8 text-center"
        >
            <div className={`mb-4 rounded-full p-4 ${type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-[#FDF6EE] text-[#1A6B4A]'}`}>
                <Icon size={48} strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1A6B4A]">{title || (type === 'error' ? 'Something went wrong' : 'No items found')}</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {message || (type === 'error' ? 'We encountered an error while loading this data. Please try again.' : 'There are currently no items to display in this section.')}
            </p>
            {actionLabel && (
                <Button
                    onClick={onAction}
                    className="mt-6 rounded-full bg-[#1A6B4A] px-8 hover:bg-[#1A6B4A]/90"
                >
                    {type === 'error' ? <RefreshCcw size={16} className="mr-2" /> : null}
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
};
