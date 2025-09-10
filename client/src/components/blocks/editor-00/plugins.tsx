import { useState } from "react";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { UNDO_COMMAND, REDO_COMMAND, KEY_TAB_COMMAND } from "lexical";
import { useEffect } from "react";

import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";
import { BlockFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph";
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";

// History Controls Component
function HistoryControls() {
  const [editor] = useLexicalComposerContext();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="h-8 w-8 p-0"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="h-8 w-8 p-0"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </>
  );
}

// Tab Handler Component to prevent tab from moving to next form field
function TabHandler() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => {
        // Prevent default tab behavior (moving to next form field)
        event.preventDefault();
        // Let the TabIndentationPlugin handle the indentation
        return false;
      },
      1 // High priority to override default behavior
    );
  }, [editor]);

  return null;
}

export function Plugins() {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <ToolbarPlugin>
        {({ blockType }) => (
          <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
            {/* Block Format Dropdown */}
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading />
              <FormatBulletedList />
              <FormatNumberedList />
              <FormatQuote />
            </BlockFormatDropDown>

            {/* Separator */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Font Format Tools */}
            <FontFormatToolbarPlugin format="bold" />
            <FontFormatToolbarPlugin format="italic" />
            <FontFormatToolbarPlugin format="underline" />
            <FontFormatToolbarPlugin format="strikethrough" />
            <FontFormatToolbarPlugin format="code" />

            {/* Separator */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* History Controls */}
            <HistoryControls />
          </div>
        )}
      </ToolbarPlugin>

      {/* Editor Content */}
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="min-h-[200px]">
              <div ref={onRef}>
                <ContentEditable
                  placeholder="Start typing your content..."
                  className="min-h-[200px] p-4 focus:outline-none"
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        {/* Additional Plugins */}
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <TabIndentationPlugin />
        <TabHandler />
      </div>
    </div>
  );
}
