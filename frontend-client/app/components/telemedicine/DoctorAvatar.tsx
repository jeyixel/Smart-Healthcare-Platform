"use client";

import Image from "next/image";
import { useState } from "react";

interface DoctorAvatarProps {
  src: string | null;
  alt: string;
}

const FALLBACK_SRC = "/images/doctor-generic.svg";

export default function DoctorAvatar({ src, alt }: DoctorAvatarProps) {
  const [currentSrc, setCurrentSrc] = useState(src || FALLBACK_SRC);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={72}
      height={72}
      className="h-[72px] w-[72px] rounded-xl object-cover bg-[#f2f3fc]"
      onError={() => setCurrentSrc(FALLBACK_SRC)}
    />
  );
}


