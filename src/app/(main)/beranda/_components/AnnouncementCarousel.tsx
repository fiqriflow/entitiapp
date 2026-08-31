"use client";

import { useRef, useState } from "react";

export type Announcement = {
  id: string;
  title: string;
  content: string | null;
};

export default function AnnouncementCarousel({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  };

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  if (announcements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/10 bg-white p-4 text-center text-sm text-ink/40">
        Belum ada pengumuman.
      </div>
    );
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {announcements.map((a) => (
          <div
            key={a.id}
            className="w-full shrink-0 snap-center rounded-xl border border-black/10 bg-gradient-to-br from-brand-light to-white p-4"
          >
            <p className="text-sm font-semibold text-ink">{a.title}</p>
            {a.content && (
              <p className="mt-1 text-sm text-ink/60">{a.content}</p>
            )}
          </div>
        ))}
      </div>

      {announcements.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {announcements.map((a, i) => (
            <button
              key={a.id}
              onClick={() => goTo(i)}
              aria-label={`Pengumuman ${i + 1}`}
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
