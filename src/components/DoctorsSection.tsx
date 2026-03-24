import { motion } from "framer-motion";
import { Award, BadgeCheck, GraduationCap } from "lucide-react";
import { useSiteContent } from "@/content/siteContent";

const DoctorsSection = () => {
  const { content } = useSiteContent();

  return (
    <section id="doctors" className="py-20 md:py-28 bg-muted/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary bg-accent px-4 py-1.5 rounded-full mb-4">
            {content.doctors.eyebrow}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.doctors.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{content.doctors.description}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {content.doctors.items.map((doctor, idx) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`h-2 ${doctor.color === "primary" ? "bg-primary" : "bg-secondary"}`} />
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      doctor.color === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    <span className="font-heading font-bold text-xl">{doctor.initials}</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground text-lg leading-snug">{doctor.name}</h3>
                    <p className={`text-sm font-medium ${doctor.color === "primary" ? "text-primary" : "text-secondary"}`}>
                      {doctor.title}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4 flex-shrink-0 text-foreground" />
                    <span>{doctor.qualifications}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Award className="w-4 h-4 flex-shrink-0 text-foreground" />
                    <span>{doctor.certification}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <BadgeCheck className="w-4 h-4 flex-shrink-0 text-foreground" />
                    <span>{doctor.clinic}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {doctor.specialties.map((spec) => (
                    <span
                      key={spec}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                        doctor.color === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                      }`}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
