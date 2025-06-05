"use client";
import React, { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

const statCards = [
  {
    title: "Total Projects",
    icon: <Folder className="text-blue-500" size={20} />,
    gradient: "from-blue-400 to-blue-600",
    value: "12",
  },
  {
    title: "Active",
    icon: <Activity className="text-emerald-500" size={20} />,
    gradient: "from-emerald-400 to-emerald-600",
    value: "8",
  },
  {
    title: "Completed",
    icon: <CheckCircle className="text-purple-500" size={20} />,
    gradient: "from-purple-400 to-purple-600",
    value: "3",
  },
  {
    title: "Archived",
    icon: <Archive className="text-amber-500" size={20} />,
    gradient: "from-amber-400 to-amber-600",
    value: "1",
  },
];

const CreateProjectPopup = ({ onClose, onCreate }) => {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      onCreate(projectName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Create New Project
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Project name"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition flex items-center gap-2"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  const [projects, setProjects] = useState([
    {
      id: "1",
      name: "Website Redesign",
      updatedAt: "2 hours ago",
      icon: <Layers className="text-blue-500" size={18} />,
    },
    {
      id: "2",
      name: "Mobile App Development",
      updatedAt: "1 day ago",
      icon: <Zap className="text-purple-500" size={18} />,
    },
    {
      id: "3",
      name: "Marketing Campaign",
      updatedAt: "3 days ago",
      icon: <Activity className="text-emerald-500" size={18} />,
    },
    {
      id: "4",
      name: "Product Launch",
      updatedAt: "1 week ago",
      icon: <CheckCircle className="text-amber-500" size={18} />,
    },
  ]);

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleCreateProject = (name) => {
    const newProject = {
      id: Date.now().toString(),
      name,
      updatedAt: "Just now",
      icon: <Folder className="text-blue-500" size={18} />,
    };
    setProjects([newProject, ...projects]);
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
    setProjectToDelete(null);
  };

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

        {/* Stats with Gradients and Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.gradient} text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium opacity-80">
                    {stat.title}
                  </div>
                  <div className="text-2xl font-bold mt-1">{stat.value}</div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <ProgressChart />

        {/* Projects Grid */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Projects
            </h2>
            <div className="text-sm text-gray-500">
              {projects.length} projects
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/${project.id}/${project.name}`}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-md overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        {project.icon}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition">
                        {project.name}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setProjectToDelete(project);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 -mr-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} className="opacity-70" />
                      <span>Updated {project.updatedAt}</span>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 group-hover:text-blue-500 transition"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Create Project Popup */}
      {showCreatePopup && (
        <CreateProjectPopup
          onClose={() => setShowCreatePopup(false)}
          onCreate={handleCreateProject}
        />
      )}

      {/* Delete Confirmation */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
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
                onClick={() => handleDeleteProject(projectToDelete.id)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-lg transition flex items-center gap-2"
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
