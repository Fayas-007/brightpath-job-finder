import { LoaderCircle, CheckCircle } from "lucide-react";


const LoadingSpinner = ({
  message = "Finding your perfect opportunities...",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 p-8">

        {/* Brand */}
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400">
          BRIGHT<span className="text-blue-600">PATH</span>
        </p>

        {/* Message */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Just a moment<span className="text-blue-600">.</span>
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {message}
          </p>
        </div>

        {/* Progress */}
        <div className="mt-9 h-[3px] w-full overflow-hidden bg-slate-100">
          <div className="h-full w-1/3 animate-[loading_1.5s_ease-in-out_infinite] bg-blue-600" />
        </div>

      </div>

      <style>{`
        @keyframes loading {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(320%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-\\[loading_1\\.5s_ease-in-out_infinite\\] {
            animation: none !important;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
