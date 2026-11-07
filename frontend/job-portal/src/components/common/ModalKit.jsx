import { useEffect } from "react";
import { ChevronDown, Loader, X } from "lucide-react";

export const inputClass =
  "h-11 w-full rounded-md border border-[#0f1115]/20 bg-white px-3.5 text-[15px] text-[#0f1115] placeholder:text-zinc-400 transition-colors hover:border-[#0f1115]/40 focus:border-[#1646e0] focus:outline-none focus:ring-2 focus:ring-[#1646e0]/20 disabled:opacity-60";

export const textareaClass =
  "w-full resize-y rounded-md border border-[#0f1115]/20 bg-white px-3.5 py-3 text-[15px] leading-6 text-[#0f1115] placeholder:text-zinc-400 transition-colors hover:border-[#0f1115]/40 focus:border-[#1646e0] focus:outline-none focus:ring-2 focus:ring-[#1646e0]/20";

export const fileClass =
  "w-full cursor-pointer rounded-md border border-[#0f1115]/20 bg-white text-sm text-zinc-600 file:mr-3 file:cursor-pointer file:border-0 file:bg-[#0f1115] file:px-4 file:py-3 file:font-mono file:text-[11px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-white hover:file:bg-[#1646e0] focus:border-[#1646e0] focus:outline-none focus:ring-2 focus:ring-[#1646e0]/20";

export const Field = ({ label, required = false, hint, children }) => (
  <label className="block min-w-0">
    <span className="mb-2 flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600">
      {label}
      {required && (
        <span className="text-[#c8412f]" aria-hidden="true">
          *
        </span>
      )}
    </span>
    {children}
    {hint && <span className="mt-1.5 block text-xs text-zinc-500">{hint}</span>}
  </label>
);

/* Select with a custom chevron so it matches the inputs on every browser. */
export const Select = ({ className = "", children, ...props }) => (
  <div className="relative">
    <select
      {...props}
      className={`${inputClass} cursor-pointer appearance-none pr-10 ${className}`}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
  </div>
);

export const Section = ({ title, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#1646e0]">
        {title}
      </p>
      <span className="h-px flex-1 bg-zinc-200" />
    </div>
    {children}
  </div>
);

const SIZES = {
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export const Modal = ({
  label = "Admin",
  title,
  onClose,
  onSubmit,
  submitText,
  submitting = false,
  size = "md",
  children,
}) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, submitting]);

  return (
    <div
      className="m-overlay fixed inset-0 z-[60] flex items-center justify-center bg-[#0f1115]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`m-panel flex max-h-[92vh] w-full ${SIZES[size] || SIZES.md} flex-col overflow-hidden rounded-md border border-[#0f1115]/10 bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5 sm:px-8">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              {label}
            </p>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-normal text-[#0f1115]">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-[#0f1115] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
            {children}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-zinc-100 bg-[#f4f4f5] px-6 py-4 sm:px-8">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              <span className="text-[#c8412f]">*</span> Required
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-md border border-[#0f1115]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#0f1115] transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-md bg-[#0f1115] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1115] disabled:cursor-wait disabled:opacity-60"
              >
                {submitting && <Loader className="h-4 w-4 animate-spin" />}
                {submitText}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};