-- Notification triggers: auto-create notifications on key events

-- 1. Trigger function: notify host on new booking
CREATE OR REPLACE FUNCTION public.notify_host_new_booking()
RETURNS TRIGGER AS $$
DECLARE
    guest_name text;
    listing_title text;
BEGIN
    SELECT full_name INTO guest_name FROM public.users WHERE id = NEW.guest_id;
    SELECT title INTO listing_title FROM public.listings WHERE id = NEW.listing_id;

    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
        NEW.host_id,
        'booking_new',
        'New Booking Request',
        COALESCE(guest_name, 'A guest') || ' booked ' || COALESCE(listing_title, 'your property'),
        jsonb_build_object(
            'booking_id', NEW.id,
            'listing_id', NEW.listing_id,
            'guest_id', NEW.guest_id,
            'is_host', true
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_host_new_booking ON public.bookings;
CREATE TRIGGER trg_notify_host_new_booking
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_host_new_booking();

-- 2. Trigger function: notify guest on booking status change
CREATE OR REPLACE FUNCTION public.notify_guest_booking_status()
RETURNS TRIGGER AS $$
DECLARE
    listing_title text;
    notif_title text;
    notif_body text;
    notif_type text;
BEGIN
    -- Only fire when status actually changes
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    SELECT title INTO listing_title FROM public.listings WHERE id = NEW.listing_id;

    IF NEW.status = 'confirmed' THEN
        notif_type := 'booking_confirmed';
        notif_title := 'Booking Confirmed!';
        notif_body := 'Your booking at ' || COALESCE(listing_title, 'a property') || ' has been confirmed. Get ready for your stay!';
    ELSIF NEW.status = 'cancelled' THEN
        notif_type := 'booking_cancelled';
        notif_title := 'Booking Cancelled';
        notif_body := 'Your booking at ' || COALESCE(listing_title, 'a property') || ' has been cancelled.';
    ELSE
        RETURN NEW;
    END IF;

    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
        NEW.guest_id,
        notif_type,
        notif_title,
        notif_body,
        jsonb_build_object(
            'booking_id', NEW.id,
            'listing_id', NEW.listing_id,
            'is_host', false
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_guest_booking_status ON public.bookings;
CREATE TRIGGER trg_notify_guest_booking_status
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_guest_booking_status();

-- 3. Trigger function: notify recipient of a new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name text;
    conv_guest_id uuid;
    conv_host_id uuid;
    recipient_id uuid;
BEGIN
    SELECT full_name INTO sender_name FROM public.users WHERE id = NEW.sender_id;
    SELECT guest_id, host_id INTO conv_guest_id, conv_host_id FROM public.conversations WHERE id = NEW.conversation_id;

    -- Determine recipient (the other party)
    IF NEW.sender_id = conv_guest_id THEN
        recipient_id := conv_host_id;
    ELSE
        recipient_id := conv_guest_id;
    END IF;

    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
        recipient_id,
        'message_new',
        'New Message from ' || COALESCE(sender_name, 'Someone'),
        LEFT(NEW.content, 100),
        jsonb_build_object(
            'conversation_id', NEW.conversation_id,
            'sender_id', NEW.sender_id,
            'is_host', (recipient_id = conv_host_id)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_message();

-- 4. Trigger function: notify host on new review
CREATE OR REPLACE FUNCTION public.notify_host_new_review()
RETURNS TRIGGER AS $$
DECLARE
    reviewer_name text;
    listing_title text;
BEGIN
    SELECT full_name INTO reviewer_name FROM public.users WHERE id = NEW.reviewer_id;
    SELECT title INTO listing_title FROM public.listings WHERE id = NEW.listing_id;

    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
        NEW.reviewee_id,
        'review_new',
        'New Review ⭐',
        COALESCE(reviewer_name, 'A guest') || ' left a ' || NEW.overall_rating || '-star review on ' || COALESCE(listing_title, 'your property'),
        jsonb_build_object(
            'review_id', NEW.id,
            'listing_id', NEW.listing_id,
            'rating', NEW.overall_rating,
            'is_host', true
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_host_new_review ON public.reviews;
CREATE TRIGGER trg_notify_host_new_review
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_host_new_review();
