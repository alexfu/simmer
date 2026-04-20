import Image from "next/image";

interface RecipeCardProps {
  title: string;
  description: string | null;
  imageUrl: string | null;
  servings: number;
}

export function RecipeCard({
  title,
  description,
  imageUrl,
  servings,
}: RecipeCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] bg-border">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{description}</p>
        )}
        <p className="mt-2 text-xs text-muted">
          {servings} {servings === 1 ? "serving" : "servings"}
        </p>
      </div>
    </div>
  );
}
