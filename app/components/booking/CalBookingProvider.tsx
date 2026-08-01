import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type {GlobalCal, GlobalCalWithoutNs} from '@calcom/embed-core';
import type {BookingConfig, BookingEventKey} from './booking.types';
import {bookingConfig as fallbackBookingConfig} from './booking.config';

type CalApi = GlobalCal | GlobalCalWithoutNs;

interface BookingContextValue {
  bookingConfig: BookingConfig;
  isPopupReady: boolean;
  openBooking: (event: BookingEventKey) => boolean;
}

const BookingContext = createContext<BookingContextValue | null>(null);

const calUiConfig = {
  hideEventTypeDetails: false,
  layout: 'month_view',
  theme: 'light',
  styles: {
    branding: {
      brandColor: '#486f55',
    },
  },
} as const;

export function CalBookingProvider({
  bookingConfig = fallbackBookingConfig,
  children,
}: PropsWithChildren<{bookingConfig?: BookingConfig}>) {
  const [calApi, setCalApi] = useState<CalApi | null>(null);
  const [hasEmbedError, setHasEmbedError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initializeCal() {
      try {
        const {getCalApi} = await import('@calcom/embed-react');
        const cal = await getCalApi();

        if (cancelled) return;

        cal('ui', calUiConfig);

        Object.values(bookingConfig.events).forEach((event) => {
          cal('preload', {
            calLink: event.calLink,
            type: 'modal',
            options: {prerenderIframe: false},
          });
        });

        setCalApi(() => cal);
      } catch (error) {
        if (!cancelled) {
          setHasEmbedError(true);
          console.warn('Cal.com booking embed could not be initialized.', error);
        }
      }
    }

    void initializeCal();

    return () => {
      cancelled = true;
    };
  }, [bookingConfig]);

  const openBooking = useCallback(
    (eventKey: BookingEventKey) => {
      const event = bookingConfig.events[eventKey];

      if (!calApi || hasEmbedError || !event) {
        return false;
      }

      calApi('modal', {
        calLink: event.calLink,
        config: {
          layout: 'month_view',
          theme: 'light',
        },
      });

      return true;
    },
    [bookingConfig.events, calApi, hasEmbedError],
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      bookingConfig,
      isPopupReady: Boolean(calApi && !hasEmbedError),
      openBooking,
    }),
    [bookingConfig, calApi, hasEmbedError, openBooking],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error('useBooking must be used within CalBookingProvider.');
  }

  return context;
}
