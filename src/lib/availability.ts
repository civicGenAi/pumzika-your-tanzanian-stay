import { supabase } from './supabase';

/**
 * PUMZIKA AVAILABILITY ENGINE
 * 
 * Manages listing availability and calendar logic.
 */

export interface AvailabilityCheck {
    isAvailable: boolean;
    conflictingDates: string[];
}

/**
 * Checks if a specific date range is available for a listing.
 * A range is available if:
 * 1. No entries in listing_availability have status 'booked' or 'blocked_by_host'
 * 2. (Optional) We could verify against a bookings table if availability table is not sync'd
 */
export const isDateRangeAvailable = async (
    listingId: string,
    startDate: string,
    endDate: string
): Promise<AvailabilityCheck> => {
    // Query the availability table for non-available statuses
    const { data, error } = await supabase
        .from('listing_availability')
        .select('date, status')
        .eq('listing_id', listingId)
        .gte('date', startDate)
        .lt('date', endDate)
        .in('status', ['booked', 'blocked_by_host', 'pending']);

    if (error) {
        console.error('Error checking availability:', error);
        return { isAvailable: false, conflictingDates: [] };
    }

    const conflictingDates = data?.map(d => d.date) || [];

    return {
        isAvailable: conflictingDates.length === 0,
        conflictingDates
    };
};

/**
 * Fetches the calendar data for a listing to display in the UI.
 */
export const getListingCalendar = async (
    listingId: string,
    monthStartDate: string,
    monthEndDate: string
) => {
    const { data, error } = await supabase
        .from('listing_availability')
        .select('*')
        .eq('listing_id', listingId)
        .gte('date', monthStartDate)
        .lte('date', monthEndDate);

    if (error) {
        console.error('Error fetching calendar:', error);
        return [];
    }

    return data;
};
