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
  LogOut
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const ProgressChart = ({ projectsDetail }) => {
  const projectData = projectsDetail.map(project => {
    if (!project.checklist || project.checklist.length === 0) {
      return {
        id: project.id || project._id,
        name: project.projectName || 'Unnamed Project',
        value: 0,
        totalItems: 0,
        completedItems: 0
      };
    }

    const completedItems = project.checklist.filter(item => item.answer && item.answer.trim() !== '').length;
    const percentage = Math.round((completedItems / project.checklist.length) * 100);

    return {
      id: project.id || project._id,
      name: project.projectName || 'Unnamed Project',
      value: percentage,
      totalItems: project.checklist.length,
      completedItems
    };
  });

  projectData.sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-blue-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            Project Completion Progress
          </h2>
        </div>
        <div className="text-sm text-blue-600 font-medium">
          {projectsDetail.length} {projectsDetail.length === 1 ? 'Project' : 'Projects'}
        </div>
      </div>

      {projectData.length > 0 ? (
        <div className="space-y-4">
          {projectData.map((item) => {
            const barColor = item.value === 100
              ? 'bg-gradient-to-r from-green-500 to-green-400'
              : item.value >= 75
                ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                : item.value >= 50
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400';

            return (
              <div key={item.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                    {item.name}
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    {item.completedItems}/{item.totalItems} items
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
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400"></div>
          <span>100% Complete</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"></div>
          <span>75-99%</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"></div>
          <span>50-74%</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-400"></div>
          <span>Below 50%</span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;
  const [loading, setLoading] = useState(false);
  const [projectsDetail, setProjectsDetail] = useState([]);
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

      const normalizedProjects = projectsWithChecklists.map(project => ({
        ...project,
        id: project.projectId || project._id,
        projectName: project.projectName || `Project ${project._id}`,
        checklist: project.checklist || []
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
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllChecklistItems();
    fetchProjects();
  }, []);

  // Filter and pagination logic
  const filteredProjects = projects.filter((project) =>
    project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Project Dashboard</h1>
            <p className="text-gray-600">Manage your current projects</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
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

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <ProgressChart projectsDetail={projectsDetail} />

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-blue-500" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Quick Stats</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">Total Projects</div>
                <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">Completed</div>
                <div className="text-2xl font-bold text-gray-900">
                  {projectsDetail.filter(p => 
                    p.checklist && p.checklist.length > 0 && 
                    p.checklist.every(item => item.answer && item.answer.trim() !== '')
                  ).length}
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-600 font-medium mb-1">In Progress</div>
                <div className="text-2xl font-bold text-gray-900">
                  {projectsDetail.filter(p => 
                    p.checklist && p.checklist.length > 0 && 
                    p.checklist.some(item => item.answer && item.answer.trim() !== '') &&
                    !p.checklist.every(item => item.answer && item.answer.trim() !== '')
                  ).length}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-1">Not Started</div>
                <div className="text-2xl font-bold text-gray-900">
                  {projectsDetail.filter(p => 
                    !p.checklist || p.checklist.length === 0 || 
                    p.checklist.every(item => !item.answer || item.answer.trim() === '')
                  ).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              All Projects ({projects.length})
            </h3>
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
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
                    <td colSpan="3" className="px-6 py-8 text-center">
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
    </div>
  );
}