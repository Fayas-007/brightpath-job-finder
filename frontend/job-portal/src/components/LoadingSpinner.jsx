import { Rocket } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="text-center relative">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-300 border-t-purple-500 mx-auto"></div>
          <div className="absolute inset-0 flex animate-spin items-center justify-center [animation-duration:2s]">
            <Rocket className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <p className="mt-6 animate-pulse font-medium text-gray-700">
          Finding your perfect opportunities...
        </p>

        <div className="flex justify-center mt-4 space-x-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-pink-500 [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
