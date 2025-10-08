import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    chatbotembed?: (config: {
      botId: string;
      botIcon: string;
      botColor: string;
    }) => void;
  }
}

export default function ChatEmbed() {
  const location = useLocation();

  // Define your bot rules
  const bots = {
    home: {
      id: "68d3c5eb94d4851d85bb6408",
      icon: "https://api.potential.com/static/mentors/home-bot.jpeg",
      color: "#404040",
    },
    user: {
      id: "68d62d3d94d4851d85bb88e0",
      icon: "https://api.potential.com/static/mentors/user-bot.jpeg",
      color: "#404040",
    },
    subAdmin: {
      id: "68d631a094d4851d85bb8903",
      icon: "https://api.potential.com/static/mentors/subadmin-bot.jpeg",
      color: "#404040",
    },
  };

  // Determine which bot to load based on current pathname
  let bot = null;
  if (["/", "/home", "/login", "/join"].includes(location.pathname)) {
    bot = bots.home;
  } else if (location.pathname.startsWith("/user")) {
    bot = bots.user;
  } else if (location.pathname.startsWith("/sub-admin")) {
    bot = bots.subAdmin;
  }

  useEffect(() => {
    if (!bot) return;

    const scriptUrl = "https://ai.potential.com/static/embed/chat.js";

    const loadChatScript = () =>
      new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(`script[src="${scriptUrl}"]`);
        if (existing) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.type = "text/javascript";
        script.charset = "utf-8";

        script.onload = () => resolve();
        script.onerror = () => reject("Chatbot script failed to load");
        document.body.appendChild(script);
      });

    const initChatbot = async () => {
      try {
        await loadChatScript();
        if (window.chatbotembed) {
          window.chatbotembed({
            botId: bot.id,
            botIcon: bot.icon,
            botColor: bot.color,
          });
        } else {
          setTimeout(initChatbot, 200); // retry if not ready
        }
      } catch (err) {
        console.error("Chatbot initialization error:", err);
      }
    };

    initChatbot();

    // Cleanup popup on route change
    return () => {
      document
        .querySelectorAll(
          'iframe[src*="ai.potential.com"], div[id^="potential"], .potential-chatbot'
        )
        .forEach((n) => n.remove());
    };
  }, [bot, location.pathname]);

  return null; // nothing visual — just runs behind the scenes
}
