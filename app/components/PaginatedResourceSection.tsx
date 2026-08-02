import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {Link, useFetcher, useLocation} from 'react-router';

type Connection<NodesType> =
  React.ComponentProps<typeof Pagination<NodesType>>['connection'];
type ResourceKey = React.Key;
type ConnectionPath = string | readonly string[];

type InfinitePageInfo = {
  endCursor?: string | null;
  hasNextPage: boolean;
};

/**
 * <PaginatedResourceSection> renders paginated connections as infinite scroll.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  connectionPath,
  getResourceKey,
  resourcesClassName,
}: {
  connection: Connection<NodesType>;
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  connectionPath: ConnectionPath;
  getResourceKey?: (node: NodesType) => ResourceKey;
  resourcesClassName?: string;
}) {
  const fetcher = useFetcher();
  const location = useLocation();
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const requestedCursorRef = React.useRef<string | null>(null);
  const resourceKey = getResourceKey ?? getNodeKey;
  const [nodes, setNodes] = React.useState<NodesType[]>(() =>
    getConnectionNodes(connection),
  );
  const [pageInfo, setPageInfo] = React.useState<InfinitePageInfo>(() =>
    getPageInfo(connection),
  );
  const isLoading = fetcher.state !== 'idle';
  const [pendingCursor, setPendingCursor] = React.useState<string | null>(null);
  const isPendingNextPage = isLoading || pendingCursor !== null;
  const nextPageUrl = pageInfo.endCursor
    ? getPaginationUrl(location, pageInfo.endCursor)
    : null;
  const infinitePageUrl = pageInfo.endCursor
    ? getPaginationUrl(location, pageInfo.endCursor, true)
    : null;

  React.useEffect(() => {
    setNodes(getConnectionNodes(connection));
    setPageInfo(getPageInfo(connection));
    requestedCursorRef.current = null;
    setPendingCursor(null);
  }, [connection]);

  React.useEffect(() => {
    if (fetcher.state !== 'idle' || !pendingCursor) {
      return;
    }

    const nextConnection = getConnectionAtPath<NodesType>(
      fetcher.data,
      connectionPath,
    );

    if (!nextConnection) {
      requestedCursorRef.current = null;
      setPendingCursor(null);
      return;
    }

    const nextNodes = getConnectionNodes(nextConnection);
    const nextPageInfo = getPageInfo(nextConnection);

    if (
      !nextNodes.length &&
      nextPageInfo.endCursor === pendingCursor &&
      nextPageInfo.hasNextPage
    ) {
      requestedCursorRef.current = null;
      setPendingCursor(null);
      return;
    }

    setNodes((currentNodes) =>
      appendUniqueNodes(currentNodes, nextNodes, resourceKey),
    );
    setPageInfo(nextPageInfo);
    requestedCursorRef.current = null;
    setPendingCursor(null);
  }, [
    connectionPath,
    fetcher.data,
    fetcher.state,
    pendingCursor,
    resourceKey,
  ]);

  const loadNextPage = React.useCallback(() => {
    const endCursor = pageInfo.endCursor;

    if (
      isLoading ||
      !endCursor ||
      !infinitePageUrl ||
      requestedCursorRef.current === endCursor
    ) {
      return false;
    }

    requestedCursorRef.current = endCursor;
    setPendingCursor(endCursor);
    void fetcher.load(infinitePageUrl);

    return true;
  }, [fetcher, infinitePageUrl, isLoading, pageInfo.endCursor]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      !pageInfo.hasNextPage ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const endCursor = pageInfo.endCursor;

        if (
          !entry?.isIntersecting ||
          isLoading ||
          !endCursor ||
          requestedCursorRef.current === endCursor
        ) {
          return;
        }

        loadNextPage();
      },
      {rootMargin: '1200px 0px'},
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isLoading, loadNextPage, pageInfo.endCursor, pageInfo.hasNextPage]);

  const resourcesMarkup = nodes.map((node, index) => children({node, index}));
  const loadingMarkup = isPendingNextPage ? <ResourceLoadingSkeleton /> : null;

  return (
    <>
      {resourcesClassName ? (
        <div
          aria-label={ariaLabel}
          className={resourcesClassName}
          role={ariaLabel ? 'region' : undefined}
        >
          {resourcesMarkup}
          {loadingMarkup}
        </div>
      ) : (
        <>
          {resourcesMarkup}
          {loadingMarkup}
        </>
      )}
      <div className="pagination-infinite">
        <div
          aria-hidden="true"
          className="pagination-infinite__sentinel"
          ref={sentinelRef}
        />
        {isPendingNextPage ? (
          <div className="pagination-infinite__status" role="status">
            <span className="sr-only">Loading more items</span>
          </div>
        ) : null}
        {pageInfo.hasNextPage && nextPageUrl ? (
          <Link
            className="pagination-infinite__load-more focus-ring"
            onClick={(event) => {
              if (loadNextPage()) {
                event.preventDefault();
              }
            }}
            preventScrollReset
            to={nextPageUrl}
          >
            {isPendingNextPage ? 'Loading...' : 'Load more'}
          </Link>
        ) : null}
      </div>
    </>
  );
}

export function ResourceLoadingSkeleton({count = 4}: {count?: number}) {
  return (
    <>
      {Array.from({length: count}, (_, index) => (
        <div
          aria-hidden="true"
          className="resource-skeleton"
          key={`resource-skeleton-${index}`}
        >
          <div className="resource-skeleton__media" />
          <div className="resource-skeleton__body">
            <div className="resource-skeleton__line resource-skeleton__line--title" />
            <div className="resource-skeleton__line resource-skeleton__line--short" />
          </div>
        </div>
      ))}
    </>
  );
}

function appendUniqueNodes<NodesType>(
  currentNodes: NodesType[],
  nextNodes: NodesType[],
  getKey: (node: NodesType) => ResourceKey,
) {
  const existingKeys = new Set(currentNodes.map(getKey));
  const uniqueNextNodes = nextNodes.filter(
    (node) => !existingKeys.has(getKey(node)),
  );

  return [...currentNodes, ...uniqueNextNodes];
}

function getConnectionNodes<NodesType>(connection: Connection<NodesType>) {
  if (hasNodes(connection)) {
    return connection.nodes;
  }

  if (hasEdges(connection)) {
    return connection.edges.map((edge) => edge.node);
  }

  return [];
}

function getPageInfo<NodesType>(
  connection: Connection<NodesType>,
): InfinitePageInfo {
  return {
    endCursor: connection.pageInfo.endCursor,
    hasNextPage: connection.pageInfo.hasNextPage,
  };
}

function getConnectionAtPath<NodesType>(
  value: unknown,
  path: ConnectionPath,
): Connection<NodesType> | null {
  const pathSegments = typeof path === 'string' ? path.split('.') : path;
  let currentValue = value;

  for (const segment of pathSegments) {
    if (!currentValue || typeof currentValue !== 'object') {
      return null;
    }

    currentValue = (currentValue as Record<string, unknown>)[segment];
  }

  if (!currentValue || typeof currentValue !== 'object') {
    return null;
  }

  return isConnection<NodesType>(currentValue) ? currentValue : null;
}

function getNodeKey(node: unknown): ResourceKey {
  if (node && typeof node === 'object' && 'id' in node) {
    return String((node as {id: unknown}).id);
  }

  if (node && typeof node === 'object' && 'handle' in node) {
    return String((node as {handle: unknown}).handle);
  }

  return JSON.stringify(node);
}

function getPaginationUrl(
  location: ReturnType<typeof useLocation>,
  cursor: string,
  isInfinite = false,
) {
  const searchParams = new URLSearchParams(location.search);

  searchParams.delete('__infinite');
  searchParams.delete('cursor');
  searchParams.delete('direction');
  searchParams.set('cursor', cursor);
  searchParams.set('direction', 'next');

  if (isInfinite) {
    searchParams.set('__infinite', '1');
  }

  return `${location.pathname}?${searchParams.toString()}`;
}

function isConnection<NodesType>(value: object): value is Connection<NodesType> {
  const pageInfo =
    'pageInfo' in value && value.pageInfo && typeof value.pageInfo === 'object'
      ? value.pageInfo
      : null;

  return (
    (('nodes' in value && Array.isArray(value.nodes)) ||
      ('edges' in value && Array.isArray(value.edges))) &&
    pageInfo !== null &&
    'hasNextPage' in pageInfo
  );
}

function hasNodes<NodesType>(
  connection: Connection<NodesType>,
): connection is Extract<Connection<NodesType>, {nodes: NodesType[]}> {
  return 'nodes' in connection && Array.isArray(connection.nodes);
}

function hasEdges<NodesType>(
  connection: Connection<NodesType>,
): connection is Extract<
  Connection<NodesType>,
  {edges: Array<{node: NodesType}>}
> {
  return 'edges' in connection && Array.isArray(connection.edges);
}
