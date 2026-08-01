import type {MouseEvent, ReactNode} from 'react';
import type {BookingAnalyticsDetail, BookingEventKey} from './booking.types';
import {useBooking} from './CalBookingProvider';

interface BookingButtonProps {
  event: BookingEventKey;
  children: ReactNode;
  className?: string;
  source?: string;
}

export function BookingButton({
  event,
  children,
  className = 'button-secondary focus-ring',
  source = 'website',
}: BookingButtonProps) {
  const {bookingConfig, isPopupReady, openBooking} = useBooking();
  const bookingEvent = bookingConfig.events[event];

  function handleClick(clickEvent: MouseEvent<HTMLAnchorElement>) {
    dispatchBookingAnalytics({
      event_type: event,
      source,
      provider: bookingConfig.provider,
    });

    if (!isPopupReady) {
      return;
    }

    const opened = openBooking(event);

    if (opened) {
      clickEvent.preventDefault();
    }
  }

  return (
    <a
      className={className}
      data-booking-event={event}
      data-booking-provider={bookingConfig.provider}
      href={bookingEvent.externalUrl}
      onClick={handleClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

function dispatchBookingAnalytics(detail: BookingAnalyticsDetail) {
  if (typeof window === 'undefined') return;

  try {
    window.dispatchEvent(
      new CustomEvent('consultation_booking_opened', {detail}),
    );
  } catch (error) {
    console.warn('Booking analytics event could not be dispatched.', error);
  }
}
