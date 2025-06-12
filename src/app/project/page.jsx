'use client'
import React, { useEffect, useState } from "react";
import Folders from "@/components/Folders";
import AskQuestion from "@/components/AskQuestion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Page() {
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
                    </div>
                    <Link href={`/view-checklist/?projectId=${projectId}`} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg">
                        View Checklist
                    </Link>
                </div>
                <Folders folders={folders} projectId={projectId} />
            </div>
        </div>
    );
}