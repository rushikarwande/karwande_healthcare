import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/content/siteContent";
import LogoMark from "@/components/LogoMark";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { content } = useSiteContent();

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Doctors", href: "#doctors" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const primaryPhone = content.contact.clinics[0]?.phones[0] ?? content.footer.phones[0] ?? "";
  const dialNumber = primaryPhone.replace(/\s|-/g, "");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#home" className="flex items-center gap-2">
            <LogoMark size="md" />
            <div className="leading-tight">
              <span className="font-heading font-bold text-foreground text-sm md:text-base block">{content.branding.shortName}</span>
              <span className="text-muted-foreground text-xs">{content.branding.tagLine}</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button asChild size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <a href={`tel:${dialNumber}`}>
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin">Admin</Link>
            </Button>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button asChild size="sm" className="w-[calc(100%-2rem)] mx-4 mt-2 gap-2 bg-primary text-primary-foreground">
              <a href={`tel:${dialNumber}`}>
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-[calc(100%-2rem)] mx-4 mt-2">
              <Link to="/admin">Admin</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
