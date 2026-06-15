"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  X,
} from "lucide-react";
import {
  createProduct,
  deleteProduct,
  getMyBusinesses,
  getProductsByBusinessId,
  toggleProductAvailability,
  updateProduct,
} from "@/lib/business-actions";
import { uploadBusinessImage } from "@/lib/storage-actions";
import { formatCurrency } from "@/lib/utils";
import { ImageUploadField } from "@/components/ImageUploadField";

const productCategories = [
  "Pastries",
  "Food & Drinks",
  "Fashion",
  "Beauty",
  "Retail",
  "Booking",
  "Digital Product",
  "Service Add-on",
  "Other",
];

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
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

  const [editingProductId, setEditingProductId] = useState("");
  const [query, setQuery] = useState("");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyProductId, setBusyProductId] = useState("");
  const [message, setMessage] = useState("");

  const editingProduct = products.find(
    (product) => product.id === editingProductId
  );

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
    setCategory(productCategories[0]);
    setImageUrl("");
    setCompressedImageFile(null);
    setDescription("");
    setIsAvailable(true);
    setIsFeatured(false);
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
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(String(product.price || ""));
    setCategory(product.category || productCategories[0]);
    setImageUrl(product.image_url || "");
    setCompressedImageFile(null);
    setDescription(product.description || "");
    setIsAvailable(product.is_available);
    setIsFeatured(product.is_featured);
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
      setMessage("Create a business page first before adding products.");
      return;
    }

    setMessage("");
    setIsSaving(true);

    try {
      let finalImageUrl = imageUrl;

      if (compressedImageFile) {
        const uploadedImage = await uploadBusinessImage({
          file: compressedImageFile,
          businessId: selectedBusinessId,
          folder: "products",
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
        });

        setMessage("Product updated successfully.");
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
        });

        setMessage("Product added successfully.");
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
        isAvailable: !product.is_available,
      });

      await reloadProducts();
      setMessage("Product availability updated.");
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
      "Delete this product? This cannot be undone."
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

      setMessage("Product deleted successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to delete product.";

      setMessage(errorMessage);
    } finally {
      setBusyProductId("");
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => {
                setSelectedBusinessId(event.target.value);
                resetForm();
              }}
              className="min-h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100 md:min-w-80"
            >
              {businesses.length === 0 ? (
                <option value="">No business created yet</option>
              ) : null}

              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} — /store/{business.slug}
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
                className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 text-sm outline-none transition focus:border-[#8b4dff] focus:bg-white focus:ring-4 focus:ring-slate-100"
                placeholder="Search products"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Total</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {products.length}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs text-emerald-700">Live</p>
              <p className="mt-1 text-xl font-semibold text-emerald-950">
                {availableProductsCount}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 px-4 py-3">
              <p className="text-xs text-purple-700">Featured</p>
              <p className="mt-1 text-xl font-semibold text-white">
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
          <p className="text-lg font-semibold text-white">
            Create a business page first
          </p>

          <p className="mt-2 text-sm text-purple-100">
            Add your business profile before adding products.
          </p>
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
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <button
                type="button"
                onClick={openNewProductForm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Plus size={18} />
                Add Product
              </button>

              <p className="mt-3 text-sm text-slate-500">
                Add a product, service, or catalogue item.
              </p>
            </div>
          ) : null}

          {isProductFormOpen ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {editingProductId ? "Edit" : "New Item"}
                </span>

                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <ImagePlus size={21} />
                </span>
              </div>

              <form onSubmit={handleSubmitProduct} className="grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Product name
                  </span>

                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                    placeholder="Product name"
                    required
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Price
                    </span>

                    <input
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
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
                      className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                    >
                      {productCategories.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <ImageUploadField
                  label={
                    editingProductId
                      ? "Replace product image"
                      : "Upload product image"
                  }
                  helper="Large images will be compressed before upload."
                  maxWidth={1400}
                  maxHeight={1400}
                  onCompressed={(file) => setCompressedImageFile(file)}
                />

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Image URL
                  </span>

                  <div className="relative">
                    <Camera
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-11 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                      placeholder="https://..."
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Description
                  </span>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                    placeholder="Add important product details."
                  />
                </label>

                <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-3">
                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Available
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Show on storefront.
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

                      <p className="mt-1 text-xs text-slate-500">
                        Highlight this item.
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
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                      : "Add Product"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
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
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-600">
                  No products found.
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Add a product or adjust your search.
                </p>
              </div>
            ) : null}

            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition ${
                  editingProductId === product.id
                    ? "border-slate-950 ring-4 ring-slate-100"
                    : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className="grid md:grid-cols-[12rem_1fr]">
                  <div
                    className="min-h-56 bg-cover bg-center md:min-h-full"
                    style={{
                      backgroundImage: `url(${
                        product.image_url ||
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
                      })`,
                    }}
                  />

                  <div className="p-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {product.category || "Products"}
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
                        </div>

                        <p className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                          {product.name}
                        </p>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                          {product.description || "No description added."}
                        </p>
                      </div>

                      <p className="whitespace-nowrap text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                        {formatCurrency(Number(product.price || 0))}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEditing(product)}
                        disabled={busyProductId === product.id}
                        className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(product)}
                        disabled={busyProductId === product.id}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200 disabled:opacity-60"
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
                        className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:opacity-60"
                      >
                        <Trash2 size={17} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}