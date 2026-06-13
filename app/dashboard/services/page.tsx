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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyServiceId, setBusyServiceId] = useState("");
  const [message, setMessage] = useState("");

  const selectedBusiness = businesses.find(
    (business) => business.id === selectedBusinessId
  );

  const editingService = services.find(
    (service) => service.id === editingServiceId
  );

  const filteredServices = useMemo(() => {
    const search = query.toLowerCase();

    return services.filter((service) => {
      return (
        service.name.toLowerCase().includes(search) ||
        (service.description || "").toLowerCase().includes(search) ||
        (service.service_type || "").toLowerCase().includes(search) ||
        (service.price_label || "").toLowerCase().includes(search)
      );
    });
  }, [services, query]);

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

  function resetForm() {
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
    <div className="grid gap-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-7 text-white shadow-soft">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
              Services Manager
            </p>

            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em]">
              Add, edit, hide, and delete service offers.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Manage bookings, appointment offers, consultations, quotes,
              reservations, and service requests for your business page.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-2xl bg-white p-4 text-slate-950">
                <div>
                  <p className="text-sm font-semibold">Active Services</p>
                  <p className="text-xs text-slate-500">
                    For selected business
                  </p>
                </div>

                <span className="text-2xl font-semibold">
                  {services.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <div>
                  <p className="text-sm font-semibold">Service Flow</p>
                  <p className="text-xs text-slate-300">
                    {selectedBusiness
                      ? selectedBusiness.name
                      : "No business selected"}
                  </p>
                </div>

                <CalendarCheck className="text-emerald-300" size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Business
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Select business page
            </h3>
          </div>

          <select
            value={selectedBusinessId}
            onChange={(event) => {
              setSelectedBusinessId(event.target.value);
              resetForm();
            }}
            className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950 md:min-w-80"
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
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading your businesses...
        </section>
      ) : businesses.length === 0 ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center">
          <h3 className="text-lg font-semibold text-amber-950">
            Create a business page first
          </h3>
          <p className="mt-2 text-sm text-amber-900">
            Go to onboarding and create your first business page before adding
            services.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                  {editingServiceId ? "Edit Service" : "Add Service"}
                </p>

                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  {editingServiceId
                    ? `Editing ${editingService?.name || "service"}`
                    : "Create a service or booking item"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This service will be linked to the selected business page.
                </p>
              </div>

              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <Sparkles size={22} />
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
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="Example: Measurement Appointment"
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
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
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
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                    placeholder="Example: Request quote / From â‚¦20,000"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Service description
                </span>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="Explain what the customer is requesting, booking, or asking about."
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Clock3 size={16} />
                    Availability note
                  </span>

                  <input
                    value={availabilityNote}
                    onChange={(event) =>
                      setAvailabilityNote(event.target.value)
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                    placeholder="Example: Mon - Sat, 10 AM - 5 PM"
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
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                    placeholder="Example: Book Now / Request Quote"
                  />
                </label>
              </div>

              <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-4">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Show on business page
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Customers can see and request this service.
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
                      Highlight as main service
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Useful for businesses that mainly sell services.
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
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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

                {editingServiceId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <X size={17} />
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                    Service List
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    Current services
                  </h3>
                </div>

                <div className="relative md:w-72">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none focus:border-slate-950"
                    placeholder="Search services"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredServices.length === 0 ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                  No services found.
                </div>
              ) : null}

              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className={`rounded-[1.75rem] border bg-white p-6 shadow-sm ${
                    editingServiceId === service.id
                      ? "border-slate-950"
                      : "border-slate-200"
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
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                        {service.name}
                      </h3>

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
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(service)}
                      disabled={busyServiceId === service.id}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
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
                      className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      <Trash2 size={17} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
