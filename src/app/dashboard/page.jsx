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
  Search
} from "lucide-react";
import Link from "next/link";
import axios from "axios";


const ProgressChart = () => {
  const data = [
    { month: "Jan", value: 65 },
    { month: "Feb", value: 59 },
    { month: "Mar", value: 80 },
    { month: "Apr", value: 81 },
    { month: "May", value: 56 },
    { month: "Jun", value: 55 },
    { month: "Jul", value: 40 },
  ];

  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-blue-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            Project Activity
          </h2>
        </div>
        <div className="text-sm text-blue-600 font-medium">Last 7 months</div>
      </div>
      <div className="flex items-end h-40 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <div className="mt-2 text-xs text-gray-500">{item.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  console.log("projects", projects);

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;
  const [lLoading, setLoading] = useState(false);

  const handleDeleteProject = async (projectId) => {
  try {
    const response = await axios.post('/api/routes/project?action=deleteProject', {
      projectId: projectId
    });

    // Remove the project from local state
    setProjects(projects.filter(project => project._id !== projectId));
    setProjectToDelete(null); // Close the confirmation dialog
    
    // Optional: Show success message
    alert('Project deleted successfully');
    
    // Refresh projects if needed
    fetchProjects();
  } catch (error) {
    console.error('Error deleting project:', error);
    alert('Failed to delete project');
  }
};

  const handleCreateProject = (name) => {
    const newProject = {
      id: Date.now().toString(),
      name,
      updatedAt: "Just now",
      icon: <Folder className="text-blue-500" size={18} />,
      status: "Planning",
      team: "New Team",
    };
    setProjects([newProject, ...projects]);
    setShowCreatePopup(false);
  };

  const filteredProjects = projects.filter((project) =>
    project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectTeam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

      const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/routes/project?action=getProjects');
        console.log("response", response.data);

        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

  useEffect(() => {


    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage your current projects</p>
          </div>
          <button
            onClick={() => setShowCreatePopup(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        <ProgressChart />

        {/* Projects Table Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Management</h2>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                All Projects ({projects.length})
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      Team
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
                          <Link href={`/${project._id}/${project.projectName}`} className="flex items-center space-x-3 group">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Folder className="text-blue-500" size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {project.projectName}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.projectTeam}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1 opacity-70" />
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setProjectToDelete(project);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </button>
                            <Link
                              href={`project/?projectid=${project._id}&projectDetails=${encodeURIComponent(project.projectName)}`}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                            >
                              <ArrowRight size={18} />
                            </Link>

                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No projects found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredProjects.length > projectsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{indexOfFirstProject + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastProject, filteredProjects.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredProjects.length}</span> projects
                </div>
                <div className="flex space-x-2">
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
                      className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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
      </div>

      {/* Create Project Popup */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const name = e.target.projectName.value;
              const teamMember = e.target.projectTeam.value; // Single value (string)

              if (name.trim()) {
                try {
                  const response = await axios.post('/api/routes/project?action=createProject', {
                    projectName: name,
                    projectTeam: teamMember  // now just a string
                  });

                  const newProject = response.data;
                  handleCreateProject(newProject);
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
                />
              </div>

              <div className="mb-4">
                <label htmlFor="projectTeam" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Member
                </label>
                <select
                  id="projectTeam"
                  name="projectTeam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-auto min-h-[42px]"
                  required
                >
                  <option value="">Select a team member</option>
                  <option value="user1@example.com">John Doe (Developer)</option>
                  <option value="user2@example.com">Jane Smith (Designer)</option>
                  <option value="user3@example.com">Mike Johnson (PM)</option>
                </select>
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
              Are you sure you want to delete "{projectToDelete.name}"?
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
