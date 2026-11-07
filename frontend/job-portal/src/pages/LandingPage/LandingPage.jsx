import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  ClipboardList,
  FileText,
  MapPin,
  Search,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

/* -------------------------------------------------------------------------- */
/*  CONTENT — replace the placeholder numbers with real figures from your API  */
/* -------------------------------------------------------------------------- */

// Hero background photo. Two layers: if the first URL fails to load, the second shows.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=85";
const HERO_IMAGE_BACKUP =
  "https://images.pexels.com/photos/3184663/pexels-photo-3184663.jpeg?auto=compress&cs=tinysrgb&w=2400";
const HERO_POSITION = "center";

const POPULAR = ["Developer", "Designer", "Accountant", "Remote"];

const MANIFESTO =
  "Good careers start with clear information. BrightPath shows real roles, real requirements and exactly where your application stands, so nobody is left guessing.";

const STATS = {
  seekers: 12000, // TODO: real count
  jobs: 850, // TODO: real count
  employers: 240, // TODO: real count
};

const STEPS = [
  {
    icon: Search,
    title: "Search",
    text: "Filter roles by title, skill, location or category.",
  },
  {
    icon: FileText,
    title: "Apply",
    text: "Use one saved profile to apply in a few clicks.",
  },
  {
    icon: ClipboardList,
    title: "Track",
    text: "See every application move from applied to decision.",
  },
];

const EMPLOYER_STEPS = [
  { icon: Briefcase, title: "Post", text: "Publish a role with clear requirements." },
  { icon: UserCheck, title: "Review", text: "See every applicant and profile in one list." },
  { icon: CheckCircle, title: "Decide", text: "Update statuses so candidates know where they stand." },
];

const EMPLOYER_POINTS = [
  "Publish a role with clear requirements",
  "Review every applicant and profile in one list",
  "Update statuses so candidates always know where they stand",
];

/* -------------------------------------------------------------------------- */
/*  HOOKS                                                                     */
/* -------------------------------------------------------------------------- */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const useInView = (threshold = 0.3) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

const useCountUp = (target, active, duration = 1400) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
};

/* -------------------------------------------------------------------------- */
/*  HERO — visitor chooses: find a job, or hire talent                        */
/* -------------------------------------------------------------------------- */

const MODES = [
  { key: "seeker", label: "Find a job", icon: Search },
  { key: "employer", label: "Hire talent", icon: Briefcase },
];

