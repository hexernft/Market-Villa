export type BusinessMode = "products";

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
];

export function normalizeBusinessMode(value: string | null | undefined): BusinessMode {
  return "products";
}

export function getBusinessModeMeta(value: string | null | undefined) {
  return businessModes[0];
}

export function getThemeBusinessMode(themeId: string): BusinessMode {
  return "products";
}
