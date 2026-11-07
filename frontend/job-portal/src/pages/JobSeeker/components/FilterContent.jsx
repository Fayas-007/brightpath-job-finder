import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { CATEGORIES, JOB_TYPES } from "../../../utils/data";
import SalaryRangeSlider from "../../../components/Input/SalaryRangeSlider";

const DISPLAY_FONT = { fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" };

const FilterSection = ({ title, children, isExpanded, onToggle, count }) => (
  <div className="border-t border-[#0a1f6b]/10 py-4 first:border-t-0 first:pt-0">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      className="group flex w-full items-center justify-between rounded-lg py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1646e0]"
    >
      <span className="flex items-center gap-2">
        <span className="text-[15px] font-extrabold text-[#0a1f6b]">
          {title}
        </span>

        {count > 0 && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#1646e0]" />
        )}
      </span>

      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef3ff] transition-colors group-hover:bg-[#dbe6ff]">
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-[#0a1f6b]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#0a1f6b]" />
        )}
      </span>
    </button>

    {isExpanded && <div className="mt-3">{children}</div>}
  </div>
);

/* round = single choice look (job type), square = checkbox look */
const Option = ({ label, checked, onChange, round = false }) => (
  <label className="group flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 transition-colors hover:bg-[#f5f8ff]">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="peer sr-only"
    />

    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 border-[#0a1f6b]/30 bg-white transition-colors group-hover:border-[#1646e0] peer-checked:border-[#1646e0] peer-checked:bg-[#1646e0] peer-checked:[&>svg]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-[#1646e0] peer-focus-visible:ring-offset-2 ${
        round ? "rounded-full" : "rounded-md"
      }`}
    >
      <Check className="h-3 w-3 text-white opacity-0" strokeWidth={3.5} />
    </span>

    <span
      className={`text-[15px] transition-colors ${
        checked
          ? "font-bold text-[#0a1f6b]"
          : "text-slate-600 group-hover:text-[#0a1f6b]"
      }`}
    >
      {label}
    </span>
  </label>
);

const FilterContent = ({
  toggleSection,
  clearAllFilters,
  expandedSections,
  filters,
  handleFilterChange,
  onClose, // optional: shows a close button (mobile drawer)
}) => {
  const hasSalary = filters.minSalary !== "" || filters.maxSalary !== "";

  const activeCount =
    (filters.type ? 1 : 0) + (filters.category ? 1 : 0) + (hasSalary ? 1 : 0);

  const hasAnyFilter = Object.values(filters).some(
    (value) => value !== "" && value !== null && value !== undefined
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#0a1f6b]/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2
            style={DISPLAY_FONT}
            className="text-xl font-extrabold tracking-tight text-[#0a1f6b]"
          >
            Filters
          </h2>

          {activeCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ffd23f] px-2 text-xs font-extrabold text-[#0a1f6b]">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasAnyFilter && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-md text-sm font-bold text-[#1646e0] underline underline-offset-4 hover:text-[#0a1f6b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
            >
              Clear all
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3ff] text-[#0a1f6b] transition-colors hover:bg-[#dbe6ff]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pb-3 pt-5">
        <FilterSection
          title="Job type"
          count={filters.type ? 1 : 0}
          isExpanded={expandedSections?.jobType}
          onToggle={() => toggleSection("jobType")}
        >
          <div>
            {JOB_TYPES.map((type) => (
              <Option
                key={type.value}
                round
                label={type.value}
                checked={filters.type === type.value}
                onChange={(e) =>
                  handleFilterChange("type", e.target.checked ? type.value : "")
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Salary"
          count={hasSalary ? 1 : 0}
          isExpanded={expandedSections?.salary}
          onToggle={() => toggleSection("salary")}
        >
          <SalaryRangeSlider
            filters={filters}
            handleFilterChange={handleFilterChange}
          />
        </FilterSection>

        <FilterSection
          title="Category"
          count={filters.category ? 1 : 0}
          isExpanded={expandedSections?.categories}
          onToggle={() => toggleSection("categories")}
        >
          <div className="max-h-64 overflow-y-auto pr-1">
            {CATEGORIES.map((category) => (
              <Option
                key={category.value}
                label={category.value}
                checked={filters.category === category.value}
                onChange={(e) =>
                  handleFilterChange(
                    "category",
                    e.target.checked ? category.value : ""
                  )
                }
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default FilterContent;