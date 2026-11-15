// Copy shared by every variant — real content, so the comparison is fair.
export interface SetupItem {
  brand: string;
  href: string;
  name: string;
  role: string;
}

export const SETUP: SetupItem[] = [
  {
    role: "Jacket",
    name: "Jones Deeper GORE-TEX",
    brand: "jonessnowboards.com",
    href: "https://eu.jonessnowboards.com/products/men-s-deeper-goretex-insulated-jacket?variant=44791621615751",
  },
  {
    role: "Bibs",
    name: "Jones Higher GORE-TEX 3L",
    brand: "jonessnowboards.com",
    href: "https://eu.jonessnowboards.com/products/men-s-higher-goretex-3l-bibs?variant=44791553327239",
  },
  {
    role: "Goggles",
    name: "Out Of Electra 3",
    brand: "out-of.com",
    href: "https://out-of.com/product/electra-3/",
  },
  {
    role: "All-mountain board",
    name: "CAPiTA Super D.O.A.",
    brand: "capitasnowboarding.com",
    href: "https://eu.capitasnowboarding.com/en-bg/products/capita-super-d-o-a-mens-snowboard-2027?variant=55656797045121",
  },
  {
    role: "All-mountain bindings",
    name: "Burton Step On X Re:Flex",
    brand: "burton.com",
    href: "https://eu.burton.com/en-bg/products/mens-burton-step-on-x-re-flex-snowboard-bindings-222841",
  },
  {
    role: "Backcountry board",
    name: "CAPiTA Slush Slashers 2.0",
    brand: "capitasnowboarding.com",
    href: "https://skipro.com/products/sb-slush-slashers-2-0-56w",
  },
  {
    role: "Backcountry bindings",
    name: "Union Ultra",
    brand: "unionbindingcompany.com",
    href: "https://www.blue-tomato.com/en-BG/product/UNION-Ultra+Men+s+2027+Snowboard+Bindings-774203/",
  },
];

export const LAUNCHES = [
  {
    name: "Cal AI",
    note: "An agentic assistant that understands the context of your calendar.",
  },
  { name: "Cal Events", note: "Events, hosted and booked on Cal." },
  {
    name: "Cal Discover",
    note: "Services people list on their Cal become discoverable.",
  },
  { name: "Cal Desktop", note: "Cal.com as a native app on your desk." },
  { name: "Cal Mobile", note: "Cal.com in your pocket." },
];

export const VALA_SPECS = [
  ["Frame", "Carbon CC"],
  ["Fork", "FOX 36 Float Factory, 160 mm"],
  ["Shock", "FOX Float X Factory, 150 mm"],
  ["Motor", "Bosch Performance CX"],
  ["Drivetrain", "SRAM XX Eagle AXS T-Type"],
  ["Brakes", "SRAM Maven Silver, 200 mm"],
  ["Wheels", "Reserve 30|HD Carbon"],
  ["Weight", "20.64 kg"],
] as const;
