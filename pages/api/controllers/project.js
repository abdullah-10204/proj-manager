import connectToDatabase from '../config/db';
import Project from '../models/project';

export const createProject = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectName, assignedUser } = req.body;

    const newProject = new Project({
      projectName,
      assignedUser: assignedUser || null
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { projectId, projectIds, status } = req.body;
    console.log(" projectId, projectIds, status", projectId, projectIds, status);
    
    if ((!projectId && (!projectIds || !Array.isArray(projectIds))) || !status) {
      return res.status(400).json({
        success: false,
        message: "Either projectId or projectIds array is required along with status."
      });
    }

    const isBulkUpdate = projectIds && Array.isArray(projectIds);
    const idsToUpdate = isBulkUpdate ? projectIds : [projectId];

    const updateResult = await Project.updateMany(
      { _id: { $in: idsToUpdate } },
      { projectStatus: status }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found with the provided ID(s)."
      });
    }

    const updatedProjects = await Project.find({ _id: { $in: idsToUpdate } });

    return res.status(200).json({
      success: true,
      message: isBulkUpdate 
        ? `Updated status for ${updateResult.modifiedCount} projects.`
        : "Project status updated successfully.",
      data: isBulkUpdate ? updatedProjects : updatedProjects[0]
    });

  } catch (error) {
    console.error("Error updating project status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


export const getProjects = async (req, res) => {
  try {
    await connectToDatabase();
    
    const userEmail = req.user?.email; 
    
    let query = {};
    
    if (req.user?.role !== 'Admin') {
      const user = await User.findOne({ email: userEmail });
      if (user) {
        query = { assignedUser: user._id };
      }
    }

    const projects = await Project.find(query);
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    await connectToDatabase();
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addSubfolder = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId, folderId, subfolderName } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const folder = project.folders.id(folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    folder.subfolders.push({ name: subfolderName });
    await project.save();

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addFolder = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { name,projectId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const newFolder = {
      name,
      subfolders: [],
      files: []
    };

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $push: { folders: newFolder } },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(201).json({
      message: "Folder added successfully",
      folder: newFolder,
      project: updatedProject
    });

  } catch (error) {
    console.error("Error adding folder:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadFileToSubfolder = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId, folderId, subfolderId, fileUrl, fileName } = req.body;

    if (!fileUrl || !fileName) {
      return res.status(400).json({ message: 'File URL and name are required' });
    }

    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}.${fileExt}`;
    const filePath = `projects/${projectId}/${folderId}/${subfolderId}/${uniqueFileName}`;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const folder = project.folders.id(folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const subfolder = folder.subfolders.id(subfolderId);
    if (!subfolder) {
      return res.status(404).json({ message: 'Subfolder not found' });
    }

    // Ensure subfolder.files is an array
    if (!Array.isArray(subfolder.files)) {
      subfolder.files = [];
    }

    subfolder.files.push({
      name: fileName,
      url: fileUrl,
      path: filePath,
      uploadedAt: new Date()
    });

    await project.save();

    res.status(200).json({
      message: 'File reference added successfully',
      file: {
        name: fileName,
        url: fileUrl,
        path: filePath
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadFileToFolder = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId, folderId, fileUrl, fileName } = req.body;

    if (!fileUrl || !fileName) {
      return res.status(400).json({ message: 'File URL and name are required' });
    }

    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}.${fileExt}`;
    const filePath = `projects/${projectId}/${folderId}/${uniqueFileName}`;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const folder = project.folders.id(folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Ensure folder.files is an array
    if (!Array.isArray(folder.files)) {
      folder.files = [];
    }

    folder.files.push({
      name: fileName,
      url: fileUrl,
      path: filePath,
      uploadedAt: new Date()
    });

    await project.save();

    res.status(200).json({
      message: 'File reference added successfully',
      file: {
        name: fileName,
        url: fileUrl,
        path: filePath
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubfolderFiles = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId, folderId, subfolderId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const folder = project.folders.id(folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const subfolder = folder.subfolders.id(subfolderId);
    if (!subfolder) {
      return res.status(404).json({ message: 'Subfolder not found' });
    }

    const files = subfolder.files || [];
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectFoldersWithSubfolders = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const folders = project.folders || [];
    const foldersWithSubfolders = folders.map(folder => ({
      _id: folder._id,
      name: folder.name,
      files: (folder.files || []).map(file => ({
        _id: file._id,
        name: file.name,
        url: file.url,
        path: file.path,
        uploadedAt: file.uploadedAt
      })),
      subfolders: (folder.subfolders || []).map(subfolder => ({
        _id: subfolder._id,
        name: subfolder.name,
        files: (subfolder.files || []).map(file => ({
          _id: file._id,
          name: file.name,
          url: file.url,
          path: file.path,
          uploadedAt: file.uploadedAt
        }))
      }))
    }));

    res.status(200).json(foldersWithSubfolders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.status(200).json({ message: 'Project deleted successfully.', project: deletedProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFile = async (req, res) => {
  const { projectId, fileId, newName, folderId, isNested, parentFolderId } = req.body;

  try {
    await connectToDatabase();

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Helper function to update filename recursively
    const updateFilename = (folders) => {
      return folders.map(folder => {
        // Check files in current folder
        const updatedFiles = folder.files.map(file => 
          file._id.toString() === fileId ? { ...file.toObject(), name: newName } : file
        );

        // Check subfolders if this is the parent folder (for nested files)
        const updatedSubfolders = isNested && parentFolderId && folder._id.toString() === parentFolderId
          ? folder.subfolders.map(subfolder => 
              subfolder._id.toString() === folderId
                ? {
                    ...subfolder.toObject(),
                    files: subfolder.files.map(file =>
                      file._id.toString() === fileId ? { ...file.toObject(), name: newName } : file
                    )
                  }
                : subfolder
            )
          : folder.subfolders;

        return {
          ...folder.toObject(),
          files: updatedFiles,
          subfolders: updatedSubfolders
        };
      });
    };

    const updatedFolders = updateFilename(project.folders);
    project.folders = updatedFolders;

    await project.save();

    return res.status(200).json({ message: "File renamed successfully", project });
  } catch (error) {
    console.error("Error updating file:", error);
    return res.status(500).json({ error: "Failed to update file" });
  }
};

export const deleteFile = async (req, res) => {
  const { projectId, fileId, folderId, isNested, parentFolderId } = req.body;

  try {
    await connectToDatabase();

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Helper function to delete file recursively
    const deleteFileFromFolders = (folders) => {
      return folders.map(folder => {
        // Filter out the file from current folder
        const filteredFiles = folder.files.filter(
          file => file._id.toString() !== fileId
        );

        // Handle subfolders if this is the parent folder (for nested files)
        const updatedSubfolders = isNested && parentFolderId && folder._id.toString() === parentFolderId
          ? folder.subfolders.map(subfolder => 
              subfolder._id.toString() === folderId
                ? {
                    ...subfolder.toObject(),
                    files: subfolder.files.filter(file => file._id.toString() !== fileId)
                  }
                : subfolder
            )
          : folder.subfolders;

        return {
          ...folder.toObject(),
          files: filteredFiles,
          subfolders: updatedSubfolders
        };
      });
    };

    const updatedFolders = deleteFileFromFolders(project.folders);
    project.folders = updatedFolders;

    await project.save();

    return res.status(200).json({ message: "File deleted successfully", project });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
};

