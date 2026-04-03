import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import clinicHero from "@/assets/clinic-hero.jpg";
import dentalImg from "@/assets/dental-service.jpg";
import sonographyImg from "@/assets/sonography-service.jpg";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type ColorKey = "primary" | "secondary";
export type GalleryCategory = "Facility" | "Event";
export type IconKey =
  | "baby"
  | "scan"
  | "stethoscope"
  | "smile"
  | "wrench"
  | "sparkles"
  | "shield"
  | "heart"
  | "clock"
  | "users";

export interface HeroStat {
  number: string;
  label: string;
}

export interface ServiceItem {
  icon: IconKey;
  title: string;
  description: string;
  image: string;
}

export interface ServiceCategory {
  id: string;
  category: string;
  color: ColorKey;
  image: string;
  description: string;
  items: ServiceItem[];
}

export interface DoctorItem {
  id: string;
  name: string;
  title: string;
  qualifications: string;
  certification: string;
  clinic: string;
  specialties: string[];
  color: ColorKey;
  initials: string;
}

export interface AboutHighlight {
  icon: IconKey;
  title: string;
  description: string;
}

export interface ClinicContact {
  id: string;
  name: string;
  subtitle: string;
  doctor: string;
  phones: string[];
  appointmentNumber?: string;
  email: string;
  hours: string;
  color: ColorKey;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  description: string;
  image: string;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
}

export interface SiteContent {
  branding: {
    siteName: string;
    shortName: string;
    tagLine: string;
    logoText: string;
    logoImage: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    location: string;
    hours: string;
    backgroundImage: string;
    stats: HeroStat[];
  };
  services: {
    eyebrow: string;
    title: string;
    description: string;
    categories: ServiceCategory[];
  };
  gallery: {
    eyebrow: string;
    title: string;
    description: string;
    filters: GalleryCategory[];
    items: GalleryItem[];
  };
  doctors: {
    eyebrow: string;
    title: string;
    description: string;
    items: DoctorItem[];
  };
  about: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    paragraphs: string[];
    highlights: AboutHighlight[];
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    callNumber: string;
    appointmentNumber: string;
    clinics: ClinicContact[];
    mapEmbedUrl: string;
    mapLink: string;
    locationTitle: string;
    addressLines: string[];
    mapButtonLabel: string;
  };
  footer: {
    description: string;
    email: string;
    phones: string[];
    address: string;
    copyrightName: string;
    socialLinks: SocialLinks;
  };
}

const STORAGE_KEY = "karwande-site-content";
const OLD_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3755.123!2d75.5947!3d19.5128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdcee37be49f4e1%3A0x5e1c17e7c0d8f3a2!2sDr.%20Karwande%20Diagnostic%20%26%20Ekdant%20dental%20care!5e0!3m2!1sen!2sin!4v1711000000000!5m2!1sen!2sin";
const NEW_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3406.5864706053476!2d75.2170901!3d19.3517998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdb5dd9a8c3931f%3A0xda7f6d60bc6aa723!2sDr.%20Karwande%20Diagnostic%20%26%20Ekdant%20dental%20care!5e1!3m2!1sen!2sin!4v1774149863566!5m2!1sen!2sin";
const SERVICE_IMAGE_3D4D =
  "https://images.pexels.com/photos/7108418/pexels-photo-7108418.jpeg?auto=compress&cs=tinysrgb&w=900&h=675&fit=crop";
const SERVICE_IMAGE_DOPPLER =
  "https://images.pexels.com/photos/7108427/pexels-photo-7108427.jpeg?auto=compress&cs=tinysrgb&w=900&h=675&fit=crop";
const SERVICE_IMAGE_FETAL =
  "https://images.pexels.com/photos/7089394/pexels-photo-7089394.jpeg?auto=compress&cs=tinysrgb&w=900&h=675&fit=crop";
const SERVICE_IMAGE_PERIODONTICS =
  "https://images.pexels.com/photos/5355837/pexels-photo-5355837.jpeg?auto=compress&cs=tinysrgb&w=900&h=675&fit=crop";
