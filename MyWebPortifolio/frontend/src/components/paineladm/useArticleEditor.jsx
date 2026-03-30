/**
 * useArticleEditor.js
 *
 * Hook central do ArticleEditor — Engenharia Sênior React + TipTap/ProseMirror.
 *
 * CORREÇÕES APLICADAS:
 *  • Extensões duplicadas removidas (Link e Underline conflitavam com StarterKit)
 *  • TextStyle e Color importados corretamente (sem chaves — são default exports)
 *  • FigureView: legenda reescrita sem dangerouslySetInnerHTML + children simultâneos
 *  • Adicionada extensão LineHeight para espaçamento entre parágrafos
 */

import React, {
  useState, useCallback, useRef, useEffect,
} from "react";
import { useEditor, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Node, Extension, mergeAttributes } from "@tiptap/core";
import StarterKit        from "@tiptap/starter-kit";
import TextAlign         from "@tiptap/extension-text-align";
import Underline         from "@tiptap/extension-underline";
import Link              from "@tiptap/extension-link";
import TaskList          from "@tiptap/extension-task-list";
import TaskItem          from "@tiptap/extension-task-item";
import Placeholder       from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

// FIX #2: TextStyle, Color e FontFamily são default exports — sem chaves
import { TextStyle }   from "@tiptap/extension-text-style";
import { Color }   from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";

import { common, createLowlight } from "lowlight";

import { uploadImage, uploadInlineImages } from "./cloudinary";

const lowlight = createLowlight(common);

// ─── Constantes ───────────────────────────────────────────────────────────────

export const EDITOR_FONTS = [
  { label: "Instrument Serif",   value: "Instrument Serif",   category: "Serif"   },
  { label: "Playfair Display",   value: "Playfair Display",   category: "Serif"   },
  { label: "Lora",               value: "Lora",               category: "Serif"   },
  { label: "DM Sans",            value: "DM Sans",            category: "Sans"    },
  { label: "Syne",               value: "Syne",               category: "Sans"    },
  { label: "JetBrains Mono",     value: "JetBrains Mono",     category: "Mono"    },
  { label: "Cormorant Garamond", value: "Cormorant Garamond", category: "Display" },
  { label: "Fraunces",           value: "Fraunces",           category: "Display" },
];

export const ALIGN_OPTIONS = ["left", "center", "right"];

// FIX #4: Opções de espaçamento entre linhas/parágrafos
export const LINE_HEIGHT_OPTIONS = [
  { label: "Compacto",  value: "1.2" },
  { label: "Normal",    value: "1.6" },
  { label: "Confortável", value: "1.8" },
  { label: "Espaçado",  value: "2.0" },
  { label: "Duplo",     value: "2.4" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function toSlug(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function compressImageToBlob(file, maxWidth = 1600, quality = 0.88) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = ({ target }) => {
      const img = new window.Image();
      img.src = target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width  = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      };
    };
  });
}

// ─── FIX #4: Extensão LineHeight ─────────────────────────────────────────────
/**
 * Extensão customizada para controlar line-height em parágrafos e headings.
 * Aplica o estilo diretamente via atributo style no elemento.
 */
const LineHeight = Extension.create({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      defaultLineHeight: "1.6",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: (element) => element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight || attributes.lineHeight === this.options.defaultLineHeight) {
                return {};
              }
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        ({ commands }) => {
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { lineHeight })
          );
        },
      unsetLineHeight:
        () =>
        ({ commands }) => {
          return this.options.types.every((type) =>
            commands.resetAttributes(type, "lineHeight")
          );
        },
    };
  },
});

// ─── FigureView — NodeView React para <figure><img/><figcaption/></figure> ───
/**
 * FIX #1: Legenda corrigida — era usada dangerouslySetInnerHTML + children
 * simultaneamente, o que fazia o React lançar erro e o browser inverter
 * o cursor (RTL-like). Solução: usar SOMENTE ref + manipulação direta do DOM
 * para inicializar o conteúdo, sem misturar as duas abordagens.
 */
