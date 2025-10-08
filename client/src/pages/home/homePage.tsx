import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
// import * as AOS from "aos";
// import "aos/dist/aos.css";
import "../../homepage.css";

// TypeScript declaration for chatbot embed
declare global {
  interface Window {
    chatbotembed?: (config: {
      botId: string;
      botIcon: string;
      botColor: string;
    }) => void;
  }
}

import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Icon from "@/components/icon";
import HomeNavigation from "@/components/homeNavigation";
import HomeFooter from "@/components/homeFooter";
import TrainingAreaCard from "@/components/trainingAreaCard";

// MUI Icons
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SchoolIcon from "@mui/icons-material/School";
import BuildIcon from "@mui/icons-material/Build";
import VerifiedIcon from "@mui/icons-material/Verified";
import InfoIcon from "@mui/icons-material/Info";
import GroupsIcon from "@mui/icons-material/Groups";

// Layout Primitives
interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

const Section = ({
  id,
  className = "",
  children,
  "aria-label": ariaLabel,
}: SectionProps) => (
  <section id={id} className={className} aria-label={ariaLabel}>
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

const TwoCol = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 ${className}`}
  >
    {children}
  </div>
);

const ThreeCol = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 ${className}`}
  >
    {children}
  </div>
);

const FourCol = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 ${className}`}
  >
    {children}
  </div>
);

const MediaBox = ({
  className = "",
  imageSrc = "",
  alt = "Media placeholder",
}: {
  className?: string;
  imageSrc?: string;
  alt?: string;
}) => (
  <div
    className={`aspect-[16/10] rounded-full bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 overflow-hidden ${className}`}
  >
    {imageSrc ? (
      <img src={imageSrc} alt={alt} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/30 text-sm">Image Placeholder</div>
      </div>
    )}
  </div>
);

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // Add user state

  // Smooth scrolling function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    // Initialize AOS
    // AOS.init({
    //   duration: 600,
    //   easing: "ease-in-out",
    //   once: false,
    //   mirror: true,
    // });

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
        botId: "68d3c5eb94d4851d85bb6408",
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
    <div className="min-h-screen flex flex-col bg-primary-white relative overflow-hidden">
      <HomeNavigation showItems={true} />

      {/* Hero Section with Full Background Image */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden -mt-20 pt-20"
        // data-aos="fade-up"
      >
        {/* Full Background Image */}
        <div className="absolute inset-0 -top-20">
          <img
            src="bg.avif"
            alt="VX Academy Hero Background"
            className="w-full h-full object-cover"
          />
          {/* Sandstone overlay for warmth */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50"></div>
          {/* Subtle geometric accents */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-dawn opacity-10 transform rotate-45"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-dawn opacity-10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-dawn opacity-10 transform rotate-12"></div>
        </div>

        <div className="grid-container py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left-aligned text block - takes up 6-7 columns */}
            <div className="lg:col-span-7 text-primary-white space-y-8">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-primary-white text-column"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                Elevate Abu Dhabi's Visitor Experience
              </h1>
              <p
                className="text-lg md:text-xl lg:text-2xl text-primary-white leading-relaxed font-light text-column"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                Welcome to VX Academy — your gateway to becoming part of Abu
                Dhabi's story.
              </p>
              <div
                className="flex flex-col sm:flex-row gap-4"
                data-aos="fade-up"
                data-aos-delay="600"
              ></div>
            </div>
            {/* Right visual area - takes up remaining columns */}
            <div className="lg:col-span-5"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="section-padding relative overflow-hidden bg-primary-sandstone border-b border-[#E5E5E5]"
      >
        <div className="grid-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Content Column - Left side */}
            <div className="lg:col-span-6 text-primary-black">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                data-aos="fade-up"
              >
                About VX Academy
              </h2>
              <div className="w-24 h-1 bg-dawn rounded-full mb-8"></div>
              <div
                className="space-y-4 text-lg leading-relaxed mb-8 font-light text-column"
                data-aos="fade-up"
              >
                <p>
                  At VX Academy, we believe every frontliner is more than just a
                  service provider. You are the warm welcome that sets the tone,
                  the trusted guide who shares our culture, and the lasting
                  memory every visitor takes home.
                </p>
                <p>
                  Abu Dhabi is a place of discovery, tradition, and world-class
                  hospitality. To every visitor, it should feel consistent,
                  seamless, and extraordinary — and VX Academy was created to
                  ensure that, by equipping you with the knowledge, skills, and
                  confidence to deliver exceptional service across every
                  touchpoint.
                </p>
                <p>
                  This is more than training. It's an invitation to become an
                  ambassador of Abu Dhabi, to share the spirit of our home with
                  the world, and to make every interaction truly unforgettable.
                </p>
              </div>
              <Link to="/login">
                <Button
                  className="bg-primary-dawn hover:bg-[#B85A1A] text-primary-white px-8 py-3 font-regular transition-colors rounded-full shadow-lg border border-primary-dawn hover:scale-105 cursor-pointer"
                  data-aos="fade-up"
                >
                  Enroll Now
                </Button>
              </Link>
            </div>

            {/* Image Column - Right side */}
            <div className="lg:col-span-6 lg:pl-8">
              <div className="w-full h-full overflow-hidden" data-aos="fade-up">
                <img
                  src="about-vx.jpeg"
                  alt="Woman working on laptop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="section-padding relative overflow-hidden bg-primary-white border-b border-[#E5E5E5]"
        // data-aos="fade-up"
      >
        <div className="grid-container relative z-10">
          <div className="text-center mb-16 lg:mb-20" data-aos="fade-up">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-black">
                Why Join VX Academy?
              </h2>
              <div className="w-24 h-1 bg-primary-dawn rounded-full mx-auto"></div>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto text-primary-black leading-relaxed font-light">
                Joining the VX Academy provides frontliners with numerous
                benefits that enhance both professional development and personal
                growth.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
            {[
              {
                title: "Recognized Certification",
                description:
                  "Earn official certifications and digital badges that highlight your expertise and commitment to excellence. Showcase your achievements with credentials recognized across Abu Dhabi's tourism and hospitality ecosystem.",
                icon: "icons/VX Icons-01.png",
              },
              {
                title: "Career Advancement",
                description:
                  "Stand out in your field and open doors to new opportunities. With enhanced skills and proven knowledge, you'll be better equipped for promotions, leadership roles, and long-term career growth.",
                icon: "icons/VX Icons-02.png",
              },
              {
                title: "AI-Powered Assistance",
                description:
                  "Get access to smart, AI-driven tools that guide you through training and provide instant support when you need it most — helping you learn faster and apply knowledge on the job.",
                icon: "icons/VX Icons-03.png",
              },
              {
                title: "Self-Paced Training",
                description:
                  "Learn anytime, anywhere, at your own pace. Whether you're at work, home, or on the go, VX Academy adapts to your schedule so you can grow without limits.",
                icon: "icons/VX Icons-04.png",
              },
            ].map((benefit, index) => (
              <div key={index} className="group">
                <div
                  className="bg-primary-white border border-gray-200 p-6 lg:p-8 transition-all duration-500 h-full relative overflow-hidden shadow-sm hover:bg-blur-md hover:shadow-lg hover:border-2 hover:border-gray-300"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <div className="relative z-10">
                    <div className="w-20 h-20 flex items-center justify-center mb-6 transition-transform duration-300">
                      <Icon
                        Component={
                          <img
                            src={benefit.icon}
                            alt={benefit.title}
                            className="w-full h-full object-cover"
                          />
                        }
                        color="#F77860"
                        size={58}
                      />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold mb-4 text-primary-black group-hover:text-primary-dawn transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-[#666666] leading-relaxed font-light">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Areas Section */}
      <section
        id="training-areas"
        className="section-padding relative overflow-hidden bg-primary-sandstone border-b border-[#E5E5E5]"
        // data-aos="fade-up"
      >
        <div className="grid-container relative z-10">
          <div className="text-center mb-16 lg:mb-20" data-aos="fade-up">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-black">
                Training Areas
              </h2>
              <div className="w-24 h-1 bg-primary-dawn rounded-full mx-auto"></div>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto text-primary-black leading-relaxed font-light">
                Our comprehensive training system follows a structured approach
                through five interconnected areas, building from foundational
                knowledge to advanced competencies for exceptional visitor
                experiences in Abu Dhabi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "ABU DHABI INFORMATION",
                description:
                  "Immerse yourself in Abu Dhabi's rich cultural heritage, tourism strategy, and infrastructure knowledge essential for frontline professionals.",
                icon: InfoIcon,
                imageSrc: "info.jpeg",
                imageAlt: "Abu Dhabi skyline and cultural landmarks",
              },
              {
                title: "VX SOFT SKILLS",
                description:
                  "Master communication, empathy, and service delivery skills that ensure every guest feels welcomed and valued.",
                icon: GroupsIcon,
                imageSrc: "soft-1.jpg",
                imageAlt: "Professional hospitality training session",
              },
              {
                title: "VX HARD SKILLS",
                description:
                  "Develop technical expertise and operational knowledge for specialized frontline positions across Abu Dhabi's visitor landscape.",
                icon: BuildIcon,
                imageSrc: "hard.jpeg",
                imageAlt: "Specialized training and skill development",
              },
              {
                title: "MANAGERIAL COMPETENCIES",
                description:
                  "Build leadership skills, team management, and strategic thinking capabilities for supervisory and management roles.",
                icon: TrendingUpIcon,
                imageSrc: "managerial.jpeg",
                imageAlt: "Leadership and management training",
              },
              {
                title: "AL MIDHYAF CODE OF CONDUCT",
                description:
                  "Learn the essential standards, regulations, and ethical guidelines that define excellence in Abu Dhabi's hospitality sector.",
                icon: VerifiedIcon,
                imageSrc: "coc.jpeg",
                imageAlt: "Code of conduct and regulations",
              },
            ].map((area, index) => (
              <div key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <TrainingAreaCard
                  title={area.title}
                  description={area.description}
                  imageSrc={area.imageSrc}
                  imageAlt={area.imageAlt}
                  onLearnMore={() => {
                    // Handle learn more action
                    console.log(`Learn more about ${area.title}`);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for Section */}
      <section
        id="for"
        className="section-padding relative overflow-hidden bg-primary-white border-b border-[#E5E5E5]"
      >
        <div className="grid-container">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-black mb-6">
              Who Is VX Academy For?
            </h2>
            <div className="w-24 h-1 bg-primary-dawn rounded-full mx-auto mb-8"></div>
            <p className="text-xl text-[#666666] max-w-3xl mx-auto leading-relaxed font-light text-column-wide">
              If you play a role in shaping Abu Dhabi's visitor journey, VX
              Academy is for you.
            </p>
          </div>

          <div className="w-full max-w-none">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {[
                  {
                    title: "Museums & Cultural Sites",
                    image: "museum-1.jpg",
                  },
                  {
                    title: "Events & Entertainment Venues",
                    image: "event.jpg",
                  },
                  {
                    title: "Mobility Operators & Airports",
                    image: "mobility.avif",
                  },
                  {
                    title: "Cruise Terminals",
                    image: "cruise.avif",
                  },
                  {
                    title: "Hotels & Hospitality",
                    image: "hotel-1.jpg",
                  },
                  {
                    title: "Malls & Retail",
                    image: "mall-1.jpg",
                  },
                  {
                    title: "Tour Guides & Operators",
                    image: "tour-1.jpg",
                  },
                  {
                    title: "Visitor Information Centers",
                    image: "visitor-1.jpg",
                  },
                  {
                    title: "Attractions & Theme Parks",
                    image: "attraction-1.jpg",
                  },
                ].map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
                      <div className="aspect-[4/3] overflow-hidden shadow-lg border border-sandstone">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110"
                        />
                      </div>
                      {/* Text positioned under the image */}
                      <div className="mt-4 px-2">
                        <h3 className="text-xl lg:text-3xl font-bold text-primary-black group-hover:text-primary-dawn transition-colors duration-300">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 bg-primary-white hover:bg-primary-sandstone border-primary-sandstone text-primary-black hover:text-primary-dawn" />
              <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 bg-primary-white hover:bg-primary-sandstone border-primary-sandstone text-primary-black hover:text-primary-dawn" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Your Impact Section */}
      <section
        id="impact"
        className="section-padding relative overflow-hidden bg-primary-sandstone"
      >
        <div className="grid-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Image Column - Left side */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="w-full h-full overflow-hidden" data-aos="fade-up">
                <img
                  src="./impact-1.jpg"
                  alt="Team collaboration and impact"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content Column - Right side */}
            <div className="lg:col-span-6 text-primary-black order-1 lg:order-2">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                data-aos="fade-up"
              >
                Your Impact
              </h2>
              <div className="w-24 h-1 bg-dawn rounded-full mb-8"></div>
              <div
                className="space-y-4 text-lg leading-relaxed mb-8 font-light text-column"
                data-aos="fade-up"
              >
                <p>
                  Every smile, every story, every act of service becomes part of
                  the memory a visitor carries home. By joining VX Academy,
                  you're not just learning — you're shaping the way the world
                  experiences Abu Dhabi. Together, we'll make every visit
                  unforgettable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="join"
        className="section-padding relative overflow-hidden bg-primary-white min-h-[80vh]"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="./join-1.png"
            alt="VX Academy Join Background"
            className="w-full h-full object-cover"
          />
          {/* Sandstone overlay for warmth */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/95"></div>
        </div>

        <div className="grid-container relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-5xl mx-auto" data-aos="fade-up">
            <h2
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-12 leading-tight text-column-wide"
              data-aos="fade-up"
            >
              VX Academy - Excellence in Visitor Experiences
            </h2>
            <div className="pt-8">
              <Link to="/login">
                <Button
                  className="bg-primary-dawn hover:bg-[#B85A1A] text-primary-white text-xl py-6 px-16 shadow-lg transition-all duration-300 hover:scale-105 font-regular rounded-full border border-primary-dawn cursor-pointer"
                  data-aos="fade-up"
                >
                  Enroll Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Horizontal Layout on Mobile */}
      <HomeFooter scrollToSection={scrollToSection} />
    </div>
  );
}
