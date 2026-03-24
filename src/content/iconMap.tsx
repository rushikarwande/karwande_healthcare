import { Baby, Clock, Heart, Scan, Shield, Smile, Sparkles, Stethoscope, Users, Wrench, type LucideIcon } from "lucide-react";
import type { IconKey } from "@/content/siteContent";

export const iconMap: Record<IconKey, LucideIcon> = {
  baby: Baby,
  scan: Scan,
  stethoscope: Stethoscope,
  smile: Smile,
  wrench: Wrench,
  sparkles: Sparkles,
  shield: Shield,
  heart: Heart,
  clock: Clock,
  users: Users,
};

export const iconOptions: { label: string; value: IconKey }[] = [
  { label: "Baby", value: "baby" },
  { label: "Scan", value: "scan" },
  { label: "Stethoscope", value: "stethoscope" },
  { label: "Smile", value: "smile" },
  { label: "Wrench", value: "wrench" },
  { label: "Sparkles", value: "sparkles" },
  { label: "Shield", value: "shield" },
  { label: "Heart", value: "heart" },
  { label: "Clock", value: "clock" },
  { label: "Users", value: "users" },
];
