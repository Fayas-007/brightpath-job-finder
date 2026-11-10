import { MapPin, Search, X } from "lucide-react";

// Hero photo: src/assets/hero.png
// Path is relative to this file (src/pages/<Page>/components/SearchHeader.jsx).
// If your folder depth differs, adjust the number of "../".
import HERO_IMAGE from "../../../assets/hero.png";

// Headline font. Add this once to index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&display=swap" rel="stylesheet" />
const DISPLAY_FONT = { fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" };

const quickTags = ["Remote", "Full Time", "Design", "Engineering"];

const SearchHeader = ({ filters, handleFilterChange, onClear, total = 0 }) => {
  const handleQuickTag = (tag) => {
    if (tag === "Remote") {
      handleFilterChange("type", filters.type === "Remote" ? "" : "Remote");
    } else if (tag === "Full Time") {
      handleFilterChange(
        "type",
        filters.type === "Full-Time" ? "" : "Full-Time"
      );
    } else {
      handleFilterChange("keyword", filters.keyword === tag ? "" : tag);
    }
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const isActive = (tag) => {
    if (tag === "Remote") return filters.type === "Remote";
    if (tag === "Full Time") return filters.type === "Full-Time";
    return filters.keyword === tag;
  };

  // Results update as you type, so submitting just closes the keyboard.
  const handleSubmit = (e) => {
    e.preventDefault();
    document.activeElement?.blur();
  };

  const input =
    "w-full min-w-0 border-0 bg-transparent p-0 text-[15px] font-medium text-[#0a1f6b] outline-none placeholder:font-normal placeholder:text-slate-400 focus:ring-0";

  return (
    // The navbar is fixed (h-16), so the top padding clears it.
    <section className="relative isolate -mt-2 overflow-hidden bg-[#0a1f6b] pb-16 pt-[7.5rem] sm:pb-28 sm:pt-[9.5rem]">
      {/* Photo: anchored right so the handshake stays visible as the width changes */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 -z-30 h-full w-full object-cover object-[78%_30%] lg:object-[right_30%]"
      />

      {/* Desktop: solid navy on the left (text side), fading out to the photo on the right */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 hidden bg-gradient-to-r from-[#050b24] from-25% via-[#0a1f6b]/85 via-50% to-[#0a1f6b]/10 lg:block"
      />

      {/* Mobile/tablet: top-to-bottom wash, since text spans the full width */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-gradient-to-b from-[#050b24]/90 via-[#0a1f6b]/75 to-[#0a1f6b]/55 lg:hidden"
      />

      {/* Soft fade into the page below */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-[#050b24]/40 to-transparent"
      />

      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {total > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {total} open {total === 1 ? "role" : "roles"} right now
          </span>
        )}

        <h1
          style={DISPLAY_FONT}
          className="mt-4 max-w-2xl text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-white"
        >
          Find your next job.
        </h1>

        <p className="mt-3 max-w-xl text-sm font-medium text-white/85 sm:text-base">
          Search by title or skill, then narrow it down by pay and job type.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="mt-8 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_24px_48px_-20px_rgba(5,11,36,0.7)] md:flex-row md:items-stretch lg:max-w-3xl"
        >
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors focus-within:bg-[#f5f8ff]">
            <Search className="h-5 w-5 shrink-0 text-[#1646e0]" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-[#1646e0]">
                Job title or skill
              </span>
              <input
                type="search"
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
                placeholder="e.g. React developer"
                aria-label="Search jobs by title or skill"
                className={input}
              />
            </span>
          </label>

          <span
            aria-hidden="true"
            className="mx-2 hidden w-px self-stretch bg-[#0a1f6b]/10 md:block"
          />

          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors focus-within:bg-[#f5f8ff]">
            <MapPin className="h-5 w-5 shrink-0 text-[#1646e0]" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-[#1646e0]">
                Location
              </span>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                placeholder="City or remote"
                aria-label="Search jobs by location"
                className={input}
              />
            </span>
          </label>

          <button
            type="submit"
            className="rounded-xl bg-[#1646e0] px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#0f36b8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
          >
            Search jobs
          </button>
        </form>

        {/* Quick filters */}
        <div className="mt-5 flex flex-wrap items-center gap-2 lg:max-w-3xl">
          <span className="mr-1 text-[13px] font-medium text-white/80">
            Popular searches
          </span>

          {quickTags.map((tag) => {
            const active = isActive(tag);

            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTag(tag)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-1 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  active
                    ? "border-white bg-white text-[#0a1f6b]"
                    : "border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                }`}
              >
                {tag}
              </button>
            );
          })}

          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="ml-auto flex items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1 text-[13px] font-semibold text-white transition-colors hover:bg-white/15"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchHeader;