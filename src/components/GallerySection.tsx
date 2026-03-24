import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { useSiteContent } from "@/content/siteContent";
import clinicHero from "@/assets/clinic-hero.jpg";
import SafeImage from "@/components/SafeImage";

const GallerySection = () => {
  const { content } = useSiteContent();
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(9);

  const filters = ["All", ...content.gallery.filters];

  const filteredImages = useMemo(() => {
    if (activeFilter === "All") {
      return content.gallery.items;
    }

    return content.gallery.items.filter((item) => item.category === activeFilter);
  }, [activeFilter, content.gallery.items]);

  useEffect(() => {
    setVisibleCount(9);
  }, [activeFilter]);

  const visibleImages = filteredImages.slice(0, visibleCount);
  const hasMoreImages = filteredImages.length > visibleCount;

  return (
    <section id="gallery" className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-accent px-4 py-1.5 rounded-full mb-4">
            <ImageIcon className="w-4 h-4" />
            {content.gallery.eyebrow}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">{content.gallery.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{content.gallery.description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-primary"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleImages.map((item, idx) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm group"
            >
              <div className="relative overflow-hidden h-[320px]">
                <SafeImage
                  src={item.image}
                  fallbackSrc={clinicHero}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/25 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-heading text-xl font-semibold text-background mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-background/75">{item.description}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {hasMoreImages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 flex justify-center"
          >
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 9)}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
            >
              View More
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
