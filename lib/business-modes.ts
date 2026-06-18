export type BusinessMode = "products" | "properties" | "cars";

export const businessModes: Array<{
  id: BusinessMode;
  label: string;
  shortLabel: string;
  description: string;
  inventoryLabel: string;
  themeLabel: string;
}> = [
  {
    id: "products",
    label: "Products",
    shortLabel: "Products",
    description:
      "For businesses selling physical items, food, fashion, beauty, groceries, pharmacy items, or general retail.",
    inventoryLabel: "Products",
    themeLabel: "Product themes",
  },
  {
    id: "properties",
    label: "Properties",
    shortLabel: "Properties",
    description:
      "For apartments, shortlets, rentals, land, commercial spaces, real estate agents, and property managers.",
    inventoryLabel: "Listings",
    themeLabel: "Property themes",
  },
  {
    id: "cars",
    label: "Cars",
    shortLabel: "Cars",
    description:
      "For car dealerships, vehicle brokers, importers, auto lots, and sellers who need inspection or test-drive leads.",
    inventoryLabel: "Vehicles",
    themeLabel: "Car themes",
  },
];

export function normalizeBusinessMode(value: string | null | undefined): BusinessMode {
  if (value === "properties") return "properties";
  if (value === "cars" || value === "car_dealership") return "cars";

  return "products";
}

export function getBusinessModeMeta(value: string | null | undefined) {
  const mode = normalizeBusinessMode(value);

  return businessModes.find((item) => item.id === mode) || businessModes[0];
}

export function getThemeBusinessMode(themeId: string): BusinessMode {
  if (themeId === "car-showroom") return "cars";

  if (themeId === "apartment-stay") return "properties";

  return "products";
}
