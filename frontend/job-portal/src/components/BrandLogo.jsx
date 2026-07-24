import { Link } from "react-router-dom";

const BrandLogo = ({
  to = "/",
  as: Component = Link,
  onClick,
  className = "",
  textClassName = "text-[1.55rem]",
  iconClassName = "h-9 w-9",
  showText = true,
}) => {
  const content = (
    <>
      <span
        className={`brand-mark inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm ${iconClassName}`}
        aria-hidden="true"
      >
        <img src="/brightpath-bp-logo.png" alt="" className="h-full w-full object-contain" />
      </span>
      {showText && (
        <span className={`brand-wordmark ${textClassName}`}>
          BrightPath
        </span>
      )}
    </>
  );

  if (Component === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 ${className}`}
        aria-label="BrightPath home"
      >
        {content}
      </button>
    );
  }

  return (
    <Component
      to={to}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="BrightPath home"
    >
      {content}
    </Component>
  );
};

export default BrandLogo;
