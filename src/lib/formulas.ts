// Reference data for the Formula Cheat-Sheet: spreadsheet formulas used in Phase 3 (Google Sheets and
// Excel) plus the marketing metrics used in Phases 4 and 7. Pure data and a search function (no React,
// no browser APIs) so it can be unit-tested with `node --test`.

export const FORMULA_GROUPS = ['Lookups', 'Aggregation', 'Cleaning', 'Pivots', 'Metrics'] as const;
export type FormulaGroup = (typeof FORMULA_GROUPS)[number];

export interface FormulaEntry {
  id: string;
  name: string;
  group: FormulaGroup;
  /** What gets copied: a formula that works as written once the cell references match your sheet. */
  formula: string;
  /** One or two sentences: what it does and the one thing that goes wrong. */
  note: string;
  /** Present when the formula only exists in Google Sheets: how to get the same result in Excel. */
  excel?: string;
}

export const FORMULAS: readonly FormulaEntry[] = [
  // Lookups and combining
  {
    id: 'xlookup', name: 'XLOOKUP', group: 'Lookups',
    formula: '=XLOOKUP(A2, Prices!A:A, Prices!C:C, "Not found")',
    note: 'Finds A2 in the first range and returns the matching value from the second. Works in Google Sheets and Excel 365/2021; it can look left, unlike VLOOKUP.',
  },
  {
    id: 'vlookup', name: 'VLOOKUP', group: 'Lookups',
    formula: '=VLOOKUP(A2, Prices!A:D, 3, FALSE)',
    note: 'Looks up A2 in the first column of the range and returns the 3rd column. Always end with FALSE (exact match), and the key must be in the first column.',
  },
  {
    id: 'index-match', name: 'INDEX / MATCH', group: 'Lookups',
    formula: '=INDEX(Prices!C:C, MATCH(A2, Prices!A:A, 0))',
    note: 'MATCH finds the row, INDEX returns the value from that row. Works in every version of Excel and Sheets, and in any direction.',
  },
  {
    id: 'importrange', name: 'IMPORTRANGE', group: 'Lookups',
    formula: '=IMPORTRANGE("https://docs.google.com/spreadsheets/d/FILE_ID", "Sheet1!A1:F")',
    note: 'Pulls a range from another Google Sheet and keeps it live. The first time, click "Allow access" on the #REF! cell.',
    excel: 'Data > Get Data > From File > From Workbook (Power Query), then Refresh All.',
  },
  {
    id: 'query', name: 'QUERY', group: 'Lookups',
    formula: '=QUERY(A1:F, "select B, sum(E) where C = \'Meta\' group by B label sum(E) \'Spend\'", 1)',
    note: 'SQL-style filter, group and sort in one cell. Column letters refer to the range, text is in single quotes, and the last number is how many header rows the range has.',
    excel: 'Use a PivotTable, or Power Query (Data > Get Data) for the same group-and-sum.',
  },
  {
    id: 'arrayformula', name: 'ARRAYFORMULA', group: 'Lookups',
    formula: '=ARRAYFORMULA(IF(A2:A="", "", B2:B / C2:C))',
    note: 'Fills a whole column from one formula, so new rows are calculated automatically. Wrap the logic in IF(A2:A="", "", ...) to keep empty rows blank.',
    excel: 'Excel 365 spills automatically: type =B2:B100/C2:C100 in one cell.',
  },
  // Aggregation
  {
    id: 'sumifs', name: 'SUMIFS', group: 'Aggregation',
    formula: '=SUMIFS(E:E, C:C, "Meta", A:A, ">="&DATE(2026,10,1))',
    note: 'Adds the values in E where every condition matches (channel is Meta and date is on or after 1 Oct 2026). The sum range comes first.',
  },
  {
    id: 'countifs', name: 'COUNTIFS', group: 'Aggregation',
    formula: '=COUNTIFS(C:C, "Meta", D:D, ">0")',
    note: 'Counts the rows where every condition matches. Use it for "how many campaigns had conversions".',
  },
  {
    id: 'averageifs', name: 'AVERAGEIFS', group: 'Aggregation',
    formula: '=AVERAGEIFS(E:E, C:C, "Meta")',
    note: 'Averages E for the rows that match. Rows where E is blank are ignored, which can hide missing data.',
  },
  {
    id: 'unique', name: 'UNIQUE', group: 'Aggregation',
    formula: '=UNIQUE(C2:C)',
    note: 'Lists each distinct value once. Handy for a channel list or to spot spelling variants. Works in Sheets and Excel 365/2021.',
  },
  {
    id: 'filter', name: 'FILTER', group: 'Aggregation',
    formula: '=FILTER(A2:F, C2:C="Meta", E2:E>0)',
    note: 'Returns only the rows where every condition is true. Returns #N/A when nothing matches, so wrap it in IFERROR if that can happen.',
  },
  // Cleaning
  {
    id: 'trim-clean', name: 'TRIM + CLEAN', group: 'Cleaning',
    formula: '=TRIM(CLEAN(A2))',
    note: 'Removes extra spaces and non-printing characters that stop two identical-looking values from matching.',
  },
  {
    id: 'split', name: 'SPLIT', group: 'Cleaning',
    formula: '=SPLIT(A2, "|")',
    note: 'Splits text into columns at a separator, for example a campaign name like "eid|meta|video".',
    excel: 'Use TEXTSPLIT(A2, "|") in Excel 365, or Data > Text to Columns.',
  },
  {
    id: 'regexextract', name: 'REGEXEXTRACT', group: 'Cleaning',
    formula: '=REGEXEXTRACT(A2, "utm_source=([^&]+)")',
    note: 'Pulls the part of the text that matches the pattern in brackets, here the utm_source value of a URL.',
    excel: 'Use TEXTAFTER(A2, "utm_source=") with TEXTBEFORE(..., "&") in Excel 365, or Power Query.',
  },
  {
    id: 'textjoin', name: 'TEXTJOIN', group: 'Cleaning',
    formula: '=TEXTJOIN(", ", TRUE, A2:A10)',
    note: 'Joins a range into one text with a separator. TRUE skips empty cells.',
  },
  {
    id: 'datevalue', name: 'DATEVALUE / TEXT', group: 'Cleaning',
    formula: '=TEXT(DATEVALUE(A2), "yyyy-mm-dd")',
    note: 'Turns text that looks like a date into a real date, then formats it. Dates stored as text will not sort or group correctly.',
  },
  {
    id: 'iferror', name: 'IFERROR', group: 'Cleaning',
    formula: '=IFERROR(B2/C2, 0)',
    note: 'Replaces an error with a value, such as 0 when C2 is 0. Use it for known cases like division by zero, not to hide errors you have not looked at.',
  },
  // Pivots
  {
    id: 'pivot-build', name: 'Build a pivot table', group: 'Pivots',
    formula: 'Select the clean table > Insert > Pivot table > Rows: Channel > Values: SUM of Spend > Filters: Month',
    note: 'Both tools use the same four areas: Rows, Columns, Values and Filters. Keep one header row and no blank rows or columns in the source.',
    excel: 'Insert > PivotTable. After the data changes, use Data > Refresh All (Sheets refreshes by itself).',
  },
  {
    id: 'getpivotdata', name: 'GETPIVOTDATA', group: 'Pivots',
    formula: '=GETPIVOTDATA("Spend", $A$3, "Channel", "Meta")',
    note: 'Reads one value out of a pivot table by name, so a summary tab stays correct when the pivot grows.',
  },
  // Metrics
  {
    id: 'roi', name: 'ROI', group: 'Metrics',
    formula: '=(B2-C2)/C2',
    note: 'ROI = (Revenue - Cost) / Cost, with B2 = revenue and C2 = cost. Format the cell as a percentage.',
  },
  {
    id: 'cpa', name: 'CPA', group: 'Metrics',
    formula: '=C2/D2',
    note: 'Cost per acquisition = Total cost / Conversions, with C2 = cost and D2 = conversions. Returns an error when conversions is 0.',
  },
  {
    id: 'roas', name: 'ROAS', group: 'Metrics',
    formula: '=B2/C2',
    note: 'Return on ad spend = Revenue / Ad spend, with B2 = revenue and C2 = ad spend. A result of 3 means 3 taka of revenue per 1 taka of spend.',
  },
  {
    id: 'ctr', name: 'CTR', group: 'Metrics',
    formula: '=E2/F2',
    note: 'Click-through rate = Clicks / Impressions, with E2 = clicks and F2 = impressions. Format the cell as a percentage.',
  },
  {
    id: 'cvr', name: 'Conversion rate', group: 'Metrics',
    formula: '=D2/G2',
    note: 'Conversion rate = Conversions / Sessions, with D2 = conversions and G2 = sessions. Say which denominator you used (sessions or clicks), because they give different numbers.',
  },
  {
    id: 'cpc', name: 'CPC', group: 'Metrics',
    formula: '=C2/E2',
    note: 'Cost per click = Cost / Clicks, with C2 = cost and E2 = clicks.',
  },
  {
    id: 'cpm', name: 'CPM', group: 'Metrics',
    formula: '=C2/F2*1000',
    note: 'Cost per 1,000 impressions = Cost / Impressions x 1000, with C2 = cost and F2 = impressions.',
  },
  {
    id: 'aov', name: 'AOV', group: 'Metrics',
    formula: '=B2/H2',
    note: 'Average order value = Revenue / Orders, with B2 = revenue and H2 = orders.',
  },
];

/**
 * Entries that match every word of `query` in their name, group, formula, note or Excel hint (case
 * and spacing do not matter), optionally limited to one group. Entries whose name matches come
 * first. An empty query matches everything, in the original order.
 */
export function filterFormulas(
  entries: readonly FormulaEntry[],
  query: string,
  group: FormulaGroup | 'All' = 'All',
): FormulaEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = entries.filter((entry) => {
    if (group !== 'All' && entry.group !== group) return false;
    const haystack = `${entry.name} ${entry.group} ${entry.formula} ${entry.note} ${entry.excel ?? ''}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
  if (words.length === 0) return matches;
  const inName = (entry: FormulaEntry) => words.every((word) => entry.name.toLowerCase().includes(word));
  // Array.prototype.sort is stable, so entries keep their order within each half.
  return [...matches].sort((a, b) => Number(inName(b)) - Number(inName(a)));
}
