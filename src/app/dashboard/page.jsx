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
  Zap,
  Clock,
  TrendingUp,
  Layers,
  Search,
  FolderOpen,
  LogOut,
  Edit
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const ProgressChart = ({ projectsDetail }) => {
  const statusOrder = {
    'Not Started': 0,
    'Data Received': 1,
    'Audit Completed': 2,
    'Internal Review of Audit Report': 3,
    'Audit Report Submitted': 4
  };

  const projectData = projectsDetail.map(project => {
    const status = project.projectStatus || 'Not Started';
    const statusValue = statusOrder[status] || 0;
    const percentage = Math.round((statusValue / 4) * 100);

    return {
      id: project.id || project._id,
      name: project.projectName || 'Unnamed Project',
      value: percentage,
      status,
      statusValue
    };
  });

  projectData.sort((a, b) => b.statusValue - a.statusValue);

  return (
<div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: '#002BFF', borderWidth: '4px' }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-blue-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            Project Status Progress
          </h2>
        </div>
        <div className="text-sm text-blue-600 font-medium">
          {projectsDetail.length} {projectsDetail.length === 1 ? 'Project' : 'Projects'}
        </div>
      </div>

      {projectData.length > 0 ? (
        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar ">
          {projectData.map((item) => {
            const barColor = item.status === 'Audit Report Submitted'
              ? 'bg-gradient-to-r from-green-500 to-green-400'
              : item.status === 'Internal Review of Audit Report'
                ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                : item.status === 'Audit Completed'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : item.status === 'Data Received'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-400'
                    : 'bg-gradient-to-r from-gray-500 to-gray-400';

            return (
              <div key={item.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                    {item.name}
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    {item.status}
                  </div>
                </div>

                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative">
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
        <div className="h-40 flex flex-col items-center justify-center text-gray-500">
          <FolderOpen className="text-gray-300 mb-2" size={24} />
          <p>No project data available</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center mt-6 gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-400"></div>
          <span>Not Started</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"></div>
          <span>Data Received</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"></div>
          <span>Audit Completed</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"></div>
          <span>Internal Review</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400"></div>
          <span>Report Submitted</span>
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
  const [bulkStatus, setBulkStatus] = useState('Not Started');
  const role = Cookies.get("Role");
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("isAuthenticated");
    Cookies.remove("Role");
    router.push("/");
  };

  const fetchAllChecklistItems = async () => {
    try {
      const response = await axios.post('/api/routes/checklist?action=getAllProjectsChecklists');
      const projectsWithChecklists = Array.isArray(response.data.data) ? response.data.data : [];
      console.log("projectsWithChecklists", projectsWithChecklists);

      const normalizedProjects = projectsWithChecklists.map(project => ({
        ...project,
        id: project.projectId || project._id,
        projectName: project.projectName || `Project ${project._id}`,
        checklist: project.checklist || [],
        projectStatus: project.projectStatus
      }));

      setProjectsDetail(normalizedProjects);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching checklist items:", err);
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.post('/api/routes/project?action=deleteProject', {
        projectId: projectId
      });

      setProjects(projects.filter(project => project._id !== projectId));
      setProjectToDelete(null);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/routes/project?action=getProjects');
      setProjects(
        response.data.map(project => ({
          ...project,
          projectStatus: project.projectStatus || 'Not Started'
        }))
      );
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllChecklistItems();
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.projectStatus?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate stats based on status
  const statusStats = projects.reduce((acc, project) => {
    const status = project.projectStatus || 'Not Started';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Handle project selection
  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Handle select all projects on current page
  const toggleSelectAll = () => {
    if (selectedProjects.length === currentProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(currentProjects.map(project => project._id));
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async () => {
    if (selectedProjects.length === 0) {
      alert('Please select at least one project');
      return;
    }

    try {
      await axios.post('/api/routes/project?action=updateProjectStatus', {
        projectIds: selectedProjects,
        status: bulkStatus
      });

      fetchProjects();
      fetchAllChecklistItems();
      setSelectedProjects([]);
      setShowBulkUpdate(false);
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#00004F]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
<div
  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl p-4"
  style={{
    borderColor: '#002BFF',
    borderWidth: '4px',
    borderStyle: 'solid',
  }}
>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Project Dashboard</h1>
            <p className="text-gray-600">Manage your current projects</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline ">Logout</span>
            </button>

            {role === "Admin" && (
              <button
                onClick={() => setShowCreatePopup(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg flex-1 sm:flex-none justify-center"
              >
                <Plus size={18} /> <span className="hidden sm:inline">New Project</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressChart projectsDetail={projectsDetail} />


          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: '#002BFF', borderWidth: '4px' }}>
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-blue-500" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Quick Stats</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">Total Projects</div>
                <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-1">Not Started</div>
                <div className="text-2xl font-bold text-gray-900">
                  {projects.length} {/* All projects start as Not Started */}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-1">Data Received</div>
                <div className="text-2xl font-bold text-gray-900">
                  {projects.filter(p =>
                    ['Data Received', 'Audit Completed', 'Internal Review of Audit Report', 'Audit Report Submitted']
                      .includes(p.projectStatus)
                  ).length}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-600 font-medium mb-1">Audit Completed</div>
                <div className="text-2xl font-bold text-gray-900">
                  {projects.filter(p =>
                    ['Audit Completed', 'Internal Review of Audit Report', 'Audit Report Submitted']
                      .includes(p.projectStatus)
                  ).length}
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium mb-1">Internal Review</div>
                <div className="text-2xl font-bold text-gray-900">
                  {projects.filter(p =>
                    ['Internal Review of Audit Report', 'Audit Report Submitted']
                      .includes(p.projectStatus)
                  ).length}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">Report Submitted</div>
                <div className="text-2xl font-bold text-gray-900">
                  {statusStats['Audit Report Submitted'] || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table Section */}
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#002BFF', borderWidth: '4px' }}>
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              All Projects ({projects.length})
            </h3>
            <div className="flex items-center gap-3">
              {selectedProjects.length > 0 && (
                <button
                  onClick={() => setShowBulkUpdate(true)}
                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition"
                >
                  Update Status ({selectedProjects.length})
                </button>
              )}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProjects.length > 0 && selectedProjects.length === currentProjects.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProjects.length > 0 ? (
                  currentProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project._id)}
                          onChange={() => toggleProjectSelection(project._id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`project/?projectid=${project._id}&projectDetails=${encodeURIComponent(project.projectName)}`}
                          className="flex items-center space-x-3 group"
                        >
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <Folder className="text-blue-500" size={18} />
                          </div>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {project.projectName}
                          </span>
                        </Link>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {project.projectStatus === 'Not Started' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Not Started
                            </span>
                          )}
                          {project.projectStatus === 'Data Received' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Data Received
                            </span>
                          )}
                          {project.projectStatus === 'Audit Completed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Audit Completed
                            </span>
                          )}
                          {project.projectStatus === 'Internal Review of Audit Report' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Internal Review
                            </span>
                          )}
                          {project.projectStatus === 'Audit Report Submitted' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Report Submitted
                            </span>
                          )}

                          {role === "Admin" && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setProjectToEdit(project);
                              }}
                              className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                              title="Edit status"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 opacity-70" />
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          {role === "Admin" && (
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
                            href={`project/?projectid=${project._id}&projectDetails=${encodeURIComponent(project.projectName)}`}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
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
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FolderOpen className="text-gray-300 mb-2" size={24} />
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
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{indexOfFirstProject + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastProject, filteredProjects.length)}
                </span>{' '}
                of <span className="font-medium">{filteredProjects.length}</span> projects
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md min-w-[36px] ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const name = e.target.projectName.value;

              if (name.trim()) {
                try {
                  await axios.post('/api/routes/project?action=createProject', {
                    projectName: name,
                    projectStatus: 'Not Started'
                  });
                  setShowCreatePopup(false);
                  fetchProjects();
                } catch (error) {
                  console.error('Error creating project:', error);
                  alert('Failed to create project. Please try again.');
                }
              }
            }}>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreatePopup(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition"
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Delete Project
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{projectToDelete.projectName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Update Project Status
            </h2>
            <div className="space-y-3 mb-6">
              {['Not Started', 'Data Received', 'Audit Completed', 'Internal Review of Audit Report', 'Audit Report Submitted'].map((status) => (
                <div
                  key={status}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${projectToEdit.projectStatus === status ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setProjectToEdit({ ...projectToEdit, projectStatus: status })}
                >
                  <div className="flex items-center gap-3">
                    {status === 'Not Started' && <Clock className="text-gray-500" size={18} />}
                    {status === 'Data Received' && <Folder className="text-purple-500" size={18} />}
                    {status === 'Audit Completed' && <CheckCircle className="text-amber-500" size={18} />}
                    {status === 'Internal Review of Audit Report' && <BarChart2 className="text-blue-500" size={18} />}
                    {status === 'Audit Report Submitted' && <Archive className="text-green-500" size={18} />}
                    <span className="font-medium">{status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProjectToEdit(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.post('/api/routes/project?action=updateProjectStatus', {
                      projectId: projectToEdit._id,
                      status: projectToEdit.projectStatus
                    });
                    fetchProjects();
                    fetchAllChecklistItems();
                    setProjectToEdit(null);
                  } catch (error) {
                    console.error('Error updating project status:', error);
                    alert('Failed to update project status');
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition"
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Update Status for {selectedProjects.length} Projects
            </h2>
            <div className="space-y-3 mb-6">
              {['Not Started', 'Data Received', 'Audit Completed', 'Internal Review of Audit Report', 'Audit Report Submitted'].map((status) => (
                <div
                  key={status}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${bulkStatus === status ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setBulkStatus(status)}
                >
                  <div className="flex items-center gap-3">
                    {status === 'Not Started' && <Clock className="text-gray-500" size={18} />}
                    {status === 'Data Received' && <Folder className="text-purple-500" size={18} />}
                    {status === 'Audit Completed' && <CheckCircle className="text-amber-500" size={18} />}
                    {status === 'Internal Review of Audit Report' && <BarChart2 className="text-blue-500" size={18} />}
                    {status === 'Audit Report Submitted' && <Archive className="text-green-500" size={18} />}
                    <span className="font-medium">{status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkUpdate(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStatusUpdate}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition"
              >
                Update All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};