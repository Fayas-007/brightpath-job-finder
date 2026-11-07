import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const useInView = ({ threshold = 0.15, rootMargin = "0px 0px -8% 0px" } = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
};

export const Reveal = ({ variant = "rise", delay = 0, className = "", children }) => {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`m-reveal m-${variant} ${inView ? "is-in" : ""} ${className}`}
      style={{ "--m-delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const MaskText = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({ threshold: 0.2 });

  return (
    <span ref={ref} className={`m-mask ${inView ? "is-in" : ""}`}>
      <span style={{ transitionDelay: `${delay}ms` }}>{children}</span>
    </span>
  );
};

const useCountUp = (target, duration, active) => {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (!active) return undefined;

    if (prefersReducedMotion()) {
      setValue(target);
      from.current = target;
      return undefined;
    }

    let frame;
    const start = performance.now();
    const begin = from.current;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const next = Math.round(begin + (target - begin) * eased);

      setValue(next);
      from.current = next;

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, active]);

  return value;
};

// Starts counting only when visible, and counts from the old value on refresh.
export const Count = ({ value, suffix = "", duration = 1000 }) => {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const animated = useCountUp(value, duration, inView);

  return (
    <span ref={ref}>
      {animated}
      {suffix}
    </span>
  );
};