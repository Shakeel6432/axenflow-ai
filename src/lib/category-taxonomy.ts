/** Main category → subcategory names stored on Business.categoryName */

export type MainCategory = {
  name: string;
  slug: string;
  subcategories: string[];
};

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    name: "Healthcare",
    slug: "healthcare",
    subcategories: [
      "Dentists",
      "Cosmetic Dentists",
      "Pediatric Dentists",
      "Orthodontists",
      "Oral Surgeons",
      "Dental Laboratories",
      "Family Doctors",
      "Medical Clinics",
      "Physicians",
      "Urgent Care",
      "Pharmacies",
      "Hospitals",
      "Optometrists",
      "Eye Clinics",
      "Dermatologists",
      "Chiropractors",
      "Physical Therapy",
      "Psychologists",
      "Mental Health Clinics",
      "Veterinary Clinics",
    ],
  },
  {
    name: "Home Services",
    slug: "home-services",
    subcategories: ["HVAC Contractors", "Plumbers", "Roofers"],
  },
  {
    name: "Real Estate",
    slug: "real-estate",
    subcategories: ["Real Estate Agents"],
  },
];

/** Old main-category names that now map to Healthcare */
const MAIN_ALIASES: Record<string, string> = {
  dental: "Healthcare",
  medical: "Healthcare",
};

const SUB_TO_MAIN = new Map<string, string>();
for (const main of MAIN_CATEGORIES) {
  for (const sub of main.subcategories) {
    SUB_TO_MAIN.set(sub.toLowerCase(), main.name);
  }
}

export function getMainCategoryName(subcategory: string | null | undefined): string | null {
  if (!subcategory?.trim()) return null;
  return SUB_TO_MAIN.get(subcategory.trim().toLowerCase()) || null;
}

export function getSubcategoriesForMain(mainName: string): string[] {
  const key = mainName.trim().toLowerCase();
  const resolved = MAIN_ALIASES[key] || mainName.trim();
  const main = MAIN_CATEGORIES.find(
    (m) => m.name.toLowerCase() === resolved.toLowerCase() || m.slug === resolved.toLowerCase()
  );
  return main?.subcategories ?? [];
}

export function resolveCategoryFilter(params: {
  mainCategory?: string;
  category?: string;
}): string[] | null {
  const sub = params.category?.trim();
  if (sub) return [sub];

  const main = params.mainCategory?.trim();
  if (main) {
    const subs = getSubcategoriesForMain(main);
    return subs.length ? subs : null;
  }

  return null;
}
