"use client"
import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ChevronLeft, ChevronDown, Edit, Check, Info, MessageSquare, AlertCircle } from 'lucide-react';

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
                projectId,
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
        <div className="flex justify-center items-center min-h-screen bg-[#003366]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0000C0]"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-500 bg-[#003366] min-h-screen flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg border-4 border-[#0000FF] shadow-lg max-w-md">
                <p className="text-xl font-medium text-[#003366]">Error loading checklist</p>
                <p className="mt-2 text-[#003366]">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-[#0000C0] to-[#0000C0] hover:from-[#000080] hover:to-[#000080] text-white rounded-md transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#003366] py-8 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center text-[#0000C0] hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Back to Dashboard
                    </button>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Compliance Checklist</h1>
                    <p className="text-[#A0C4E0]">Review and manage compliance requirements for your project</p>
                </div>

                {/* AI Compliance Assistant Block */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border-4 border-[#0000FF]">
                    <div className="p-5 bg-[#003366]">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-[#0000C0] bg-opacity-20 mr-3">
                                {/* <Lightning className="h-6 w-6 text-[#0000C0]" /> */}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">AI Compliance Assistant</h2>
                                <p className="text-sm text-[#A0C4E0]">Ask questions about compliance requirements</p>
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
                                    className="flex-1 p-3 border border-[#E6F0F8] rounded-md focus:ring-[#0000C0] focus:border-[#0000C0] text-[#003366]"
                                    disabled={isAiLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isAiLoading || !aiQuestion.trim()}
                                    className="px-4 py-3 bg-gradient-to-r from-[#0000C0] to-[#0000C0] hover:from-[#000080] hover:to-[#000080] text-white rounded-md transition-colors disabled:bg-[#003366] disabled:cursor-not-allowed flex items-center"
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
                            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-start">
                                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                                <div>{aiError}</div>
                            </div>
                        )}

                        {aiAnswer && (
                            <div className="bg-[#E6F0F8] border border-[#003366] rounded-md p-4">
                                <div className="flex items-start">
                                    <MessageSquare className="h-5 w-5 text-[#0000C0] mt-1 mr-3 flex-shrink-0" />
                                    <div className="prose prose-sm max-w-none text-[#003366]">
                                        <p className="whitespace-pre-wrap">{aiAnswer}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Checklist Summary Block */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border-4 border-[#0000FF]">
                    <div className="p-5 bg-[#003366]">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-[#0000C0] bg-opacity-20 mr-3">
                                <Check className="h-6 w-6 text-[#0000C0]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Checklist Summary</h2>
                                <p className="text-sm text-[#A0C4E0]">
                                    {checklistItems.filter(item => item.answer).length} of {checklistItems.length} items completed
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-[#E6F0F8]">
                        <div className="w-full bg-[#D0E0ED] rounded-full h-2.5">
                            <div 
                                className="bg-[#0000C0] h-2.5 rounded-full" 
                                style={{ width: `${(checklistItems.filter(item => item.answer).length / checklistItems.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Checklist Items */}
                <div className="space-y-4">
                    {checklistItems.map((item) => (
                        <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden border-4 border-[#0000FF] hover:border-[#0000C0] transition-colors">
                            <div className="p-5">
                                <div 
                                    className="flex justify-between items-start cursor-pointer group"
                                    onClick={() => toggleExpand(item._id)}
                                >
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 mt-1 mr-3 h-5 w-5 rounded-full border flex items-center justify-center ${item.answer ? 'border-green-200 bg-green-100 text-green-600' : 'border-[#E6F0F8] bg-[#F5F9FC] text-[#003366]'}`}>
                                            {item.answer && <Check className="h-3 w-3" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#003366] group-hover:text-[#0000C0] transition-colors">
                                                {item.controlItem}
                                            </h3>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`h-5 w-5 text-[#003366] group-hover:text-[#0000C0] transform transition-transform ${expandedId === item._id ? 'rotate-180' : ''}`}
                                    />
                                </div>

                                {expandedId === item._id && (
                                    <div className="mt-4 space-y-4 pl-8">
                                        <div className="bg-[#E6F0F8] p-4 rounded-md border border-[#003366]">
                                            <h4 className="font-medium text-[#003366] mb-2 flex items-center">
                                                <Info className="h-4 w-4 mr-2 text-[#0000C0]" />
                                                Control Objective
                                            </h4>
                                            <p className="text-[#003366]">{item.controlObjective}</p>
                                        </div>

                                        {item.description && (
                                            <div className="bg-[#F5F9FC] p-4 rounded-md border border-[#003366]">
                                                <h4 className="font-medium text-[#003366] mb-2">Description</h4>
                                                <p className="text-[#003366]">{item.description}</p>
                                            </div>
                                        )}

                                        <div className="border-t border-[#003366] pt-4">
                                            <h4 className="font-medium text-[#003366] mb-2 flex items-center">
                                                <MessageSquare className="h-4 w-4 mr-2 text-[#0000C0]" />
                                                Response
                                            </h4>
                                            {editingId === item._id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        className="w-full p-3 border border-[#003366] rounded-md focus:ring-[#0000C0] focus:border-[#0000C0] text-[#003366]"
                                                        value={editAnswer}
                                                        onChange={(e) => setEditAnswer(e.target.value)}
                                                        rows={3}
                                                        placeholder="Enter your response here..."
                                                    />
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="px-4 py-2 border border-[#003366] rounded-md text-[#003366] hover:bg-[#F5F9FC] transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleSaveAnswer(item._id)}
                                                            className="px-4 py-2 bg-gradient-to-r from-[#0000C0] to-[#0000C0] hover:from-[#000080] hover:to-[#000080] text-white rounded-md transition-colors"
                                                        >
                                                            Save Response
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`p-3 rounded-md ${item.answer ? 'bg-green-50 border border-green-100' : 'bg-[#F5F9FC] border border-[#003366]'}`}>
                                                    <div className="flex justify-between items-start">
                                                        <p className={item.answer ? "text-[#003366]" : "text-[#003366] italic"}>
                                                            {item.answer || "No response provided yet"}
                                                        </p>
                                                        {role === "Admin" && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick(item);
                                                                }}
                                                                className="ml-2 text-[#0000C0] hover:text-[#003366] flex items-center text-sm"
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                    {item.answer && (
                                                        <div className="mt-2 text-xs text-[#003366]">
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
        </div>
    );
};

const ChecklistPage = () => {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen bg-[#003366]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0000C0]"></div>
            </div>
        }>
            <ChecklistContent />
        </Suspense>
    );
};

export default ChecklistPage;