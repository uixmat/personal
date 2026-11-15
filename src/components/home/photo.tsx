import Image from "next/image";

/** A square photo, high-contrast mono with light grain (decided 15 Nov 2026). */
export function Photo({
  src,
  alt,
  position = "50% 50%",
}: {
  src: string;
  alt: string;
  position?: string;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden">
      <Image
        alt={alt}
        className="object-cover"
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        src={src}
        style={{
          filter: "grayscale(1) contrast(1.6) brightness(1.06)",
          objectPosition: position,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[length:160px_160px] bg-[url(/grain.svg)] opacity-30 mix-blend-overlay"
      />
    </div>
  );
}
