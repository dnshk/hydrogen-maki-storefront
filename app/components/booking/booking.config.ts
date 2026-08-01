import type {
  BookingConfig,
  BookingEventConfig,
  BookingEventKey,
  PublicBookingEnv,
} from './booking.types';

const DEFAULT_CALCOM_USERNAME = 'your-calcom-username';
const DEFAULT_DISCOVERY_EVENT = 'discovery-call';
const DEFAULT_INITIAL_EVENT = 'initial-consultation';

const EVENT_TITLES: Record<BookingEventKey, string> = {
  discovery: 'Discovery Call',
  initialConsultation: 'Initial Nutrition Consultation',
};

export function createBookingConfig(env: PublicBookingEnv = {}): BookingConfig {
  const username = normalizeSegment(
    env.PUBLIC_CALCOM_USERNAME,
    DEFAULT_CALCOM_USERNAME,
  );
  const eventSlugs: Record<BookingEventKey, string> = {
    discovery: normalizeSegment(
      env.PUBLIC_CALCOM_DISCOVERY_EVENT,
      DEFAULT_DISCOVERY_EVENT,
    ),
    initialConsultation: normalizeSegment(
      env.PUBLIC_CALCOM_INITIAL_EVENT,
      DEFAULT_INITIAL_EVENT,
    ),
  };

  return {
    provider: 'calcom',
    username,
    events: {
      discovery: createEventConfig('discovery', username, eventSlugs.discovery),
      initialConsultation: createEventConfig(
        'initialConsultation',
        username,
        eventSlugs.initialConsultation,
      ),
    },
  };
}

export const bookingConfig = createBookingConfig();

function createEventConfig(
  key: BookingEventKey,
  username: string,
  slug: string,
): BookingEventConfig {
  const calLink = `${username}/${slug}`;

  return {
    key,
    title: EVENT_TITLES[key],
    slug,
    calLink,
    externalUrl: `https://cal.com/${calLink}`,
  };
}

function normalizeSegment(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().replace(/^\/+|\/+$/g, '');

  return trimmed || fallback;
}
