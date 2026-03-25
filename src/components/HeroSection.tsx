import { motion } from "framer-motion";
import { Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDialNumber, useSiteContent } from "@/content/siteContent";
import clinicHero from "@/assets/clinic-hero.jpg";
import SafeImage from "@/components/SafeImage";

const HeroSection = () => {
  const { content } = useSiteContent();
  const dialNumber = getDialNumber(content.contact.appointmentNumber);

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <SafeImage
          src={content.hero.backgroundImage}
          fallbackSrc={clinicHero}
          alt={content.branding.siteName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-background/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-background/20">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium text-background">{content.hero.badge}</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-background leading-tight mb-6">
              {content.hero.titleStart}{" "}
              <span className="text-accent">{content.hero.titleHighlight}</span>{" "}
              {content.hero.titleEnd}
            </h1>

            <p className="text-lg text-background/80 mb-8 max-w-lg leading-relaxed">
              {content.hero.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12 shadow-lg shadow-primary/25"
              >
                <a href={`tel:${dialNumber}`}>
                  <Phone className="w-5 h-5" />
                  {content.hero.primaryCtaLabel}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-background/30 bg-background/5 text-background hover:bg-background/10 hover:text-background text-base px-8 h-12 shadow-lg shadow-foreground/10"
              >
                <a href="#services">{content.hero.secondaryCtaLabel}</a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-background/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>{content.hero.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <span>{content.hero.hours}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
              <div className="relative bg-card/90 backdrop-blur-md rounded-3xl p-8 border border-border/50 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {content.hero.stats.map((stat) => (
                    <StatCard key={stat.label} number={stat.number} label={stat.label} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="bg-accent/50 rounded-2xl p-5 text-center cursor-default"
  >
    <div className="font-heading text-2xl font-bold text-primary mb-1">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

export default HeroSection;


