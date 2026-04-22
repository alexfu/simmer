"use client";

import { useOptimistic, useTransition } from "react";
import { toggleItem } from "@/app/shopping-list/[id]/actions";
import { formatQuantity } from "@/lib/format-quantity";

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
}

interface ShoppingListViewProps {
  items: ShoppingListItem[];
}

export function ShoppingListView({ items }: ShoppingListViewProps) {
  const [optimisticItems, setOptimisticItems] = useOptimistic(items);
  const [, startTransition] = useTransition();

  function handleToggle(itemId: string, currentChecked: boolean) {
    startTransition(async () => {
      setOptimisticItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, checked: !currentChecked } : item,
        ),
      );
      await toggleItem(itemId, !currentChecked);
    });
  }

  const unchecked = optimisticItems.filter((i) => !i.checked);
  const checked = optimisticItems.filter((i) => i.checked);

  return (
    <div className="mt-6 space-y-6">
      {unchecked.length > 0 && (
        <ul className="space-y-2">
          {unchecked.map((item) => (
            <ShoppingItem
              key={item.id}
              item={item}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      )}

      {checked.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">
            Checked off ({checked.length})
          </p>
          <ul className="space-y-2">
            {checked.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                onToggle={handleToggle}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ShoppingItem({
  item,
  onToggle,
}: {
  item: ShoppingListItem;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const hasQuantity = item.quantity && item.quantity !== "";
  const hasUnit = item.unit && item.unit !== "";
  const quantityDisplay = hasQuantity ? formatQuantity(item.quantity, 1) : "";

  return (
    <li
      className={`flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors ${
        item.checked
          ? "bg-border/30 opacity-60"
          : "bg-surface hover:bg-border/20"
      }`}
      onClick={() => onToggle(item.id, item.checked)}
    >
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id, item.checked)}
        className="accent-primary"
        onClick={(e) => e.stopPropagation()}
      />
      <span
        className={`flex-1 text-sm ${
          item.checked
            ? "text-muted line-through"
            : "text-foreground"
        }`}
      >
        {hasQuantity && (
          <span className="font-medium">{quantityDisplay} </span>
        )}
        {hasUnit && <span className="text-muted">{item.unit} </span>}
        {item.name}
      </span>
    </li>
  );
}
