import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { useSiteContent } from "@/content/siteContent";
import LogoMark from "@/components/LogoMark";

const Footer = () => {
  const { content } = useSiteContent();
  const socialLinks = [
    { label: "Instagram", href: content.footer.socialLinks.instagram, icon: Instagram },
    { label: "Facebook", href: content.footer.socialLinks.facebook, icon: Facebook },
    { label: "YouTube", href: content.footer.socialLinks.youtube, icon: Youtube },
    { label: "LinkedIn", href: content.footer.socialLinks.linkedin, icon: Linkedin },
  ].filter((item) => item.href.trim().length > 0);

  return (
    <footer className="bg-foreground text-background/80 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LogoMark size="sm" />
              <span className="font-heading font-bold text-background">{content.branding.siteName}</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">{content.footer.description}</p>
            {socialLinks.length > 0 && (
              <div className="mt-5">
                <h4 className="font-heading font-semibold text-background mb-3">Follow Us</h4>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-background/15 text-background/70 transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-heading font-semibold text-background mb-4">Quick Links</h4>
            <div className="space-y-2">
              {["Home", "Services", "Gallery", "Doctors", "About", "Contact"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block text-sm text-background/60 hover:text-primary transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-background mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm text-background/60">
              {content.footer.phones.map((phone) => (
                <a key={phone} href={`tel:${phone.replace(/\s|-/g, "")}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" /> {phone}
                </a>
              ))}
              <a href={`mailto:${content.footer.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> {content.footer.email}
              </a>
              <a href={content.contact.mapLink} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-primary transition-colors">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{content.footer.address}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 text-center text-xs text-background/40">
          &copy; {new Date().getFullYear()} {content.footer.copyrightName}. All rights reserved. Created by Rushi Karwande
        </div>
      </div>
    </footer>
  );
};

export default Footer;

