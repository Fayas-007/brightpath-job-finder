const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const SavedJob = require("../models/SavedJob");

const deleteJobsAndRelatedData = async (jobFilter) => {
  const jobs = await Job.find(jobFilter).select("_id").lean();
  const jobIds = jobs.map((job) => job._id);

  if (jobIds.length === 0) return { deletedJobs: 0, deletedApplications: 0, deletedSavedJobs: 0 };

  const applications = await Application.find({ job: { $in: jobIds } })
    .select("_id")
    .lean();
  const applicationIds = applications.map((application) => application._id);

  await Notification.deleteMany({
    $or: [
      { job: { $in: jobIds } },
      { application: { $in: applicationIds } },
    ],
  });

  const [applicationResult, savedJobResult, jobResult] = await Promise.all([
    Application.deleteMany({ job: { $in: jobIds } }),
    SavedJob.deleteMany({ job: { $in: jobIds } }),
    Job.deleteMany({ _id: { $in: jobIds } }),
  ]);

  return {
    deletedJobs: jobResult.deletedCount || 0,
    deletedApplications: applicationResult.deletedCount || 0,
    deletedSavedJobs: savedJobResult.deletedCount || 0,
  };
};

const deleteUserRelatedData = async (user) => {
  if (user.role === "employer" || user.role === "recruiter") {
    await deleteJobsAndRelatedData({ company: user._id });
  }

  if (user.role === "jobseeker") {
    const applications = await Application.find({ applicant: user._id })
      .select("_id")
      .lean();
    const applicationIds = applications.map((application) => application._id);

    await Promise.all([
      Notification.deleteMany({
        $or: [
          { recipient: user._id },
          { actor: user._id },
          { application: { $in: applicationIds } },
        ],
      }),
      Application.deleteMany({ applicant: user._id }),
      SavedJob.deleteMany({ jobseeker: user._id }),
    ]);
  } else {
    await Notification.deleteMany({
      $or: [{ recipient: user._id }, { actor: user._id }],
    });
  }
};

module.exports = {
  deleteJobsAndRelatedData,
  deleteUserRelatedData,
};
