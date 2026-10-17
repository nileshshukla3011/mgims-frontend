/** Slices a list into one page and reports how many pages there are. */
export const paginate = <T,>(items: T[], page: number, perPage: number) => ({
  pageItems: items.slice((page - 1) * perPage, page * perPage),
  pageCount: Math.max(1, Math.ceil(items.length / perPage)),
});
