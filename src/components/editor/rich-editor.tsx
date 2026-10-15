"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extensions";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BarChart3,
  Bold,
  ChevronDown,
  Columns3,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Rows3,
  Sparkles,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { AI_ACTIONS, type AiActionId } from "@/lib/ai";
import { MenuItem, Popover } from "@/components/popover";
import { ChartDialog, ImageDialog, LinkDialog } from "./dialogs";

export type AiRequest = { action: AiActionId; selection: string; prompt?: string };

export function RichEditor({
  initialHtml,
  onChange,
  userId,
  onAi,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
  userId: string;
  onAi: (req: AiRequest) => void;
}) {
  const [dialog, setDialog] = useState<null | "link" | "image" | "chart">(null);

  const editor = useEditor({
    immediatelyRender: false, // evita diferença entre servidor e navegador
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https", HTMLAttributes: { rel: "noopener" } },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      TableKit.configure({ table: { resizable: true } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Placeholder.configure({ placeholder: "Comece a escrever, ou use “Gerar com IA” para criar o texto…" }),
    ],
    content: initialHtml,
    editorProps: { attributes: { class: "article-body min-h-[60vh] px-6 py-6 sm:px-10" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  if (!editor) {
    return <div className="min-h-[60vh] animate-pulse rounded-b-xl bg-surface" />;
  }

  const insertImage = (src: string, alt: string) => {
    editor.chain().focus().setImage({ src, alt, title: alt }).run();
    setDialog(null);
  };

  return (
    <div>
      <Toolbar editor={editor} openDialog={setDialog} onAi={onAi} />
      <EditorContent editor={editor} />

      {dialog === "link" && (
        <LinkDialog
          initial={editor.getAttributes("link").href ?? ""}
          onClose={() => setDialog(null)}
          onRemove={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            setDialog(null);
          }}
          onSubmit={(href, newTab) => {
            const chain = editor.chain().focus().extendMarkRange("link");
            if (editor.state.selection.empty && !editor.isActive("link")) {
              chain.insertContent(`<a href="${href.replace(/"/g, "&quot;")}"${newTab ? ' target="_blank"' : ""}>${href}</a>`).run();
            } else {
              chain.setLink({ href, target: newTab ? "_blank" : null }).run();
            }
            setDialog(null);
          }}
        />
      )}
      {dialog === "image" && (
        <ImageDialog
          userId={userId}
          onClose={() => setDialog(null)}
          onInsert={insertImage}
          onAiGenerate={(description) => {
            setDialog(null);
            onAi({ action: "gerar_imagem", selection: "", prompt: description });
          }}
        />
      )}
      {dialog === "chart" && <ChartDialog userId={userId} onClose={() => setDialog(null)} onInsert={insertImage} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Toolbar({
  editor,
  openDialog,
  onAi,
}: {
  editor: Editor;
  openDialog: (d: "link" | "image" | "chart") => void;
  onAi: (req: AiRequest) => void;
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      highlight: e.isActive("highlight"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      left: e.isActive({ textAlign: "left" }),
      center: e.isActive({ textAlign: "center" }),
      right: e.isActive({ textAlign: "right" }),
      table: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      hasSelection: !e.state.selection.empty,
    }),
  });

  const c = () => editor.chain().focus();
  const block = s.h1 ? "Título 1" : s.h2 ? "Título 2" : s.h3 ? "Título 3" : "Parágrafo";

  return (
    <div className="sticky top-14 z-20 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-line bg-surface/95 px-2 py-1.5 backdrop-blur lg:top-0">
      <Btn label="Desfazer (Ctrl+Z)" disabled={!s.canUndo} onClick={() => c().undo().run()}>
        <Undo2 />
      </Btn>
      <Btn label="Refazer (Ctrl+Shift+Z)" disabled={!s.canRedo} onClick={() => c().redo().run()}>
        <Redo2 />
      </Btn>
      <Sep />

      <Popover
        trigger={({ toggle }) => (
          <button type="button" onClick={toggle} className="flex h-8 w-[118px] items-center justify-between gap-1 rounded-md px-2 text-sm hover:bg-canvas">
            {block} <ChevronDown className="size-3.5 text-muted" />
          </button>
        )}
        panelClassName="w-52"
      >
        {(close) => (
          <>
            <MenuItem icon={<Pilcrow />} onClick={() => (c().setParagraph().run(), close())}>
              Parágrafo
            </MenuItem>
            <MenuItem icon={<Heading1 />} hint="H1" onClick={() => (c().toggleHeading({ level: 1 }).run(), close())}>
              <span className="text-lg font-bold">Título 1</span>
            </MenuItem>
            <MenuItem icon={<Heading2 />} hint="H2" onClick={() => (c().toggleHeading({ level: 2 }).run(), close())}>
              <span className="text-base font-bold">Título 2</span>
            </MenuItem>
            <MenuItem icon={<Heading3 />} hint="H3" onClick={() => (c().toggleHeading({ level: 3 }).run(), close())}>
              <span className="font-semibold">Título 3</span>
            </MenuItem>
          </>
        )}
      </Popover>
      <Sep />

      <Btn label="Negrito (Ctrl+B)" active={s.bold} onClick={() => c().toggleBold().run()}>
        <Bold />
      </Btn>
      <Btn label="Itálico (Ctrl+I)" active={s.italic} onClick={() => c().toggleItalic().run()}>
        <Italic />
      </Btn>
      <Btn label="Sublinhado (Ctrl+U)" active={s.underline} onClick={() => c().toggleUnderline().run()}>
        <UnderlineIcon />
      </Btn>
      <Btn label="Tachado" active={s.strike} onClick={() => c().toggleStrike().run()}>
        <Strikethrough />
      </Btn>
      <Btn label="Destacar" active={s.highlight} onClick={() => c().toggleHighlight().run()}>
        <Highlighter />
      </Btn>
      <Btn label="Link" active={s.link} onClick={() => openDialog("link")}>
        <Link2 />
      </Btn>
      <Sep />

      <Btn label="Lista" active={s.bullet} onClick={() => c().toggleBulletList().run()}>
        <List />
      </Btn>
      <Btn label="Lista numerada" active={s.ordered} onClick={() => c().toggleOrderedList().run()}>
        <ListOrdered />
      </Btn>
      <Btn label="Citação" active={s.quote} onClick={() => c().toggleBlockquote().run()}>
        <Quote />
      </Btn>
      <Btn label="Alinhar à esquerda" active={s.left} onClick={() => c().setTextAlign("left").run()}>
        <AlignLeft />
      </Btn>
      <Btn label="Centralizar" active={s.center} onClick={() => c().setTextAlign("center").run()}>
        <AlignCenter />
      </Btn>
      <Btn label="Alinhar à direita" active={s.right} onClick={() => c().setTextAlign("right").run()}>
        <AlignRight />
      </Btn>
      <Sep />

      <Btn label="Imagem" onClick={() => openDialog("image")}>
        <ImagePlus />
      </Btn>
      <Popover
        trigger={({ toggle }) => (
          <Btn label="Tabela" active={s.table} onClick={toggle}>
            <TableIcon />
          </Btn>
        )}
        panelClassName="w-56"
      >
        {(close) =>
          s.table ? (
            <>
              <MenuItem icon={<Rows3 />} onClick={() => (c().addRowAfter().run(), close())}>
                Adicionar linha
              </MenuItem>
              <MenuItem icon={<Columns3 />} onClick={() => (c().addColumnAfter().run(), close())}>
                Adicionar coluna
              </MenuItem>
              <MenuItem icon={<Rows3 />} onClick={() => (c().deleteRow().run(), close())}>
                Remover linha
              </MenuItem>
              <MenuItem icon={<Columns3 />} onClick={() => (c().deleteColumn().run(), close())}>
                Remover coluna
              </MenuItem>
              <MenuItem icon={<TableIcon />} onClick={() => (c().toggleHeaderRow().run(), close())}>
                Ligar/desligar cabeçalho
              </MenuItem>
              <div className="my-1 border-t border-line" />
              <MenuItem icon={<Trash2 />} danger onClick={() => (c().deleteTable().run(), close())}>
                Excluir tabela
              </MenuItem>
            </>
          ) : (
            <TablePicker
              onPick={(rows, cols) => {
                c().insertTable({ rows, cols, withHeaderRow: true }).run();
                close();
              }}
            />
          )
        }
      </Popover>
      <Btn label="Gráfico" onClick={() => openDialog("chart")}>
        <BarChart3 />
      </Btn>
      <Btn label="Linha divisória" onClick={() => c().setHorizontalRule().run()}>
        <Minus />
      </Btn>

      <div className="ml-auto">
        <AiMenu hasSelection={s.hasSelection} editor={editor} onAi={onAi} />
      </div>
    </div>
  );
}

function AiMenu({ hasSelection, editor, onAi }: { hasSelection: boolean; editor: Editor; onAi: (req: AiRequest) => void }) {
  const groups = ["Artigo", "Seleção", "Inserir", "SEO"] as const;
  return (
    <Popover
      align="right"
      panelClassName="w-80 max-h-[70vh] overflow-y-auto"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          <Sparkles className="size-4" /> Gerar com IA <ChevronDown className="size-3.5" />
        </button>
      )}
    >
      {(close) =>
        groups.map((g) => (
          <div key={g}>
            <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {g}
              {g === "Seleção" && !hasSelection && <span className="ml-1 normal-case tracking-normal">· selecione um trecho</span>}
            </p>
            {AI_ACTIONS.filter((a) => a.group === g).map((a) => (
              <button
                key={a.id}
                type="button"
                disabled={a.needsSelection && !hasSelection}
                onClick={() => {
                  close();
                  const { from, to } = editor.state.selection;
                  onAi({ action: a.id, selection: editor.state.doc.textBetween(from, to, "\n") });
                }}
                className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-sm font-medium">{a.label}</span>
                <span className="text-xs text-muted">{a.hint}</span>
              </button>
            ))}
          </div>
        ))
      }
    </Popover>
  );
}

function TablePicker({ onPick }: { onPick: (rows: number, cols: number) => void }) {
  const [hover, setHover] = useState<[number, number]>([3, 3]);
  return (
    <div className="p-1.5">
      <div className="grid grid-cols-6 gap-1" onMouseLeave={() => setHover([3, 3])}>
        {Array.from({ length: 36 }, (_, i) => {
          const r = Math.floor(i / 6) + 1;
          const col = (i % 6) + 1;
          const on = r <= hover[0] && col <= hover[1];
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover([r, col])}
              onClick={() => onPick(r, col)}
              className={`size-6 rounded border ${on ? "border-brand bg-brand-soft" : "border-line"}`}
              aria-label={`${r} por ${col}`}
            />
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        {hover[0]} × {hover[1]} (com cabeçalho)
      </p>
    </div>
  );
}

function Btn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // mantém a seleção do texto
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-md transition [&>svg]:size-4 disabled:opacity-30 ${
        active ? "bg-brand-soft text-brand" : "text-ink hover:bg-canvas"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-line" aria-hidden />;
}
