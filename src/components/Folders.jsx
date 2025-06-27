"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, FolderPlus, Upload, File, Folder, ChevronUp } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import Cookies from "js-cookie";

const supabaseUrl = "https://tvwcfdsbjfxyepyqbacd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2d2NmZHNiamZ4eWVweXFiYWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzMzMDMsImV4cCI6MjA2NjUwOTMwM30._T3SVwlAeDcwi4wEzD-XX5JRKxikXI5e_jd4CUXhnKA";
const supabase = createClient(supabaseUrl, supabaseKey);

const FileBrowser = ({ folders: initialFolders, projectId }) => {
  const [folders, setFolders] = useState(initialFolders);
  const role = Cookies.get("Role");
  const [currentPath, setCurrentPath] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const isFolder = (item) => {
    return item.hasOwnProperty('subfolders') || item.hasOwnProperty('files');
  };

  const getCurrentFolder = () => {
    if (currentPath.length === 0) {
      return {
        subfolders: folders,
        files: []
      };
    }

    let current = folders.find(f => f._id === currentPath[0]);
    if (!current) return { subfolders: [], files: [] };

    for (let i = 1; i < currentPath.length; i++) {
      current = current.subfolders?.find(sf => sf._id === currentPath[i]);
      if (!current) return { subfolders: [], files: [] };
    }

    return current;
  };

  const getCurrentContents = () => {
    const currentFolder = getCurrentFolder();
    const foldersList = currentFolder.subfolders || [];
    const filesList = currentFolder.files || [];

    return [...foldersList, ...filesList];
  };

  const navigateToFolder = (folderId) => {
    setCurrentPath([...currentPath, folderId]);
  };

  const navigateUp = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const handleAddFolder = () => {
    setSelectedFolderId(null);
    setIsFolderDialogOpen(true);
  };

  const handleAddSubfolder = (folderId) => {
    setSelectedFolderId(folderId);
    setIsFolderDialogOpen(true);
  };

  const confirmAddFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/routes/project?action=addFolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          name: newFolderName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const updatedProject = await response.json();
      setFolders(updatedProject.folders);
      setIsFolderDialogOpen(false);
      setNewFolderName("");
      window.location.reload();
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder");
    }
  };

  const confirmAddSubfolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/routes/project?action=addSubfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          folderId: selectedFolderId,
          subfolderName: newFolderName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subfolder');
      }

      const updatedProject = await response.json();
      setFolders(updatedProject.folders);
      setIsFolderDialogOpen(false);
      setNewFolderName("");
      alert("Subfolder created successfully");
    } catch (error) {
      console.error("Error creating subfolder:", error);
      alert("Error creating subfolder");
    }
  };

  const handleFileUpload = async (event, folderId) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setSelectedFolderId(folderId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const fullPath = currentPath.length > 0
        ? `projects/${projectId}/${currentPath.join('/')}/${fileName}`
        : `projects/${projectId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('scmview')
        .upload(fullPath, file);

      if (error) throw error;

      const isNestedUpload = currentPath.length > 1;
      const apiEndpoint = isNestedUpload
        ? '/api/routes/project?action=uploadFileToSubfolder'
        : '/api/routes/project?action=uploadFileToFolder';

      const requestBody = isNestedUpload
        ? {
          projectId,
          folderId: currentPath[0],
          subfolderId: currentPath[currentPath.length - 1],
          fileUrl: data.path,
          fileName: file.name
        }
        : {
          projectId,
          folderId,
          fileUrl: data.path,
          fileName: file.name
        };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to save file reference');
      }

      const result = await response.json();

      setFolders(prevFolders => {
        const updateRecursively = (foldersList, path = []) => {
          return foldersList.map(folder => {
            if (!isNestedUpload && folder._id === folderId) {
              return {
                ...folder,
                files: [...(folder.files || []), result.file]
              };
            }

            if (isNestedUpload && folder._id === path[0]) {
              if (path.length === 2) {
                return {
                  ...folder,
                  subfolders: folder.subfolders.map(sub => {
                    if (sub._id === path[1]) {
                      return {
                        ...sub,
                        files: [...(sub.files || []), result.file]
                      };
                    }
                    return sub;
                  })
                };
              } else {
                return {
                  ...folder,
                  subfolders: updateRecursively(folder.subfolders || [], path.slice(1))
                };
              }
            }

            return folder;
          });
        };

        return updateRecursively(prevFolders, currentPath);
      });

      alert("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const currentContents = getCurrentContents();

  return (
    <div className="bg-white rounded-xl border border-[#003366] shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={navigateUp}
            disabled={currentPath.length === 0}
            className={`flex items-center mr-4 ${currentPath.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#0000C0] hover:text-[#003366]'}`}
          >
            <ChevronUp className="h-5 w-5 mr-1" />
            <span>Up</span>
          </button>
          <div className="flex items-center text-sm text-[#0000C0]">
            <span className="font-medium">Root</span>
            {currentPath.map((pathId, index) => {
              let pathItem;
              let currentLevel = folders;

              for (let i = 0; i <= index; i++) {
                pathItem = currentLevel.find(item => item._id === currentPath[i]);
                if (!pathItem) break;
                currentLevel = pathItem.subfolders || [];
              }

              return pathItem ? (
                <span key={pathId} className="flex items-center">
                  <span className="mx-2 text-[#0000C0]">/</span>
                  <span className="font-medium">{pathItem.name}</span>
                </span>
              ) : null;
            })}
          </div>
        </div>

        {role === "Admin" && currentPath.length === 0 && (
          <Button
            onClick={handleAddFolder}
            className="bg-gradient-to-r from-[#0000C0] to-[#0000C0] hover:from-[#000080] hover:to-[#000080] text-white"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        )}
      </div>

      {currentPath.length > 0 && (
        <div className="flex justify-between mb-6">
          <div className="flex space-x-2">
            {role === "Admin" && (
              <>
                <Button
                  onClick={() => handleAddSubfolder(currentPath[currentPath.length - 1])}
                  className="bg-gradient-to-r from-[#0000C0] to-[#0000C0] hover:from-[#000080] hover:to-[#000080] text-white"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
                <Button asChild className="bg-gradient-to-r from-[#0000C0] to-[#0000C0] hover:from-[#000080] hover:to-[#000080] text-white">
                  <label>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(
                        e,
                        currentPath.length > 0 ? currentPath[currentPath.length - 1] : null
                      )}
                    />
                  </label>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="border border-[#003366] rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-[#003366]">
          <thead className="bg-[#E6F0F8]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#003366] uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#003366] uppercase tracking-wider">
                Type
              </th>
              {role === "Admin" && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#003366] uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#003366]">
            {currentContents.length === 0 ? (
              <tr>
                <td colSpan={role === "Admin" ? 3 : 2} className="px-6 py-4 text-center text-[#003366]">
                  No items in this folder
                </td>
              </tr>
            ) : (
              currentContents.map((item) => (
                <tr key={item._id} className="hover:bg-[#F5F9FC]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isFolder(item) ? (
                        <Folder className="h-5 w-5 text-[#0000C0] mr-3" />
                      ) : (
                        <File className="h-5 w-5 text-[#003366] mr-3" />
                      )}
                      <button
                        onClick={() => isFolder(item) && navigateToFolder(item._id)}
                        className={`${isFolder(item) ? 'text-[#0000C0] hover:text-[#003366] cursor-pointer' : 'text-[#003366]'}`}
                      >
                        {item.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#E6F0F8] text-[#003366]">
                      {isFolder(item) ? 'Folder' : 'File'}
                    </span>
                  </td>
                  {role === "Admin" && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#003366] hover:text-[#0000C0]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border border-[#003366]">
                          {isFolder(item) ? (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleAddSubfolder(item._id)}
                                className="text-[#003366] hover:bg-[#E6F0F8]"
                              >
                                <FolderPlus className="mr-2 h-4 w-4 text-[#0000C0]" />
                                Add Subfolder
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="text-[#003366] hover:bg-[#E6F0F8]">
                                <label className="cursor-pointer">
                                  <Upload className="mr-2 h-4 w-4 text-[#0000C0]" />
                                  Upload File
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, item._id)}
                                  />
                                </label>
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(
                                  `https://byaiqxqedhbtgchwotds.supabase.co/storage/v1/object/public/proj-manager/${item.url}`,
                                  '_blank'
                                )
                              }
                              className="text-[#003366] hover:bg-[#E6F0F8]"
                            >
                              <File className="mr-2 h-4 w-4 text-[#0000C0]" />
                              Open File
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="border border-[#003366]">
          <DialogHeader>
            <DialogTitle className="text-[#003366]">
              {selectedFolderId ? 'Create New Subfolder' : 'Create New Folder'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={selectedFolderId ? 'Subfolder name' : 'Folder name'}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="border border-[#003366] focus:border-[#0000C0]"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsFolderDialogOpen(false)}
              className="border border-[#003366] text-[#003366] hover:bg-[#E6F0F8]"
            >
              Cancel
            </Button>
            <Button 
              onClick={selectedFolderId ? confirmAddSubfolder : confirmAddFolder}
              className="bg-gradient-to-r from-[#0000C0] to-[#0000C0] hover:from-[#000080] hover:to-[#000080] text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg border border-[#003366] shadow-lg">
            <p className="text-lg font-medium text-[#003366]">Uploading file...</p>
            <p className="text-sm text-[#003366]">Please wait</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileBrowser;