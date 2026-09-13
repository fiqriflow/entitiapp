"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export type HeroBanner = {
  id: string;
  image_url: string;
  link_url: string | null;
};

export default function HeroBannerCarousel({
  banners,
}: {
  banners: HeroBanner[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  if (banners.length === 0) return null;

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth no-scrollbar"
      >
        {banners.map((b, i) => {
          const content = (
            <Image
              src={b.image_url}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover"
            />
          );
          return (
            <div
              key={b.id}
              className="relative aspect-[2.5/1] w-full shrink-0 snap-center overflow-hidden rounded-xl"
            >
              {b.link_url ? (
                <a href={b.link_url} className="block h-full w-full">
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => goTo(i)}
              aria-label={`Banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? "w-4 bg-brand" : "w-1.5 bg-black/15"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
