"use client";
import React from "react";
import { useState } from "react";

const data = 
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
      {
        foldername: "Folder 4",
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
      {
        foldername: "Folder 4",
        files: [
          { filename: "File 6", filetype: "spreadsheet" },
          { filename: "File 7", filetype: "presentation" },
        ],
      },
    ],
  }

const Folders = () => {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [expandedSubfolders, setExpandedSubfolders] = useState({});

  const toggleFolder = (folderIndex) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderIndex]: !prev[folderIndex],
    }));
  };

  const toggleSubfolder = (folderIndex, subfolderIndex) => {
    setExpandedSubfolders((prev) => {
      const key = `${folderIndex}-${subfolderIndex}`;
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };
  return (
    <div className="max-w-7xl mx-auto mt-30 rounded-lg shadow-md">
      <div className="space-y-2">
        {data.folders.map((folder, folderIndex) => (
          <div key={folderIndex} className="folder-group mb-5">
            <div
              className="folder-item flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => toggleFolder(folderIndex)}
            >
              <span
                className={`mr-2 ${
                  expandedFolders[folderIndex]
                    ? "text-yellow-500"
                    : "text-gray-500"
                }`}
              >
                {expandedFolders[folderIndex] ? "📂" : "📁"}
              </span>
              <span className=" text-xl">{folder.foldername}</span>
            </div>

            {(expandedFolders[folderIndex] || folder.files) && (
              <div className="subfolder-container ml-6 pl-2 border-l-2 border-gray-200">
                {/* Render subfolders if they exist */}
                {folder.subfolders?.map((subfolder, subfolderIndex) => (
                  <div key={subfolderIndex} className="subfolder-group mt-1">
                    <div
                      className="subfolder-item flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() =>
                        toggleSubfolder(folderIndex, subfolderIndex)
                      }
                    >
                      <span
                        className={`mr-2 ${
                          expandedSubfolders[`${folderIndex}-${subfolderIndex}`]
                            ? "text-yellow-500"
                            : "text-gray-500"
                        }`}
                      >
                        {expandedSubfolders[`${folderIndex}-${subfolderIndex}`]
                          ? "📂"
                          : "📁"}
                      </span>
                      <span className="text-lg">{subfolder.subfoldername}</span>
                    </div>

                    {expandedSubfolders[`${folderIndex}-${subfolderIndex}`] &&
                      subfolder.files && (
                        <div className="file-container ml-6 pl-2 border-l-2 border-gray-200">
                          {subfolder.files.map((file, fileIndex) => (
                            <div
                              key={fileIndex}
                              className="file-item flex items-center p-2 hover:bg-gray-50 rounded"
                            >
                              <span className="mr-2">
                                {getFileIcon(file.filetype)}
                              </span>
                              <span className="text-lg">{file.filename}</span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}

                {/* Render direct files if no subfolders */}
                {!folder.subfolders && folder.files && expandedFolders[folderIndex] && (
                  <div className="file-container ml-6 pl-2 border-l-2 border-gray-200">
                    {folder.files.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="file-item flex items-center p-2 hover:bg-gray-50 rounded"
                      >
                        <span className="mr-2">
                          {getFileIcon(file.filetype)}
                        </span>
                        <span>{file.filename}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const getFileIcon = (filetype) => {
  const icons = {
    text: "📄",
    image: "🖼️",
    video: "🎬",
    audio: "🎵",
    document: "📑",
    spreadsheet: "📊",
    presentation: "📝",
  };
  return icons[filetype] || "📄";
};

export default Folders;
