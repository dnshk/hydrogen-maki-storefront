import {useEffect, useId, useMemo, useState} from 'react';

type ProductDescriptionMetafield = {
  type?: string | null;
  value?: string | null;
} | null | undefined;

export type ProductDescriptionSection = {
  id: string;
  title: string;
  metafield?: ProductDescriptionMetafield;
  fallbackHtml?: string | null;
};

type NormalizedProductDescriptionSection = {
  id: string;
  title: string;
  html?: string;
  paragraphs?: string[];
};

export function ProductDescriptionTabs({
  sections,
}: {
  sections: ProductDescriptionSection[];
}) {
  const componentId = useId();
  const visibleSections = useMemo(
    () => sections.map(normalizeSection).filter(isVisibleSection),
    [sections],
  );
  const [activeSectionId, setActiveSectionId] = useState(
    () => visibleSections[0]?.id,
  );

  useEffect(() => {
    if (!visibleSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(visibleSections[0]?.id);
    }
  }, [activeSectionId, visibleSections]);

  if (!visibleSections.length) {
    return null;
  }

  const activeSection =
    visibleSections.find((section) => section.id === activeSectionId) ??
    visibleSections[0];

  if (!activeSection) {
    return null;
  }

  if (visibleSections.length === 1) {
    return (
      <div className="product-description-tabs">
        <ProductDescriptionPanel section={activeSection} />
      </div>
    );
  }

  return (
    <div className="product-description-tabs">
      <div
        aria-label="Product information"
        className="product-description-tabs__list"
        role="tablist"
      >
        {visibleSections.map((section) => {
          const tabId = `${componentId}-${section.id}-tab`;
          const panelId = `${componentId}-${section.id}-panel`;
          const isSelected = section.id === activeSection.id;

          return (
            <button
              aria-controls={panelId}
              aria-selected={isSelected}
              className="product-description-tabs__tab focus-ring"
              id={tabId}
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              role="tab"
              type="button"
            >
              {section.title}
            </button>
          );
        })}
      </div>
      {visibleSections.map((section) => {
        const tabId = `${componentId}-${section.id}-tab`;
        const panelId = `${componentId}-${section.id}-panel`;
        const isSelected = section.id === activeSection.id;

        return (
          <div
            aria-labelledby={tabId}
            hidden={!isSelected}
            id={panelId}
            key={section.id}
            role="tabpanel"
          >
            <ProductDescriptionPanel section={section} />
          </div>
        );
      })}
    </div>
  );
}

function ProductDescriptionPanel({
  section,
}: {
  section: NormalizedProductDescriptionSection;
}) {
  if (section.html) {
    return (
      <div
        className="product-description-tabs__panel product-description"
        dangerouslySetInnerHTML={{__html: section.html}}
      />
    );
  }

  return (
    <div className="product-description-tabs__panel product-description">
      {section.paragraphs?.map((paragraph) => (
        <p key={`${section.id}-${getStableTextKey(paragraph)}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function normalizeSection(
  section: ProductDescriptionSection,
): NormalizedProductDescriptionSection {
  const metafieldText = getMetafieldText(section.metafield);

  if (metafieldText) {
    return {
      id: section.id,
      title: section.title,
      paragraphs: splitParagraphs(metafieldText),
    };
  }

  return {
    id: section.id,
    title: section.title,
    html: section.fallbackHtml?.trim(),
  };
}

function isVisibleSection(
  section: NormalizedProductDescriptionSection,
): section is NormalizedProductDescriptionSection {
  return Boolean(section.html || section.paragraphs?.length);
}

function getMetafieldText(metafield: ProductDescriptionMetafield) {
  const value = metafield?.value?.trim();

  if (!value) {
    return '';
  }

  if (metafield?.type === 'rich_text_field') {
    return getRichTextValue(value);
  }

  return value;
}

function getRichTextValue(value: string) {
  try {
    const richText = JSON.parse(value) as unknown;
    return getRichTextNodeValue(richText).trim();
  } catch {
    return value;
  }
}

function getRichTextNodeValue(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }

  const type = 'type' in node && typeof node.type === 'string' ? node.type : '';

  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }

  if (!('children' in node) || !Array.isArray(node.children)) {
    return '';
  }

  const childValues = node.children
    .map(getRichTextNodeValue)
    .filter(Boolean)
    .join(isBlockRichTextNode(type) ? '\n\n' : '');

  return type === 'list-item' ? `- ${childValues}` : childValues;
}

function isBlockRichTextNode(type: string) {
  return ['root', 'list'].includes(type);
}

function splitParagraphs(value: string) {
  return value
    .split(/\n{2,}|\r\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function getStableTextKey(value: string) {
  let hash = 0;

  for (const character of value) {
    hash = (hash << 5) - hash + character.charCodeAt(0);
    hash |= 0;
  }

  return hash.toString(36);
}
