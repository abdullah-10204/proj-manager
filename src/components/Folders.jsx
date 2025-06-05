"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Trash2 } from "lucide-react";

const initialData = {
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
  ],
};

const Folders = () => {
  const [data, setData] = useState(initialData);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("text");
  const [currentLocation, setCurrentLocation] = useState(null);

  const handleAddFile = (folderIndex, subfolderIndex = undefined) => {
    setCurrentLocation({
      type: subfolderIndex !== undefined ? "subfolder" : "folder",
      folderIndex,
      subfolderIndex
    });
    setNewFileName("");
    setNewFileType("text");
  };

  const confirmAddFile = () => {
    if (!newFileName.trim() || !currentLocation) return;

    setData(prev => {
      const updatedData = JSON.parse(JSON.stringify(prev));
      const folder = updatedData.folders[currentLocation.folderIndex];
      
      if (currentLocation.type === "subfolder" && currentLocation.subfolderIndex !== undefined) {
        // Add to subfolder
        folder.subfolders[currentLocation.subfolderIndex].files.push({
          filename: newFileName,
          filetype: newFileType
        });
      } else {
        // Add to folder directly
        if (!folder.files) {
          folder.files = [];
        }
        folder.files.push({
          filename: newFileName,
          filetype: newFileType
        });
      }
      
      return updatedData;
    });

    setNewFileName("");
    setCurrentLocation(null);
  };

  const deleteFile = (folderIndex, subfolderIndex=undefined, fileIndex) => {
    setData(prev => {
      const updatedData = JSON.parse(JSON.stringify(prev));
      const folder = updatedData.folders[folderIndex];
      
      if (subfolderIndex !== undefined && folder.subfolders) {
        // Delete from subfolder
        folder.subfolders[subfolderIndex].files.splice(fileIndex, 1);
      } else if (folder.files) {
        // Delete from main folder
        folder.files.splice(fileIndex, 1);
      }
      
      return updatedData;
    });
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

  return (
    <div className="max-w-7xl mx-auto mt-8 rounded-lg shadow-md p-6 bg-white">

      <Accordion type="multiple" className="space-y-4">
        {data.folders.map((folder, folderIndex) => (
          <AccordionItem 
            key={folderIndex} 
            value={`folder-${folderIndex}`}
            className="border-b-0"
          >
            <div className="bg-gray-50 rounded-lg p-1">
              <div className="flex justify-between items-center group">
                <AccordionTrigger className="hover:no-underline px-4 py-3 flex-1 w-full">
                  <div className="flex items-center w-full">
                    <span className="mr-3 text-lg text-gray-600 group-data-[state=open]:text-yellow-500">
                      <span className="group-data-[state=open]:hidden">📁</span>
                      
                    </span>
                    <span className="font-medium text-gray-800">{folder.foldername}</span>
                  </div>
                </AccordionTrigger>

                {/* Add file button for folders without subfolders (except first folder) */}
                {(!folder.subfolders || folderIndex !== 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFile(folderIndex);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <AccordionContent className="px-4 pb-2">
                <div className="ml-8 pl-4 border-l-2 border-gray-200 space-y-3">
                  {/* Subfolders */}
                  {folder.subfolders?.map((subfolder, subfolderIndex) => (
                    <div key={subfolderIndex} className="mt-2">
                      <Accordion type="multiple" className="w-full">
                        <AccordionItem 
                          value={`subfolder-${folderIndex}-${subfolderIndex}`}
                          className="border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <AccordionTrigger className="hover:no-underline py-2 px-3 -ml-1 flex-1">
                              <div className="flex items-center">
                                <span className="mr-3 text-gray-600 group-data-[state=open]:text-yellow-500">
                                  <span className="group-data-[state=open]:hidden">📁</span>
                                  
                                </span>
                                <span className="text-gray-700">{subfolder.subfoldername}</span>
                              </div>
                            </AccordionTrigger>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="mr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddFile(folderIndex, subfolderIndex);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <AccordionContent className="pl-6 ml-2">
                            <div className="space-y-2">
                              {subfolder.files.map((file, fileIndex) => (
                                <div
                                  key={fileIndex}
                                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                                >
                                  <div className="flex items-center">
                                    <span className="mr-3">{getFileIcon(file.filetype)}</span>
                                    <span>{file.filename}</span>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem
                                        onClick={() => deleteFile(folderIndex, subfolderIndex, fileIndex)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ))}

                  {/* Direct files in folder */}
                  {!folder.subfolders && folder.files?.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{getFileIcon(file.filetype)}</span>
                        <span>{file.filename}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => deleteFile(folderIndex, undefined, fileIndex)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Add File Dialog */}
      <Dialog open={currentLocation !== null} onOpenChange={(open) => !open && setCurrentLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New File to {currentLocation?.type === "subfolder" ? 
                data.folders[currentLocation.folderIndex].subfolders?.[currentLocation.subfolderIndex ?? 0].subfoldername : 
                data.folders[currentLocation?.folderIndex ?? 0].foldername}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="File name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
            <select
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
              <option value="spreadsheet">Spreadsheet</option>
              <option value="presentation">Presentation</option>
            </select>
            <Button onClick={confirmAddFile} className="w-full">
              Add File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Folders;