const Hero = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isEmployer = isAuthenticated && user?.role === "employer";

  const [mode, setMode] = useState(isEmployer ? "employer" : "seeker");
  const [query, setQuery] = useState({ keyword: "", location: "" });
  const visualRef = useRef(null);

  useEffect(() => {
    if (isEmployer) setMode("employer");
  }, [isEmployer]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let frame;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (visualRef.current) {
          visualRef.current.style.transform = `translate3d(0, ${
            window.scrollY * -0.08
          }px, 0)`;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goSearch = (keyword, location = "") => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    const qs = params.toString();
    navigate(qs ? `/find-jobs?${qs}` : "/find-jobs");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goSearch(query.keyword, query.location);
  };

  const rise = (delay) => ({ "--d": `${delay}ms` });
  const isSeeker = mode === "seeker";

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#0B1B33] pt-16"
    >
      {/* BACKGROUND PHOTO */}
      <div
        className="bp-lp-zoom absolute inset-0 bg-cover"
        style={{
          backgroundImage: `url('${HERO_IMAGE}'), url('${HERO_IMAGE_BACKUP}')`,
          backgroundPosition: HERO_POSITION,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[#061428]/65 lg:bg-[linear-gradient(90deg,rgba(6,20,40,.82)_0%,rgba(6,20,40,.5)_45%,rgba(6,20,40,.12)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#061428]/75 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-14 py-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 xl:gap-24 lg:py-20">
        {/* COPY */}
        <div>
          {/* MODE TOGGLE */}
          <div
            role="tablist"
            aria-label="What do you want to do?"
            className="bp-lp-rise inline-flex rounded-full border border-white/25 bg-white/15 p-1 backdrop-blur-md"
            style={rise(0)}
          >
            {MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => setMode(key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:px-5 ${
                  mode === key
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-white/85 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div key={mode} className="bp-lp-swap">
            <h1 className="bp-lp-display mt-7 text-[2.75rem] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem] xl:text-[4.5rem]">
              {isSeeker ? (
                <>
                  <span className="block">Find work that</span>
                  <span className="block text-blue-200">fits your life.</span>
                </>
              ) : (
                <>
                  <span className="block">Hire people</span>
                  <span className="block text-blue-200">who are ready.</span>
                </>
              )}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">
              {isSeeker
                ? "Search open roles, apply with one saved profile and follow every application from applied to decision."
                : "Publish jobs, review applicants and move decisions forward from one focused workspace."}
            </p>

            {isSeeker ? (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-[0_24px_50px_-18px_rgba(0,0,0,.55)] sm:flex-row sm:items-center"
                >
                  <label className="bp-lp-field flex flex-1 items-center rounded-xl px-3">
                    <Search className="h-[18px] w-[18px] shrink-0 text-slate-400" />
                    <span className="sr-only">Job title or skill</span>
                    <input
                      value={query.keyword}
                      onChange={(e) =>
                        setQuery((p) => ({ ...p, keyword: e.target.value }))
                      }
                      placeholder="Job title or skill"
                      autoComplete="off"
                      className="w-full min-w-0 bg-transparent px-3 py-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </label>

                  <span className="hidden h-6 w-px bg-slate-200 sm:block" />

                  <label className="bp-lp-field flex flex-1 items-center rounded-xl px-3">
                    <MapPin className="h-[18px] w-[18px] shrink-0 text-slate-400" />
                    <span className="sr-only">Location</span>
                    <input
                      value={query.location}
                      onChange={(e) =>
                        setQuery((p) => ({ ...p, location: e.target.value }))
                      }
                      placeholder="City or country"
                      autoComplete="off"
                      className="w-full min-w-0 bg-transparent px-3 py-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </label>

                  <button
                    type="submit"
                    className="bp-lp-btn flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-[15px] font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  >
                    Search jobs
                  </button>
                </form>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/75">
                  <span>Popular:</span>
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => goSearch(term)}
                      className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <ul className="mt-8 max-w-lg space-y-3">
                  {EMPLOYER_POINTS.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-[15px] text-white/90"
                    >
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(isEmployer ? "/post-job" : "/signup")
                    }
                    className="bp-lp-btn inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(37,99,235,.6)] hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                  >
                    Post a job
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(isEmployer ? "/manage-jobs" : "/login")
                    }
                    className="bp-lp-btn inline-flex items-center justify-center rounded-xl border border-white/50 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                  >
                    {isEmployer ? "Manage jobs" : "Employer sign in"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* PRODUCT VISUAL */}
        <div ref={visualRef} className="relative will-change-transform">
          <div
            key={`visual-${mode}`}
            className="bp-lp-swap relative mx-auto w-full max-w-[520px]"
          >
            {isSeeker ? <SeekerVisual /> : <EmployerVisual />}
          </div>
        </div>
      </div>
      </div>

      {/* FEATURE STRIP */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
        <div
          key={`strip-${mode}`}
          className="bp-lp-swap grid gap-5 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:grid-cols-3 sm:gap-8 sm:p-6"
        >
          {(isSeeker ? STEPS : EMPLOYER_STEPS).map((step) => (
            <div key={step.title} className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
                <step.icon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {step.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-white/75">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SeekerVisual = () => (
  <>
    <div className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-[0_30px_60px_-25px_rgba(0,0,0,.55)] backdrop-blur sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">
          Recommended roles
        </p>
        <span className="text-xs text-slate-400">Sample</span>
      </div>

      <ul className="mt-4 space-y-3">
        {[
          ["Frontend Developer", "Orbit Labs", "Remote", "Full-time", "O"],
          ["Staff Nurse", "Lumen Health", "Kandy", "Shift", "L"],
          ["Accounts Executive", "Fieldstone", "Colombo", "Full-time", "F"],
        ].map(([title, company, place, type, initial], i) => (
          <li
            key={title}
            className={`flex items-center gap-3.5 rounded-2xl border p-3.5 ${
              i === 0
                ? "border-blue-200 bg-blue-50/70"
                : "border-slate-100 bg-white"
            }`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {title}
              </p>
              <p className="truncate text-[13px] text-slate-500">
                {company} · {place}
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 sm:inline">
              {type}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900">
            Application status
          </span>
          <span className="font-semibold text-blue-700">Reviewed</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="h-1.5 flex-1 rounded-full bg-blue-600" />
          <span className="h-1.5 flex-1 rounded-full bg-blue-600" />
          <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
          <span>Applied</span>
          <span>Reviewed</span>
          <span>Interview</span>
        </div>
      </div>
    </div>

    <div className="bp-lp-float absolute -top-5 right-2 hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-lg shadow-black/20 sm:flex">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
        <CheckCircle className="h-3.5 w-3.5" />
      </span>
      Your application was viewed
    </div>

    <div className="bp-lp-float bp-lp-float-b absolute -left-12 bottom-28 hidden items-center gap-3 rounded-2xl border border-white/60 bg-white px-4 py-3 shadow-xl shadow-black/25 xl:flex">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
        <ClipboardList className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="text-xs font-semibold text-slate-900">
          Interview scheduled
        </p>
        <p className="text-xs text-slate-500">Tomorrow · 10:00 AM</p>
      </div>
    </div>
  </>
);

const EmployerVisual = () => (
  <>
    <div className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-[0_30px_60px_-25px_rgba(0,0,0,.55)] backdrop-blur sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Frontend Developer
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Applicants</p>
        </div>
        <span className="text-xs text-slate-400">Sample</span>
      </div>

      <ul className="mt-4 space-y-3">
        {[
          ["Amal K.", "Applied 2h ago", "New", "AK"],
          ["Sara R.", "Applied yesterday", "Shortlisted", "SR"],
          ["Mihir P.", "Applied 2 days ago", "Interview", "MP"],
        ].map(([name, when, status, initials], i) => (
          <li
            key={name}
            className={`flex items-center gap-3.5 rounded-2xl border p-3.5 ${
              i === 0
                ? "border-blue-200 bg-blue-50/70"
                : "border-slate-100 bg-white"
            }`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {name}
              </p>
              <p className="truncate text-[13px] text-slate-500">{when}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                status === "New"
                  ? "bg-blue-600 text-white ring-blue-600"
                  : status === "Shortlisted"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-white text-slate-600 ring-slate-200"
              }`}
            >
              {status}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-900">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Job is live and accepting applications
      </div>
    </div>

    <div className="bp-lp-float absolute -top-5 right-2 hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-lg shadow-black/20 sm:flex">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
        <UserCheck className="h-3.5 w-3.5" />
      </span>
      New applicant
    </div>

    <div className="bp-lp-float bp-lp-float-b absolute -left-12 bottom-28 hidden items-center gap-3 rounded-2xl border border-white/60 bg-white px-4 py-3 shadow-xl shadow-black/25 xl:flex">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
        <ClipboardList className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="text-xs font-semibold text-slate-900">
          Interview booked
        </p>
        <p className="text-xs text-slate-500">Sara R. · Tomorrow</p>
      </div>
    </div>
  </>
);

/* -------------------------------------------------------------------------- */
/*  MANIFESTO — words fill from dim blue-grey to white on scroll              */
/* -------------------------------------------------------------------------- */

const FROM = [88, 112, 150];
const TO = [255, 255, 255];
const EDGE = 3;

const Manifesto = () => {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const words = MANIFESTO.split(" ");

  useEffect(() => {
    if (prefersReducedMotion()) {
      setProgress(1);
      return;
    }

    let frame;
    const update = () => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh * 0.8 - rect.top) / (rect.height * 0.85);
      setProgress(Math.min(Math.max(raw, 0), 1));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const head = progress * (words.length + EDGE);

  return (
    <section ref={ref} className="bg-white px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] bg-[#0B1B33] py-20 lg:rounded-[2.25rem] lg:py-32">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="bp-lp-display text-[1.65rem] font-medium leading-[1.3] tracking-[-0.025em] sm:text-4xl lg:text-5xl xl:text-[3.4rem] lg:leading-[1.25]">
          {words.map((word, i) => {
            const t = Math.min(Math.max((head - i) / EDGE, 0), 1);
            const color = FROM.map((c, k) =>
              Math.round(c + (TO[k] - c) * t)
            );
            return (
              <span key={i} style={{ color: `rgb(${color.join(",")})` }}>
                {word}{" "}
              </span>
            );
          })}
        </p>

        <p className="mx-auto mt-10 max-w-md text-base leading-7 text-slate-400 sm:text-lg">
          Built for people who are hiring and people who are looking.{" "}
          <span className="text-slate-500">Simple on both sides.</span>
        </p>
      </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  TWO AUDIENCES  (id="features" so the header's Features link scrolls here) */
/* -------------------------------------------------------------------------- */

const Audiences = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const employerTarget =
    isAuthenticated && user?.role === "employer" ? "/post-job" : "/signup";

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#f8f9fc] py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-14">
        {/* SECTION INTRO */}
        <div className="mb-14 grid gap-8 lg:mb-16 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-9 bg-[#1764ed]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1764ed]">
                Designed for both sides
              </span>
            </div>

            <h2
              className="max-w-[750px] text-[clamp(3.2rem,5.5vw,76px)] leading-[0.99] tracking-[-0.065em] text-[#101827]"
              style={{
                fontFamily: '"Archivo", sans-serif',
                fontVariationSettings: '"wdth" 100, "wght" 600',
              }}
            >
              One platform.
              <br />
              <span className="text-[#1764ed]">Two ways</span> to move forward.
            </h2>
          </div>

          <div className="max-w-[390px] lg:justify-self-end lg:pb-2">
            <p
              className="text-[15px] leading-[1.85] text-[#647084]"
              style={{ fontFamily: '"Inter Tight", sans-serif' }}
            >
              Whether you're building your career or growing your team,
              BrightPath brings everything together in one straightforward
              experience.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#1764ed]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#34445a]">
                One destination. Different ambitions.
              </span>
            </div>
          </div>
        </div>

        {/* AUDIENCE PANELS */}
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          {/* JOB SEEKERS */}
          <article className="group relative flex min-h-[470px] flex-col overflow-hidden rounded-[1.75rem] border border-[#dce5f2] bg-[#edf3ff] p-7 shadow-[0_18px_55px_-42px_rgba(25,65,130,0.35)] transition-all duration-500 hover:-translate-y-1 hover:border-[#b8cdf1] hover:shadow-[0_28px_65px_-42px_rgba(25,65,130,0.42)] sm:rounded-[2rem] sm:p-10 lg:p-11">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1764ed]">
                01 / For individuals
              </span>

              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#cbd9ef] bg-white text-[#1764ed] transition-transform duration-500 group-hover:rotate-[-8deg]">
                <UserCheck className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-10">
              <h3
                className="text-[clamp(2.3rem,3.4vw,43px)] leading-[1.02] tracking-[-0.055em] text-[#101827]"
                style={{
                  fontFamily: '"Archivo", sans-serif',
                  fontVariationSettings: '"wdth" 100, "wght" 600',
                }}
              >
                Find work that
                <br />
                moves you forward.
              </h3>

              <p
                className="mt-4 max-w-[360px] text-[14px] leading-7 text-[#5c6d85]"
                style={{ fontFamily: '"Inter Tight", sans-serif' }}
              >
                Your next opportunity shouldn't be difficult to find. Make your
                search simpler, from discovery to decision.
              </p>
            </div>

            <div className="my-8 h-px bg-[#cbd6e7]" />

            <div className="space-y-5">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex items-start gap-5">
                  <span className="pt-0.5 font-mono text-[11px] text-[#1764ed]">
                    0{i + 1}
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <step.icon className="h-4 w-4 text-[#1764ed]" />
                      <p
                        className="text-[14px] font-semibold text-[#172337]"
                        style={{ fontFamily: '"Inter Tight", sans-serif' }}
                      >
                        {step.title}
                      </p>
                    </div>

                    <p
                      className="mt-1.5 text-[13px] leading-6 text-[#66758a]"
                      style={{ fontFamily: '"Inter Tight", sans-serif' }}
                    >
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-9">
              <button
                type="button"
                onClick={() => navigate("/find-jobs")}
                className="group/btn inline-flex items-center gap-8 bg-[#175cff] px-6 py-3.5 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-[#0849df]"
                style={{ fontFamily: '"Inter Tight", sans-serif' }}
              >
                Explore opportunities
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
            </div>

            <span
              className="pointer-events-none absolute -bottom-16 -right-5 select-none text-[230px] leading-none tracking-[-0.1em] text-[#1764ed]/[0.035]"
              style={{ fontFamily: '"Archivo", sans-serif' }}
              aria-hidden="true"
            >
              01
            </span>
          </article>

          {/* EMPLOYERS */}
          <article className="group relative flex min-h-[470px] flex-col overflow-hidden rounded-[1.75rem] border border-[#1b3150] bg-[#101e34] p-7 text-white shadow-[0_20px_60px_-42px_rgba(5,18,38,0.55)] transition-all duration-500 hover:-translate-y-1 hover:border-[#42618b] hover:shadow-[0_30px_70px_-42px_rgba(5,18,38,0.65)] sm:rounded-[2rem] sm:p-10 lg:p-11">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8eb9ff]">
                02 / For organisations
              </span>

              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-[#8eb9ff] transition-transform duration-500 group-hover:rotate-[-8deg]">
                <Building2 className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-10">
              <h3
                className="text-[clamp(2.3rem,3.4vw,43px)] leading-[1.02] tracking-[-0.055em] text-white"
                style={{
                  fontFamily: '"Archivo", sans-serif',
                  fontVariationSettings: '"wdth" 100, "wght" 600',
                }}
              >
                Build your team.
                <br />
                Find your people.
              </h3>

              <p
                className="mt-4 max-w-[360px] text-[14px] leading-7 text-[#a8b7cb]"
                style={{ fontFamily: '"Inter Tight", sans-serif' }}
              >
                From publishing a role to making the right decision, manage your
                hiring process in one place.
              </p>
            </div>

            <div className="my-8 h-px bg-white/15" />

            <div className="space-y-5">
              {[
                ["Post a job", "Publish a role with clear requirements."],
                ["Review applicants", "See every candidate and their profile in one list."],
                [
                  "Move decisions forward",
                  "Update statuses so candidates know where they stand.",
                ],
              ].map(([title, text], i) => (
                <div key={title} className="flex items-start gap-5">
                  <span className="pt-0.5 font-mono text-[11px] text-[#8eb9ff]">
                    0{i + 1}
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#8eb9ff]" />
                      <p
                        className="text-[14px] font-semibold text-white"
                        style={{ fontFamily: '"Inter Tight", sans-serif' }}
                      >
                        {title}
                      </p>
                    </div>

                    <p
                      className="mt-1.5 text-[13px] leading-6 text-[#a8b7cb]"
                      style={{ fontFamily: '"Inter Tight", sans-serif' }}
                    >
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-9">
              <button
                type="button"
                onClick={() => navigate(employerTarget)}
                className="group/btn inline-flex items-center gap-8 bg-white px-6 py-3.5 text-[13px] font-semibold text-[#101e34] transition-all duration-300 hover:bg-[#dceaff]"
                style={{ fontFamily: '"Inter Tight", sans-serif' }}
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Start hiring
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
            </div>

            <span
              className="pointer-events-none absolute -bottom-16 -right-5 select-none text-[230px] leading-none tracking-[-0.1em] text-white/[0.035]"
              style={{ fontFamily: '"Archivo", sans-serif' }}
              aria-hidden="true"
            >
              02
            </span>
          </article>
        </div>

        {/* BOTTOM SIGNATURE */}
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-[#d8dee7] pt-5 sm:flex-row sm:items-center">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.13em] text-[#7a8799]"
            style={{ fontFamily: '"Inter Tight", sans-serif' }}
          >
            A clearer path for everyone
          </p>

          <p
            className="text-[12px] text-[#7a8799]"
            style={{ fontFamily: '"Inter Tight", sans-serif' }}
          >
            BrightPath — Connecting ambition with opportunity.
          </p>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  STATS PANEL                                                               */
/* -------------------------------------------------------------------------- */

const Stats = () => {
  const [ref, inView] = useInView(0.25);
  const seekers = useCountUp(STATS.seekers, inView);
  const jobs = useCountUp(STATS.jobs, inView);
  const employers = useCountUp(STATS.employers, inView);

  const initials = ["AK", "SR", "MP", "JD", "NF", "LT"];

  return (
    <section className="bg-white pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="rounded-3xl border border-slate-200 p-6 sm:p-10 lg:grid lg:grid-cols-[.9fr_1.1fr] lg:gap-12"
        >
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="bp-lp-display text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[2.9rem]">
                A growing network of people and employers
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
                Every profile, role and application on BrightPath lives in one
                place, so hiring and job hunting stay simple.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3 lg:mt-0">
              <div className="flex -space-x-2.5">
                {initials.map((text, i) => (
                  <span
                    key={text}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold ${
                      i % 3 === 0
                        ? "bg-blue-600 text-white"
                        : i % 3 === 1
                        ? "bg-slate-900 text-white"
                        : "bg-blue-100 text-blue-800"
                    } ${inView ? "bp-lp-pop-in" : "opacity-0"}`}
                    style={{ "--d": `${i * 70}ms` }}
                  >
                    {text}
                  </span>
                ))}
              </div>
              <span className="text-sm text-slate-500">Join them</span>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-0">
            <div className="bp-lp-lift rounded-2xl bg-blue-600 p-6 text-white sm:row-span-2 sm:flex sm:flex-col sm:justify-between sm:p-7">
              <p className="bp-lp-display text-5xl font-bold tracking-[-0.04em] sm:text-6xl">
                {seekers.toLocaleString()}+
              </p>
              <p className="mt-3 text-sm leading-6 text-blue-100">
                Job seekers with a ready profile
              </p>
            </div>

            <div className="bp-lp-lift rounded-2xl bg-[#F3F7FF] p-6">
              <p className="bp-lp-display text-4xl font-bold tracking-[-0.04em] text-slate-950">
                {jobs.toLocaleString()}+
              </p>
              <p className="mt-2 text-sm text-slate-600">Open roles</p>
            </div>

            <div className="bp-lp-lift rounded-2xl bg-[#0B1B33] p-6 text-white">
              <p className="bp-lp-display text-4xl font-bold tracking-[-0.04em]">
                {employers.toLocaleString()}+
              </p>
              <p className="mt-2 text-sm text-slate-300">Employers hiring</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  FINAL CTA                                                                 */
/* -------------------------------------------------------------------------- */

const FinalCta = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-blue-600 px-7 py-12 text-white sm:px-12 lg:flex-row lg:items-center">
          <div>
            <h2 className="bp-lp-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl lg:text-[2.9rem]">
              Create your free account
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-blue-100 sm:text-base">
              Set up your profile once and start applying, or open an employer
              account and post your first job.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="bp-lp-btn inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="bp-lp-btn inline-flex items-center justify-center rounded-xl border border-white/40 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  PAGE                                                                      */
/* -------------------------------------------------------------------------- */

const LandingPage = () => (
  <div className="bp-lp bg-white text-slate-900">
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Inter+Tight:wght@100..900&display=swap');

      .bp-lp {
        font-family: 'Inter Tight', ui-sans-serif, system-ui, sans-serif;
        overflow-x: clip;
        -webkit-font-smoothing: antialiased;
      }
      .bp-lp-display {
        font-family: 'Archivo', 'Inter Tight', ui-sans-serif, system-ui, sans-serif;
        font-variation-settings: 'wdth' 100, 'wght' 640;
      }
      .bp-lp section { scroll-margin-top: 5rem; }

      @keyframes bp-lp-rise {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bp-lp-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      @keyframes bp-lp-zoom {
        from { transform: scale(1); }
        to { transform: scale(1.08); }
      }
      @keyframes bp-lp-pop {
        from { opacity: 0; transform: scale(.4); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes bp-lp-soft-reveal {
        from { opacity: 0; transform: translate3d(0, 28px, 0); filter: blur(5px); }
        to { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
      }
      @keyframes bp-lp-image-reveal {
        from { opacity: .45; transform: scale(1.045) translateY(18px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes bp-lp-line-in {
        from { transform: scaleX(0); transform-origin: left; }
        to { transform: scaleX(1); transform-origin: left; }
      }

      .bp-lp-rise { animation: bp-lp-rise 700ms cubic-bezier(.2,.7,.2,1) both; animation-delay: var(--d, 0ms); }
      .bp-lp-zoom { animation: bp-lp-zoom 26s ease-out forwards; will-change: transform; }
      .bp-lp-swap { animation: bp-lp-rise 380ms cubic-bezier(.2,.7,.2,1) both; }
      .bp-lp-float { animation: bp-lp-float 6s ease-in-out infinite; }
      .bp-lp-float-b { animation-delay: -3s; }
      .bp-lp-pop-in { animation: bp-lp-pop 420ms cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0ms); }

      .bp-lp-field:focus-within { box-shadow: 0 0 0 3px rgba(96,165,250,.3); }
      .bp-lp-btn { transition: background-color 180ms ease, transform 180ms ease, border-color 180ms ease; }
      .bp-lp-btn:hover { transform: translateY(-1px); }
      .bp-lp-lift { transition: transform 220ms ease, border-color 180ms ease, background-color 180ms ease; }
      .bp-lp-lift:hover { transform: translateY(-5px); }

      /* Polished page-load choreography */
      .bp-lp #home .grid > div:first-child { animation: bp-lp-soft-reveal 850ms cubic-bezier(.2,.75,.25,1) both; }
      .bp-lp #home .grid > div:last-child { animation: bp-lp-image-reveal 1100ms cubic-bezier(.2,.75,.25,1) 180ms both; }
      .bp-lp #home .grid > div:first-child > * { animation: bp-lp-soft-reveal 750ms cubic-bezier(.2,.75,.25,1) both; }
      .bp-lp #home .grid > div:first-child > *:nth-child(2) { animation-delay: 120ms; }
      .bp-lp #home .grid > div:first-child > *:nth-child(3) { animation-delay: 220ms; }
      .bp-lp #home .grid > div:last-child > * { transition: transform 500ms cubic-bezier(.2,.7,.2,1), box-shadow 500ms ease; }
      .bp-lp #home .grid > div:last-child > *:hover { transform: translateY(-5px); }
      .bp-lp #home .bp-lp-float { animation-duration: 7s; }
      .bp-lp #home .bp-lp-zoom { transform-origin: center; }

      .bp-lp #features > div > div:first-child { animation: bp-lp-soft-reveal 850ms cubic-bezier(.2,.75,.25,1) both; }
      .bp-lp #features article:first-child { animation: bp-lp-soft-reveal 850ms cubic-bezier(.2,.75,.25,1) 100ms both; }
      .bp-lp #features article:last-child { animation: bp-lp-soft-reveal 850ms cubic-bezier(.2,.75,.25,1) 220ms both; }
      .bp-lp #features article { transform: translateZ(0); }
      .bp-lp #features article::after {
        content: ''; position: absolute; inset: auto 0 0; height: 3px;
        background: linear-gradient(90deg, #1764ed, #7bb8ff);
        transform: scaleX(0); transform-origin: left; transition: transform 550ms cubic-bezier(.2,.7,.2,1);
      }
      .bp-lp #features article:hover::after { transform: scaleX(1); }
      .bp-lp #features article button { transition: transform 220ms ease, box-shadow 220ms ease; }
      .bp-lp #features article button:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(23,92,255,.18); }
      .bp-lp main > section:not(#home):not(#features) { animation: bp-lp-soft-reveal 800ms ease both; }

      /* Tablet and phone layout refinements */
      @media (max-width: 1023px) {
        .bp-lp #home { min-height: auto; }
        .bp-lp #home > .relative.z-10 { padding-top: 3.5rem; padding-bottom: 2.5rem; }
        .bp-lp #home > .relative.z-10 > .grid { gap: 3rem; padding-top: 2rem; padding-bottom: 2rem; }
        .bp-lp #home .grid > div:last-child { width: 100%; max-width: 560px; margin-inline: auto; }
        .bp-lp #home .grid > div:last-child > div { max-width: 100%; }
        .bp-lp #home .bp-lp-float-b { display: none; }
        .bp-lp #home > .relative.z-10 + .relative.z-10 { padding-bottom: 1.5rem; }
        .bp-lp #features { padding-top: 5rem; padding-bottom: 5rem; }
        .bp-lp #features article { min-height: 0; }
      }
      @media (max-width: 640px) {
        .bp-lp #home { padding-top: 4.25rem; }
        .bp-lp #home > .relative.z-10 { padding-inline: 1rem; }
        .bp-lp #home h1 { font-size: clamp(2.65rem, 12vw, 4.2rem); line-height: .99; letter-spacing: -.055em; }
        .bp-lp #home p { overflow-wrap: anywhere; }
        .bp-lp #home form { border-radius: 1rem; padding: .55rem; }
        .bp-lp #home .bp-lp-field { min-height: 3.1rem; }
        .bp-lp #home form button { min-height: 3.1rem; }
        .bp-lp #home .grid > div:last-child { padding-inline: .15rem; }
        .bp-lp #home .grid > div:last-child > div > div:first-child { border-radius: 1.15rem; padding: 1rem; }
        .bp-lp #home .grid > div:last-child li { padding: .7rem; gap: .65rem; }
        .bp-lp #home .grid > div:last-child li > span:first-child { height: 2.5rem; width: 2.5rem; }
        .bp-lp #home .grid > div:last-child .bp-lp-float { display: none; }
        .bp-lp #home .grid > div:last-child > div { overflow: visible; }
        .bp-lp #home .grid > div:last-child { min-width: 0; }
        .bp-lp #home .grid > div:last-child .rounded-3xl { border-radius: 1.1rem; }
        .bp-lp #home .grid > div:last-child .rounded-2xl { border-radius: .8rem; }
        .bp-lp #home .grid > div:last-child .bp-lp-float { display: none; }
        .bp-lp #home .relative.z-10:last-child > div { border-radius: 1rem; padding: 1rem; }
        .bp-lp #features { padding: 4.25rem 0; }
        .bp-lp #features > div { padding-inline: 1rem; }
        .bp-lp #features h2 { font-size: clamp(2.7rem, 12vw, 4rem); line-height: .98; }
        .bp-lp #features article { border-radius: 1.25rem; padding: 1.4rem; }
        .bp-lp #features article h3 { font-size: clamp(2rem, 9vw, 2.7rem); }
        .bp-lp #features article .my-8 { margin-block: 1.35rem; }
        .bp-lp #features article .space-y-5 { gap: 1rem; }
        .bp-lp #features article button { width: 100%; justify-content: space-between; }
        .bp-lp #features > div > div:last-child { margin-top: 1.5rem; }
        .bp-lp main > section { scroll-margin-top: 4rem; }
      }
      @media (max-width: 380px) {
        .bp-lp #home h1 { font-size: 2.55rem; }
        .bp-lp #home .grid > div:last-child { transform: scale(.97); transform-origin: top center; }
        .bp-lp #features article { padding: 1.15rem; }
        .bp-lp #features article h3 { font-size: 1.9rem; }
      }

      @media (prefers-reduced-motion: reduce) {
        .bp-lp-rise, .bp-lp-swap, .bp-lp-float, .bp-lp-pop-in, .bp-lp-zoom,
        .bp-lp #home .grid > div, .bp-lp #home .grid > div:first-child > *,
        .bp-lp #features > div > div:first-child, .bp-lp #features article,
        .bp-lp main > section:not(#home):not(#features) { animation: none !important; opacity: 1 !important; filter: none !important; }
        .bp-lp-btn, .bp-lp-lift, .bp-lp #features article::after { transition: none !important; }
        .bp-lp-btn:hover, .bp-lp-lift:hover { transform: none; }
      }
    `}</style>

    <Header />

    <main>
      <Hero />
      <Audiences />
      <Manifesto />
      <Stats />
      <FinalCta />
    </main>

    <Footer />
  </div>
);

export default LandingPage;