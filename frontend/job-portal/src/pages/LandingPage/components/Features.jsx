import { employerFeatures, jobSeekerFeatures } from "../../../utils/data";

const accentStyles = {
  blue: {
    badge: "bg-blue-50 text-blue-700",
    icon: "bg-blue-600 text-white",
    panel: "from-blue-50/90 to-white",
    card: "hover:border-blue-200 hover:bg-blue-50/45",
  },
  teal: {
    badge: "bg-teal-50 text-teal-700",
    icon: "bg-teal-600 text-white",
    panel: "from-teal-50/90 to-white",
    card: "hover:border-teal-200 hover:bg-teal-50/45",
  },
};

const FeatureLane = ({ id, eyebrow, title, intro, accent, features }) => {
  const styles = accentStyles[accent];

  return (
    <div
      id={id}
      className={`relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br ${styles.panel} p-5 shadow-sm backdrop-blur-md sm:p-6`}
    >
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="max-w-md">
          <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold uppercase ${styles.badge}`}>
            {eyebrow}
          </span>
          <h3 className="mt-4 text-2xl font-black leading-tight text-slate-950">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{intro}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group rounded-lg border border-white/90 bg-white/86 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg shadow-sm ${styles.icon}`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-950">
                    {feature.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <section id="features" className="relative overflow-hidden bg-white py-14">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,rgba(240,249,255,0.72)_48%,#ffffff_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mb-8 grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <span className="text-sm font-bold uppercase text-blue-600">
              Workflows
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-[2.45rem]">
              Two clear paths, one simple product.
            </h2>
          </div>
          <p className="text-base leading-8 text-slate-600 sm:text-lg">
            BrightPath keeps the main steps visible for candidates and hiring
            teams, so the workspace feels calm from search to shortlist.
          </p>
        </div>

        <div className="relative grid gap-5">
          <FeatureLane
            eyebrow="For job seekers"
            title="From search to application"
            intro="A focused path for people who want to find suitable roles and keep their details ready."
            accent="blue"
            features={jobSeekerFeatures}
          />
          <FeatureLane
            id="employers"
            eyebrow="For employers"
            title="From job post to shortlist"
            intro="A clean workspace for teams that need to publish jobs and review candidate activity."
            accent="teal"
            features={employerFeatures}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
