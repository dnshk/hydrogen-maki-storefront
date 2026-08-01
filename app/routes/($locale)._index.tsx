import {Suspense} from 'react';
import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {BookingButton} from '~/components/booking/BookingButton';
import heroImage from '~/assets/choosing-supplement.jpg';
import consultationFlatlay from '~/assets/consultation-flatlay.jpg';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Maki Nutrition — Practitioner-guided supplements'},
    {
      name: 'description',
      content:
        'Canada-based supplement shop and 1:1 nutrition consultations. Shipping across Canada and to Japan. Secure Shopify checkout.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);

  return {...deferredData};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {
    recommendedProducts: getRecommendedProducts(context.storefront),
  };
}

function getRecommendedProducts(contextStorefront: Route.LoaderArgs['context']['storefront']) {
  return contextStorefront.query(RECOMMENDED_PRODUCTS_QUERY).catch(() => null);
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home">
      <section className="home-hero bg-hero">
        <div className="container-wide home-hero__grid">
          <div className="home-hero__copy">
            <span className="badge-soft">Certified nutrition practitioner</span>
            <h1>
              Considered supplements,
              <br />
              <span>guided by a practitioner.</span>
            </h1>
            <p>
              A small Canadian shelf of trusted brands, paired with 1:1
              nutrition support. Shipping across Canada and to Japan, with
              secure Shopify checkout.
            </p>
            <div className="home-hero__actions">
              <Link className="button-primary focus-ring" to="/collections/all">
                Shop supplements
              </Link>
              <Link
                className="button-secondary focus-ring"
                to="/pages/consultation"
              >
                Book a consultation
              </Link>
            </div>
          </div>
          <div className="home-hero__media">
            <img
              alt="Botanical illustration of herbs and leaves"
              className="shadow-elegant"
              height="1100"
              src={heroImage}
              width="1600"
            />
          </div>
        </div>
      </section>
      <TrustBar />
      <ShopByGoal />
      <RecommendedProducts products={data.recommendedProducts} />
      <ConsultationTeaser />
    </div>
  );
}

function TrustBar() {
  const items = [
    ['🌿', 'Canadian business', 'Small, practitioner-led'],
    ['🔒', 'Secure Shopify checkout', 'PCI-DSS compliant'],
    ['✈️', 'Shipping to Japan', 'Eligible items shipped'],
    ['✚', 'Practitioner-guided', 'Education over diagnosis'],
  ];

  return (
    <section className="trust-bar" aria-label="Why shop with us">
      <div className="container-wide trust-bar__grid">
        {items.map(([icon, label, sub]) => (
          <div className="trust-item" key={label}>
            <span className="trust-item__icon" aria-hidden>
              {icon}
            </span>
            <div>
              <div>{label}</div>
              <small className="muted">{sub}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShopByGoal() {
  const goals = [
    ['🌿', 'Gut Health', 'Comfortable digestion and regularity'],
    ['☀️', 'Immune Support', 'Everyday and seasonal support'],
    ['🌸', 'Women’s Health', 'Cycle, iron, and life-stage support'],
    ['🌤', 'Energy & Stress', 'Steady energy and calm focus'],
    ['🍃', 'Detox & Liver', 'Daily pathway support'],
    ['✿', 'General Wellness', 'Daily multis and foundations'],
  ];

  return (
    <section className="container-wide section-block">
      <div className="section-heading">
        <div>
          <span className="badge-soft">Shop by goal</span>
          <h2>Find what fits your day.</h2>
          <p>No disease claims, no megastore noise.</p>
        </div>
      </div>
      <div className="goal-grid">
        {goals.map(([icon, title, copy]) => (
          <Link className="goal-card focus-ring" key={title} to="/collections/all">
            <div className="goal-card__icon" aria-hidden>
              {icon}
            </div>
            <h3>{title}</h3>
            <p className="muted">{copy}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="bg-soft section-block" aria-labelledby="recommended-products">
      <div className="container-wide">
        <div className="section-heading">
          <div>
            <span className="badge-soft">On the shelf</span>
            <h2 id="recommended-products">Featured supplements</h2>
          </div>
          <Link className="button-secondary focus-ring" to="/collections/all">
            View all
          </Link>
        </div>
        <Suspense fallback={<div className="empty-state">Loading products…</div>}>
          <Await resolve={products}>
            {(response) => (
              response?.products.nodes.length ? (
                <div className="product-grid" style={{marginTop: '2.5rem'}}>
                  {response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Featured supplements are temporarily unavailable.</p>
                  <Link className="button-secondary focus-ring" to="/collections/all">
                    Browse catalog
                  </Link>
                </div>
              )
            )}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

function ConsultationTeaser() {
  return (
    <section className="container-wide section-block consultation-grid">
      <div>
        <span className="badge-soft">1:1 support</span>
        <h2>Nutrition consultations, on your terms.</h2>
        <p className="product-description">
          Work with a certified nutrition practitioner trained in both Canada
          and Japan. Sessions are practical, educational, and tailored to your
          daily life.
        </p>
        <div className="consultation-cards">
          <ConsultationCard
            body="A relaxed intake to map goals, history, and a realistic next step."
            bookingEvent="initialConsultation"
            bookingLabel="Book initial consultation"
            price="$140 CAD"
            subtitle="60 min · online"
            title="Initial Consultation"
          />
          <ConsultationCard
            body="A relaxed first step to ask questions, talk through goals, and decide whether 1:1 support is the right fit."
            bookingEvent="discovery"
            bookingLabel="Book free discovery call"
            price="Free"
            subtitle="15–30 min · online"
            title="Discovery Call"
          />
        </div>
      </div>
      <img
        alt="Flatlay of supplement bottle, dried herbs, and notebook"
        className="consultation-image shadow-elegant"
        height="1000"
        loading="lazy"
        src={consultationFlatlay}
        width="1400"
      />
    </section>
  );
}

function ConsultationCard({
  bookingEvent,
  bookingLabel,
  body,
  price,
  subtitle,
  title,
}: {
  bookingEvent: 'discovery' | 'initialConsultation';
  bookingLabel: string;
  body: string;
  price: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="consultation-card surface-card">
      <div className="consultation-card__subtitle">{subtitle}</div>
      <h3>{title}</h3>
      <div className="consultation-card__price">{price}</div>
      <p className="muted">{body}</p>
      <BookingButton
        className="button-secondary focus-ring"
        event={bookingEvent}
        source={`homepage-${bookingEvent}-card`}
      >
        {bookingLabel}
      </BookingButton>
    </div>
  );
}

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
