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
import { MoreVertical, Plus, FolderPlus, Upload, File, Folder } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import Cookies from "js-cookie";

const supabaseUrl = "https://byaiqxqedhbtgchwotds.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5YWlxeHFlZGhidGdjaHdvdGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MjY1ODIsImV4cCI6MjA2NTQwMjU4Mn0.XKkb_c3ca0V4LnAuCox7J-jlNHNyuC1mYO2pMUFsvZc";
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

      // Refresh the page to see latest changes
      window.location.reload();

      // Alternatively, if you don't want full page reload:
      // fetchFolders(); // You would need to implement this function

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
        .from('proj-manager')
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
    <div className="max-w-7xl mx-auto mt-8 rounded-lg shadow-md p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={navigateUp}
            disabled={currentPath.length === 0}
            className={`mr-2 ${currentPath.length === 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
          >
            ← Up
          </button>
          <div className="flex items-center text-sm text-gray-600">
            <span>Root</span>
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
                  <span className="mx-1">/</span>
                  <span>{pathItem.name}</span>
                </span>
              ) : null;
            })}
          </div>
        </div>

        {role === "Admin" && currentPath.length === 0 && (
          <Button
            variant="outline"
            onClick={handleAddFolder}
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
                  variant="outline"
                  onClick={() => handleAddSubfolder(currentPath[currentPath.length - 1])}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
                <Button variant="outline" asChild>
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

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              {role === "Admin" && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentContents.length === 0 ? (
              <tr>
                <td colSpan={role === "Admin" ? 3 : 2} className="px-6 py-4 text-center text-gray-500">
                  No items in this folder
                </td>
              </tr>
            ) : (
              currentContents.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isFolder(item) ? (
                        <Folder className="h-5 w-5 text-blue-500 mr-3" />
                      ) : (
                        <File className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      <button
                        onClick={() => isFolder(item) && navigateToFolder(item._id)}
                        className={`${isFolder(item) ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : 'text-gray-900'}`}
                      >
                        {item.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {isFolder(item) ? 'Folder' : 'File'}
                    </span>
                  </td>
                  {role === "Admin" && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isFolder(item) ? (
                            <>
                              <DropdownMenuItem onClick={() => handleAddSubfolder(item._id)}>
                                <FolderPlus className="mr-2 h-4 w-4" />
                                Add Subfolder
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <label className="cursor-pointer">
                                  <Upload className="mr-2 h-4 w-4" />
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

                            >
                              <File className="mr-2 h-4 w-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFolderId ? 'Create New Subfolder' : 'Create New Folder'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={selectedFolderId ? 'Subfolder name' : 'Folder name'}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedFolderId ? confirmAddSubfolder : confirmAddFolder}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-medium">Uploading file...</p>
            <p className="text-sm text-gray-500">Please wait</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileBrowser;