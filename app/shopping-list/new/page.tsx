import { CreateShoppingListForm } from "@/components/create-shopping-list-form";

export default function NewShoppingListPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        Create Shopping List
      </h1>
      <CreateShoppingListForm />
    </main>
  );
}
