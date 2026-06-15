"use client";

import { Product } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

type Props = {
  product: Product;
  onAdd?: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: Props) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] bg-white text-slate-950 shadow-sm">
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${product.image})` }}
      />
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {product.category}
            </p>
            <h3 className="text-sm font-semibold tracking-tight">{product.name}</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
            {formatCurrency(product.price)}
          </span>
        </div>
        <p className="min-h-10 text-sm leading-6 text-slate-500">{product.description}</p>
        <button
          onClick={() => onAdd?.(product)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#26143d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={17} />
          Add to order
        </button>
      </div>
    </article>
  );
}


