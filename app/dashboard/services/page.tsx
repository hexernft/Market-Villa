"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Clock3,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";
import {
  createService,
  deleteService,
  getMyBusinesses,
  getServicesByBusinessId,
  toggleServiceVisibility,
  updateService,
} from "@/lib/business-actions";

const serviceTypes = [
  "Booking",
  "Appointment",
  "Consultation",
  "Quote Request",
  "Reservation",
  "Measurement",
  "Class / Program",
  "Event Service",
  "Other",
];

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
};

type DashboardService = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  service_type: string | null;
  price_label: string | null;
  availability_note: string | null;
  button_label: string | null;
  is_visible: boolean;
  is_featured: boolean;
};

export default function ServicesPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [services, setServices] = useState<DashboardService[]>([]);

  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState(serviceTypes[0]);
  const [priceLabel, setPriceLabel] = useState("");
  const [description, setDescription] = useState("");
  const [availabilityNote, setAvailabilityNote] = useState("");
  const [buttonLabel, setButtonLabel] = useState("Request Service");
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [editingServiceId, setEditingServiceId] = useState("");
  const [query, setQuery] = useState("");
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyServiceId, setBusyServiceId] = useState("");
  const [message, setMessage] = useState("");

  const filteredServices = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return services;
    }

    return services.filter((service) => {
      return (
        service.name.toLowerCase().includes(search) ||
        (service.description || "").toLowerCase().includes(search) ||
        (service.service_type || "").toLowerCase().includes(search) ||
        (service.price_label || "").toLowerCase().includes(search)
      );
    });
  }, [services, query]);

  const visibleServicesCount = services.filter(
    (service) => service.is_visible
  ).length;

  const featuredServicesCount = services.filter(
    (service) => service.is_featured
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

    async function loadServices() {
      if (!selectedBusinessId) {
        setServices([]);
        return;
      }

      try {
        const items = await getServicesByBusinessId(selectedBusinessId);

        if (!mounted) return;

        setServices(items);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load services.";
        setMessage(errorMessage);
      }
    }

    loadServices();

    return () => {
      mounted = false;
    };
  }, [selectedBusinessId]);

  function clearFormFields() {
    setName("");
    setServiceType(serviceTypes[0]);
    setPriceLabel("");
    setDescription("");
    setAvailabilityNote("");
    setButtonLabel("Request Service");
    setIsVisible(true);
    setIsFeatured(false);
    setEditingServiceId("");
  }

  function resetForm() {
    clearFormFields();
    setIsServiceFormOpen(false);
  }

  function openNewServiceForm() {
    clearFormFields();
    setMessage("");
    setIsServiceFormOpen(true);
  }

  function startEditing(service: DashboardService) {
    setEditingServiceId(service.id);
    setName(service.name);
    setServiceType(service.service_type || serviceTypes[0]);
    setPriceLabel(service.price_label || "");
    setDescription(service.description || "");
    setAvailabilityNote(service.availability_note || "");
    setButtonLabel(service.button_label || "Request Service");
    setIsVisible(service.is_visible);
    setIsFeatured(service.is_featured);
    setMessage("");
    setIsServiceFormOpen(true);
  }

  async function reloadServices() {
    if (!selectedBusinessId) return;

    const updatedServices = await getServicesByBusinessId(selectedBusinessId);
    setServices(updatedServices);
  }

  async function handleSubmitService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setMessage("Create a business page first before adding services.");
      return;
    }

    setMessage("");
    setIsSaving(true);

    try {
      if (editingServiceId) {
        await updateService({
          serviceId: editingServiceId,
          name,
          description,
          serviceType,
          priceLabel,
          availabilityNote,
          buttonLabel,
          isVisible,
          isFeatured,
        });

        setMessage("Service updated successfully.");
      } else {
        await createService({
          businessId: selectedBusinessId,
          name,
          description,
          serviceType,
          priceLabel,
          availabilityNote,
          buttonLabel,
          isVisible,
          isFeatured,
        });

        setMessage("Service added successfully.");
      }

      await reloadServices();
      resetForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to save service.";

      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleVisibility(service: DashboardService) {
    setBusyServiceId(service.id);
    setMessage("");

    try {
      await toggleServiceVisibility({
        serviceId: service.id,
        isVisible: !service.is_visible,
      });

      await reloadServices();
      setMessage("Service visibility updated.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to update service visibility.";

      setMessage(errorMessage);
    } finally {
      setBusyServiceId("");
    }
  }

  async function handleDeleteService(serviceId: string) {
    const confirmed = window.confirm(
      "Delete this service? This cannot be undone."
    );

    if (!confirmed) return;

    setBusyServiceId(serviceId);
    setMessage("");

    try {
      await deleteService(serviceId);
      await reloadServices();

      if (editingServiceId === serviceId) {
        resetForm();
      }

      setMessage("Service deleted successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to delete service.";

      setMessage(errorMessage);
    } finally {
      setBusyServiceId("");
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
                placeholder="Search services"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Total</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {services.length}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs text-emerald-700">Visible</p>
              <p className="mt-1 text-xl font-semibold text-emerald-950">
                {visibleServicesCount}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 px-4 py-3">
              <p className="text-xs text-purple-700">Featured</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {featuredServicesCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {message && !isServiceFormOpen ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading services...
        </section>
      ) : businesses.length === 0 ? (
        <section className="rounded-[2rem] border border-purple-200 bg-purple-50 p-8 text-center">
          <p className="text-lg font-semibold text-white">
            Create a business page first
          </p>

          <p className="mt-2 text-sm text-purple-100">
            Add your business profile before adding services.
          </p>
        </section>
      ) : (
        <section
          className={`grid gap-6 ${
            isServiceFormOpen
              ? "xl:grid-cols-[0.9fr_1.1fr]"
              : "xl:grid-cols-[0.35fr_1fr]"
          }`}
        >
          {!isServiceFormOpen ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <button
                type="button"
                onClick={openNewServiceForm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Plus size={18} />
                Add Service
              </button>

              <p className="mt-3 text-sm text-slate-500">
                Add a booking, appointment, quote, or service offer.
              </p>
            </div>
          ) : null}

          {isServiceFormOpen ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {editingServiceId ? "Edit" : "New Service"}
                </span>

                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <Sparkles size={21} />
                </span>
              </div>

              <form onSubmit={handleSubmitService} className="grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Service name
                  </span>

                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                    placeholder="Service name"
                    required
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Service type
                    </span>

                    <select
                      value={serviceType}
                      onChange={(event) => setServiceType(event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                    >
                      {serviceTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Price label
                    </span>

                    <input
                      value={priceLabel}
                      onChange={(event) => setPriceLabel(event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                      placeholder="Request quote / From ₦20,000"
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Description
                  </span>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                    placeholder="Add important service details."
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Clock3 size={16} />
                      Availability
                    </span>

                    <input
                      value={availabilityNote}
                      onChange={(event) =>
                        setAvailabilityNote(event.target.value)
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                      placeholder="Mon - Sat, 10 AM - 5 PM"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <MessageCircle size={16} />
                      Button label
                    </span>

                    <input
                      value={buttonLabel}
                      onChange={(event) => setButtonLabel(event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100"
                      placeholder="Book Now / Request Quote"
                    />
                  </label>
                </div>

                <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-3">
                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Visible
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Show on storefront.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(event) => setIsVisible(event.target.checked)}
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Featured
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Highlight this service.
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
                      : editingServiceId
                      ? "Save Changes"
                      : "Add Service"}
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
            {filteredServices.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-600">
                  No services found.
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Add a service or adjust your search.
                </p>
              </div>
            ) : null}

            {filteredServices.map((service) => (
              <article
                key={service.id}
                className={`rounded-[1.75rem] border bg-white p-6 shadow-sm transition ${
                  editingServiceId === service.id
                    ? "border-slate-950 ring-4 ring-slate-100"
                    : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                        {service.service_type || "Service"}
                      </span>

                      {service.is_visible ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Visible
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                          Hidden
                        </span>
                      )}

                      {service.is_featured ? (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                          Featured
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                      {service.name}
                    </p>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      {service.description || "No description added."}
                    </p>

                    <p className="mt-4 text-sm font-semibold text-slate-950">
                      {service.price_label || "Request quote"}
                    </p>

                    {service.availability_note ? (
                      <p className="mt-2 text-xs text-slate-500">
                        {service.availability_note}
                      </p>
                    ) : null}
                  </div>

                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                    <CalendarCheck size={21} />
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(service)}
                    disabled={busyServiceId === service.id}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(service)}
                    disabled={busyServiceId === service.id}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200 disabled:opacity-60"
                  >
                    {busyServiceId === service.id ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <ToggleRight size={17} />
                    )}

                    {service.is_visible ? "Hide" : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteService(service.id)}
                    disabled={busyServiceId === service.id}
                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 size={17} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}