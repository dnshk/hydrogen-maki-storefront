import {Suspense} from 'react';
import {Await, Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {Route} from './+types/_index';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import heroBotanical from '~/assets/hero-botanical.jpg';
import consultationFlatlay from '~/assets/consultation-flatlay.jpg';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Certified Nutrition Store — Practitioner-guided supplements'},
    {
      name: 'description',
      content:
        'Canada-based supplement shop and 1:1 nutrition consultations. Shipping across Canada and to Japan. Secure Shopify checkout.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
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
              src={heroBotanical}
              width="1600"
            />
          </div>
        </div>
      </section>
      <TrustBar />
      <ShopByGoal />
      <RecommendedProducts products={data.recommendedProducts} />
      <ConsultationTeaser />
      <FeaturedCollection collection={data.featuredCollection} />
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
              <div className="product-grid" style={{marginTop: '2.5rem'}}>
                {response
                  ? response.products.nodes.map((product) => (
                      <ProductItem key={product.id} product={product} />
                    ))
                  : null}
              </div>
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
            price="$140 CAD"
            subtitle="60 min · online"
            title="Initial Consultation"
          />
          <ConsultationCard
            body="Bring your current shelf. We’ll review interactions, gaps, and what to keep."
            price="$70 CAD"
            subtitle="30 min · online"
            title="Supplement Review"
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
  body,
  price,
  subtitle,
  title,
}: {
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
      <Link className="button-secondary focus-ring" to="/pages/consultation">
        Learn more
      </Link>
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;

  return (
    <section className="container-wide section-block">
      <div className="section-heading">
        <div>
          <span className="badge-soft">Featured collection</span>
          <h2>{collection.title}</h2>
        </div>
        <Link
          className="button-secondary focus-ring"
          to={`/collections/${collection.handle}`}
        >
          Browse collection
        </Link>
      </div>
      <Link
        className="collection-item surface-card focus-ring"
        to={`/collections/${collection.handle}`}
      >
        {image && (
          <div className="collection-item__image">
            <Image
              data={image}
              sizes="(min-width: 64em) 50vw, 100vw"
              alt={image.altText || collection.title}
            />
          </div>
        )}
        <div className="collection-item__content">
          <h3>{collection.title}</h3>
          <p className="muted">Practitioner-selected products from the shop.</p>
        </div>
      </Link>
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

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
