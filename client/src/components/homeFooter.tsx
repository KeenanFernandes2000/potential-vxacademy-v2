import React from "react";
import Icon from "./icon";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

interface HomeFooterProps {
  scrollToSection?: (sectionId: string) => void;
}

const HomeFooter: React.FC<HomeFooterProps> = ({
  scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  },
}) => {
  return (
    <footer className="bg-sandstone border-t border-[#E5E5E5] text-[#2C2C2C] py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="grid-container relative z-10">
        {/* Mobile: Single row layout, Desktop: Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-8 lg:mb-12">
          {/* VX Academy Section */}
          <div className="space-y-6">
            <h3 className="text-xl lg:text-2xl font-bold">VX Academy</h3>
            <p className="text-[#666666] leading-relaxed text-sm lg:text-base font-light">
              The premier training platform for Abu Dhabi's frontline
              hospitality and tourism professionals.
            </p>
          </div>

          {/* Mobile: Compact layout for Links and Contact */}
          <div className="lg:hidden">
            <div className="grid grid-cols-2 gap-6">
              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-left">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      onClick={() => scrollToSection("about")}
                      className="text-[#666666] hover:text-dawn transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full font-light"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("training-areas")}
                      className="text-[#666666] hover:text-dawn transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full font-light"
                    >
                      Training Areas
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("benefits")}
                      className="text-[#666666] hover:text-dawn transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full font-light"
                    >
                      Benefits
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("for")}
                      className="text-[#666666] hover:text-dawn transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full font-light"
                    >
                      Who is it for
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("about")}
                      className="text-[#666666] hover:text-dawn transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full font-light"
                    >
                      FAQ
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact Us */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-left">Contact Us</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3 group">
                    <div className="w-5 h-5 bg-dawn/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-dawn/40 transition-colors">
                      <Icon
                        Component={LocationOnIcon}
                        size={12}
                        color="#D2691E"
                      />
                    </div>
                    <span className="text-[#666666] text-xs leading-relaxed text-left font-light">
                      Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi, UAE
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 group">
                    <div className="w-5 h-5 bg-dawn/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-dawn/40 transition-colors">
                      <Icon Component={EmailIcon} size={12} color="#D2691E" />
                    </div>
                    <span className="text-[#666666] text-xs text-left font-light">
                      info@vxacademy.ae
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 group">
                    <div className="w-5 h-5 bg-dawn/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-dawn/40 transition-colors">
                      <Icon Component={PhoneIcon} size={12} color="#D2691E" />
                    </div>
                    <span className="text-[#666666] text-xs text-left font-light">
                      +971 2 123 4567
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: 3-column layout (About / Links / Contact) */}
          <div className="hidden lg:block space-y-6">
            <h3 className="text-lg font-bold">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-[#666666] hover:text-dawn transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full font-light"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("training-areas")}
                  className="text-[#666666] hover:text-dawn transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full font-light"
                >
                  Training Areas
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("benefits")}
                  className="text-[#666666] hover:text-dawn transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full font-light"
                >
                  Benefits
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("for")}
                  className="text-[#666666] hover:text-dawn transition-all duration-300 hover:translate-x-1 transform inline-block text-left w-full font-light"
                >
                  Who is it for
                </button>
              </li>
            </ul>
          </div>

          <div className="hidden lg:block space-y-6">
            <h3 className="text-lg font-bold">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-dawn/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-dawn/40 transition-colors">
                  <Icon Component={LocationOnIcon} size={16} color="#D2691E" />
                </div>
                <span className="text-[#666666] text-sm leading-relaxed font-light">
                  Abu Dhabi Tourism Building, Corniche Road, Abu Dhabi, UAE
                </span>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-dawn/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-dawn/40 transition-colors">
                  <Icon Component={EmailIcon} size={16} color="#D2691E" />
                </div>
                <span className="text-[#666666] text-sm font-light">
                  info@vxacademy.ae
                </span>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-6 h-6 bg-dawn/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-dawn/40 transition-colors">
                  <Icon Component={PhoneIcon} size={16} color="#D2691E" />
                </div>
                <span className="text-[#666666] text-sm font-light">
                  +971 2 123 4567
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] pt-8 text-center">
          <p className="text-[#666666] text-sm font-light">
            © {new Date().getFullYear()} VX Academy. All rights reserved.
          </p>
          <p className="text-[#999999] text-xs mt-2 font-light">
            Powered by{" "}
            <a
              href="https://potential.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-dawn transition-colors"
            >
              Potential.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
