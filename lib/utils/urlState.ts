export function setQueryParams(url: URL, patch: Record<string, string | null | undefined>) {
  Object.entries(patch).forEach(([k, v]) => {
    if (v === null || v === undefined || v === "") url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  });
  return url;
}
