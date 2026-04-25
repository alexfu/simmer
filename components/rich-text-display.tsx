interface RichTextDisplayProps {
  html: string;
  className?: string;
}

export function RichTextDisplay({
  html,
  className = "",
}: RichTextDisplayProps) {
  return (
    <div
      className={`rich-text text-sm text-foreground ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
