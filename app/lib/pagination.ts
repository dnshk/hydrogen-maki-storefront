import {getPaginationVariables} from '@shopify/hydrogen';

type PaginationOptions = Parameters<typeof getPaginationVariables>[1];

export function getInfiniteScrollPaginationVariables(
  request: Request,
  options: PaginationOptions,
) {
  return getPaginationVariables(
    getInfiniteScrollPaginationRequest(request),
    options,
  );
}

function getInfiniteScrollPaginationRequest(request: Request) {
  const url = new URL(request.url);

  url.searchParams.delete('__infinite');

  return new Request(url, request);
}
