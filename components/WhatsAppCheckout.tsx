"use client";

import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  Download,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  X,
} from "lucide-react";
import { createOrder } from "@/lib/business-actions";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Props = {
  businessId?: string;
  businessName: string;
  whatsapp: string;
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
};

export function WhatsAppCheckout({
  businessId,
  businessName,
  whatsapp,
  cart,
  setCart,
}: Props) {
  const summaryRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [message, setMessage] = useState("");

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      setCart((items) => items.filter((item) => item.id !== id));
      return;
    }

    setCart((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }

  function buildOrderMessage(orderId?: string) {
    const lines = cart.map(
      (item) =>
        `- ${item.name} x${item.quantity} = ${formatCurrency(
          item.price * item.quantity
        )}`
    );

    return [
      `Hello ${businessName}, I want to place an order.`,
      orderId ? `Order ID: ${orderId}` : "",
      "",
      "Customer Details:",
      `Name: ${customerName || "Not provided"}`,
      `Phone: ${customerPhone || "Not provided"}`,
      `Address: ${customerAddress || "Not provided"}`,
      customerNote ? `Note: ${customerNote}` : "",
      "",
      "Order Summary:",
      ...lines,
      "",
      `Total: ${formatCurrency(total)}`,
      "",
      "I have also downloaded the order summary image.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function downloadOrderSummaryImage() {
    if (!summaryRef.current) return;

    setMessage("");

    if (!customerName || !customerPhone) {
      setMessage("Please enter your name and phone number before generating the image.");
      return;
    }

    setIsGeneratingImage(true);

    try {
      const dataUrl = await toPng(summaryRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-order-summary.png`;
      link.href = dataUrl;
      link.click();

      setMessage("Order summary image downloaded.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to generate order summary image.";
      setMessage(errorMessage);
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) return;

    setMessage("");

    if (!customerName || !customerPhone) {
      setMessage("Please enter your name and phone number before checkout.");
      return;
    }

    setIsSavingOrder(true);

    try {
      let orderId = "";

      if (businessId) {
        const order = await createOrder({
          businessId,
          customerName,
          customerPhone,
          customerAddress,
          customerNote,
          items: cart,
        });

        orderId = order.id;
      }

      if (summaryRef.current) {
        try {
          const dataUrl = await toPng(summaryRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
          });

          const link = document.createElement("a");
          link.download = `${businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-order-summary.png`;
          link.href = dataUrl;
          link.click();
        } catch {
          // Checkout should continue even if image generation fails.
        }
      }

      const whatsappUrl = buildWhatsAppLink(
        whatsapp,
        buildOrderMessage(orderId)
      );

      window.open(whatsappUrl, "_blank");

      setIsOpen(false);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerNote("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to save order.";
      setMessage(errorMessage);
    } finally {
      setIsSavingOrder(false);
    }
  }

  if (cart.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-slate-800"
      >
        <ShoppingBag size={18} />
        Checkout
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-950">
          {cart.length}
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-[#26143d]/50 px-4 py-6 backdrop-blur-sm">
          <div className="ml-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Checkout
                </p>
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                  Your order
                </h3>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                <div>
                  <div className="grid gap-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.25rem] border border-slate-200 p-4"
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {formatCurrency(item.price)}
                            </p>
                          </div>

                          <p className="font-semibold text-slate-950">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="min-w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="grid h-9 w-9 place-items-center rounded-full bg-[#26143d] text-white"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      Customer details
                    </p>

                    <input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)]"
                      placeholder="Your name"
                    />

                    <input
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)]"
                      placeholder="Your phone number"
                    />

                    <input
                      value={customerAddress}
                      onChange={(event) =>
                        setCustomerAddress(event.target.value)
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)]"
                      placeholder="Delivery address / location"
                    />

                    <textarea
                      value={customerNote}
                      onChange={(event) => setCustomerNote(event.target.value)}
                      rows={3}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)]"
                      placeholder="Extra note"
                    />
                  </div>

                  {message ? (
                    <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                      {message}
                    </div>
                  ) : null}
                </div>

                <aside>
                  <div
                    ref={summaryRef}
                    className="sticky top-4 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#26143d] text-white shadow-sm"
                  >
                    <div className="store-pattern bg-gradient-to-br from-[#241436] via-teal-950 to-slate-900 p-5">
                      <div className="mb-8 flex items-center justify-between">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950">
                          <ReceiptText size={20} />
                        </div>

                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
                          Order Summary
                        </span>
                      </div>

                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
                        {businessName}
                      </p>

                      <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        Customer Order
                      </h4>
                    </div>

                    <div className="bg-white p-5 text-slate-950">
                      <div className="mb-5 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Name</span>
                          <span className="font-semibold text-slate-950">
                            {customerName || "Not provided"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Phone</span>
                          <span className="font-semibold text-slate-950">
                            {customerPhone || "Not provided"}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm"
                          >
                            <div>
                              <p className="font-semibold text-slate-950">
                                {item.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {formatCurrency(item.price)} × {item.quantity}
                              </p>
                            </div>

                            <p className="font-semibold text-slate-950">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-2xl bg-[#26143d] p-4 text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Total</span>
                          <span className="text-2xl font-semibold tracking-[-0.04em]">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>

                      {customerAddress ? (
                        <p className="mt-4 text-xs leading-5 text-slate-500">
                          Delivery/location: {customerAddress}
                        </p>
                      ) : null}

                      {customerNote ? (
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Note: {customerNote}
                        </p>
                      ) : null}

                      <p className="mt-5 border-t border-slate-100 pt-4 text-center text-xs font-medium text-slate-400">
                        Generated with Market Villa
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            <div className="border-t border-slate-200 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">Total</span>
                <span className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  {formatCurrency(total)}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  onClick={downloadOrderSummaryImage}
                  disabled={isGeneratingImage || isSavingOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGeneratingImage ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {isGeneratingImage ? "Generating..." : "Download Summary"}
                </button>

                <button
                  onClick={handleCheckout}
                  disabled={isSavingOrder || isGeneratingImage}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingOrder ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <MessageCircle size={18} />
                  )}
                  {isSavingOrder ? "Saving order..." : "Save and Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}