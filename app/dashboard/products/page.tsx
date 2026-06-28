"use client";

import {
  FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Camera,
  ImagePlus,
  Loader2,
  Plus,
  Search,
  Star,
  ToggleRight,
  Trash2,
  X
} from "lucide-react";
import {
  createProduct,
  deleteProduct,
  getMyBusinesses,
  getProductsByBusinessId,
  toggleProductAvailability,
  updateProduct
} from "@/lib/business-actions";
import {
  uploadBusinessImage } from "@/lib/storage-actions";
import {
  formatCurrency } from "@/lib/utils";
import {
  ImageUploadField } from "@/components/ImageUploadField";
import {
  getBusinessModeMeta, normalizeBusinessMode } from "@/lib/business-modes";
import {
  canUseBusinessModeForPlan,
  getBusinessModePlanMessage
} from "@/lib/plans";

const productCategories = [
  "Pastries",
  "Food & Drinks",
  "Fashion",
  "Beauty",
  "Retail",
  "Booking",
  "Digital Product",
  "Other",
];

const vehicleCategories = [
  "SUV",
  "Sedan",
  "Truck",
  "Bus",
  "Coupe",
  "Hatchback",
  "Tokunbo",
  "Brand New",
  "Other",
];

const propertyCategories = [
  "Apartment",
  "House",
  "Shortlet",
  "Land",
  "Office",
  "Shop",
  "Warehouse",
  "Other",
];

const vehicleStatuses = [
  {
  label: "Available", value: "available" },
  {
  label: "Reserved", value: "reserved" },
  {
  label: "Sold", value: "sold" },
  {
  label: "In transit", value: "in_transit" },
  {
  label: "On request", value: "on_request" },
] as const;

const propertyStatuses = [
  {
  label: "Available", value: "available" },
  {
  label: "Reserved", value: "reserved" },
  {
  label: "Rented", value: "rented" },
  {
  label: "Sold", value: "sold" },
  {
  label: "Unavailable", value: "unavailable" },
] as const;

function formatVehicleStatus(status?: string | null) {
  return (
    vehicleStatuses.find((item) => item.value === status)?.label ||
    "Available"
  );
}

function formatPropertyStatus(status?: string | null) {
  return (
    propertyStatuses.find((item) => item.value === status)?.label ||
    "Available"
  );
}

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
theme_id?: string | null;
  subscription_plan?: string | null;
};

type DashboardProduct = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  item_type?: string | null;
  vehicle_status?: string | null;
  vehicle_details?: Record<string, any> | null;
  property_status?: string | null;
  property_details?: Record<string, any> | null;
};

