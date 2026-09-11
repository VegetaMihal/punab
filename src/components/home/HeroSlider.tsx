"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** Auto-rotating hero background. Cross-fades between photos every 6s; single photo just holds still. */
export function HeroSlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % images.length), 6000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          className="object-cover transition-[opacity,transform] duration-1000 ease-in-out"
          style={{
            opacity: i === active ? 1 : 0,
            transform: i === active ? "scale(1.08)" : "scale(1)",
            transitionDuration: i === active ? "1000ms, 6000ms" : "1000ms, 0ms",
          }}
          sizes="100vw"
          quality={90}
          priority={i === 0}
        />
      ))}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.35)_28%,transparent_50%,transparent_75%,rgba(0,0,0,0.5)_100%)]" />
      {images.length > 1 && (
        <div className="pointer-events-auto absolute bottom-6 left-1/2 z-[1] flex -translate-x-1/2 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
