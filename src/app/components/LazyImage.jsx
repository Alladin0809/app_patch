import { useLazyLoad } from "./useLazyLoad";
import { useState } from "react";

export function LazyImage({
  src,
  placeholder = "/images/default_logo.png",
  error = "/images/default_logo.png",
  alt = "",
  ...props
}) {
  const { ref, loaded } = useLazyLoad({ src });
  const [imgSrc, setImgSrc] = useState(placeholder);

  return (
    <img
      ref={ref}
      src={loaded ? src : imgSrc}
      alt={alt}
      onError={() => setImgSrc(error)}
      {...props}
    />
  );
}