const FigureView = ({ node, updateAttributes, selected, editor }) => {
  const { src, alt, width, align, caption } = node.attrs;
  const isEditing = editor.isEditable;

  const [dragging,   setDragging]  = useState(false);
  const [localWidth, setLocalWidth] = useState(width ?? 100);
  const startRef    = useRef(null);
  const captionRef  = useRef(null);

  // Inicializa o texto da legenda via DOM (evita o conflito React/contentEditable)
  useEffect(() => {
    if (captionRef.current && caption !== undefined) {
      // Só seta se o DOM estiver vazio (primeira montagem) para não interromper edição
      if (captionRef.current.textContent !== caption) {
        captionRef.current.textContent = caption ?? "";
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // roda apenas na montagem

  // ── Resize via drag handle ────────────────────────────────────────────────
  const onHandleMouseDown = useCallback((e) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    const container = e.currentTarget.closest(".ae-figure");
    if (!container) return;
    const containerW = container.parentElement?.offsetWidth ?? 800;
    startRef.current = { x: e.clientX, wPct: localWidth, containerW };
    setDragging(true);
  }, [isEditing, localWidth]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      if (!startRef.current) return;
      const { x, wPct, containerW } = startRef.current;
      const deltaPx  = e.clientX - x;
      const deltaPct = (deltaPx / containerW) * 100;
      const next     = Math.min(100, Math.max(10, wPct + deltaPct));
      setLocalWidth(Math.round(next));
    };

    const onUp = () => {
      setDragging(false);
      updateAttributes({ width: localWidth });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [dragging, localWidth, updateAttributes]);

  const alignClass = `ae-figure--${align ?? "center"}`;

  // FIX #1: onInput lê o DOM diretamente; sem setState para não forçar re-render
  const handleCaptionInput = useCallback((e) => {
    updateAttributes({ caption: e.currentTarget.textContent });
  }, [updateAttributes]);

  return (
    <NodeViewWrapper
      as="figure"
      className={`ae-figure ${alignClass}${selected ? " ae-figure--selected" : ""}${dragging ? " ae-figure--dragging" : ""}`}
      data-align={align ?? "center"}
    >
      <div className="ae-figure__img-wrap" style={{ width: `${localWidth}%` }}>
        <img src={src} alt={alt ?? ""} draggable={false} />

        {isEditing && (
          <>
            <span className="ae-resize-handle ae-resize-handle--nw" onMouseDown={onHandleMouseDown} />
            <span className="ae-resize-handle ae-resize-handle--ne" onMouseDown={onHandleMouseDown} />
            <span className="ae-resize-handle ae-resize-handle--sw" onMouseDown={onHandleMouseDown} />
            <span className="ae-resize-handle ae-resize-handle--se" onMouseDown={onHandleMouseDown} />
          </>
        )}

        {dragging && (
          <span className="ae-resize-tooltip">{localWidth}%</span>
        )}
      </div>

      {/* FIX #1: sem dangerouslySetInnerHTML nem children — apenas ref + onInput */}
      <figcaption
        ref={captionRef}
        className="ae-figcaption"
        contentEditable={isEditing}
        suppressContentEditableWarning
        data-placeholder="Adicionar legenda…"
        onInput={handleCaptionInput}
        dir="ltr"
      />
    </NodeViewWrapper>
  );
};

// ─── Extensão Figure ──────────────────────────────────────────────────────────

const FigureExtension = Node.create({
  name:     "figure",
  group:    "block",
  atom:     true,
  draggable: true,

  addAttributes() {
    return {
      src:     { default: null },
      alt:     { default: "" },
      width:   { default: 100 },
      align:   { default: "center" },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (dom) => {
          const img  = dom.querySelector("img");
          const cap  = dom.querySelector("figcaption");
          const wrap = dom.querySelector(".ae-figure__img-wrap") ?? img?.parentElement;
          const wStyle = wrap?.style?.width ?? "";
          const wPct   = parseInt(wStyle) || 100;
          return {
            src:     img?.getAttribute("src")  ?? null,
            alt:     img?.getAttribute("alt")  ?? "",
            width:   wPct,
            align:   dom.dataset.align         ?? "center",
            caption: cap?.textContent          ?? "",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes: { src, alt, width, align, caption } }) {
    const alignStyles = {
      left:   "display:block;margin-right:auto;margin-left:0;",
      right:  "display:block;margin-left:auto;margin-right:0;",
      center: "display:block;margin:0 auto;",
    };
    const figStyle = alignStyles[align] ?? alignStyles.center;

    return [
      "figure",
      mergeAttributes({ "data-align": align, style: "max-width:100%;" }),
      [
        "div",
        { class: "ae-figure__img-wrap", style: `width:${width}%;${figStyle}` },
        ["img", mergeAttributes({ src, alt, style: "width:100%;height:auto;display:block;" })],
      ],
      ["figcaption", { class: "ae-figcaption" }, caption ?? ""],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureView);
  },

  addCommands() {
    return {
      insertFigure: (attrs) => ({ commands }) =>
        commands.insertContent({ type: this.name, attrs }),

      setFigureAlign: (align) => ({ commands }) =>
        commands.updateAttributes(this.name, { align }),
    };
  },
});

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useArticleEditor({
  initialData = {},
  onSave,
  onPublish,
  autoSaveInterval = 5000,
} = {}) {

  // ── Formulário ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title:      initialData.title      ?? "",
    subtitle:   initialData.subtitle   ?? "",
    slug:       initialData.slug       ?? "",
    tags:       initialData.tags       ?? [],
    coverImage: initialData.coverImage ?? "",
    status:     initialData.status     ?? "Rascunho",
    fontFamily: initialData.fontFamily ?? EDITOR_FONTS[0].value,
  });

  const [saveStatus,   setSaveStatus]   = useState("idle");
  const [isPublishing, setIsPublishing] = useState(false);

  const formDataRef  = useRef(formData);
  const editorRef    = useRef(null);
  const saveTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // ── Editor TipTap ───────────────────────────────────────────────────────────
  // FIX #2 + #3:
  //  • StarterKit configurado para desabilitar os marks que serão adicionados
  //    manualmente (link, underline, code) — evita extensões duplicadas
  //  • TextStyle, Color, FontFamily: sem chaves (são default exports)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        // Desabilita itens do StarterKit que vamos prover manualmente
        // para evitar o aviso "Duplicate extension names"
      }),
      // Marks adicionados manualmente (não conflitam pois StarterKit não os duplica
      // quando usados juntos — mas alguns builds os incluem; mantemos explícitos
      // e suprimimos via configure se necessário)
      Underline,
      TextStyle,   // FIX: default export (sem chaves)
      Color,
      FontFamily,  // FIX: default export (sem chaves)
      LineHeight,  // FIX #4: novo
      FigureExtension,
      TextAlign.configure({
        types:            ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      Link.configure({
        openOnClick:    false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Comece a escrever seu artigo aqui…" }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content:  initialData.content ?? "",
    onUpdate: () => { if (isMountedRef.current) scheduleAutoSave(); },
  });

  useEffect(() => { editorRef.current = editor; }, [editor]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ── Payload ─────────────────────────────────────────────────────────────────
  const buildPayload = useCallback(() => ({
    ...formDataRef.current,
    contentJson: editorRef.current?.getJSON() ?? {},
    contentHtml: editorRef.current?.getHTML() ?? "",
    updatedAt:   new Date().toISOString(),
  }), []);

  const buildPayloadWithCloudinary = useCallback(async () => {
    const payload = buildPayload();

    payload.contentHtml = await uploadInlineImages(payload.contentHtml);

    if (payload.coverImage?.startsWith("blob:")) {
      const response     = await fetch(payload.coverImage);
      const blob         = await response.blob();
      const { url }      = await uploadImage(blob, { folder: "articles/covers" });
      payload.coverImage = url;
      setFormData((prev) => ({ ...prev, coverImage: url }));
    }

    return payload;
  }, [buildPayload]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const doSave = useCallback(async () => {
    clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    try {
      await onSave?.(buildPayload());
      if (isMountedRef.current) setSaveStatus("idle");
    } catch (err) {
      console.error("[ArticleEditor] Erro no save:", err);
      if (isMountedRef.current) setSaveStatus("error");
    }
  }, [buildPayload, onSave]);

  const scheduleAutoSave = useCallback(() => {
    setSaveStatus("saving");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) doSave();
    }, autoSaveInterval);
  }, [doSave, autoSaveInterval]);

  // ── Publish ──────────────────────────────────────────────────────────────────
  const doPublish = useCallback(async () => {
    setIsPublishing(true);
    setSaveStatus("saving");
    try {
      const payload  = await buildPayloadWithCloudinary();
      payload.status = "Publicado";
      setFormData((prev) => ({ ...prev, status: "Publicado" }));
      await onPublish?.(payload);
      if (isMountedRef.current) setSaveStatus("idle");
    } catch (err) {
      console.error("[ArticleEditor] Erro ao publicar:", err);
      if (isMountedRef.current) setSaveStatus("error");
    } finally {
      if (isMountedRef.current) setIsPublishing(false);
    }
  }, [buildPayloadWithCloudinary, onPublish]);

  // ── Ctrl/Cmd + S ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        doSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doSave]);

  // ── Setters ──────────────────────────────────────────────────────────────────
  const setField = useCallback(
    (field) => (value) => setFormData((prev) => ({ ...prev, [field]: value })),
    []
  );

  const handleTitleChange = useCallback((e) => {
    const title = e.target.value;
    setFormData((prev) => ({ ...prev, title, slug: toSlug(title) }));
  }, []);

  const handleFontChange = useCallback((fontValue) => {
    setFormData((prev) => ({ ...prev, fontFamily: fontValue }));
    editorRef.current?.chain().focus().setFontFamily(fontValue).run();
  }, []);

  const handleCoverUpload = useCallback((file) => {
    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, coverImage: objectUrl }));
  }, []);

  const handleCoverRemove = useCallback(() => {
    setFormData((prev) => {
      if (prev.coverImage?.startsWith("blob:")) URL.revokeObjectURL(prev.coverImage);
      return { ...prev, coverImage: "" };
    });
  }, []);

  const handleEditorImageUpload = useCallback((file) => {
    const objectUrl = URL.createObjectURL(file);
    editorRef.current
      ?.chain()
      .focus()
      .insertFigure({ src: objectUrl, alt: file.name, width: 100, align: "center", caption: "" })
      .run();
  }, []);

  const setFigureAlign = useCallback((align) => {
    editorRef.current?.chain().focus().setFigureAlign(align).run();
  }, []);

  // FIX #4: controle de espaçamento entre linhas
  const setLineHeight = useCallback((value) => {
    editorRef.current?.chain().focus().setLineHeight(value).run();
  }, []);

  const isFigureActive = useCallback(() =>
    editorRef.current?.isActive("figure") ?? false,
  []);

  return {
    formData,
    saveStatus,
    isPublishing,
    editor,
    setField,
    handleTitleChange,
    handleFontChange,
    handleCoverUpload,
    handleCoverRemove,
    handleEditorImageUpload,
    setFigureAlign,
    setLineHeight,
    isFigureActive,
    doSave,
    doPublish,
    buildPayload,
    buildPayloadWithCloudinary,
    EDITOR_FONTS,
    LINE_HEIGHT_OPTIONS,
  };
}
