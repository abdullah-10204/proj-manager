"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ArrowRight,
  BarChart2,
  Folder,
  Activity,
  CheckCircle,
  Archive,
  Clock,
  TrendingUp,
  Search,
  FolderOpen,
  LogOut,
  Edit,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ProgressChart = ({ projectsDetail }) => {
  const statusOrder = {
    Mobilised: 0,
    "Data Received": 1,
    "Audit Completed": 2,
    "Internal Review of Audit Report": 3,
    "Audit Report Submitted": 4,
  };

  const projectData = projectsDetail.map((project) => {
    const status = project.projectStatus || "Mobilised";
    const statusValue = statusOrder[status] || 0;
    const percentage = Math.round((statusValue / 4) * 100);

    return {
      id: project.id || project._id,
      name: project.projectName || "Unnamed Project",
      value: percentage,
      status,
      statusValue,
    };
  });

  projectData.sort((a, b) => b.statusValue - a.statusValue);

  return (
    <div className="bg-white rounded-xl p-6 border-5 shadow-sm border-[#0000FF]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-[#0000C0]" size={20} />
          <h2 className="text-xl font-semibold text-[#003366]">
            Project Status Progress
          </h2>
        </div>
        <div className="text-sm text-[#0000C0] font-medium">
          {projectsDetail.length}{" "}
          {projectsDetail.length === 1 ? "Project" : "Projects"}
        </div>
      </div>

      {projectData.length > 0 ? (
        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
          {projectData.map((item) => {
            const barColor =
              item.status === "Audit Report Submitted"
                ? "bg-gradient-to-r from-green-500 to-green-400"
                : item.status === "Internal Review of Audit Report"
                ? "bg-gradient-to-r from-[#0000C0] to-[#0000C0]"
                : item.status === "Audit Completed"
                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                : item.status === "Data Received"
                ? "bg-gradient-to-r from-purple-500 to-purple-400"
                : "bg-gradient-to-r from-gray-500 to-gray-400";

            return (
              <div key={item.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-[#003366]">
                    {item.name}
                  </div>
                  <div className="text-xs font-medium text-[#003366]">
                    {item.status}
                  </div>
                </div>

                <div className="w-full h-4 bg-[#E6F0F8] rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500 ease-out`}
                    style={{ width: `${item.value}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <span className="text-xs font-medium text-white">
                      {item.value}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center text-[#003366]">
          <FolderOpen className="text-[#E6F0F8] mb-2" size={24} />
          <p>No project data available</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center mt-6 gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E6F0F8] rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-400"></div>
          <span className="text-[#003366]">Mobilised</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E6F0F8] rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"></div>
          <span className="text-[#003366]">Data Received</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E6F0F8] rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"></div>
          <span className="text-[#003366]">Audit Completed</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E6F0F8] rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#0000C0] to-[#0000C0]"></div>
          <span className="text-[#003366]">Internal Review</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E6F0F8] rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400"></div>
          <span className="text-[#003366]">Report Submitted</span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;
  const [loading, setLoading] = useState(false);
  const [projectsDetail, setProjectsDetail] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("Mobilised");
  const role = Cookies.get("Role");
  const router = useRouter();

  const [showAIPopup, setShowAIPopup] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "User", // Default role
  });
  const [userCreationError, setUserCreationError] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const currentAdminEmail = Cookies.get("email"); // Get current admin's email

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/routes/user?action=getUsers", {
        params: {
          createdBy: currentAdminEmail, // Only fetch users created by this admin
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Call this in your useEffect
  useEffect(() => {
    if (role === "Admin") {
      fetchUsers();
    }
  }, [role, currentAdminEmail]); // Add currentAdminEmail to dependencies

  // In your Dashboard component
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const adminEmail = Cookies.get("email"); // Assuming you store the admin's email in cookies
      const response = await axios.post("/api/routes/user", {
        ...newUser,
        createdBy: adminEmail, // Pass the admin's email
      });

      if (response.data.success) {
        setShowCreateUserPopup(false);
        setNewUser({ email: "", password: "", role: "User" });
        setUserCreationError("");
        // Refresh users list
        const usersResponse = await axios.get(
          "/api/routes/user?action=getUsers"
        );
        setUsers(usersResponse.data);
      } else {
        setUserCreationError(response.data.message || "Failed to create user");
      }
    } catch (error) {
      setUserCreationError(
        error.response?.data?.message || "Failed to create user"
      );
    }
  };

  const handleLogout = () => {
    Cookies.remove("isAuthenticated");
    Cookies.remove("Role");
    router.push("/");
  };

  const fetchAllChecklistItems = async () => {
    try {
      const adminEmail = Cookies.get("email");

      const response = await axios.post(
        "/api/routes/checklist?action=getAllProjectsChecklists",
        {
          createdBy: adminEmail, // ✅ pass admin email here
        }
      );

      const projectsWithChecklists = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      setProjectsDetail(
        projectsWithChecklists.map((project) => ({
          ...project,
          id: project.projectId || project._id,
          projectName: project.projectName,
          checklist: project.checklist || [],
          projectStatus: project.projectStatus,
        }))
      );

      setLoading(false);
    } catch (err) {
      console.error("Error fetching checklist items:", err);
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.post("/api/routes/project?action=deleteProject", {
        projectId,
        email: Cookies.get("email"),
      });

      setProjects(projects.filter((project) => project._id !== projectId));
      setProjectToDelete(null);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  const fetchProjects = async () => {
    try {
      const email = Cookies.get("email");
      const role = Cookies.get("Role");

      const response = await axios.get(
        "/api/routes/project?action=getProjects",
        {
          params: {
            email,
            role,
          },
        }
      );

      setProjects(
        response.data.map((project) => ({
          ...project,
          projectStatus: project.projectStatus || "Mobilised",
        }))
      );

      setLoading(false);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllChecklistItems();
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.projectStatus?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const statusStats = projects.reduce((acc, project) => {
    const status = project.projectStatus || "Mobilised";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProjects.length === currentProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(currentProjects.map((project) => project._id));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedProjects.length === 0) {
      alert("Please select at least one project");
      return;
    }

    try {
      await axios.post("/api/routes/project?action=updateProjectStatus", {
        projectIds: selectedProjects,
        status: bulkStatus,
        createdBy: Cookies.get("email"),
      });

      fetchProjects();
      fetchAllChecklistItems();
      setSelectedProjects([]);
      setShowBulkUpdate(false);
    } catch (error) {
      console.error("Error updating project status:", error);
      alert("Failed to update project status");
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) {
      alert("Please enter a question");
      return;
    }

    try {
      setAiLoading(true);
      const response = await axios.post(
        "/api/routes/checklist?action=askAiQuestionAboutAllProject",
        {
          question: aiQuestion,
        }
      );

      setAiAnswer(response.data.answer);
    } catch (error) {
      console.error("Error asking AI question:", error);
      setAiAnswer("Failed to get answer. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#003366]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl p-4 bg-[#003366] border-5 border-[#0000FF]">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Image
                src="/image1.png"
                alt="Description"
                width={250}
                height={250}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#0000C0] rounded-lg transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={() => setShowAIPopup(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#0000C0] rounded-lg transition"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {role === "Admin" && (
              <button
                onClick={() => setShowCreateUserPopup(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#0000C0] rounded-lg transition"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Create User</span>
              </button>
            )}

            {role === "Admin" && (
              <button
                onClick={() => setShowCreatePopup(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#0000C0] to-[#0000C0] text-white hover:from-[#000080] hover:to-[#000080] rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg flex-1 sm:flex-none justify-center"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Project</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl p-6 border-5 shadow-sm border-[#0000FF]">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-[#0000C0]" size={20} />
              <h2 className="text-xl font-semibold text-[#003366]">
                Quick Stats
              </h2>
            </div>

            <div className="grid grid-cols-6 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">
                  Total Projects
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {projects.length}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-1">
                  Mobilised
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {projects.length} {/* All projects start as Mobilised */}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-1">
                  Data Received
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {
                    projects.filter((p) =>
                      [
                        "Data Received",
                        "Audit Completed",
                        "Internal Review of Audit Report",
                        "Audit Report Submitted",
                      ].includes(p.projectStatus)
                    ).length
                  }
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-600 font-medium mb-1">
                  Audit Completed
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {
                    projects.filter((p) =>
                      [
                        "Audit Completed",
                        "Internal Review of Audit Report",
                        "Audit Report Submitted",
                      ].includes(p.projectStatus)
                    ).length
                  }
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium mb-1">
                  Internal Review
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {
                    projects.filter((p) =>
                      [
                        "Internal Review of Audit Report",
                        "Audit Report Submitted",
                      ].includes(p.projectStatus)
                    ).length
                  }
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">
                  Report Submitted
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {statusStats["Audit Report Submitted"] || 0}
                </div>
              </div>
            </div>
          </div>

          <ProgressChart projectsDetail={projectsDetail} />
        </div>

        {/* Projects Table Section */}
        <div className="bg-white rounded-xl border-5 overflow-hidden shadow-sm border-[#0000FF]">
          <div className="p-4 border-b border-[#E6F0F8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-[#003366]">
              All Projects ({projects.length})
            </h3>
            <div className="flex items-center gap-3">
              {selectedProjects.length > 0 && (
                <button
                  onClick={() => setShowBulkUpdate(true)}
                  className="px-3 py-1.5 bg-[#0000C0] text-white text-sm rounded-md hover:bg-[#000080] transition"
                >
                  Update Status ({selectedProjects.length})
                </button>
              )}
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#003366]"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E6F0F8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000C0] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E6F0F8]">
              <thead className="bg-[#E6F0F8]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#003366] uppercase tracking-wider"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedProjects.length > 0 &&
                        selectedProjects.length === currentProjects.length
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-[#0000C0] rounded border-[#E6F0F8] focus:ring-[#0000C0]"
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#003366] uppercase tracking-wider"
                  >
                    Project
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#003366] uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#003366] uppercase tracking-wider"
                  >
                    Last Updated
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-[#003366] uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E6F0F8]">
                {currentProjects.length > 0 ? (
                  currentProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-[#F5F9FC]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project._id)}
                          onChange={() => toggleProjectSelection(project._id)}
                          className="h-4 w-4 text-[#0000C0] rounded border-[#E6F0F8] focus:ring-[#0000C0]"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`project/?projectid=${
                            project._id
                          }&projectDetails=${encodeURIComponent(
                            project.projectName
                          )}`}
                          className="flex items-center space-x-3 group"
                        >
                          <div className="bg-[#E6F0F8] p-2 rounded-lg">
                            <Folder className="text-[#0000C0]" size={18} />
                          </div>
                          <span className="text-sm font-medium text-[#003366] group-hover:text-[#0000C0]">
                            {project.projectName}
                          </span>
                        </Link>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {project.projectStatus === "Mobilised" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Mobilised
                            </span>
                          )}
                          {project.projectStatus === "Data Received" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Data Received
                            </span>
                          )}
                          {project.projectStatus === "Audit Completed" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Audit Completed
                            </span>
                          )}
                          {project.projectStatus ===
                            "Internal Review of Audit Report" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E6F0F8] text-[#003366]">
                              Internal Review
                            </span>
                          )}
                          {project.projectStatus ===
                            "Audit Report Submitted" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Report Submitted
                            </span>
                          )}

                          {role === "User" && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setProjectToEdit(project);
                              }}
                              className="text-[#003366] hover:text-[#0000C0] p-1 rounded-full hover:bg-[#E6F0F8]"
                              title="Edit status"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#003366]">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 opacity-70" />
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          {role === "User" && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setProjectToDelete(project);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                              title="Delete project"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}

                          <Link
                            href={`project/?projectid=${
                              project._id
                            }&projectDetails=${encodeURIComponent(
                              project.projectName
                            )}`}
                            className="text-[#0000C0] hover:text-[#003366] p-1 rounded-full hover:bg-[#E6F0F8]"
                            title="View project"
                          >
                            <ArrowRight size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-[#003366]">
                        <FolderOpen className="text-[#E6F0F8] mb-2" size={24} />
                        No projects found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProjects.length > projectsPerPage && (
            <div className="px-6 py-4 border-t border-[#E6F0F8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-[#003366]">
                Showing{" "}
                <span className="font-medium">{indexOfFirstProject + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastProject, filteredProjects.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredProjects.length}</span>{" "}
                projects
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-[#E6F0F8] text-[#003366] cursor-not-allowed"
                      : "bg-[#E6F0F8] text-[#003366] hover:bg-[#D0E0F0]"
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md min-w-[36px] ${
                        currentPage === number
                          ? "bg-[#0000C0] text-white"
                          : "bg-[#E6F0F8] text-[#003366] hover:bg-[#D0E0F0]"
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-[#E6F0F8] text-[#003366] cursor-not-allowed"
                      : "bg-[#E6F0F8] text-[#003366] hover:bg-[#D0E0F0]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Popup */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#003366] shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#003366] mb-4">
              Create New Project
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const name = e.target.projectName.value;
                const assignedUser = e.target.assignedUser.value;

                if (name.trim()) {
                  try {
                    await axios.post(
                      "/api/routes/project?action=createProject",
                      {
                        projectName: name,
                        projectStatus: "Mobilised",
                        assignedUser: assignedUser || undefined,
                        createdBy: Cookies.get("email"),
                      }
                    );
                    setShowCreatePopup(false);
                    fetchProjects();
                  } catch (error) {
                    console.error("Error creating project:", error);
                    alert("Failed to create project. Please try again.");
                  }
                }
              }}
            >
              <div className="mb-4">
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-[#003366] mb-1"
                >
                  Project Name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  className="w-full px-3 py-2 border border-[#003366] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000C0]"
                  placeholder="Enter project name"
                  required
                  autoFocus
                />
              </div>

              {role === "Admin" && (
                <div className="mb-4">
                  <label
                    htmlFor="assignedUser"
                    className="block text-sm font-medium text-[#003366] mb-1"
                  >
                    Assign to User
                  </label>
                  <select
                    id="assignedUser"
                    className="w-full px-3 py-2 border border-[#003366] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000C0]"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.email} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreatePopup(false)}
                  className="px-4 py-2 text-[#003366] hover:bg-[#E6F0F8] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#0000C0] to-[#0000C0] text-white hover:from-[#000080] hover:to-[#000080] rounded-lg transition"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#003366] shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#003366] mb-2">
              Delete Project
            </h2>
            <p className="text-[#003366] mb-6">
              Are you sure you want to delete "{projectToDelete.projectName}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-[#003366] hover:bg-[#E6F0F8] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(projectToDelete._id)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {projectToEdit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#003366] shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#003366] mb-4">
              Update Project Status
            </h2>
            <div className="space-y-3 mb-6">
              {[
                "Mobilised",
                "Data Received",
                "Audit Completed",
                "Internal Review of Audit Report",
                "Audit Report Submitted",
              ].map((status) => (
                <div
                  key={status}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    projectToEdit.projectStatus === status
                      ? "border-[#0000C0] bg-[#E6F0F8]"
                      : "border-[#E6F0F8] hover:bg-[#F5F9FC]"
                  }`}
                  onClick={() =>
                    setProjectToEdit({
                      ...projectToEdit,
                      projectStatus: status,
                    })
                  }
                >
                  <div className="flex items-center gap-3">
                    {status === "Mobilised" && (
                      <Clock className="text-[#003366]" size={18} />
                    )}
                    {status === "Data Received" && (
                      <Folder className="text-purple-500" size={18} />
                    )}
                    {status === "Audit Completed" && (
                      <CheckCircle className="text-amber-500" size={18} />
                    )}
                    {status === "Internal Review of Audit Report" && (
                      <BarChart2 className="text-[#0000C0]" size={18} />
                    )}
                    {status === "Audit Report Submitted" && (
                      <Archive className="text-green-500" size={18} />
                    )}
                    <span className="font-medium text-[#003366]">{status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProjectToEdit(null)}
                className="px-4 py-2 text-[#003366] hover:bg-[#E6F0F8] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.post(
                      "/api/routes/project?action=updateProjectStatus",
                      {
                        projectId: projectToEdit._id,
                        status: projectToEdit.projectStatus,
                        createdBy: Cookies.get("email"),
                      }
                    );
                    fetchProjects();
                    fetchAllChecklistItems();
                    setProjectToEdit(null);
                  } catch (error) {
                    console.error("Error updating project status:", error);
                    alert("Failed to update project status");
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#0000C0] to-[#0000C0] text-white hover:from-[#000080] hover:to-[#000080] rounded-lg transition"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#003366] shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#003366] mb-4">
              Update Status for {selectedProjects.length} Projects
            </h2>
            <div className="space-y-3 mb-6">
              {[
                "Mobilised",
                "Data Received",
                "Audit Completed",
                "Internal Review of Audit Report",
                "Audit Report Submitted",
              ].map((status) => (
                <div
                  key={status}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    bulkStatus === status
                      ? "border-[#0000C0] bg-[#E6F0F8]"
                      : "border-[#E6F0F8] hover:bg-[#F5F9FC]"
                  }`}
                  onClick={() => setBulkStatus(status)}
                >
                  <div className="flex items-center gap-3">
                    {status === "Mobilised" && (
                      <Clock className="text-[#003366]" size={18} />
                    )}
                    {status === "Data Received" && (
                      <Folder className="text-purple-500" size={18} />
                    )}
                    {status === "Audit Completed" && (
                      <CheckCircle className="text-amber-500" size={18} />
                    )}
                    {status === "Internal Review of Audit Report" && (
                      <BarChart2 className="text-[#0000C0]" size={18} />
                    )}
                    {status === "Audit Report Submitted" && (
                      <Archive className="text-green-500" size={18} />
                    )}
                    <span className="font-medium text-[#003366]">{status}</span>
                  </div>
                </div>
              ))}
              {role === "Admin" && (
                <div className="mb-4">
                  <label
                    htmlFor="assignedUser"
                    className="block text-sm font-medium text-[#003366] mb-1"
                  >
                    Assign to User
                  </label>
                  <select
                    id="assignedUser"
                    className="w-full px-3 py-2 border border-[#003366] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000C0]"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.email} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkUpdate(false)}
                className="px-4 py-2 text-[#003366] hover:bg-[#E6F0F8] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStatusUpdate}
                className="px-4 py-2 bg-gradient-to-r from-[#0000C0] to-[#0000C0] text-white hover:from-[#000080] hover:to-[#000080] rounded-lg transition"
              >
                Update All
              </button>
            </div>
          </div>
        </div>
      )}

      {showAIPopup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#003366] shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-[#003366] mb-4">
              Ask AI About Projects
            </h2>

            <div className="mb-4">
              <label
                htmlFor="aiQuestion"
                className="block text-sm font-medium text-[#003366] mb-1"
              >
                Your Question *
              </label>
              <textarea
                id="aiQuestion"
                rows={3}
                className="w-full px-3 py-2 border border-[#003366] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0000C0]"
                placeholder="Ask anything about your projects..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                disabled={aiLoading}
              />
            </div>

            {aiAnswer && (
              <div className="mb-4 p-4 bg-[#E6F0F8] rounded-lg">
                <h3 className="font-medium text-[#003366] mb-2">
                  AI Response:
                </h3>
                <p className="text-[#003366] whitespace-pre-wrap">{aiAnswer}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAIPopup(false);
                  setAiQuestion("");
                  setAiAnswer("");
                }}
                className="px-4 py-2 text-[#003366] hover:bg-[#E6F0F8] rounded-lg transition"
                disabled={aiLoading}
              >
                Close
              </button>
              <button
                onClick={handleAskAI}
                className="px-4 py-2 bg-gradient-to-r from-[#0000C0] to-[#0000C0] text-white hover:from-[#000080] hover:to-[#000080] rounded-lg transition flex items-center gap-2"
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Ask AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateUserPopup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#003366] shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#003366] mb-4">
              Create New User
            </h2>
            {userCreationError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {userCreationError}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const adminEmail = Cookies.get("email"); // Get the admin's email from cookies
                  const response = await axios.post("/api/routes/user", {
                    email: newUser.email,
                    password: newUser.password,
                    role: newUser.role,
                    createdBy: adminEmail, // Include the admin's email
                  });

                  if (response.data.success) {
                    setShowCreateUserPopup(false);
                    setNewUser({ email: "", password: "", role: "User" });
                    setUserCreationError("");
                    // Refresh users list
                    const usersResponse = await axios.get(
                      "/api/routes/user?action=getUsers"
                    );
                    setUsers(usersResponse.data);
                  } else {
                    setUserCreationError(
                      response.data.message || "Failed to create user"
                    );
                  }
                } catch (error) {
                  setUserCreationError(
                    error.response?.data?.message || "Failed to create user"
                  );
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#003366] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-[#003366] rounded-md"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#003366] mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-[#003366] rounded-md"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#003366] mb-1">
                  Role *
                </label>
                <select
                  className="w-full px-3 py-2 border border-[#003366] rounded-md"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="User">User</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUserPopup(false);
                    setUserCreationError("");
                  }}
                  className="px-4 py-2 text-[#003366] hover:bg-[#E6F0F8] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#0000C0] to-[#0000C0] text-white hover:from-[#000080] hover:to-[#000080] rounded-lg transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
