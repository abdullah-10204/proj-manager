"use client"
import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const ChecklistContent = () => {
    const [checklistItems, setChecklistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editAnswer, setEditAnswer] = useState('');
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const searchParam = useSearchParams();
    const projectId = searchParam.get("projectId");
    const role = Cookies.get("Role");
    const router = useRouter();

    useEffect(() => {
        const fetchAllChecklistItems = async () => {
            try {
                const response = await axios.post('/api/routes/checklist?action=getChecklistItems', {
                    projectId
                });
                setChecklistItems(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAllChecklistItems();
    }, [projectId]);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleEditClick = (item) => {
        setEditingId(item._id);
        setEditAnswer(item.answer || '');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditAnswer('');
    };

    const handleSaveAnswer = async (itemId) => {
        try {
            const response = await axios.post('/api/routes/checklist?action=updateChecklistAnswer', {
                projectId,
                itemId,
                answer: editAnswer
            });

            setChecklistItems(checklistItems.map(item => 
                item._id === itemId ? { ...item, answer: editAnswer } : item
            ));
            setEditingId(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAiQuestionSubmit = async (e) => {
        e.preventDefault();
        if (!aiQuestion.trim()) return;
        
        setIsAiLoading(true);
        setAiError(null);
        
        try {
            const response = await axios.post('/api/routes/checklist?action=askAiQuestion', {
                question: aiQuestion,
                context: `This question is related to a compliance checklist project (ID: ${projectId}). The user is asking:`
            });
            
            setAiAnswer(response.data.answer);
            setAiQuestion('');
        } catch (err) {
            setAiError(err.response?.data?.message || err.message);
        } finally {
            setIsAiLoading(false);
        }
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
            <div className="mb-6">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to previous page
                </button>
            </div>

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Compliance Checklist</h1>
                <p className="text-gray-600">Review and manage compliance requirements for your project</p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-blue-100">
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 rounded-full bg-blue-100 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">AI Compliance Assistant</h2>
                            <p className="text-sm text-gray-600">Ask questions about compliance requirements</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-5">
                    <form onSubmit={handleAiQuestionSubmit} className="mb-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                placeholder="Ask a question about compliance..."
                                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                disabled={isAiLoading}
                            />
                            <button
                                type="submit"
                                disabled={isAiLoading || !aiQuestion.trim()}
                                className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                            >
                                {isAiLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Thinking...
                                    </>
                                ) : 'Ask'}
                            </button>
                        </div>
                    </form>

                    {aiError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                            {aiError}
                        </div>
                    )}

                    {aiAnswer && (
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap">{aiAnswer}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 rounded-full bg-blue-100 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Checklist Summary</h2>
                            <p className="text-sm text-gray-600">
                                {checklistItems.filter(item => item.answer).length} of {checklistItems.length} items completed
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${(checklistItems.filter(item => item.answer).length / checklistItems.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {checklistItems.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:border-blue-200 transition-colors">
                        <div className="p-5">
                            <div 
                                className="flex justify-between items-start cursor-pointer group"
                                onClick={() => toggleExpand(item._id)}
                            >
                                <div className="flex items-start">
                                    <div className={`flex-shrink-0 mt-1 mr-3 h-5 w-5 rounded-full border flex items-center justify-center ${item.answer ? 'border-green-200 bg-green-100 text-green-600' : 'border-gray-200 bg-gray-100 text-gray-400'}`}>
                                        {item.answer && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {item.controlItem}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.category} • {item.subCategory}
                                        </p>
                                    </div>
                                </div>
                                <svg
                                    className={`h-5 w-5 text-gray-400 group-hover:text-gray-600 transform transition-transform ${expandedId === item._id ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {expandedId === item._id && (
                                <div className="mt-4 space-y-4 pl-8">
                                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Control Objective
                                        </h4>
                                        <p className="text-gray-600">{item.controlObjective}</p>
                                    </div>

                                    {item.description && (
                                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                                            <p className="text-gray-600">{item.description}</p>
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            Response
                                        </h4>
                                        {editingId === item._id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                    value={editAnswer}
                                                    onChange={(e) => setEditAnswer(e.target.value)}
                                                    rows={3}
                                                    placeholder="Enter your response here..."
                                                />
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveAnswer(item._id)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        Save Response
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`p-3 rounded-md ${item.answer ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-200'}`}>
                                                <div className="flex justify-between items-start">
                                                    <p className={item.answer ? "text-gray-800" : "text-gray-500 italic"}>
                                                        {item.answer || "No response provided yet"}
                                                    </p>
                                                    {role === "Admin" && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditClick(item);
                                                            }}
                                                            className="ml-2 text-blue-600 hover:text-blue-800 flex items-center text-sm"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                                {item.answer && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Last updated: {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
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

const ChecklistPage = () => {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>}>
            <ChecklistContent />
        </Suspense>
    );
};

export default ChecklistPage;