const SERVICE_IMAGE_IMPLANTS =
  "https://images.pexels.com/photos/6502305/pexels-photo-6502305.jpeg?auto=compress&cs=tinysrgb&w=900&h=675&fit=crop";
const SERVICE_IMAGE_MULTISPECIALITY =
  "https://images.pexels.com/photos/5452254/pexels-photo-5452254.jpeg?auto=compress&cs=tinysrgb&w=900&h=675&fit=crop";
const GALLERY_IMAGE_WAITING_AREA =
  "https://images.pexels.com/photos/8459996/pexels-photo-8459996.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop";
const GALLERY_IMAGE_SONOGRAPHY_ROOM =
  "https://images.pexels.com/photos/7108402/pexels-photo-7108402.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop";
const GALLERY_IMAGE_DENTAL_ROOM =
  "https://images.pexels.com/photos/4269276/pexels-photo-4269276.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop";
const GALLERY_IMAGE_CONSULTATION_ROOM =
  "https://images.pexels.com/photos/12454146/pexels-photo-12454146.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop";
const GALLERY_IMAGE_SUPPORT_DESK =
  "https://images.pexels.com/photos/6234630/pexels-photo-6234630.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop";
const GALLERY_IMAGE_AWARENESS_CAMP =
  "https://images.pexels.com/photos/23625648/pexels-photo-23625648.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop";
const GALLERY_IMAGE_WORKSHOP =
  "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop";
const GALLERY_IMAGE_DENTAL_EVENT =
  "https://images.pexels.com/photos/5355863/pexels-photo-5355863.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop";
const GALLERY_IMAGE_EDUCATION_SESSION =
  "https://images.pexels.com/photos/6234614/pexels-photo-6234614.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop";

const KNOWN_ASSET_URLS: Array<[pattern: string, resolved: string]> = [
  ["clinic-hero", clinicHero],
  ["dental-service", dentalImg],
  ["sonography-service", sonographyImg],
];

