import { useEffect, useRef, useState } from "react";

export function useLazyLoad({ src, rootMargin = "100px" }) {
    const ref = useRef(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setLoaded(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [rootMargin]);

    return { ref, loaded };
}

// export function useLazyLoad(src) {
//   const ref = useRef(null);
//   const [loadedSrc, setLoadedSrc] = useState("");

//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;

//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setLoadedSrc(src);
//           observer.disconnect();
//         }
//       },
//       { rootMargin: "100px" }
//     );

//     observer.observe(el);

//     return () => observer.disconnect();
//   }, [src]);

//   return { ref, loadedSrc };
// }