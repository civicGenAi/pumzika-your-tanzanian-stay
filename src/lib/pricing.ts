/**
 * PUMZIKA PRICING ENGINE
 * 
 * Handles all financial calculations for bookings in TSh.
 * Rates:
 * - Guest Service Fee: 14% of (base price + cleaning fee)
 * - Host Service Fee: 3% of (base price + cleaning fee)
 */

export interface PricingBreakdown {
    basePrice: number;
    totalNights: number;
    nightlySubtotal: number;
    cleaningFee: number;
    securityDeposit: number;
    serviceFee: number;
    totalGuestPays: number;
    hostReceives: number;
    platformRevenue: number;
}

export interface PriceInput {
    basePrice: number;
    cleaningFee?: number;
    securityDeposit?: number;
    checkIn: Date;
    checkOut: Date;
    weekendMultiplier?: number;
    pricingRules?: any[]; // For seasonal overrides later
}

export const calculatePrice = (input: PriceInput): PricingBreakdown => {
    const {
        basePrice,
        cleaningFee = 0,
        securityDeposit = 0,
        checkIn,
        checkOut,
        weekendMultiplier = 1.0
    } = input;

    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let nightlySubtotal = 0;
    const current = new Date(checkIn);

    // Calculate night by night to account for weekend multipliers
    for (let i = 0; i < totalNights; i++) {
        const day = current.getDay();
        const isWeekend = day === 5 || day === 6; // Friday and Saturday nights

        if (isWeekend && weekendMultiplier > 1) {
            nightlySubtotal += Math.round(basePrice * weekendMultiplier);
        } else {
            nightlySubtotal += basePrice;
        }

        current.setDate(current.getDate() + 1);
    }

    const subtotalBeforeFees = nightlySubtotal + cleaningFee;

    // Fees as per Pumzika Standard
    const serviceFee = Math.round(subtotalBeforeFees * 0.14); // 14% guest fee
    const hostServiceFee = Math.round(subtotalBeforeFees * 0.03); // 3% host fee

    const totalGuestPays = subtotalBeforeFees + serviceFee + securityDeposit;
    const hostReceives = subtotalBeforeFees - hostServiceFee;
    const platformRevenue = serviceFee + hostServiceFee;

    return {
        basePrice,
        totalNights,
        nightlySubtotal,
        cleaningFee,
        securityDeposit,
        serviceFee,
        totalGuestPays,
        hostReceives,
        platformRevenue
    };
};
