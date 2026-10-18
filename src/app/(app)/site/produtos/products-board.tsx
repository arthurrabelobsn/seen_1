"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ExternalLink, Package, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { Field, SavedNote } from "@/components/ui";
import { ImageInput } from "@/components/image-input";
import { deleteProduct, saveProduct, type FormState } from "../actions";
import { Hint } from "@/components/hint";
import { HELP } from "@/lib/help";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProductsBoard({ products, userId }: { products: Product[]; userId: string }) {
  const [editing, setEditing] = useState<Product | "novo" | null>(null);
  const [filter, setFilter] = useState<"todos" | "produto" | "servico">("todos");
  const [, startTransition] = useTransition();
  const shown = products.filter((p) => filter === "todos" || p.kind === filter);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-lg font-bold">
            Produtos e serviços <Hint>{HELP.produtos}</Hint>
          </h2>
          <p className="text-sm text-muted">A IA menciona estes itens nos artigos, com link, quando o tema combinar.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-line bg-surface p-1 text-sm">
            {(["todos", "produto", "servico"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 ${filter === f ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:text-ink"}`}
              >
                {f === "todos" ? "Todos" : f === "produto" ? "Produtos" : "Serviços"}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setEditing("novo")} className="btn-primary">
            <Plus className="size-4" /> Adicionar
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <button
          type="button"
          onClick={() => setEditing("novo")}
          className="card flex w-full flex-col items-center px-6 py-16 text-center transition hover:border-brand/40"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Package className="size-6" />
          </span>
          <span className="mt-3 font-semibold">Nenhum item cadastrado</span>
          <span className="mt-1 max-w-sm text-sm text-muted">
            Cadastre o que você vende. Um artigo sobre “como escolher blush” pode terminar indicando o seu blush, com foto e link.
          </span>
        </button>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <article key={p.id} className={`card flex flex-col overflow-hidden ${p.active ? "" : "opacity-60"}`}>
              <div className="aspect-video bg-canvas">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- imagem do Storage
                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <Package className="size-8" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug">{p.name}</h3>
                  <span className="pill shrink-0 border-line bg-canvas text-muted">{p.kind === "servico" ? "Serviço" : "Produto"}</span>
                </div>
                {p.price != null && <p className="mt-1 text-sm font-semibold text-brand">{brl.format(Number(p.price))}</p>}
                {p.description && <p className="mt-2 line-clamp-3 text-sm text-muted">{p.description}</p>}
                <div className="mt-auto flex items-center gap-1 pt-4">
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="btn-ghost px-2.5 py-1.5 text-xs">
                      <ExternalLink className="size-3.5" /> Ver
                    </a>
                  )}
                  <button type="button" onClick={() => setEditing(p)} className="btn-ghost px-2.5 py-1.5 text-xs">
                    <Pencil className="size-3.5" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => confirm(`Excluir “${p.name}”?`) && startTransition(() => deleteProduct(p.id))}
                    className="ml-auto rounded-lg p-1.5 text-muted hover:bg-bad-soft hover:text-bad"
                    aria-label={`Excluir ${p.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <ProductDialog
          key={editing === "novo" ? "novo" : editing.id}
          product={editing === "novo" ? null : editing}
          userId={userId}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ProductDialog({ product, userId, onClose }: { product: Product | null; userId: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});

  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useEffect(() => {
    if (state.saved) onClose();
  }, [state.saved, onClose]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(640px,calc(100vw-32px))] rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40"
    >
      <form action={action}>
        {product && <input type="hidden" name="id" value={product.id} />}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-bold">{product ? "Editar item" : "Novo produto ou serviço"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-canvas" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid max-h-[70vh] gap-5 overflow-y-auto px-6 py-5 sm:grid-cols-[200px_1fr]">
          <div className="space-y-3">
            <ImageInput name="image_url" userId={userId} folder="products" defaultValue={product?.image_url} className="aspect-square w-full" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="size-4 accent-brand" />
              Ativo (a IA pode citar)
            </label>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2 text-sm">
              {(["produto", "servico"] as const).map((k) => (
                <label key={k} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line py-2 has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:font-semibold has-[:checked]:text-brand">
                  <input type="radio" name="kind" value={k} defaultChecked={(product?.kind ?? "produto") === k} className="sr-only" />
                  {k === "produto" ? "Produto" : "Serviço"}
                </label>
              ))}
            </div>
            <Field label="Nome" htmlFor="p-name">
              <input id="p-name" name="name" defaultValue={product?.name} className="field" required autoFocus />
            </Field>
            <Field label="Descrição" htmlFor="p-desc" hint="Para que serve, para quem é, diferenciais.">
              <textarea id="p-desc" name="description" rows={4} defaultValue={product?.description ?? ""} className="field" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preço (R$)" htmlFor="p-price">
                <input id="p-price" name="price" inputMode="decimal" defaultValue={product?.price != null ? String(product.price).replace(".", ",") : ""} className="field" placeholder="89,90" />
              </Field>
              <Field label="Link" htmlFor="p-url">
                <input id="p-url" name="url" defaultValue={product?.url ?? ""} className="field" placeholder="loja.com.br/produto" />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
          <SavedNote error={state.error} />
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
