'use client'
import React, { useEffect, useState, Suspense } from "react";
import Folders from "@/components/Folders";
import AskQuestion from "@/components/AskQuestion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Folder, Clock } from "lucide-react";

// Move the main content to a separate component
const ProjectContent = () => {
    const searchParam = useSearchParams();
    const projectId = searchParam.get("projectid");
    const projectName = searchParam.get("projectDetails");
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFolders = async () => {
            if (!projectId) return;

            try {
                setLoading(true);
                const response = await fetch('/api/routes/project?action=getProjectFoldersWithSubfolders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ projectId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch folders');
                }

                const data = await response.json();
                setFolders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFolders();
    }, [projectId]);

    if (loading) return (
        <div className="min-h-screen bg-[#003366] p-6 flex items-center justify-center">
            <div className="text-white">Loading project data...</div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-[#003366] p-6 flex items-center justify-center">
            <div className="text-red-500">Error: {error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#003366] p-6">
            <div className="max-w-7xl mx-auto">
                {/* First main block with thick blue border */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-white rounded-xl border-4 border-[#0000FF] shadow-sm">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#003366]">{projectName}</h1>
                        <div className="flex items-center mt-2 text-sm text-[#0000C0]">
                            <Clock size={14} className="mr-1 opacity-70" />
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                    <Link 
                        href={`/view-checklist/?projectId=${projectId}`} 
                        className="px-4 py-2 bg-gradient-to-r from-[#0000C0] to-[#0000C0] text-white hover:from-[#000080] hover:to-[#000080] rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        View Checklist <ArrowRight size={18} />
                    </Link>
                </div>
                
                {/* Second main block with thick blue border */}
                <div className="border-4 border-[#0000FF] rounded-xl p-4 bg-white">
                    <Folders folders={folders} projectId={projectId} />
                </div>
            </div>
        </div>
    );
};

// Main page component with Suspense boundary
export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#003366] p-6 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <ProjectContent />
        </Suspense>
    );
}