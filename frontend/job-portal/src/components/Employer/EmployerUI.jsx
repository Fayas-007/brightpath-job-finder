import { AlertCircle } from "lucide-react";

// Shared building blocks for the employer pages.
// Flat colours only: navy ink, one blue accent, yellow for the main action.

export const inputClass =
  "w-full rounded-xl border border-[#0a1f6b]/25 bg-white px-4 py-2.5 text-[15px] text-[#0a1f6b] placeholder:text-slate-400 transition-colors focus:border-[#1646e0] focus:outline-none focus:ring-2 focus:ring-[#1646e0]/20";

const variants = {
  primary: "bg-[#1646e0] text-white hover:bg-[#0f36b8]",
  accent: "bg-[#ffd23f] text-[#0a1f6b] hover:bg-[#f5c400]",
  outline:
    "border border-[#0a1f6b]/30 bg-white text-[#0a1f6b] hover:bg-[#eef3ff]",
};

export const buttonClass = (variant = "primary", extra = "") =>
  `inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${extra}`;

export const Button = ({
  variant = "primary",
  className = "",
  children,
  ...props
}) => (
  <button type="button" {...props} className={buttonClass(variant, className)}>
    {children}
  </button>
);

export const Card = ({ className = "", children }) => (
  <section
    className={`rounded-2xl border border-[#0a1f6b]/15 bg-white ${className}`}
  >
    {children}
  </section>
);

export const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="editorial-display text-4xl text-[#0a1f6b] sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-xl text-[15px] text-slate-600">
          {description}
        </p>
      )}
    </div>
    {action}
  </div>
);

// One block of a long form: title, short note, then the fields.
export const Section = ({ title, description, children }) => (
  <div className="p-5 sm:p-8">
    <h3 className="text-lg font-semibold text-[#0a1f6b]">{title}</h3>
    {description && (
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    )}
    <div className="mt-6 space-y-5">{children}</div>
  </div>
);

// Label + control + hint or error. The label wraps the control,
// so clicking the text focuses the field.
export const Field = ({ label, hint, error, optional, children }) => (
  <label className="block">
    <span className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-[#0a1f6b]">
      <span>{label}</span>
      {optional && (
        <span className="text-xs font-normal text-slate-500">Optional</span>
      )}
    </span>

    {children}

    {error ? (
      <span
        role="alert"
        className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600"
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </span>
    ) : hint ? (
      <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
    ) : null}
  </label>
);