export const defaultSiteContent: SiteContent = {
  branding: {
    siteName: "Karwande Healthcare",
    shortName: "Karwande",
    tagLine: "Healthcare",
    logoText: "K",
    logoImage: "",
  },
  hero: {
    badge: "Trusted Healthcare in Shevgaon",
    titleStart: "Your Complete",
    titleHighlight: "Healthcare",
    titleEnd: "Destination",
    description:
      "Advanced Sonography & Diagnostic Centre combined with Multispeciality Dental Care all under one trusted name. Dr. Karwande Healthcare.",
    primaryCtaLabel: "Book Appointment",
    secondaryCtaLabel: "Our Services",
    location: "Miri Rd, Laxmi Nagar, Shevgaon",
    hours: "Mon - Sun: 9 AM - 9 PM",
    backgroundImage: clinicHero,
    stats: [
      { number: "15+", label: "Years Experience" },
      { number: "10K+", label: "Happy Patients" },
      { number: "3D/4D", label: "Sonography" },
      { number: "100%", label: "Patient Care" },
    ],
  },
  services: {
    eyebrow: "What We Offer",
    title: "Our Specialized Services",
    description:
      "Two specialized medical practices under one trusted family delivering excellence in diagnostics and dental healthcare.",
    categories: [
      {
        id: "service-sonography",
        category: "Sonography & Diagnostics",
        color: "primary",
        image: sonographyImg,
        description:
          "State-of-the-art diagnostic imaging centre equipped with the latest 3D/4D ultrasound and Colour Doppler technology, led by UK-certified fetal medicine specialist Dr. Amol Karwande.",
        items: [
          { icon: "baby", title: "3D/4D Sonography", description: "State-of-the-art 3D and 4D ultrasound imaging for detailed fetal monitoring and diagnostics.", image: SERVICE_IMAGE_3D4D },
          { icon: "scan", title: "Colour Doppler", description: "Advanced colour doppler studies for blood flow assessment and vascular diagnostics.", image: SERVICE_IMAGE_DOPPLER },
          { icon: "stethoscope", title: "Fetal Medicine", description: "UK-certified fetal medicine expertise for comprehensive prenatal care and assessment.", image: SERVICE_IMAGE_FETAL },
        ],
      },
      {
        id: "service-dental",
        category: "Dental Care",
        color: "secondary",
        image: dentalImg,
        description:
          "Modern multispeciality dental clinic offering comprehensive oral healthcare from periodontics and implants to cosmetic dentistry led by Dr. Rutuja Karwande (Kale), M.D.S.",
        items: [
          { icon: "smile", title: "Periodontics", description: "Expert treatment for gum diseases, ensuring healthy gums and strong teeth foundations.", image: SERVICE_IMAGE_PERIODONTICS },
          { icon: "wrench", title: "Dental Implants", description: "Permanent tooth replacement solutions with advanced implant technology and precision.", image: SERVICE_IMAGE_IMPLANTS },
          { icon: "sparkles", title: "Multispeciality Care", description: "Comprehensive dental treatments including cosmetic dentistry, root canals, and orthodontics.", image: SERVICE_IMAGE_MULTISPECIALITY },
        ],
      },
    ],
  },
  gallery: {
    eyebrow: "Our Gallery",
    title: "A Closer Look At Our Center",
    description: "A visual section where your client can manage facility and event photos for the center.",
    filters: ["Facility", "Event"],
    items: [
      { id: "gallery-1", title: "Reception & Waiting Area", category: "Facility", description: "Warm, welcoming space designed for patient comfort and easy check-in.", image: GALLERY_IMAGE_WAITING_AREA },
      { id: "gallery-2", title: "Advanced Sonography Room", category: "Facility", description: "Dedicated imaging setup for detailed scans and careful diagnostic review.", image: GALLERY_IMAGE_SONOGRAPHY_ROOM },
      { id: "gallery-3", title: "Dental Care Setup", category: "Facility", description: "Clean treatment area prepared for precision-led dental care.", image: GALLERY_IMAGE_DENTAL_ROOM },
      { id: "gallery-4", title: "Consultation Corner", category: "Facility", description: "A well-organized consultation space for guided patient discussions and checkups.", image: GALLERY_IMAGE_CONSULTATION_ROOM },
      { id: "gallery-5", title: "Diagnostic Support Desk", category: "Facility", description: "An efficient front-desk and support area for patient coordination and smooth visits.", image: GALLERY_IMAGE_SUPPORT_DESK },
      { id: "gallery-6", title: "Health Awareness Camp", category: "Event", description: "Community-focused care initiatives and patient engagement moments from the center.", image: GALLERY_IMAGE_AWARENESS_CAMP },
      { id: "gallery-7", title: "Diagnostic Workshop Day", category: "Event", description: "A professional look at educational and outreach activities hosted by the clinic.", image: GALLERY_IMAGE_WORKSHOP },
      { id: "gallery-8", title: "Dental Consultation Camp", category: "Event", description: "Showcase moments for special dental drives, camps, and patient support events.", image: GALLERY_IMAGE_DENTAL_EVENT },
      { id: "gallery-9", title: "Patient Education Session", category: "Event", description: "Informative sessions designed to build awareness around diagnostics and oral health.", image: GALLERY_IMAGE_EDUCATION_SESSION },
      { id: "gallery-10", title: "Center Milestone Celebration", category: "Event", description: "Highlights from important center events, team gatherings, and patient community moments.", image: clinicHero },
      { id: "gallery-11", title: "Special Checkup Drive", category: "Event", description: "Snapshots from special health drives organized to support patients with timely care.", image: dentalImg },
    ],
  },
  doctors: {
    eyebrow: "Meet Our Doctors",
    title: "Expert Care You Can Trust",
    description: "A husband-and-wife team combining expertise in diagnostics and dental care to serve the Shevgaon community.",
    items: [
      { id: "doctor-1", name: "Dr. Amol Karwande", title: "Sonologist & Diagnostician", qualifications: "M.B.B.S., D.M.R.E. (Mumbai)", certification: "Fetal Medicine Foundation UK Certified", clinic: "Dr. Karwande Diagnostic", specialties: ["3D/4D Sonography", "Colour Doppler", "Fetal Medicine"], color: "primary", initials: "AK" },
      { id: "doctor-2", name: "Dr. Rutuja Amol Karwande (Kale)", title: "Periodontist & Implantologist", qualifications: "B.D.S., M.D.S.", certification: "Reg. No. A-27775", clinic: "Dr. R.K.'s Ekdant Dental Care", specialties: ["Periodontics", "Dental Implants", "Multispeciality Dentistry"], color: "secondary", initials: "RK" },
    ],
  },
  about: {
    eyebrow: "About Us",
    title: "A Legacy of Care in",
    titleHighlight: "Shevgaon",
    paragraphs: [
      "Dr. Karwande Healthcare brings together two specialized medical practices to serve the Shevgaon community and surrounding areas in Ahmednagar district.",
      "Dr. Karwande Diagnostic is an advanced sonography clinic led by Dr. Amol Karwande, offering state-of-the-art 3D/4D sonography and colour doppler services with UK-certified fetal medicine expertise.",
      "Dr. R.K.'s Ekdant Dental Care is a multispeciality dental clinic led by Dr. Rutuja Karwande (Kale), providing expert periodontics, dental implants, and comprehensive dental treatments.",
    ],
    highlights: [
      { icon: "shield", title: "Trusted Expertise", description: "UK-certified fetal medicine specialist and registered dental surgeon providing reliable care." },
      { icon: "heart", title: "Patient-First Approach", description: "We prioritize your comfort and well-being with compassionate and personalized treatment." },
      { icon: "clock", title: "Convenient Hours", description: "Open 7 days a week, 9 AM to 9 PM because your health does not follow a schedule." },
      { icon: "users", title: "Family Healthcare", description: "From prenatal diagnostics to dental care, we serve the entire family under one roof." },
    ],
  },
  contact: {
    eyebrow: "Get In Touch",
    title: "Contact Us",
    description: "Reach out to us for appointments or inquiries. We're here to help with all your healthcare needs.",
    callNumber: "9405 568 568",
    appointmentNumber: "9405 568 568",
    clinics: [
      { id: "clinic-1", name: "Dr. Karwande Diagnostic", subtitle: "Advanced Sonography Clinic", doctor: "Dr. Amol Karwande", phones: ["02429-222020", "9405 568 568"], appointmentNumber: "9405 568 568", email: "DrkarwandeDiagnostic@gmail.com", hours: "Monday - Sunday, 9 AM - 9 PM", color: "primary" },
      { id: "clinic-2", name: "Dr. R.K.'s Ekdant Dental Care", subtitle: "Multispeciality Dental Clinic", doctor: "Dr. Rutuja Karwande (Kale)", phones: ["8999482897"], appointmentNumber: "8999482897", email: "rpk224455@gmail.com", hours: "Contact for appointment", color: "secondary" },
    ],
    mapEmbedUrl: NEW_MAP_EMBED_URL,
    mapLink: "https://maps.app.goo.gl/ZKgcXMvWgj4wLRtDA",
    locationTitle: "Our Location",
    addressLines: ["Miri Rd, Laxmi Nagar, Shevgaon,", "Maharashtra 414502, India"],
    mapButtonLabel: "Open in Google Maps",
  },
  footer: {
    description: "Advanced Sonography & Diagnostics combined with Multispeciality Dental Care in Shevgaon, Ahmednagar.",
    email: "DrkarwandeDiagnostic@gmail.com",
    phones: ["9405 568 568", "8999 48 2897"],
    address: "Miri Rd, Laxmi Nagar, Shevgaon, Maharashtra 414502",
    copyrightName: "Karwande Healthcare",
    socialLinks: {
      instagram: "",
      facebook: "",
      youtube: "",
      linkedin: "",
    },
  },
};

