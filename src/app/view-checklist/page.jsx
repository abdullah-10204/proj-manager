"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

const ChecklistPage = () => {
    const [checklistItems, setChecklistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const searchParam = useSearchParams();
    const projectId = searchParam.get("projectId");

    useEffect(() => {
        const fetchAllChecklistItems = async () => {
            try {
                const response = await axios.post('/api/routes/checklist?action=getChecklistItems',{
                    projectId
                });
                console.log("response",response);
                
                setChecklistItems(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAllChecklistItems();
    }, []);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Compliance Checklist</h1>
                <p className="text-gray-600">View all checklist items</p>
            </div>

            <div className="space-y-4">
                {checklistItems.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <div className="p-5">
                            <div 
                                className="flex justify-between items-start cursor-pointer"
                                onClick={() => toggleExpand(item._id)}
                            >
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {item.controlItem}
                                    </h3>
                                </div>
                                <svg
                                    className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedId === item._id ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {expandedId === item._id && (
                                <div className="mt-4 space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="font-medium text-gray-700 mb-2">Control Objective:</h4>
                                        <p className="text-gray-600">{item.controlObjective}</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-gray-700 mb-2">Response:</h4>
                                        <div className={`p-3 rounded-md ${item.answer ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-200'}`}>
                                            <p className={item.answer ? "text-gray-800" : "text-gray-500 italic"}>
                                                {item.answer || "Answer not Present"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChecklistPage;