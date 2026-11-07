import { Link } from "react-router-dom";
import logo from "../assets/brightpath-logo.png";

const BrandLogo = ({ className = "" }) => (
  <Link
    to="/"
    aria-label="BrightPath home"
    className={`inline-flex flex-shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] ${className}`}
  >
    <img
      src={logo}
      alt="BrightPath"
      className="-my-3 block h-14 w-auto select-none sm:h-16 lg:h-[72px]"
      draggable="false"
    />
  </Link>
);

export default BrandLogo;