export default function ProductsPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [products, setProducts] = useState<DashboardProduct[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(productCategories[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [compressedImageFile, setCompressedImageFile] = useState<File | null>(
    null
  );
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [vehicleStatus, setVehicleStatus] =
    useState<(typeof vehicleStatuses)[number]["value"]>("available");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleTrim, setVehicleTrim] = useState("");
  const [vehicleMileage, setVehicleMileage] = useState("");
  const [vehicleTransmission, setVehicleTransmission] = useState("");
  const [vehicleFuelType, setVehicleFuelType] = useState("");
  const [vehicleEngine, setVehicleEngine] = useState("");
  const [vehicleBodyType, setVehicleBodyType] = useState("");
  const [vehicleExteriorColor, setVehicleExteriorColor] = useState("");
  const [vehicleInteriorColor, setVehicleInteriorColor] = useState("");
  const [vehicleCondition, setVehicleCondition] = useState("");
  const [vehicleDutyStatus, setVehicleDutyStatus] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");
  const [vehicleLocation, setVehicleLocation] = useState("");
  const [vehicleDocuments, setVehicleDocuments] = useState("");
  const [vehicleFinancingAvailable, setVehicleFinancingAvailable] =
    useState(false);
  const [vehiclePriceNegotiable, setVehiclePriceNegotiable] = useState(false);
  const [propertyStatus, setPropertyStatus] =
    useState<(typeof propertyStatuses)[number]["value"]>("available");
  const [propertyType, setPropertyType] = useState("");
  const [propertyBedrooms, setPropertyBedrooms] = useState("");
  const [propertyBathrooms, setPropertyBathrooms] = useState("");
  const [propertyToilets, setPropertyToilets] = useState("");
  const [propertyParking, setPropertyParking] = useState("");
  const [propertyFurnishedStatus, setPropertyFurnishedStatus] = useState("");
  const [propertyServicing, setPropertyServicing] = useState("");
  const [propertyLandSize, setPropertyLandSize] = useState("");
  const [propertyTitleDocument, setPropertyTitleDocument] = useState("");
  const [propertyInspectionFee, setPropertyInspectionFee] = useState("");
  const [propertyAvailabilityDate, setPropertyAvailabilityDate] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyPricePeriod, setPropertyPricePeriod] = useState("");
  const [propertyAmenities, setPropertyAmenities] = useState("");
  const [propertyAgencyFee, setPropertyAgencyFee] = useState("");
  const [propertyCautionFee, setPropertyCautionFee] = useState("");
  const [propertyIsNegotiable, setPropertyIsNegotiable] = useState(false);

  const [editingProductId, setEditingProductId] = useState("");
  const [query, setQuery] = useState("");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyProductId, setBusyProductId] = useState("");
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
  return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const isDealershipMode =
    false ||
    false;
  const modeMeta = getBusinessModeMeta("products");
  const isPropertiesMode = false;
  const singularInventoryLabel = "Product";
  const isCurrentModeLocked = !canUseBusinessModeForPlan({
  mode: modeMeta.id,
    plan: selectedBusiness?.subscription_plan
});

  const activeCategories = isDealershipMode
    ? vehicleCategories
    : isPropertiesMode
      ? propertyCategories
    : productCategories;

  const filteredProducts = useMemo(() => {
  const search = query.toLowerCase().trim();

    if (!search) {
  return products;
    }

    return products.filter((product) => {
  return (
        product.name.toLowerCase().includes(search) ||
        (product.category || "").toLowerCase().includes(search) ||
        (product.description || "").toLowerCase().includes(search)
      );
    });
  }, [products, query]);

  const availableProductsCount = products.filter(
    (product) => product.is_available
  ).length;

  const featuredProductsCount = products.filter(
    (product) => product.is_featured
  ).length;

  useEffect(() => {
  let mounted = true;

    async function loadBusinesses() {
  try {
  setIsLoading(true);

        const items = await getMyBusinesses();

        if (!mounted) return;

        setBusinesses(items);

        if (items.length > 0) {
  setSelectedBusinessId(items[0].id);
        }
      } catch (error) {
  const errorMessage =
          error instanceof Error ? error.message : "Unable to load businesses.";
        setMessage(errorMessage);
      } finally {
  if (mounted) {
  setIsLoading(false);
        }
      }
    }

    loadBusinesses();

    return () => {
  mounted = false;
    };
  }, []);

  useEffect(() => {
  let mounted = true;

    async function loadProducts() {
  if (!selectedBusinessId) {
  setProducts([]);
        return;
      }

      try {
  const items = await getProductsByBusinessId(selectedBusinessId);

        if (!mounted) return;

        setProducts(items);
      } catch (error) {
  const errorMessage =
          error instanceof Error ? error.message : "Unable to load products.";
        setMessage(errorMessage);
      }
    }

    loadProducts();

    return () => {
  mounted = false;
    };
  }, [selectedBusinessId]);

  function clearFormFields() {
  setName("");
    setPrice("");
    setCategory(activeCategories[0]);
    setImageUrl("");
    setCompressedImageFile(null);
    setDescription("");
    setIsAvailable(true);
    setIsFeatured(false);
    setVehicleStatus("available");
    setVehicleMake("");
    setVehicleModel("");
    setVehicleYear("");
    setVehicleTrim("");
    setVehicleMileage("");
    setVehicleTransmission("");
    setVehicleFuelType("");
    setVehicleEngine("");
    setVehicleBodyType("");
    setVehicleExteriorColor("");
    setVehicleInteriorColor("");
    setVehicleCondition("");
    setVehicleDutyStatus("");
    setVehicleVin("");
    setVehicleLocation("");
    setVehicleDocuments("");
    setVehicleFinancingAvailable(false);
    setVehiclePriceNegotiable(false);
    setPropertyStatus("available");
    setPropertyType("");
    setPropertyBedrooms("");
    setPropertyBathrooms("");
    setPropertyToilets("");
    setPropertyParking("");
    setPropertyFurnishedStatus("");
    setPropertyServicing("");
    setPropertyLandSize("");
    setPropertyTitleDocument("");
    setPropertyInspectionFee("");
    setPropertyAvailabilityDate("");
    setPropertyLocation("");
    setPropertyPricePeriod("");
    setPropertyAmenities("");
    setPropertyAgencyFee("");
    setPropertyCautionFee("");
    setPropertyIsNegotiable(false);
    setEditingProductId("");
  }

  function resetForm() {
  clearFormFields();
    setIsProductFormOpen(false);
  }

  function openNewProductForm() {
  clearFormFields();
    setMessage("");
    setIsProductFormOpen(true);
  }

  function startEditing(product: DashboardProduct) {
  const details = product.vehicle_details || {};
    const propertyDetails = product.property_details || {};

    setEditingProductId(product.id);
    setName(product.name);
    setPrice(String(product.price || ""));
    setCategory(product.category || activeCategories[0]);
    setImageUrl(product.image_url || "");
    setCompressedImageFile(null);
    setDescription(product.description || "");
    setIsAvailable(product.is_available);
    setIsFeatured(product.is_featured);
    setVehicleStatus(
      vehicleStatuses.some((status) => status.value === product.vehicle_status)
        ? (product.vehicle_status as (typeof vehicleStatuses)[number]["value"])
        : "available"
    );
    setVehicleMake(String(details.make || ""));
    setVehicleModel(String(details.model || ""));
    setVehicleYear(String(details.year || ""));
    setVehicleTrim(String(details.trim || ""));
    setVehicleMileage(String(details.mileage || ""));
    setVehicleTransmission(String(details.transmission || ""));
    setVehicleFuelType(String(details.fuelType || ""));
    setVehicleEngine(String(details.engine || ""));
    setVehicleBodyType(String(details.bodyType || ""));
    setVehicleExteriorColor(String(details.exteriorColor || ""));
    setVehicleInteriorColor(String(details.interiorColor || ""));
    setVehicleCondition(String(details.condition || ""));
    setVehicleDutyStatus(String(details.dutyStatus || ""));
    setVehicleVin(String(details.vin || ""));
    setVehicleLocation(String(details.vehicleLocation || ""));
    setVehicleDocuments(String(details.documents || ""));
    setVehicleFinancingAvailable(Boolean(details.financingAvailable));
    setVehiclePriceNegotiable(Boolean(details.priceNegotiable));
    setPropertyStatus(
      propertyStatuses.some((status) => status.value === product.property_status)
        ? (product.property_status as (typeof propertyStatuses)[number]["value"])
        : "available"
    );
    setPropertyType(String(propertyDetails.propertyType || ""));
    setPropertyBedrooms(String(propertyDetails.bedrooms || ""));
    setPropertyBathrooms(String(propertyDetails.bathrooms || ""));
    setPropertyToilets(String(propertyDetails.toilets || ""));
    setPropertyParking(String(propertyDetails.parking || ""));
    setPropertyFurnishedStatus(String(propertyDetails.furnishedStatus || ""));
    setPropertyServicing(String(propertyDetails.servicing || ""));
    setPropertyLandSize(String(propertyDetails.landSize || ""));
    setPropertyTitleDocument(String(propertyDetails.titleDocument || ""));
    setPropertyInspectionFee(String(propertyDetails.inspectionFee || ""));
    setPropertyAvailabilityDate(String(propertyDetails.availabilityDate || ""));
    setPropertyLocation(String(propertyDetails.propertyLocation || ""));
    setPropertyPricePeriod(String(propertyDetails.pricePeriod || ""));
    setPropertyAmenities(String(propertyDetails.amenities || ""));
    setPropertyAgencyFee(String(propertyDetails.agencyFee || ""));
    setPropertyCautionFee(String(propertyDetails.cautionFee || ""));
    setPropertyIsNegotiable(Boolean(propertyDetails.isNegotiable));
    setMessage("");
    setIsProductFormOpen(true);
  }

  async function reloadProducts() {
  if (!selectedBusinessId) return;

    const updatedProducts = await getProductsByBusinessId(selectedBusinessId);
    setProducts(updatedProducts);
  }

  async function handleSubmitProduct(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

    if (!selectedBusinessId) {
  setMessage(`Create a business page first before adding ${modeMeta.inventoryLabel.toLowerCase()}.`);
      return;
    }

    setMessage("");
    setIsSaving(true);

    try {
  let finalImageUrl = imageUrl;
      const vehicleDetails = {
  make: vehicleMake,
        model: vehicleModel,
        year: vehicleYear,
        trim: vehicleTrim,
        mileage: vehicleMileage,
        transmission: vehicleTransmission,
        fuelType: vehicleFuelType,
        engine: vehicleEngine,
        bodyType: vehicleBodyType,
        exteriorColor: vehicleExteriorColor,
        interiorColor: vehicleInteriorColor,
        condition: vehicleCondition,
        dutyStatus: vehicleDutyStatus,
        vin: vehicleVin,
        vehicleLocation,
        documents: vehicleDocuments,
        financingAvailable: vehicleFinancingAvailable,
        priceNegotiable: vehiclePriceNegotiable
};
      const propertyDetails = {
  propertyType,
        bedrooms: propertyBedrooms,
        bathrooms: propertyBathrooms,
        toilets: propertyToilets,
        parking: propertyParking,
        furnishedStatus: propertyFurnishedStatus,
        servicing: propertyServicing,
        landSize: propertyLandSize,
        titleDocument: propertyTitleDocument,
        inspectionFee: propertyInspectionFee,
        availabilityDate: propertyAvailabilityDate,
        propertyLocation,
        pricePeriod: propertyPricePeriod,
        amenities: propertyAmenities,
        agencyFee: propertyAgencyFee,
        cautionFee: propertyCautionFee,
        isNegotiable: propertyIsNegotiable
};
      const itemType = isDealershipMode
        ? "vehicle"
        : isPropertiesMode
          ? "property"
          : "product";

      if (compressedImageFile) {
  const uploadedImage = await uploadBusinessImage({
  file: compressedImageFile,
          businessId: selectedBusinessId,
          folder: "products"
});

        finalImageUrl = uploadedImage.publicUrl;
      }

      if (editingProductId) {
  await updateProduct({
  productId: editingProductId,
          name,
          description,
          price: Number(price),
          category,
          imageUrl: finalImageUrl,
          isAvailable,
          isFeatured,
          itemType,
          vehicleStatus: isDealershipMode ? vehicleStatus : "available",
          vehicleDetails: isDealershipMode ? vehicleDetails : {},
          propertyStatus: isPropertiesMode ? propertyStatus : "available",
          propertyDetails: isPropertiesMode ? propertyDetails : {}
});

        setMessage(
          isDealershipMode
            ? "Vehicle updated successfully."
            : isPropertiesMode
              ? "Listing updated successfully."
              : "Product updated successfully."
        );
      } else {
  await createProduct({
  businessId: selectedBusinessId,
          name,
          description,
          price: Number(price),
          category,
          imageUrl: finalImageUrl,
          isAvailable,
          isFeatured,
          itemType,
          vehicleStatus: isDealershipMode ? vehicleStatus : "available",
          vehicleDetails: isDealershipMode ? vehicleDetails : {},
          propertyStatus: isPropertiesMode ? propertyStatus : "available",
          propertyDetails: isPropertiesMode ? propertyDetails : {}
});

        setMessage(
          isDealershipMode
            ? "Vehicle added successfully."
            : isPropertiesMode
              ? "Listing added successfully."
              : "Product added successfully."
        );
      }

      await reloadProducts();
      resetForm();
    } catch (error) {
  const errorMessage =
        error instanceof Error ? error.message : "Unable to save product.";

      setMessage(errorMessage);
    } finally {
  setIsSaving(false);
    }
  }

  async function handleToggleAvailability(product: DashboardProduct) {
  setBusyProductId(product.id);
    setMessage("");

    try {
  await toggleProductAvailability({
  productId: product.id,
        isAvailable: !product.is_available
});

      await reloadProducts();
      setMessage(`${singularInventoryLabel} visibility updated.`);
    } catch (error) {
  const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to update product availability.";

      setMessage(errorMessage);
    } finally {
  setBusyProductId("");
    }
  }

  async function handleDeleteProduct(productId: string) {
  const confirmed = window.confirm(
      `Delete this ${singularInventoryLabel.toLowerCase()}? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusyProductId(productId);
    setMessage("");

    try {
  await deleteProduct(productId);
      await reloadProducts();

      if (editingProductId === productId) {
  resetForm();
      }

      setMessage(
        isDealershipMode
          ? "Vehicle deleted successfully."
          : isPropertiesMode
            ? "Listing deleted successfully."
            : `${singularInventoryLabel} deleted successfully.`
      );
    } catch (error) {
  const errorMessage =
        error instanceof Error ? error.message : "Unable to delete product.";

      setMessage(errorMessage);
    } finally {
  setBusyProductId("");
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => {
  setSelectedBusinessId(event.target.value);
                resetForm();
              }}
              className="min-h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 md:min-w-80"
            >
              {businesses.length === 0 ? (
                <option value="">No business created yet</option>
              ) : null}

              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} â€” /store/{business.slug}
                </option>
              ))}
            </select>

            <div className="relative md:w-80">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-10 w-full rounded-2xl border border-slate-200 bg-white px-11 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                placeholder={`Search ${modeMeta.inventoryLabel.toLowerCase()}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Total</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {products.length}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-3 py-2">
              <p className="text-xs text-emerald-700">
                {isDealershipMode ? "Visible" : "Live"}
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-950">
                {availableProductsCount}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 px-3 py-2">
              <p className="text-xs text-purple-700">Featured</p>
              <p className="mt-1 text-lg font-semibold text-purple-950">
                {featuredProductsCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {message && !isProductFormOpen ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading products...
        </section>
      ) : businesses.length === 0 ? (
        <section className="rounded-[2rem] border border-purple-200 bg-purple-50 p-8 text-center">
          <p className="text-sm font-semibold text-purple-950">
            Create a business page first
          </p>
        </section>
      ) : isCurrentModeLocked ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-amber-950">
            {getBusinessModePlanMessage(modeMeta.id)}
          </p>

          <Link
            href="/dashboard/billing"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white"
          >
            View Pro Plan
          </Link>
        </section>
      ) : (
        <section
          className={`grid gap-6 ${
  isProductFormOpen
              ? "xl:grid-cols-[0.9fr_1.1fr]"
              : "xl:grid-cols-[0.35fr_1fr]"
          }`}
        >
          {!isProductFormOpen ? (
            <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
              <button
                type="button"
                onClick={openNewProductForm}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                <Plus size={18} />
                Add {singularInventoryLabel}
              </button>
            </div>
          ) : null}

          {isProductFormOpen ? (
            <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {editingProductId ? "Edit" : `New ${singularInventoryLabel}`}
                </span>

                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <ImagePlus size={21} />
                </span>
              </div>

              <form onSubmit={handleSubmitProduct} className="grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {isDealershipMode
                      ? "Vehicle title"
                      : isPropertiesMode
                        ? "Listing title"
                        : "Product name"}
                  </span>

                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                    placeholder={
  isDealershipMode
                        ? "Toyota Camry 2018 XLE"
                        : isPropertiesMode
                          ? "2-bedroom apartment in Wuse"
                        : "Product name"
                    }
                    required
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {isDealershipMode
                        ? "Asking price"
                        : isPropertiesMode
                          ? "Price / rent"
                          : "Price"}
                    </span>

                    <input
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                      placeholder="1500"
                      type="number"
                      min="0"
                      required
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Category
                    </span>

                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                    >
                      {activeCategories.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <ImageUploadField
                  label={
  editingProductId
                      ? isDealershipMode
                        ? "Replace vehicle image"
                        : isPropertiesMode
                          ? "Replace listing image"
                        : "Replace product image"
                      : isDealershipMode
                        ? "Upload vehicle image"
                        : isPropertiesMode
                          ? "Upload listing image"
                        : "Upload product image"
                  }
                  helper={
  isDealershipMode
                      ? "Use a clean exterior or hero image. Large images will be compressed."
                      : isPropertiesMode
                        ? "Use a clean property hero image. Large images will be compressed."
                      : "Large images will be compressed before upload."
                  }
                  maxWidth={1400}
                  maxHeight={1400}
                  onCompressed={(file) => setCompressedImageFile(file)}
                />

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {isDealershipMode
                      ? "Vehicle image URL"
                      : isPropertiesMode
                        ? "Listing image URL"
                        : "Image URL"}
                  </span>

                  <div className="relative">
                    <Camera
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-11 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                      placeholder="https://..."
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {isDealershipMode
                      ? "Vehicle description"
                      : isPropertiesMode
                        ? "Listing description"
                        : "Description"}
                  </span>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                    placeholder={
  isDealershipMode
                        ? "Add mileage, condition, documents, location, and inspection notes."
                        : isPropertiesMode
                          ? "Add bedrooms, bathrooms, location, inspection notes, and availability."
                        : "Add important product details."
                    }
                  />
                </label>

                {isDealershipMode ? (
                  <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Vehicle details
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Make
                        </span>
                        <input
                          value={vehicleMake}
                          onChange={(event) => setVehicleMake(event.target.value)}
                          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                          placeholder="Toyota"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Model
                        </span>
                        <input
                          value={vehicleModel}
                          onChange={(event) => setVehicleModel(event.target.value)}
                          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                          placeholder="Camry"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Year
                        </span>
                        <input
                          value={vehicleYear}
                          onChange={(event) => setVehicleYear(event.target.value)}
                          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                          placeholder="2018"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Trim
                        </span>
                        <input
                          value={vehicleTrim}
                          onChange={(event) => setVehicleTrim(event.target.value)}
                          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                          placeholder="XLE"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Mileage
                        </span>
                        <input
                          value={vehicleMileage}
                          onChange={(event) => setVehicleMileage(event.target.value)}
                          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                          placeholder="56,000 km"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Status
                        </span>
                        <select
                          value={vehicleStatus}
                          onChange={(event) =>
                            setVehicleStatus(
                              event.target
                                .value as (typeof vehicleStatuses)[number]["value"]
                            )
                          }
                          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        >
                          {vehicleStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <input
                        value={vehicleTransmission}
                        onChange={(event) => setVehicleTransmission(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Transmission"
                      />
                      <input
                        value={vehicleFuelType}
                        onChange={(event) => setVehicleFuelType(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Fuel type"
                      />
                      <input
                        value={vehicleEngine}
                        onChange={(event) => setVehicleEngine(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Engine"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <input
                        value={vehicleBodyType}
                        onChange={(event) => setVehicleBodyType(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Body type"
                      />
                      <input
                        value={vehicleExteriorColor}
                        onChange={(event) =>
                          setVehicleExteriorColor(event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Exterior color"
                      />
                      <input
                        value={vehicleInteriorColor}
                        onChange={(event) =>
                          setVehicleInteriorColor(event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Interior color"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={vehicleCondition}
                        onChange={(event) => setVehicleCondition(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Condition"
                      />
                      <input
                        value={vehicleDutyStatus}
                        onChange={(event) => setVehicleDutyStatus(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Duty / document status"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={vehicleVin}
                        onChange={(event) => setVehicleVin(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="VIN / chassis number"
                      />
                      <input
                        value={vehicleLocation}
                        onChange={(event) => setVehicleLocation(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Vehicle location"
                      />
                    </div>

                    <textarea
                      value={vehicleDocuments}
                      onChange={(event) => setVehicleDocuments(event.target.value)}
                      rows={3}
                      className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                      placeholder="Documents, inspection notes, customs duty, registration, transfer notes..."
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                        <span className="text-sm font-semibold text-slate-700">
                          Financing / installment available
                        </span>
                        <input
                          type="checkbox"
                          checked={vehicleFinancingAvailable}
                          onChange={(event) =>
                            setVehicleFinancingAvailable(event.target.checked)
                          }
                        />
                      </label>
                      <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                        <span className="text-sm font-semibold text-slate-700">
                          Price negotiable
                        </span>
                        <input
                          type="checkbox"
                          checked={vehiclePriceNegotiable}
                          onChange={(event) =>
                            setVehiclePriceNegotiable(event.target.checked)
                          }
                        />
                      </label>
                    </div>
                  </div>
                ) : null}

                {isPropertiesMode ? (
                  <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Property details
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Property type
                        </span>
                        <input
                          value={propertyType}
                          onChange={(event) => setPropertyType(event.target.value)}
                          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                          placeholder="2-bedroom apartment"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Location
                        </span>
                        <input
                          value={propertyLocation}
                          onChange={(event) => setPropertyLocation(event.target.value)}
                          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                          placeholder="Lekki Phase 1"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Status
                        </span>
                        <select
                          value={propertyStatus}
                          onChange={(event) =>
                            setPropertyStatus(
                              event.target
                                .value as (typeof propertyStatuses)[number]["value"]
                            )
                          }
                          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        >
                          {propertyStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <input
                        value={propertyBedrooms}
                        onChange={(event) => setPropertyBedrooms(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Bedrooms"
                      />
                      <input
                        value={propertyBathrooms}
                        onChange={(event) => setPropertyBathrooms(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Bathrooms"
                      />
                      <input
                        value={propertyToilets}
                        onChange={(event) => setPropertyToilets(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Toilets"
                      />
                      <input
                        value={propertyParking}
                        onChange={(event) => setPropertyParking(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Parking"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <input
                        value={propertyFurnishedStatus}
                        onChange={(event) =>
                          setPropertyFurnishedStatus(event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Furnished status"
                      />
                      <input
                        value={propertyPricePeriod}
                        onChange={(event) => setPropertyPricePeriod(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Price period, e.g. yearly"
                      />
                      <input
                        value={propertyAvailabilityDate}
                        onChange={(event) =>
                          setPropertyAvailabilityDate(event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Availability date"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <input
                        value={propertyTitleDocument}
                        onChange={(event) =>
                          setPropertyTitleDocument(event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Title document"
                      />
                      <input
                        value={propertyInspectionFee}
                        onChange={(event) =>
                          setPropertyInspectionFee(event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Inspection fee"
                      />
                      <input
                        value={propertyLandSize}
                        onChange={(event) => setPropertyLandSize(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Land / floor size"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <input
                        value={propertyServicing}
                        onChange={(event) => setPropertyServicing(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Service charge"
                      />
                      <input
                        value={propertyAgencyFee}
                        onChange={(event) => setPropertyAgencyFee(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Agency fee"
                      />
                      <input
                        value={propertyCautionFee}
                        onChange={(event) => setPropertyCautionFee(event.target.value)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                        placeholder="Caution fee"
                      />
                    </div>

                    <textarea
                      value={propertyAmenities}
                      onChange={(event) => setPropertyAmenities(event.target.value)}
                      rows={3}
                      className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                      placeholder="Amenities, estate notes, nearby landmarks, inspection instructions..."
                    />

                    <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                      <span className="text-sm font-semibold text-slate-700">
                        Price negotiable
                      </span>
                      <input
                        type="checkbox"
                        checked={propertyIsNegotiable}
                        onChange={(event) =>
                          setPropertyIsNegotiable(event.target.checked)
                        }
                      />
                    </label>
                  </div>
                ) : null}

                <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-3">
                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Available
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(event) => setIsAvailable(event.target.checked)}
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Featured
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(event) => setIsFeatured(event.target.checked)}
                    />
                  </label>
                </div>

                {message ? (
                  <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                    {message}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#26143d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Plus size={17} />
                    )}

                    {isSaving
                      ? "Saving..."
                      : editingProductId
                      ? "Save Changes"
                      : `Add ${singularInventoryLabel}`}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    <X size={17} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          <div className="grid content-start gap-4">
            {filteredProducts.length === 0 ? (
              <div className="rounded-[1.35rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <ImagePlus size={20} />
                </div>

                <p className="mt-4 text-base font-semibold text-slate-950">
                  {products.length === 0
                    ? isDealershipMode
                      ? "You have no vehicles yet"
                      : isPropertiesMode
                        ? "You have no listings yet"
                        : "You have no products yet"
                    : isDealershipMode
                      ? "No matching vehicles"
                      : isPropertiesMode
                        ? "No matching listings"
                        : "No matching products"}
                </p>

                {products.length === 0 ? (
                  <button
                    type="button"
                    onClick={openNewProductForm}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    <Plus size={17} />
                    {isDealershipMode
                      ? "Add Vehicle"
                      : isPropertiesMode
                        ? "Add Listing"
                        : "Add Product"}
                  </button>
                ) : null}
              </div>
            ) : null}

            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className={`overflow-hidden rounded-[1.25rem] border bg-white shadow-sm transition ${
  editingProductId === product.id
                    ? "border-slate-950 ring-4 ring-slate-100"
                    : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                {(() => {
  const vehicleDetails = product.vehicle_details || {};
                  const vehicleSpecs = [
                    vehicleDetails.year,
                    vehicleDetails.make,
                    vehicleDetails.model,
                    vehicleDetails.mileage,
                    vehicleDetails.transmission,
                    vehicleDetails.dutyStatus,
                  ].filter(Boolean);
                  const propertyDetails = product.property_details || {};
                  const propertySpecs = [
                    propertyDetails.propertyType,
                    propertyDetails.bedrooms
                      ? `${propertyDetails.bedrooms} bed`
                      : "",
                    propertyDetails.bathrooms
                      ? `${propertyDetails.bathrooms} bath`
                      : "",
                    propertyDetails.propertyLocation,
                    propertyDetails.furnishedStatus,
                    propertyDetails.pricePeriod,
                  ].filter(Boolean);
                  const propertyFinancials = [
                    propertyDetails.inspectionFee
                      ? `Inspection: ${propertyDetails.inspectionFee}`
                      : "",
                    propertyDetails.agencyFee
                      ? `Agency: ${propertyDetails.agencyFee}`
                      : "",
                    propertyDetails.cautionFee
                      ? `Caution: ${propertyDetails.cautionFee}`
                      : "",
                    propertyDetails.titleDocument
                      ? `Docs: ${propertyDetails.titleDocument}`
                      : "",
                    propertyDetails.availabilityDate
                      ? `Available: ${propertyDetails.availabilityDate}`
                      : "",
                  ].filter(Boolean);

                  return (
                <div className="grid md:grid-cols-[12rem_1fr]">
                  <div
                    className="min-h-48 bg-cover bg-center md:min-h-full"
                    style={{
  backgroundImage: `url(${
  product.image_url ||
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
                      })`
}}
                  />

                  <div className="p-4">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {product.category || modeMeta.inventoryLabel}
                          </span>

                          {product.is_available ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <BadgeCheck size={14} />
                              Available
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                              Hidden
                            </span>
                          )}

                          {product.is_featured ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                              <Star size={14} />
                              Featured
                            </span>
                          ) : null}

                          {isDealershipMode ? (
                            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                              {formatVehicleStatus(product.vehicle_status)}
                            </span>
                          ) : null}

                          {isPropertiesMode ? (
                            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                              {formatPropertyStatus(product.property_status)}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                          {product.name}
                        </p>

                        {isDealershipMode && vehicleSpecs.length ? (
                          <div className="mt-3 flex max-w-xl flex-wrap gap-2">
                            {vehicleSpecs.slice(0, 6).map((spec) => (
                              <span
                                key={String(spec)}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                              >
                                {String(spec)}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {isPropertiesMode && propertySpecs.length ? (
                          <div className="mt-3 flex max-w-xl flex-wrap gap-2">
                            {propertySpecs.slice(0, 6).map((spec) => (
                              <span
                                key={String(spec)}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                              >
                                {String(spec)}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {isPropertiesMode && propertyFinancials.length ? (
                          <div className="mt-3 grid max-w-xl gap-2 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-900 sm:grid-cols-2">
                            {propertyFinancials.slice(0, 5).map((item) => (
                              <span key={String(item)}>{String(item)}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <p className="whitespace-nowrap text-lg font-semibold tracking-[-0.04em] text-slate-950">
                        {formatCurrency(Number(product.price || 0))}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEditing(product)}
                        disabled={busyProductId === product.id}
                        className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(product)}
                        disabled={busyProductId === product.id}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200 disabled:opacity-60"
                      >
                        {busyProductId === product.id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <ToggleRight size={17} />
                        )}

                        {product.is_available ? "Hide" : "Show"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={busyProductId === product.id}
                        className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:opacity-60"
                      >
                        <Trash2 size={17} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                  );
                })()}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


