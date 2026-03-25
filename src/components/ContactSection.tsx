import { motion } from "framer-motion";
import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDialNumber, useSiteContent } from "@/content/siteContent";

const ContactSection = () => {
  const { content } = useSiteContent();

  return (
    <section id="contact" className="py-20 md:py-28 bg-muted/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary bg-accent px-4 py-1.5 rounded-full mb-4">
            {content.contact.eyebrow}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">{content.contact.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{content.contact.description}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-12">
          {content.contact.clinics.map((clinic, idx) => (
            <motion.div
              key={clinic.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="bg-card rounded-2xl border border-border p-5 sm:p-6 md:p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                  clinic.color === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                }`}
              >
                {clinic.subtitle}
              </div>

              <h3 className="font-heading font-bold text-foreground text-xl mb-1">{clinic.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{clinic.doctor}</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 text-foreground flex-shrink-0" />
                  <span className="min-w-0 flex flex-wrap gap-x-3 gap-y-1 break-words">
                    {clinic.phones.map((phone, phoneIndex) => (
                      <a
                        key={phone}
                        href={`tel:${getDialNumber(phone)}`}
                        className="hover:text-primary transition-colors"
                      >
                        {phone}
                        {phoneIndex < clinic.phones.length - 1 ? " /" : ""}
                      </a>
                    ))}
                  </span>
                </div>
                <a
                  href={`mailto:${clinic.email}`}
                  className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-foreground" />
                  <span className="break-all">{clinic.email}</span>
                </a>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-foreground" />
                  <span>{clinic.hours}</span>
                </div>
              </div>

              <Button
                asChild
                className={`w-full mt-6 gap-2 ${
                  clinic.color === "primary"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                }`}
              >
                <a href={`tel:${getDialNumber(content.contact.appointmentNumber)}`}>
                  <Phone className="w-4 h-4" />
                  Call for Appointment
                </a>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="w-full h-[300px]">
              <iframe
                src={content.contact.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${content.branding.siteName} Location`}
              />
            </div>
            <div className="p-5 sm:p-6 md:p-8 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-foreground text-lg mb-2">{content.contact.locationTitle}</h3>
              <p className="text-muted-foreground mb-4">
                {content.contact.addressLines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              <Button asChild variant="outline" className="gap-2 border-border text-foreground hover:bg-accent">
                <a href={content.contact.mapLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  {content.contact.mapButtonLabel}
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;

