import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, SerializedEditorState } from "lexical";
import { useEffect, useState } from "react";

import { editorTheme } from "@/components/editor/themes/editor-theme";
import { TooltipProvider } from "@/components/ui/tooltip";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
  editable: true,
};

export function Editor({
  editorState,
  editorSerializedState,
  content,
  onChange,
  onSerializedChange,
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  content?: string | SerializedEditorState | null;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
}) {
  const [initialContent, setInitialContent] =
    useState<SerializedEditorState | null>(null);
  const [key, setKey] = useState(0); // Force re-render when content changes

  // Process content prop to determine initial editor state
  useEffect(() => {
    let parsedContent: SerializedEditorState | null = null;

    if (
      content &&
      (typeof content === "object" ||
        (typeof content === "string" && content.trim() !== ""))
    ) {
      try {
        // If content is a string, try to parse it as JSON
        if (typeof content === "string") {
          parsedContent = JSON.parse(content);
        } else {
          // If content is already an object, use it directly
          parsedContent = content;
        }
      } catch (error) {
        console.error("Failed to parse editor content:", error);
        parsedContent = null;
      }
    }

    setInitialContent(parsedContent);
    setKey((prev) => prev + 1); // Force re-render to apply new content
  }, [content]);

  // Determine which initial state to use (priority: editorState > editorSerializedState > content)
  const getInitialConfig = () => {
    const baseConfig = { ...editorConfig };

    if (editorState) {
      return { ...baseConfig, editorState };
    }

    if (editorSerializedState) {
      return {
        ...baseConfig,
        editorState: JSON.stringify(editorSerializedState),
      };
    }

    if (initialContent) {
      return { ...baseConfig, editorState: JSON.stringify(initialContent) };
    }

    return baseConfig;
  };

  return (
    <div className="bg-background overflow-hidden rounded-lg border border-border shadow-sm">
      <LexicalComposer key={key} initialConfig={getInitialConfig()}>
        <TooltipProvider>
          <Plugins />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState);
              onSerializedChange?.(editorState.toJSON());
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
