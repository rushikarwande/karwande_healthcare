import { useEffect } from "react";
import { useSiteContent } from "@/content/siteContent";

function createFallbackFavicon(letter: string) {
  const safeLetter = (letter || "K").trim().slice(0, 1).toUpperCase() || "K";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="16" fill="#0f766e" />
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="700">
        ${safeLetter}
      </text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const BrandFavicon = () => {
  const { content } = useSiteContent();

  useEffect(() => {
    const href = content.branding.logoImage || createFallbackFavicon(content.branding.logoText);
    let icon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }

    icon.href = href;
    icon.type = href.startsWith("data:image/svg+xml") ? "image/svg+xml" : "image/png";
  }, [content.branding.logoImage, content.branding.logoText]);

  return null;
};

export default BrandFavicon;
