import { JSX } from "react";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        `ContentEditable__root relative block min-h-[200px] overflow-auto px-4 py-4 focus:outline-none prose prose-sm max-w-none`
      }
      aria-placeholder={placeholder}
      tabIndex={0}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `text-muted-foreground pointer-events-none absolute top-4 left-4 overflow-hidden text-ellipsis select-none`
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
