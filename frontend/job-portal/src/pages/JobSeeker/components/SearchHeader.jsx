import { MapPin, Search, X } from "lucide-react";

const quickTags = ["Remote", "Full Time", "Design", "Engineering"];

const SearchHeader = ({ filters, handleFilterChange, onClear }) => {
  return (
    <section className="relative overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
      <img
        src="/images/brightpath-hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.66)_48%,rgba(239,246,255,0.18)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/72 to-transparent" />

      <div className="relative p-5 sm:p-6">
        <div className="mb-4 max-w-2xl">
          <span className="text-xs font-bold uppercase text-blue-600">
            Job discovery
          </span>
          <h1 className="mt-2 text-2xl font-black leading-tight text-slate-950 sm:text-4xl">
            Find your next role
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Search by title, company, keyword, or location.
          </p>
        </div>

        <div className="grid gap-3 rounded-lg border border-blue-100 bg-white/90 p-3 shadow-lg shadow-blue-100/40 backdrop-blur-md lg:grid-cols-[1.25fr_1fr_auto]">
          <label className="flex items-center rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:shadow-sm">
            <Search className="mr-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Title, company, or keyword"
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:shadow-sm">
            <MapPin className="mr-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <button
            onClick={onClear}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 lg:w-auto"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                tag === "Remote"
                  ? handleFilterChange("location", "Remote")
                  : handleFilterChange("keyword", tag)
              }
              className="rounded-lg border border-blue-100 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchHeader;
