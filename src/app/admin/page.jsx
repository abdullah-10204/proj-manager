"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChecklistPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [answerInput, setAnswerInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedProjects, setExpandedProjects] = useState({});

    useEffect(() => {
        const fetchAllChecklistItems = async () => {
            try {
                const response = await axios.post('/api/routes/checklist?action=getAllProjectsChecklists');
                const projectsWithChecklists = Array.isArray(response.data.data) ? response.data.data : [];

                const normalizedProjects = projectsWithChecklists.map(project => ({
                    ...project,
                    id: project.projectId || project._id,
                    checklist: project.checklist || []
                }));

                setProjects(normalizedProjects);

                const initialExpandedState = {};
                normalizedProjects.forEach(project => {
                    initialExpandedState[project.id] = true;
                });
                setExpandedProjects(initialExpandedState);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching checklist items:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAllChecklistItems();
    }, []);

    const toggleProject = (projectId) => {
        setExpandedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    };

    const handleUpdateAnswer = async (projectId, itemId) => {
        if (!projectId) {
            alert("Project ID is missing. Please try again.");
            return;
        }

        if (!itemId) {
            alert("Item ID is missing. Please try again.");
            return;
        }

        if (!answerInput.trim()) {
            alert("Please enter a response before saving");
            return;
        }

        try {
            const response = await axios.post('/api/routes/checklist?action=updateChecklistAnswer', {
                projectId: projectId,
                itemId: itemId,
                answer: answerInput
            });

            setProjects(prevProjects =>
                prevProjects.map(project => {
                    if (project.id === projectId) {
                        return {
                            ...project,
                            checklist: project.checklist.map(item =>
                                item._id === itemId ? { ...item, answer: answerInput } : item
                            )
                        };
                    }
                    return project;
                })
            );

            setEditingId(null);
            setAnswerInput('');
        } catch (err) {
            console.error('Failed to update answer:', err);
            alert('Failed to update answer. Please try again.');
        }
    };

    const startEditing = (id, currentAnswer) => {
        setEditingId(id);
        setAnswerInput(currentAnswer || '');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setAnswerInput('');
    };

    const allChecklistItems = projects.flatMap(project =>
        project.checklist.map(item => ({
            ...item,
            projectId: project.id,
            projectName: project.projectName
        }))
    );

    const filteredItems = allChecklistItems.filter(item =>
        item.controlItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.controlObjective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.projectId]) {
            acc[item.projectId] = {
                projectName: item.projectName,
                projectId: item.projectId,
                items: []
            };
        }
        acc[item.projectId].items.push(item);
        return acc;
    }, {});

    const totalCompleted = allChecklistItems.filter(item => item.answer).length;
    const totalItems = allChecklistItems.length;

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-500">
            <p className="text-xl font-medium">Error loading checklist</p>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Procurement Compliance Checklist</h1>
                <p className="text-gray-600">Complete all items to ensure compliance with procurement policies</p>
            </div>

            {/* Search and Stats */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search checklist items or projects..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg
                            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                        </svg>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">
                            Completed: {totalCompleted} / {totalItems}
                        </p>
                    </div>
                </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-4">
                {Object.keys(groupedItems).length === 0 ? (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1"
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No items found</h3>
                        <p className="mt-1 text-gray-500">Try adjusting your search query</p>
                    </div>
                ) : (
                    Object.values(groupedItems).map(({ projectId, projectName, items }) => (
                        <div key={projectId} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                            <div
                                className="bg-gray-50 px-5 py-3 border-b flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                onClick={() => toggleProject(projectId)}
                            >
                                <div className="flex items-center">
                                    <h2 className="text-lg font-semibold text-gray-800">{projectName}</h2>
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {items.length} items
                                    </span>
                                </div>
                                <svg
                                    className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedProjects[projectId] ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {expandedProjects[projectId] && (
                                <div className="divide-y divide-gray-100">
                                    {items.map(item => (
                                        <div key={item._id} className="p-5 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">{item.controlItem}</h3>
                                                    <p className="text-gray-600 text-sm mb-3">{item.controlObjective}</p>
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {item.category || 'General'}
                                                </span>
                                            </div>

                                            <div className="mt-4">
                                                {editingId === item._id ? (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={answerInput}
                                                            onChange={(e) => setAnswerInput(e.target.value)}
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            rows={3}
                                                            placeholder="Enter your response..."
                                                            required
                                                        />
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleUpdateAnswer(projectId, item._id)}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                            >
                                                                Save Response
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className={`p-3 rounded-md ${item.answer ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}>
                                                            <p className={`text-sm ${item.answer ? 'text-gray-800' : 'text-gray-500 italic'}`}>
                                                                {item.answer || 'No response provided yet'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => startEditing(item._id, item.answer)}
                                                            className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                            </svg>
                                                            {item.answer ? 'Edit Response' : 'Add Response'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChecklistPage;