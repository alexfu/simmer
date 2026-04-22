"use client";

import { useActionState, useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import {
  updateShoppingList,
  autoSaveShoppingList,
  getRecipeIngredients,
  addIngredientsToList,
  type EditShoppingListState,
  type RecipeIngredient,
} from "@/app/shopping-list/[id]/edit/actions";
import { formatQuantity } from "@/lib/format-quantity";
import { QuantityInput } from "@/components/quantity-input";

interface ShoppingListItem {
  name: string;
  quantity: string;
  unit: string;
}

interface Recipe {
  id: string;
  title: string;
  servings: number;
}

interface OtherShoppingList {
  id: string;
  name: string;
  items: { name: string; quantity: string; unit: string }[];
}

interface ShoppingListEditorProps {
  listId: string;
  name: string;
  items: ShoppingListItem[];
  recipes: Recipe[];
  otherLists: OtherShoppingList[];
}

const inputClassName =
  "w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export function ShoppingListEditor({
  listId,
  name: initialName,
  items: initialItems,
  recipes,
  otherLists,
}: ShoppingListEditorProps) {
  const action = updateShoppingList.bind(null, listId);
  const [state, formAction, isPending] = useActionState<
    EditShoppingListState,
    FormData
  >(action, { errors: [] });

  const dndId = useId();
  const [items, setItems] = useState<ShoppingListItem[]>(initialItems);
  const [itemIds, setItemIds] = useState(() =>
    initialItems.map(() => uuidv4()),
  );
  const [listName, setListName] = useState(initialName);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showListPicker, setShowListPicker] = useState(false);
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialRender = useRef(true);
  const itemsRef = useRef(items);
  const nameRef = useRef(listName);
  itemsRef.current = items;
  nameRef.current = listName;

  const serializedState = JSON.stringify({ listName, items });

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      autoSaveShoppingList(listId, nameRef.current, itemsRef.current);
    }, 2000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedState, listId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });

    setItemIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  }

  function updateItem(
    index: number,
    field: keyof ShoppingListItem,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    const newId = uuidv4();
    setItems((prev) => [...prev, { name: "", quantity: "", unit: "" }]);
    setItemIds((prev) => [...prev, newId]);
    setFocusItemId(newId);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setItemIds((prev) => prev.filter((_, i) => i !== index));
  }

  function handleIngredientsAdded(ingredients: ShoppingListItem[]) {
    setItems((prev) => [...prev, ...ingredients]);
    setItemIds((prev) => [...prev, ...ingredients.map(() => uuidv4())]);
    setShowRecipePicker(false);
  }

  return (
    <>
      <form action={formAction} className="mt-8 space-y-8">
        {state.errors.length > 0 && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <ul className="space-y-1 text-sm text-primary">
              {state.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground"
          >
            List Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          />
        </div>

        <section>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Items
          </h2>
          <div className="mt-4 space-y-3">
            <DndContext
              id={dndId}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item, index) => (
                  <SortableShoppingItem
                    key={itemIds[index]}
                    id={itemIds[index]}
                    item={item}
                    index={index}
                    autoFocus={itemIds[index] === focusItemId}
                    onFocused={() => setFocusItemId(null)}
                    onUpdate={updateItem}
                    onRemove={() => removeItem(index)}
                    onAddNext={addItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={addItem}
                className="w-full rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-foreground sm:w-auto"
              >
                + Add Item
              </button>
              {recipes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRecipePicker(true)}
                  className="w-full rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-foreground sm:w-auto"
                >
                  + Add from Recipe
                </button>
              )}
              {otherLists.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowListPicker(true)}
                  className="w-full rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-foreground sm:w-auto"
                >
                  + Add from List
                </button>
              )}
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </form>

      {showRecipePicker && (
        <RecipeIngredientPicker
          recipes={recipes}
          onAdd={handleIngredientsAdded}
          onClose={() => setShowRecipePicker(false)}
        />
      )}

      {showListPicker && (
        <ShoppingListItemPicker
          lists={otherLists}
          onAdd={handleIngredientsAdded}
          onClose={() => setShowListPicker(false)}
        />
      )}
    </>
  );
}

function SortableShoppingItem({
  id,
  item,
  index,
  autoFocus,
  onFocused,
  onUpdate,
  onRemove,
  onAddNext,
}: {
  id: string;
  item: ShoppingListItem;
  index: number;
  autoFocus?: boolean;
  onFocused?: () => void;
  onUpdate: (index: number, field: keyof ShoppingListItem, value: string) => void;
  onRemove: () => void;
  onAddNext: () => void;
}) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (autoFocus && nameInputRef.current) {
    requestAnimationFrame(() => {
      nameInputRef.current?.focus();
      onFocused?.();
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-border bg-surface p-4 ${
        isDragging ? "z-10 shadow-lg opacity-90" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 gap-3">
          <button
            type="button"
            className="mt-3 flex cursor-grab touch-none flex-col items-center gap-0.5 text-muted active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </button>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="flex-1 sm:flex-[3]">
              <label className="block text-xs font-medium text-muted">Item</label>
              <input
                ref={nameInputRef}
                type="text"
                name="item-name"
                placeholder="e.g. Chicken breast"
                value={item.name}
                onChange={(e) => onUpdate(index, "name", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddNext();
                  }
                }}
                required
                className={`mt-1 ${inputClassName}`}
              />
            </div>
            <div className="flex flex-1 gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted">Quantity</label>
                <QuantityInput
                  name="item-quantity"
                  value={item.quantity}
                  onChange={(value) => onUpdate(index, "quantity", value)}
                  placeholder="e.g. 1/2"
                  className="mt-1 w-full"
                  inputClassName="bg-input"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted">Unit</label>
                <input
                  type="text"
                  name="item-unit"
                  placeholder="e.g. lb"
                  value={item.unit}
                  onChange={(e) => onUpdate(index, "unit", e.target.value)}
                  className={`mt-1 ${inputClassName}`}
                />
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="ml-3 text-sm text-muted transition-colors hover:text-foreground"
          aria-label="Remove item"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

function ShoppingListItemPicker({
  lists,
  onAdd,
  onClose,
}: {
  lists: OtherShoppingList[];
  onAdd: (items: ShoppingListItem[]) => void;
  onClose: () => void;
}) {
  const [selectedList, setSelectedList] = useState<OtherShoppingList | null>(
    null,
  );
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>(
    {},
  );

  function handleSelectList(list: OtherShoppingList) {
    setSelectedList(list);
    setSelectedItems(
      Object.fromEntries(list.items.map((_, i) => [i, true])),
    );
  }

  function toggleItem(index: number) {
    setSelectedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  function handleAdd() {
    if (!selectedList) return;
    const selected = selectedList.items
      .filter((_, i) => selectedItems[i])
      .map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit }));
    onAdd(selected);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/20"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface px-6 pb-8 pt-4 shadow-lg sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border sm:pb-6">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />

        {!selectedList ? (
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Select a Shopping List
            </h3>
            <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
              {lists.map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => handleSelectList(list)}
                  className="w-full rounded-lg border border-border px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-background"
                >
                  {list.name}
                  <span className="ml-2 text-muted">
                    ({list.items.length} items)
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-lg border border-border py-3 text-sm font-medium text-muted transition-colors hover:text-foreground sm:w-auto sm:border-0 sm:py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {selectedList.name}
            </h3>

            <div className="mt-4 max-h-64 space-y-1 overflow-y-auto">
              {selectedList.items.map((item, index) => {
                const display = [
                  item.quantity ? formatQuantity(item.quantity, 1) : "",
                  item.unit,
                  item.name,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <label
                    key={index}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-background"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems[index] ?? false}
                      onChange={() => toggleItem(index)}
                      className="accent-primary"
                    />
                    <span
                      className={`text-sm ${
                        selectedItems[index]
                          ? "text-foreground"
                          : "text-muted line-through"
                      }`}
                    >
                      {display}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedList(null);
                  setSelectedItems({});
                }}
                className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-muted transition-colors hover:text-foreground sm:flex-none sm:px-4 sm:py-2"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={
                  Object.values(selectedItems).filter(Boolean).length === 0
                }
                className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-40 sm:flex-none sm:px-6 sm:py-2"
              >
                Add Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function RecipeIngredientPicker({
  recipes,
  onAdd,
  onClose,
}: {
  recipes: Recipe[];
  onAdd: (ingredients: ShoppingListItem[]) => void;
  onClose: () => void;
}) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<
    (RecipeIngredient & { selected: boolean })[]
  >([]);
  const [isLoading, startTransition] = useTransition();

  function handleSelectRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setServings(recipe.servings);

    startTransition(async () => {
      const ings = await getRecipeIngredients(recipe.id, recipe.servings);
      setIngredients(ings.map((i) => ({ ...i, selected: true })));
    });
  }

  function handleServingsChange(newServings: number) {
    if (!selectedRecipe || newServings < 1) return;
    setServings(newServings);

    startTransition(async () => {
      const ings = await getRecipeIngredients(selectedRecipe.id, newServings);
      setIngredients((prev) =>
        ings.map((i, idx) => ({
          ...i,
          selected: prev[idx]?.selected ?? true,
        })),
      );
    });
  }

  function toggleIngredient(index: number) {
    setIngredients((prev) =>
      prev.map((i, idx) =>
        idx === index ? { ...i, selected: !i.selected } : i,
      ),
    );
  }

  function handleAdd() {
    const selected = ingredients
      .filter((i) => i.selected)
      .map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit }));
    onAdd(selected);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/20"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface px-6 pb-8 pt-4 shadow-lg sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border sm:pb-6">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />

        {!selectedRecipe ? (
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Select a Recipe
            </h3>
            <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => handleSelectRecipe(recipe)}
                  className="w-full rounded-lg border border-border px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-background"
                >
                  {recipe.title}
                  <span className="ml-2 text-muted">
                    ({recipe.servings} servings)
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-lg border border-border py-3 text-sm font-medium text-muted transition-colors hover:text-foreground sm:w-auto sm:border-0 sm:py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {selectedRecipe.title}
            </h3>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-muted">Servings</span>
              <button
                type="button"
                onClick={() => handleServingsChange(servings - 1)}
                disabled={servings <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-border disabled:opacity-40"
              >
                &minus;
              </button>
              <span className="w-8 text-center font-medium text-foreground">
                {servings}
              </span>
              <button
                type="button"
                onClick={() => handleServingsChange(servings + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-border"
              >
                +
              </button>
            </div>

            {isLoading ? (
              <p className="mt-4 text-sm text-muted">Loading ingredients...</p>
            ) : (
              <div className="mt-4 max-h-64 space-y-1 overflow-y-auto">
                {ingredients.map((ing, index) => {
                  const display = [
                    ing.quantity ? formatQuantity(ing.quantity, 1) : "",
                    ing.unit,
                    ing.name,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <label
                      key={index}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-background"
                    >
                      <input
                        type="checkbox"
                        checked={ing.selected}
                        onChange={() => toggleIngredient(index)}
                        className="accent-primary"
                      />
                      <span
                        className={`text-sm ${
                          ing.selected ? "text-foreground" : "text-muted line-through"
                        }`}
                      >
                        {display}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRecipe(null);
                  setIngredients([]);
                }}
                className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-muted transition-colors hover:text-foreground sm:flex-none sm:px-4 sm:py-2"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={ingredients.filter((i) => i.selected).length === 0}
                className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-surface transition-colors hover:bg-primary-hover disabled:opacity-40 sm:flex-none sm:px-6 sm:py-2"
              >
                Add Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