interface SiteContentContextValue {
  content: SiteContent;
  loading: boolean;
  updateContent: (next: SiteContent) => void;
  saveContent: (next: SiteContent) => Promise<void>;
  resetContent: () => void;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

function normalizeContent(value: SiteContent) {
  if (value.contact.mapEmbedUrl === OLD_MAP_EMBED_URL) {
    value.contact.mapEmbedUrl = NEW_MAP_EMBED_URL;
  }

  value.contact.callNumber =
    value.contact.callNumber?.trim() ||
    value.contact.clinics?.[0]?.phones?.[0] ||
    value.footer.phones?.[0] ||
    defaultSiteContent.contact.callNumber;
  value.contact.appointmentNumber =
    value.contact.appointmentNumber?.trim() ||
    value.contact.clinics?.[0]?.phones?.[0] ||
    value.footer.phones?.[0] ||
    defaultSiteContent.contact.appointmentNumber;

  value.contact.clinics = (value.contact.clinics || []).map((clinic, clinicIndex) => ({
    ...clinic,
    appointmentNumber:
      clinic.appointmentNumber?.trim() ||
      clinic.phones?.[0] ||
      (clinicIndex === 1 ? "8999482897" : value.contact.appointmentNumber),
  }));

  value.branding.logoImage = normalizeImageUrl(value.branding.logoImage, "");
  value.hero.backgroundImage = normalizeImageUrl(value.hero.backgroundImage, defaultSiteContent.hero.backgroundImage);

  value.footer.socialLinks = {
    instagram: value.footer.socialLinks?.instagram ?? defaultSiteContent.footer.socialLinks.instagram,
    facebook: value.footer.socialLinks?.facebook ?? defaultSiteContent.footer.socialLinks.facebook,
    youtube: value.footer.socialLinks?.youtube ?? defaultSiteContent.footer.socialLinks.youtube,
    linkedin: value.footer.socialLinks?.linkedin ?? defaultSiteContent.footer.socialLinks.linkedin,
  };

  value.services.categories = value.services.categories.map((category, categoryIndex) => ({
    ...category,
    image: normalizeImageUrl(category.image, defaultSiteContent.services.categories[categoryIndex]?.image || defaultSiteContent.hero.backgroundImage),
    items: category.items.map((item, itemIndex) => ({
      ...item,
      image: normalizeImageUrl(
        item.image,
        defaultSiteContent.services.categories[categoryIndex]?.items[itemIndex]?.image ||
          category.image ||
          defaultSiteContent.hero.backgroundImage,
      ),
    })),
  }));

  value.gallery.items = value.gallery.items.map((item, itemIndex) => ({
    ...item,
    image: normalizeImageUrl(item.image, defaultSiteContent.gallery.items[itemIndex]?.image || defaultSiteContent.hero.backgroundImage),
  }));

  return value;
}

function readStoredContent() {
  if (typeof window === "undefined") {
    return defaultSiteContent;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultSiteContent;
  }

  try {
    return normalizeContent(JSON.parse(raw) as SiteContent);
  } catch {
    return defaultSiteContent;
  }
}

async function fetchRemoteContent() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from("site_content").select("content").eq("id", "main").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.content ? normalizeContent(data.content as SiteContent) : null;
}

