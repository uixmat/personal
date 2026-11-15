export const site = {
  name: "Matt Litherland",
  handle: "uixmat",
  url: "https://uixmat.dev",
  role: "Design engineer",
  location: "Veliko Tarnovo, Bulgaria",
  github: "https://github.com/uixmat",
  x: "https://x.com/uixmat",
  instagram: "https://www.instagram.com/army.burning/",
} as const;

export interface Project {
  description: string;
  href: string;
  meta: string;
  name: string;
}

export const projects: Project[] = [
  {
    name: "Bklit UI",
    description: "Open-source chart and data-viz components for React.",
    href: "https://bklit.com",
    meta: "bklit.com",
  },
  {
    name: "Onborda",
    description: "Animated onboarding flows and product tours for Next.js.",
    href: "https://github.com/uixmat/onborda",
    meta: "1.4k stars",
  },
  {
    name: "shadcn-country-dropdown",
    description: "ISO-compliant country dropdown and phone input components.",
    href: "https://github.com/uixmat/shadcn-country-dropdown",
    meta: "139 stars",
  },
  {
    name: "Firestarta",
    description: "Next.js SaaS boilerplate with auth, billing, and Prisma.",
    href: "https://github.com/uixmat/firestarta",
    meta: "244 stars",
  },
];
