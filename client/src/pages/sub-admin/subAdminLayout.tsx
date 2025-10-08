import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SubAdminSidebar from "@/components/subAdminSidebar";

const SubAdminLayout = () => {
  // Chatbot cleanup and prevention logic
  useEffect(() => {
    // Global flag to prevent multiple chatbot initializations
    if ((window as any).chatbotInitialized) {
      return;
    }

    // Aggressive cleanup: Remove ALL existing chatbot instances before creating new ones
    const existingChatHosts = document.querySelectorAll("#potChatHost");
    existingChatHosts.forEach((host) => {
      host.remove();
    });

    // Remove any other chatbot-related elements
    const chatbotElements = document.querySelectorAll('[id^="pot"]');
    chatbotElements.forEach((element) => {
      element.remove();
    });

    // Remove any existing chatbot scripts
    const existingScripts = document.querySelectorAll("#chatbot-embed-script");
    existingScripts.forEach((script) => {
      script.remove();
    });

    // Clean up the global chatbotembed function
    if (window.chatbotembed) {
      delete window.chatbotembed;
    }

    // Double-check: If potChatHost still exists after cleanup, don't proceed
    const stillExistingChatHost = document.getElementById("potChatHost");
    if (stillExistingChatHost) {
      console.warn(
        "potChatHost still exists after cleanup, skipping initialization"
      );
      return;
    }

    // Dynamically load the chatbot script
    const script = document.createElement("script");
    script.src = "https://ai.potential.com/static/embed/chat.js";
    script.charset = "utf-8";
    script.type = "text/javascript";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.id = "chatbot-embed-script";

    // Initialize chatbot after script loads
    script.onload = () => {
      // Final check before initialization
      const finalCheck = document.getElementById("potChatHost");
      if (finalCheck) {
        console.warn("potChatHost exists during initialization, skipping");
        return;
      }

      // @ts-ignore
      chatbotembed({
        botId: "68d631a094d4851d85bb8903",
        botIcon:
          "https://api.potential.com/static/mentors/sdadassd-1753092691035-person.jpeg",
        botColor: "#F77860",
      });
      (window as any).chatbotInitialized = true;
    };

    // Handle script loading errors
    script.onerror = () => {
      console.error("Failed to load chatbot script");
    };

    // Append script to document head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Remove the script tag
      const scriptElement = document.getElementById("chatbot-embed-script");
      if (scriptElement) {
        scriptElement.remove();
      }

      // Remove chatbot UI elements
      const potChatHost = document.getElementById("potChatHost");
      if (potChatHost) {
        potChatHost.remove();
      }

      // Remove any other chatbot-related elements
      const chatbotElements = document.querySelectorAll('[id^="pot"]');
      chatbotElements.forEach((element) => {
        element.remove();
      });

      // Clean up the global chatbotembed function
      if (window.chatbotembed) {
        delete window.chatbotembed;
      }

      // Reset the global flag
      (window as any).chatbotInitialized = false;
    };
  }, []);

  return (
    <SidebarProvider>
      <SubAdminSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SubAdminLayout;
