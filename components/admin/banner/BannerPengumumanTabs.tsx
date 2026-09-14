"use client";

import { useState } from "react";
import BannerListClient from "./BannerListClient";
import type { BannerRow } from "./BannerFormModal";
import AnnouncementListClient from "./AnnouncementListClient";
import type { AnnouncementRow } from "./AnnouncementFormModal";

export default function BannerPengumumanTabs({
  heroBanners,
  mabarHeaderBanners,
  announcements,
}: {
  heroBanners: BannerRow[];
  mabarHeaderBanners: BannerRow[];
  announcements: AnnouncementRow[];
}) {
  const [tab, setTab] = useState<"banner" | "mabar_header" | "pengumuman">(
    "banner"
  );

  return (
    <div>
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
        <button
          onClick={() => setTab("banner")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
            tab === "banner" ? "bg-white text-ink shadow-sm" : "text-ink/50"
          }`}
        >
          Hero Banner
        </button>
        <button
          onClick={() => setTab("mabar_header")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
            tab === "mabar_header"
              ? "bg-white text-ink shadow-sm"
              : "text-ink/50"
          }`}
        >
          Header Mabar
        </button>
        <button
          onClick={() => setTab("pengumuman")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
            tab === "pengumuman"
              ? "bg-white text-ink shadow-sm"
              : "text-ink/50"
          }`}
        >
          Pengumuman
        </button>
      </div>

      <div className="mt-4">
        {tab === "banner" && (
          <BannerListClient banners={heroBanners} purpose="beranda" />
        )}
        {tab === "mabar_header" && (
          <>
            <p className="mb-3 text-xs text-ink/50">
              Gambar ini muncul sebagai header di semua halaman detail mabar.
              Kalau lebih dari satu aktif, yang urutannya paling kecil yang
              dipakai.
            </p>
            <BannerListClient
              banners={mabarHeaderBanners}
              purpose="mabar_detail"
            />
          </>
        )}
        {tab === "pengumuman" && (
          <AnnouncementListClient announcements={announcements} />
        )}
      </div>
    </div>
  );
}
