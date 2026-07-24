import {
  Search,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  Award,
  Briefcase,
  LayoutDashboard,
  Plus,
} from "lucide-react";

export const jobSeekerFeatures = [
  {
    icon: Search,
    title: "Smart Job Matching",
    description:
      "Filter opportunities by role, location, category, and job type without losing track of what matters.",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description:
      "Keep profile details and resume information ready before you apply.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description:
      "Keep the next step clear by tracking each application in one place.",
  },
  {
    icon: Award,
    title: "Skill Assessment",
    description:
      "Present your education, experience, and career details in a simple profile.",
  },
];

export const employerFeatures = [
  {
    icon: Users,
    title: "Talent Pool Access",
    description:
      "Review applicants from each job post with the context your team needs.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "See open jobs, recent applicants, and hiring activity from a focused dashboard.",
  },
  {
    icon: Shield,
    title: "Verified Candidates",
    description:
      "Keep candidate details, resumes, and application status easy to review.",
  },
  {
    icon: Clock,
    title: "Quick Hiring",
    description:
      "Move candidates forward with clear status updates and organized job records.",
  },
];

// Navigation items configuration
export const NAVIGATION_MENU = [
  { id: "employer-dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "post-job", name: "Post Job", icon: Plus },
  { id: "manage-jobs", name: "Manage Jobs", icon: Briefcase },
];

// Categories and job types
export const CATEGORIES = [
  { value: "Engineering", label: "Engineering" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "IT & Software", label: "IT & Software" },
  { value: "Customer-service", label: "Customer Service" },
  { value: "Product", label: "Product" },
  { value: "Operations", label: "Operations" },
  { value: "Finance", label: "Finance" },
  { value: "HR", label: "Human Resources" },
  { value: "Other", label: "Other" },
];

export const JOB_TYPES = [
  { value: "Remote", label: "Remote" },
  { value: "Full-Time", label: "Full-Time" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];

export const SALARY_RANGES = [
  "Less than $1000",
  "$1000 - $15,000",
  "More than $15,000",
];
