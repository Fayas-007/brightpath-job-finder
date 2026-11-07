import dashboard from "../../assets/admin-backdrop.png";
import users from "../../assets/users.png";
import jobs from "../../assets/jobs.png";
import applications from "../../assets/application.png";

const IMAGES = { dashboard, users, jobs, applications };

const AdminBackdrop = ({ page = "dashboard" }) => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
  >
    <img
      src={IMAGES[page] || dashboard}
      alt=""
      className="m-backdrop h-full w-full object-cover object-right"
    />
  </div>
);

export default AdminBackdrop;