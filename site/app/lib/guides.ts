import diagnosticMarkdown from "@/content/blogs/desk-setup-diagnostic.md?raw";
import thermalMarkdown from "@/content/blogs/thermal-posture-cable-workflow.md?raw";
import hubMarkdown from "@/content/blogs/usb-c-hub-buying-guide.md?raw";
import editorialMap from "@/data/editorial-map.json";

export type Guide = {
  route: string;
  title: string;
  shortTitle: string;
  description: string;
  image: string;
  imageAlt: string;
  markdown: string;
  role: string;
  primaryKeyword: string;
  faq: { question: string; answer: string }[];
  cta: { label: string; href: string };
};

const mapped = editorialMap.articles;

export const guides: Guide[] = [
  {
    route: "/guides/laptop-desk-setup-diagnostic/",
    title: "The 5-minute laptop desk setup diagnostic",
    shortTitle: "Desk setup diagnostic",
    description: "Name the repeated friction in your laptop desk setup before buying a hub, stand, cooling pad, cable organizer or mouse.",
    image: "/images/blog-desk-setup-diagnostic.webp",
    imageAlt: "A generic five-part laptop desk diagnostic illustrated in Setup Sahla colors",
    markdown: diagnosticMarkdown,
    role: mapped[0].funnelRole,
    primaryKeyword: mapped[0].primaryKeyword,
    faq: mapped[0].faq,
    cta: mapped[0].primaryCta,
  },
  {
    route: "/guides/usb-c-hub-buying-guide-egypt/",
    title: "How to choose a USB-C hub in Egypt",
    shortTitle: "USB-C hub buying guide",
    description: "Build a port-job map for HDMI, data and pass-through power before comparing USB-C hubs in Egypt.",
    image: "/images/blog-usb-c-hub-guide.webp",
    imageAlt: "A generic USB-C hub port-job map illustrated in Setup Sahla colors",
    markdown: hubMarkdown,
    role: mapped[1].funnelRole,
    primaryKeyword: mapped[1].primaryKeyword,
    faq: mapped[1].faq,
    cta: mapped[1].primaryCta,
  },
  {
    route: "/guides/laptop-heat-screen-height-cable-management/",
    title: "Laptop running hot? A three-fix desk workflow",
    shortTitle: "Heat, height & cable workflow",
    description: "Check screen height, airflow space and cable routing as three separate laptop desk problems—without assuming accessory outcomes.",
    image: "/images/blog-thermal-posture-cable-workflow.webp",
    imageAlt: "Three separate generic checks for laptop height, airflow space and cable routing",
    markdown: thermalMarkdown,
    role: mapped[2].funnelRole,
    primaryKeyword: mapped[2].primaryKeyword,
    faq: mapped[2].faq,
    cta: mapped[2].primaryCta,
  },
];

export function getGuide(route: string) {
  const guide = guides.find((entry) => entry.route === route);
  if (!guide) throw new Error(`Missing guide for ${route}`);
  return guide;
}
