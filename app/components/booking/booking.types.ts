export type BookingEventKey = 'discovery' | 'initialConsultation';

export interface BookingEventConfig {
  key: BookingEventKey;
  title: string;
  slug: string;
  calLink: string;
  externalUrl: string;
}

export interface BookingConfig {
  provider: 'calcom';
  username: string;
  events: Record<BookingEventKey, BookingEventConfig>;
}

export interface PublicBookingEnv {
  PUBLIC_CALCOM_USERNAME?: string;
  PUBLIC_CALCOM_DISCOVERY_EVENT?: string;
  PUBLIC_CALCOM_INITIAL_EVENT?: string;
}

export interface BookingAnalyticsDetail {
  event_type: BookingEventKey;
  source: string;
  provider: BookingConfig['provider'];
}
