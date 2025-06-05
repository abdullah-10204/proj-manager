'use client'
import React from "react";
import { useParams } from 'next/navigation';
import Folders from "@/components/Folders";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AskQuestion from "@/components/AskQuestion";

const data = [
  {
    projectname: "Project Name",
    folders: [
      {
        foldername: "Folder 1",
        subfolders: [
          {
            subfoldername: "Subfolder 1",
            files: [
              { filename: "File 1", filetype: "text" },
              { filename: "File 2", filetype: "image" },
            ],
          },
          {
            subfoldername: "Subfolder 2",
            files: [{ filename: "File 3", filetype: "video" }],
          },

          //all other 28 sub folders
        ],
      },
      {
        foldername: "Folder 2",
        files: [
          { filename: "File 4", filetype: "audio" },
          { filename: "File 5", filetype: "document" },
        ],
      },
      {
        foldername: "Folder 3",
        files: [
          { filename: "File 6", filetype: "spreadsheet" },
          { filename: "File 7", filetype: "presentation" },
        ],
      },
      {
        foldername: "Folder 4",
        files: [
          { filename: "File 6", filetype: "spreadsheet" },
          { filename: "File 7", filetype: "presentation" },
        ],
      },
    ],
  },
];
function page() {
  const params = useParams();
  const {projectid, projectDetails} = params
  const projectName = decodeURIComponent(projectDetails);
 
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
          </div>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            View Checklist
          </button>
        </div>



        <AskQuestion />


        {/* Main Folders */}
        <Folders />
      </div>
    </div>
  )
}

export default page;

