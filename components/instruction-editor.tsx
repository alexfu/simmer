"use client";

import { createContext, useContext, useState } from "react";
import {
  useEditor,
  EditorContent,
  Node,
  mergeAttributes,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  parseInstructionTags,
  buildIngredientTag,
} from "@/lib/parse-instruction-tags";
import { formatQuantity } from "@/lib/format-quantity";

interface IngredientOption {
  name: string;
  unit: string;
  quantity?: string;
}

const IngredientsContext = createContext<IngredientOption[]>([]);

function IngredientChip({ node }: { node: { attrs: Record<string, unknown> } }) {
  const ingredients = useContext(IngredientsContext);
  const name = String(node.attrs.name ?? "");
  const ingredient = ingredients.find(
    (i) => i.name.toLowerCase() === name.toLowerCase(),
  );
  const quantity = ingredient?.quantity
    ? formatQuantity(ingredient.quantity, 1)
    : "";
  const unit = ingredient?.unit ?? "";
  const display = [quantity, unit, name].filter(Boolean).join(" ");

  return (
    <NodeViewWrapper as="span" className="inline">
      <span className="inline-flex items-baseline gap-1 rounded bg-secondary/10 px-1.5 py-0.5 text-sm font-medium text-secondary">
        {display}
      </span>
    </NodeViewWrapper>
  );
}

const IngredientRef = Node.create({
  name: "ingredientRef",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-ingredient-ref]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-ingredient-ref": "",
        class:
          "inline-flex items-baseline gap-1 rounded bg-secondary/10 px-1.5 py-0.5 text-sm font-medium text-secondary",
      }),
      HTMLAttributes.name,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(IngredientChip);
  },
});

interface InstructionEditorProps {
  value: string;
  ingredients: IngredientOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  onEditorReady?: (insertIngredient: (name: string) => void) => void;
}

function tagsToHtml(text: string): string {
  if (!text) return "<p></p>";

  const segments = parseInstructionTags(text);
  const html = segments
    .map((seg) => {
      if (seg.type === "text") {
        return seg.value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      return `<span data-ingredient-ref="" name="${seg.name.replace(/"/g, "&quot;")}">${seg.name.replace(/</g, "&lt;")}</span>`;
    })
    .join("");

  return `<p>${html}</p>`;
}

function editorToTaggedText(
  editor: ReturnType<typeof useEditor>,
): string {
  if (!editor) return "";

  const json = editor.getJSON();
  const parts: string[] = [];

  function walk(node: Record<string, unknown>) {
    if (node.type === "ingredientRef") {
      const attrs = node.attrs as Record<string, string> | undefined;
      parts.push(buildIngredientTag(attrs?.name ?? ""));
      return;
    }

    if (node.type === "text") {
      parts.push(node.text as string);
      return;
    }

    const content = node.content as Record<string, unknown>[] | undefined;
    if (content) {
      content.forEach(walk);
    }

    if (node.type === "paragraph" && parts.length > 0) {
      parts.push(" ");
    }
  }

  const content = json.content as Record<string, unknown>[] | undefined;
  if (content) {
    content.forEach(walk);
  }

  return parts.join("").trim();
}

export function InstructionEditor({
  value,
  ingredients,
  placeholder,
  onChange,
  onEditorReady,
}: InstructionEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      IngredientRef,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: tagsToHtml(value),
    editorProps: {
      attributes: {
        class:
          "min-h-16 px-3 py-2.5 text-sm text-foreground focus:outline-none",
      },
      handleKeyDown: (view, event) => {
        if (event.key !== "}") return false;

        const { state } = view;
        const { $from } = state.selection;
        const textBefore = $from.parent.textBetween(0, $from.parentOffset);

        if (!textBefore.endsWith("}")) return false;

        const match = textBefore.match(/\{\{([^}]+)\}$/);
        if (!match) return false;

        const ingredientName = match[1].trim();
        if (!ingredientName) return false;

        const tagStart = $from.pos - match[0].length;

        const tr = state.tr;
        tr.delete(tagStart, $from.pos);
        tr.insert(
          tagStart,
          state.schema.nodes.ingredientRef.create({ name: ingredientName }),
        );
        tr.insertText(" ");
        view.dispatch(tr);

        event.preventDefault();
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editorToTaggedText(editor));
    },
  });

  function insertIngredient(name: string) {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "ingredientRef",
        attrs: { name },
      })
      .insertContent(" ")
      .run();
  }

  if (!editor) return null;

  if (onEditorReady) {
    onEditorReady(insertIngredient);
  }

  return (
    <IngredientsContext.Provider value={ingredients}>
      <div className="overflow-hidden rounded-md border border-border bg-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
        <EditorContent editor={editor} />
      </div>
    </IngredientsContext.Provider>
  );
}

export function IngredientInserter({
  ingredients,
  onInsert,
}: {
  ingredients: IngredientOption[];
  onInsert: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-md px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
      >
        + Insert Ingredient
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-surface px-6 pb-8 pt-4 shadow-lg sm:absolute sm:inset-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:w-80 sm:rounded-xl sm:border sm:pb-4 sm:pt-4">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
            <p className="mb-3 text-sm font-medium text-foreground">
              Select an ingredient
            </p>
            <div className="max-h-64 space-y-1 overflow-y-auto sm:max-h-48">
              {ingredients.map((ing, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onInsert(ing.name);
                    setOpen(false);
                  }}
                  className="w-full rounded-lg px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-background active:bg-background sm:py-2"
                >
                  {ing.name}
                  <span className="ml-2 text-muted">
                    {ing.quantity && formatQuantity(ing.quantity, 1)} {ing.unit}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-lg border border-border py-3 text-sm font-medium text-muted transition-colors hover:text-foreground sm:w-auto sm:border-0 sm:py-1"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
