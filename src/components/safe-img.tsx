"use client";

import { useEffect, useRef, useState } from "react";

/**
 * <img> que troca por um substituto quando a imagem não carrega.
 * Também cobre o caso em que a falha acontece antes do React assumir a página.
 */
export function SafeImg({
  src,
  fallback,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- origem externa; alt vem nas props
  return <img ref={ref} src={src} onError={() => setFailed(true)} {...props} />;
}
