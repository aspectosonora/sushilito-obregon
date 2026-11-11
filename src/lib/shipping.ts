import prices from "@/data/shipping-prices.json";

type ColonyPrice = { name: string; price: number };

const pricesByBranch: Record<string, ColonyPrice[]> = {
  morelos: prices.obregon,
  guerrero: prices.obregon,
  tabasco: prices.tabasco,
  navojoa: prices.navojoa,
};

function normalizeColony(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function colonySuggestions(branchId: string, query: string): string[] {
  const rows = pricesByBranch[branchId] ?? [];
  const search = normalizeColony(query);
  if (search.length < 2) return [];
  return [...new Set(rows.filter((row) => normalizeColony(row.name).includes(search)).map((row) => row.name))].slice(0, 8);
}

export function quoteShipping(branchId: string, colony: string): number | null {
  const key = normalizeColony(colony);
  if (!key) return null;
  const matches = (pricesByBranch[branchId] ?? []).filter((row) => normalizeColony(row.name) === key);
  const uniquePrices = [...new Set(matches.map((row) => row.price))];
  return uniquePrices.length === 1 ? uniquePrices[0] : null;
}
