/** Academic year for display: '2021-22' -> '2021–22'. */
export const formatYear = (year: string) => year.replace('-', '–');

/** First calendar year of '2021-22' or '2021', for sorting newest first. */
export const startYear = (year: string) => Number(year.slice(0, 4));
