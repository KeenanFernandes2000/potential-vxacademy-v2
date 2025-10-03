/**
 * Convert Lexical JSON content to HTML string
 * This is a custom parser that handles Lexical editor state without requiring
 * the headless editor (which can cause bundler issues)
 * 
 * @param content - Lexical JSON content (either as string or parsed object)
 * @returns HTML string representation of the content
 */
export function lexicalToHtml(content: string | object | null | undefined): string {
  // Handle empty or invalid content
  if (!content) {
    return "";
  }

  try {
    // Parse JSON string if needed
    let parsed;
    if (typeof content === "string") {
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, return as plain text
        return content;
      }
    } else {
      parsed = content;
    }

    // Validate and parse Lexical structure
    if (parsed && typeof parsed === "object" && parsed.root) {
      return parseLexicalNode(parsed.root);
    }

    // If not valid Lexical format, return as-is
    return typeof content === "string" ? content : JSON.stringify(content);
  } catch (error) {
    console.error("Error parsing Lexical content:", error);
    return typeof content === "string" ? content : "";
  }
}

/**
 * Parse a Lexical node and its children recursively
 */
function parseLexicalNode(node: any, parentType: string = ""): string {
  if (!node) return "";

  switch (node.type) {
    case "text": {
      let text = node.text || "";

      // Apply text formatting (bold, italic, etc.)
      if (node.format) {
        if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
        if (node.format & 2) text = `<em>${text}</em>`; // Italic
        if (node.format & 4) text = `<s>${text}</s>`; // Strikethrough
        if (node.format & 8) text = `<u>${text}</u>`; // Underline
        if (node.format & 16) text = `<code>${text}</code>`; // Code
        if (node.format & 32) text = `<mark>${text}</mark>`; // Highlight
        if (node.format & 64) text = `<sub>${text}</sub>`; // Subscript
        if (node.format & 128) text = `<sup>${text}</sup>`; // Superscript
      }

      if (node.style) {
        text = `<span style="${node.style}">${text}</span>`;
      }

      return text;
    }

    case "paragraph": {
      const paragraphContent = (node.children || [])
        .map((child: any) => parseLexicalNode(child, node.type))
        .join("");

      // Check if paragraph has actual text content (not just whitespace or empty tags)
      const textContent = paragraphContent.replace(/<[^>]*>/g, "").trim();
      
      if (!textContent) {
        // Inside list items, skip empty paragraphs entirely
        if (parentType === "listitem") {
          return "";
        }
        // Outside list items, only render if it's truly meant as a line break
        return "";
      }

      // If inside a list item, don't wrap with <p>
      if (parentType === "listitem") {
        return paragraphContent;
      }

      return `<p class="mb-4 leading-relaxed">${paragraphContent}</p>`;
    }

    case "heading": {
      const headingContent = (node.children || [])
        .map((child: any) => parseLexicalNode(child, node.type))
        .join("");
      
      const tag = node.tag || "h1";
      const headingClass =
        tag === "h1"
          ? "text-2xl font-bold mt-8 mb-4"
          : tag === "h2"
          ? "text-xl font-semibold mt-6 mb-3"
          : tag === "h3"
          ? "text-lg font-semibold mt-4 mb-2"
          : "text-base font-semibold mt-3 mb-2";
      
      return `<${tag} class="${headingClass}">${headingContent}</${tag}>`;
    }

    case "list": {
      const listContent = (node.children || [])
        .map((child: any) => parseLexicalNode(child, node.type))
        .join("");

      // Determine list tag (ol or ul)
      const tag = node.tag || (node.listType === "number" ? "ol" : "ul");
      const listClass =
        tag === "ol"
          ? "list-decimal list-inside mb-4 ml-6"
          : "list-disc list-inside mb-4 ml-6";

      return `<${tag} class="${listClass}">${listContent}</${tag}>`;
    }

    case "listitem": {
      // Separate nested lists from direct content
      let directContent = "";
      let nestedLists = "";
      
      for (const child of node.children || []) {
        if (child.type === "list") {
          // This is a nested list - process it separately
          nestedLists += parseLexicalNode(child, node.type);
        } else {
          // This is direct content (paragraph, text, etc.)
          directContent += parseLexicalNode(child, node.type);
        }
      }

      // Remove empty paragraphs from direct content
      directContent = directContent
        .replace(/<p[^>]*><br><\/p>/g, "")
        .replace(/<p[^>]*>\s*<\/p>/g, "");

      // Check if there's any actual text in the direct content (not in nested lists)
      const directTextOnly = directContent.replace(/<[^>]*>/g, "").trim();

      // If there's no direct text content but we have nested lists,
      // render the nested lists without the parent li wrapper
      if (!directTextOnly && nestedLists) {
        return nestedLists;
      }

      // If there's no direct text and no nested lists, skip entirely
      if (!directTextOnly && !nestedLists) {
        return "";
      }

      // Combine direct content with nested lists
      const fullContent = directContent + nestedLists;
      
      return `<li class="leading-relaxed">${fullContent}</li>`;
    }

    case "quote": {
      const quoteContent = (node.children || [])
        .map((child: any) => parseLexicalNode(child, node.type))
        .join("");

      return `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${quoteContent}</blockquote>`;
    }

    case "code": {
      const codeContent = (node.children || [])
        .map((child: any) => parseLexicalNode(child, node.type))
        .join("");

      return `<pre class="bg-gray-100 p-4 rounded my-4 overflow-x-auto"><code>${codeContent}</code></pre>`;
    }

    case "link": {
      const linkContent = (node.children || [])
        .map((child: any) => parseLexicalNode(child, node.type))
        .join("");
      
      const url = node.url || "#";
      const target = node.target || "_self";
      
      return `<a href="${url}" target="${target}" class="text-blue-600 hover:underline">${linkContent}</a>`;
    }

    case "root":
      return (node.children || [])
        .map((child: any) => parseLexicalNode(child, node.type))
        .join("");

    default:
      // Handle unknown node types by processing their children
      return node.children
        ? node.children
            .map((child: any) => parseLexicalNode(child, node.type))
            .join("")
        : "";
  }
}

/**
 * Safely render Lexical content with proper HTML conversion
 * Useful for dangerouslySetInnerHTML
 */
export function getLexicalHtml(content: string | object | null | undefined): { __html: string } {
  return {
    __html: lexicalToHtml(content),
  };
}