async function persistRemoteContent(next: SiteContent) {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("site_content").upsert(
    {
      id: "main",
      content: next,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => readStoredContent());
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    fetchRemoteContent()
      .then((remoteContent) => {
        if (!active) {
          return;
        }

        if (remoteContent) {
          setContent(remoteContent);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteContent));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const saveContent = async (next: SiteContent) => {
    const normalized = normalizeContent(cloneDeep(next));

    if (isSupabaseConfigured) {
      await persistRemoteContent(normalized);
    }

    setContent(normalized);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  };

  const value = useMemo(
    () => ({
      content,
      loading,
      updateContent: setContent,
      saveContent,
      resetContent: () => setContent(defaultSiteContent),
    }),
    [content, loading],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }

  return context;
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDialNumber(value: string | undefined) {
  return (value || "").replace(/[^\d+]/g, "");
}

function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeImageUrl(value: string | undefined, fallback: string) {
  const url = (value || "").trim();
  if (!url) {
    return fallback;
  }

  for (const [pattern, resolved] of KNOWN_ASSET_URLS) {
    if (url.includes(pattern)) {
      return resolved;
    }
  }

  if (
    url.startsWith("blob:") ||
    url.startsWith("file:") ||
    url.includes("://localhost") ||
    url.includes("://127.0.0.1") ||
    url.includes("://0.0.0.0") ||
    url.startsWith("/src/assets/")
  ) {
    return fallback;
  }

  return url;
}














