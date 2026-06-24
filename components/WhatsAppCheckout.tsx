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
  image?: string;
};

type Props = {
  businessId: string;
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
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [message, setMessage] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);

  const summaryRef = useRef<HTMLDivElement | null>(null);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  function updateQuantity(itemId: string, direction: "increase" | "decrease") {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== itemId) return item;

          const nextQuantity =
            direction === "increase" ? item.quantity + 1 : item.quantity - 1;

          return {
            ...item,
            quantity: nextQuantity,
          };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function buildOrderMessage(orderId?: string) {
    const lines = cart.map((item, index) => {
      return `${index + 1}. ${item.name} — ${formatCurrency(
        item.price,
      )} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}`;
    });

    return [
      `Hello ${businessName}, I want to place this order.`,
      "",
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
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function downloadOrderSummaryImage() {
    if (!summaryRef.current) {
      setMessage("Order summary is not ready yet.");
      return;
    }

    setIsGeneratingImage(true);
    setMessage("");

    try {
      const dataUrl = await toPng(summaryRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}-order-summary.png`;
      link.href = dataUrl;
      link.click();

      setMessage("Order summary downloaded. You can now send the order.");
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

  async function handleSendOrder() {
    if (cart.length === 0) return;

    setMessage("");

    if (!customerName.trim() || !customerPhone.trim()) {
      setMessage("Please enter your name and phone number before sending.");
      return;
    }

    setIsSendingOrder(true);

    try {
      const order = await createOrder({
        businessId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerNote: customerNote.trim(),
        items: cart.map((item) => ({
          productId: item.id,
          productName: item.name,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      } as any);

      const whatsappUrl = buildWhatsAppLink(
        whatsapp,
        buildOrderMessage(order?.id),
      );

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      setMessage("Order sent to WhatsApp.");
      setCart([]);
      setIsOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to send order.";

      setMessage(errorMessage);
    } finally {
      setIsSendingOrder(false);
    }
  }

  if (cart.length === 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mv-checkout-trigger fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-[#26143d] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(38,20,61,0.28)] hover:bg-[#3b1b5d]"
      >
        <ShoppingBag size={17} />
        Cart
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-950">
          {cart.length}
        </span>
      </button>

      {isOpen ? (
        <div className="mv-checkout-ui fixed inset-0 z-[90] bg-[#26143d]/45 px-3 py-4 backdrop-blur-sm md:px-4 md:py-5">
          <div className="ml-auto flex h-full max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[1.25rem] border border-[#e8e1f4] bg-[#f7f3fb] text-[#241436] shadow-[0_28px_80px_rgba(36,20,54,0.24)]">
            <div className="flex items-center justify-between border-b border-[#e8e1f4] bg-[#f4eefb] px-4 py-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8b5cf6]">
                  Checkout
                </p>
                <h3 className="text-base font-black tracking-[-0.04em] text-[#241436]">
                  Your order
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#241436] shadow-sm"
                aria-label="Close checkout"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#e8e1f4] bg-white p-3 text-[#241436] shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#7c728d]">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-black">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, "decrease")}
                          className="grid h-9 w-9 place-items-center rounded-full bg-[#eef2f7] text-[#241436]"
                          aria-label={`Reduce ${item.name}`}
                        >
                          <Minus size={16} />
                        </button>

                        <span className="min-w-6 text-center text-sm font-black">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, "increase")}
                          className="grid h-9 w-9 place-items-center rounded-full bg-[#32154f] text-white"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-[#e8e1f4] bg-white p-3 shadow-sm">
                  <p className="text-sm font-black">Customer details</p>

                  <div className="mt-3 grid gap-2">
                    <input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Your name"
                      className="h-10 w-full rounded-xl border border-[#ddd3f0] bg-white px-3 text-sm text-[#241436] outline-none placeholder:text-[#9a93ad] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/12"
                    />

                    <input
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="Your phone number"
                      className="h-10 w-full rounded-xl border border-[#ddd3f0] bg-white px-3 text-sm text-[#241436] outline-none placeholder:text-[#9a93ad] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/12"
                    />

                    <input
                      value={customerAddress}
                      onChange={(event) =>
                        setCustomerAddress(event.target.value)
                      }
                      placeholder="Delivery address optional"
                      className="h-10 w-full rounded-xl border border-[#ddd3f0] bg-white px-3 text-sm text-[#241436] outline-none placeholder:text-[#9a93ad] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/12"
                    />

                    <textarea
                      value={customerNote}
                      onChange={(event) => setCustomerNote(event.target.value)}
                      placeholder="Note optional"
                      rows={2}
                      className="max-h-16 min-h-10 w-full resize-none rounded-xl border border-[#ddd3f0] bg-white px-3 py-2 text-sm text-[#241436] outline-none placeholder:text-[#9a93ad] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/12"
                    />
                  </div>
                </div>

                {message ? (
                  <p className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#6f6785]">
                    {message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border-t border-[#e8e1f4] bg-[#f3eefb] px-4 py-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-[#6f6785]">Total</p>
                <p className="text-2xl font-black text-[#241436]">
                  {formatCurrency(total)}
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <button
                  type="button"
                  onClick={downloadOrderSummaryImage}
                  disabled={isGeneratingImage || isSendingOrder}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#ddd3f0] bg-white px-4 text-sm font-bold text-[#241436] hover:bg-[#faf8fe] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGeneratingImage ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Download size={17} />
                  )}
                  {isGeneratingImage ? "Preparing..." : "Download"}
                </button>

                <button
                  type="button"
                  onClick={handleSendOrder}
                  disabled={isSendingOrder || isGeneratingImage}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#4c1d95] px-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(76,29,149,0.22)] hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSendingOrder ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <MessageCircle size={17} />
                  )}
                  {isSendingOrder ? "Sending..." : "Send Order"}
                </button>
              </div>
            </div>
          </div>

          <div
            ref={summaryRef}
            data-order-summary-preview="true"
            className="pointer-events-none fixed -left-[9999px] top-0 w-[420px] bg-white p-6 text-[#241436]"
          >
            <div className="rounded-[1.5rem] border border-[#e8e1f4] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#e8e1f4] pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b5cf6]">
                    Order Summary
                  </p>
                  <h2 className="mt-1 text-2xl font-black">{businessName}</h2>
                </div>

                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f4eefb] text-[#4c1d95]">
                  <ReceiptText size={22} />
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f7f3fb] p-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-[#6f6785]">Name</span>
                  <strong>{customerName || "Not provided"}</strong>
                </div>
                <div className="mt-2 flex justify-between gap-3 text-sm">
                  <span className="text-[#6f6785]">Phone</span>
                  <strong>{customerPhone || "Not provided"}</strong>
                </div>
                {customerAddress ? (
                  <div className="mt-2 flex justify-between gap-3 text-sm">
                    <span className="text-[#6f6785]">Address</span>
                    <strong className="text-right">{customerAddress}</strong>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-[#e8e1f4] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between gap-3">
                      <p className="font-black">{item.name}</p>
                      <p className="font-black">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-[#6f6785]">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#241436] px-4 py-3 text-white">
                <span className="text-sm font-semibold">Total</span>
                <strong className="text-xl">{formatCurrency(total)}</strong>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}