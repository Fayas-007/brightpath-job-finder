import { useState } from "react";
import { getAssetUrl } from "../../utils/apiPaths";

const Avatar = ({ user, size = "h-9 w-9" }) => {
  const [failedSrc, setFailedSrc] = useState("");
  const src = getAssetUrl(user?.avatar);
  const letter = (user?.name || user?.companyName || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <span
      className={`flex ${size} flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#0f1115] text-sm font-bold text-white`}
    >
      {src && src !== failedSrc ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      ) : (
        letter
      )}
    </span>
  );
};

export default Avatar;