import { motion } from "framer-motion";
import { useSiteContent } from "@/content/siteContent";
import { iconMap } from "@/content/iconMap";
import clinicHero from "@/assets/clinic-hero.jpg";
import dentalImg from "@/assets/dental-service.jpg";
import sonographyImg from "@/assets/sonography-service.jpg";
import SafeImage from "@/components/SafeImage";

const categoryFallbacks = [sonographyImg, dentalImg];
const serviceFallbacks = [
  [sonographyImg, sonographyImg, sonographyImg],
  [dentalImg, dentalImg, dentalImg],
];

const ServicesSection = () => {
  const { content } = useSiteContent();

  return (
    <section id="services" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary bg-accent px-4 py-1.5 rounded-full mb-4">
            {content.services.eyebrow}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.services.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{content.services.description}</p>
        </motion.div>

        <div className="space-y-20">
          {content.services.categories.map((category, catIdx) => (
            <div key={category.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative rounded-3xl overflow-hidden mb-10 group"
              >
                <SafeImage
                  src={category.image}
                  fallbackSrc={categoryFallbacks[catIdx] || clinicHero}
                  alt={category.category}
                  className="w-full h-[280px] md:h-[340px] object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy" decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-background mb-2">
                    {category.category}
                  </h3>
                  <p className="text-background/80 max-w-2xl text-sm md:text-base leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {category.items.map((service, idx) => {
                  const Icon = iconMap[service.icon];

                  return (
                    <motion.div
                      key={`${category.id}-${service.title}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <SafeImage
                          src={service.image}
                          fallbackSrc={serviceFallbacks[catIdx]?.[idx] || categoryFallbacks[catIdx] || clinicHero}
                          alt={service.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy" decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />
                        <div
                          className={`absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl shadow-lg ${
                            catIdx === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="font-heading font-semibold text-foreground mb-2 text-lg">{service.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

