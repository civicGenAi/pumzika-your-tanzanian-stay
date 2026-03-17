import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Star, CreditCard, Smartphone, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { createSnippePayment, calculateTotalWithFees, PaymentType } from '@/lib/snippe';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentType>('mobile');
    const [phoneNumber, setPhoneNumber] = useState('');

    const bookingData = location.state;

    useEffect(() => {
        if (!bookingData) {
            navigate('/');
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/login');
                return;
            }
            setUser(session.user);
            // Default to user's phone if available
            setPhoneNumber(session.user.user_metadata?.phone || '');
        });
    }, [bookingData, navigate]);

    if (!bookingData) return null;

    const { listing, pricing, dates, guests } = bookingData;
    const finalAmount = calculateTotalWithFees(pricing.totalGuestPays, paymentType);
    const processingFee = finalAmount - pricing.totalGuestPays;

    const handlePayment = async () => {
        if (paymentType === 'mobile' && !phoneNumber) {
            toast.error('Please enter your mobile money number');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create a pending booking in Supabase first
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    listing_id: listing.id,
                    host_id: listing.host_id,
                    guest_id: user.id,
                    check_in: dates.checkIn.toISOString().split('T')[0],
                    check_out: dates.checkOut.toISOString().split('T')[0],
                    total_nights: pricing.totalNights,
                    guests_count: guests,
                    booking_mode: listing.instant_book ? 'instant' : 'manual',
                    base_price_per_night: listing.base_price,
                    subtotal: pricing.nightlySubtotal + pricing.cleaningFee,
                    service_fee: pricing.serviceFee,
                    status: 'pending'
                })
                .select()
                .single();

            if (bookingError) throw bookingError;

            // 2. Initiate Snippe Payment
            const paymentResult = await createSnippePayment(paymentType, {
                amount: pricing.totalGuestPays,
                phone_number: phoneNumber || '255700000000', // Snippe requires a number for both
                customer: {
                    firstname: user.user_metadata?.full_name?.split(' ')[0] || 'Guest',
                    lastname: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'User',
                    email: user.email || '',
                },
                metadata: {
                    booking_id: booking.id,
                    listing_title: listing.title
                }
            });

            if (paymentType === 'card' && paymentResult.payment_url) {
                window.location.href = paymentResult.payment_url;
            } else if (paymentType === 'mobile') {
                toast.success('USSD Push sent! Please enter your PIN on your phone.');
                // Here we would normally start polling or wait for a webhook
                // For now, we simulate a short delay then show success
                setTimeout(() => {
                    navigate('/trips', { state: { newBooking: true } });
                }, 3000);
            }

        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Payment failed to initiate');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F7F7] pb-20 md:pb-0">
            <Navbar />
            <main className="container max-w-5xl pt-10 pb-16">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold mb-8 hover:underline text-[#1A6B4A]"
                >
                    <ChevronLeft size={18} />
                    Back
                </button>

                <h1 className="text-3xl font-bold mb-10 text-[#1A6B4A]">Confirm and pay</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left Column: Payment Details */}
                    <div className="space-y-10">
                        <section>
                            <h2 className="text-xl font-bold mb-6">Your trip</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <div className="font-bold">Dates</div>
                                    <div className="text-muted-foreground">
                                        {dates.checkIn.toLocaleDateString()} – {dates.checkOut.toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="font-bold">Guests</div>
                                    <div className="text-muted-foreground">{guests} guest{guests > 1 ? 's' : ''}</div>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-xl font-bold mb-6">Choose how to pay</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => setPaymentType('mobile')}
                                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${paymentType === 'mobile' ? 'border-[#1A6B4A] bg-[#1A6B4A]/5' : 'border-border bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${paymentType === 'mobile' ? 'bg-[#1A6B4A] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Smartphone size={24} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">Mobile Money (Tanzania)</div>
                                            <div className="text-xs text-muted-foreground">M-Pesa, Airtel Money, Tigo Pesa, Halopesa</div>
                                        </div>
                                    </div>
                                    {paymentType === 'mobile' && <CheckCircle2 className="text-[#1A6B4A]" />}
                                </button>

                                <button
                                    onClick={() => setPaymentType('card')}
                                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${paymentType === 'card' ? 'border-[#1A6B4A] bg-[#1A6B4A]/5' : 'border-border bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${paymentType === 'card' ? 'bg-[#1A6B4A] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <CreditCard size={24} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">Credit or Debit Card</div>
                                            <div className="text-xs text-muted-foreground">Visa, Mastercard</div>
                                        </div>
                                    </div>
                                    {paymentType === 'card' && <CheckCircle2 className="text-[#1A6B4A]" />}
                                </button>
                            </div>

                            {paymentType === 'mobile' && (
                                <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-sm font-bold block mb-2">Phone Number for Push Notification</label>
                                    <input
                                        type="tel"
                                        placeholder="255XXXXXXXXX"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#1A6B4A]/20 transition-all outline-none"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-2">Enter your number to receive an STK Push on your phone.</p>
                                </div>
                            )}
                        </section>

                        <Separator />

                        <section className="bg-white p-6 rounded-2xl border border-border/50">
                            <div className="flex gap-4">
                                <ShieldCheck className="text-[#1A6B4A] shrink-0" size={28} />
                                <div>
                                    <h3 className="font-bold">Pumzika Secure Checkout</h3>
                                    <p className="text-sm text-muted-foreground">Your transaction is encrypted and secured by Snippe. We never store your card details.</p>
                                </div>
                            </div>
                        </section>

                        <Button
                            className="w-full py-8 text-lg font-bold rounded-2xl bg-[#E8A838] text-[#1A6B4A] hover:bg-[#E8A838]/90"
                            size="lg"
                            onClick={handlePayment}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                `Pay TSh ${finalAmount.toLocaleString()}`
                            )}
                        </Button>
                    </div>

                    {/* Right Column: Price Summary */}
                    <div className="lg:block">
                        <div className="sticky top-24 bg-white rounded-3xl border border-border p-8 shadow-sm">
                            <div className="flex gap-4 mb-8">
                                <img
                                    src={listing.listing_images?.[0]?.url || 'https://images.unsplash.com/photo-1512918766675-ed406e3c7432?w=1200&fit=crop'}
                                    className="h-28 w-28 rounded-xl object-cover"
                                />
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{listing.category}</div>
                                    <h3 className="font-bold text-lg mb-1 leading-tight">{listing.title}</h3>
                                    <div className="flex items-center gap-1 text-sm">
                                        <Star size={14} className="fill-black" />
                                        <span className="font-bold">{listing.average_rating || 'New'}</span>
                                        <span className="text-muted-foreground">({listing.review_count || 0} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="mb-8" />

                            <h3 className="font-bold text-lg mb-6">Price details</h3>
                            <div className="space-y-4 text-sm mb-6">
                                <div className="flex justify-between">
                                    <span className="underline">TSh {Number(listing.base_price).toLocaleString()} x {pricing.totalNights} nights</span>
                                    <span>TSh {pricing.nightlySubtotal.toLocaleString()}</span>
                                </div>
                                {pricing.cleaningFee > 0 && (
                                    <div className="flex justify-between">
                                        <span className="underline">Cleaning fee</span>
                                        <span>TSh {pricing.cleaningFee.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="underline">Pumzika service fee</span>
                                    <span>TSh {pricing.serviceFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[#1A6B4A] font-medium">
                                    <span className="underline">Payment processing fee ({paymentType === 'mobile' ? '0.5%' : '3.0%'})</span>
                                    <span>TSh {processingFee.toLocaleString()}</span>
                                </div>
                            </div>

                            <Separator className="mb-6" />

                            <div className="flex justify-between font-bold text-xl">
                                <span>Total (TZS)</span>
                                <span>TSh {finalAmount.toLocaleString()}</span>
                            </div>

                            <div className="mt-8 text-[11px] text-muted-foreground leading-relaxed">
                                By selecting the button above, you agree to the <span className="underline cursor-pointer">Host's House Rules</span>, <span className="underline cursor-pointer">Pumzika's Rebooking and Refund Policy</span>, and that Pumzika can <span className="underline cursor-pointer">charge your payment method</span> if you're responsible for damage.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default Checkout;
