"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** One hero photo at a time, cross-fading every 6s; dots for manual control. */
export function HeroPhotoSlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % images.length), 6000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          quality={90}
          className="object-cover motion-safe:transition-[opacity,transform]"
          style={{
            opacity: i === active ? 1 : 0,
            transform: i === active ? "scale(1.07)" : "scale(1)",
            transitionDuration: i === active ? "1000ms, 7000ms" : "1000ms, 0ms",
            transitionTimingFunction: "ease-out",
          }}
          sizes="100vw"
        />
      ))}
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-10 z-[3] flex justify-center gap-2 sm:bottom-14">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all ${i === active ? "w-7 bg-[#efeae0]" : "w-2 bg-[#efeae0]/55"}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
