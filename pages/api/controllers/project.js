import connectToDatabase from "../config/db";
import Project from "../models/project";
import User from "../models/user";

export const createProject = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectName, assignedUser } = req.body;
    const adminEmail = req.body.createdBy;

    const newProject = new Project({
      projectName,
      createdBy: adminEmail,
      assignedUser: assignedUser || undefined, // Store as ObjectId if provided
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId, projectIds, status, createdBy } = req.body;

    if (!createdBy) {
      return res
        .status(400)
        .json({ message: "Admin email (createdBy) is required." });
    }

    if (
      (!projectId && (!projectIds || !Array.isArray(projectIds))) ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Either projectId or projectIds array is required along with status.",
      });
    }

    const isBulkUpdate = projectIds && Array.isArray(projectIds);
    const idsToUpdate = isBulkUpdate ? projectIds : [projectId];

    const updateResult = await Project.updateMany(
      { _id: { $in: idsToUpdate }, createdBy },
      { projectStatus: status }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found with the provided ID(s) and admin email.",
      });
    }

    const updatedProjects = await Project.find({
      _id: { $in: idsToUpdate },
      createdBy,
    });

    return res.status(200).json({
      success: true,
      message: isBulkUpdate
        ? `Updated status for ${updateResult.modifiedCount} projects.`
        : "Project status updated successfully.",
      data: isBulkUpdate ? updatedProjects : updatedProjects[0],
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    await connectToDatabase();

    const { email, role } = req.query;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required." });
    }

    let query = {};

    if (role === "Admin") {
      // Admin sees projects they created
      query.createdBy = email;
    } else {
      // User sees projects assigned to them OR created by them
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      query = {
        $or: [{ assignedUser: user._id }, { createdBy: email }],
      };
    }

    const projects = await Project.find(query);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error in getProjects:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    await connectToDatabase();
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addSubfolder = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId, folderId, subfolderName, email } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy !== email) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this project." });
    }

    const folder = project.folders.id(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
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

    const { name, projectId, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "Folder name and email are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.createdBy !== email) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this project." });
    }

    const newFolder = {
      name,
      subfolders: [],
      files: [],
    };

    project.folders.push(newFolder);
    await project.save();

    res.status(201).json({
      message: "Folder added successfully",
      folder: newFolder,
      project,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadFileToSubfolder = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId, folderId, subfolderId, fileUrl, fileName, email } =
      req.body;

    if (!fileUrl || !fileName || !email) {
      return res
        .status(400)
        .json({ message: "File URL, name, and email are required" });
    }

    const fileExt = fileName.split(".").pop();
    const uniqueFileName = `${Date.now()}.${fileExt}`;
    const filePath = `projects/${projectId}/${folderId}/${subfolderId}/${uniqueFileName}`;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy !== email) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this project." });
    }

    const folder = project.folders.id(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const subfolder = folder.subfolders.id(subfolderId);
    if (!subfolder) {
      return res.status(404).json({ message: "Subfolder not found" });
    }

    if (!Array.isArray(subfolder.files)) {
      subfolder.files = [];
    }

    subfolder.files.push({
      name: fileName,
      url: fileUrl,
      path: filePath,
      uploadedAt: new Date(),
    });

    await project.save();

    res.status(200).json({
      message: "File reference added successfully",
      file: {
        name: fileName,
        url: fileUrl,
        path: filePath,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadFileToFolder = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId, folderId, fileUrl, fileName, email } = req.body;

    if (!fileUrl || !fileName || !email) {
      return res
        .status(400)
        .json({ message: "File URL, name, and email are required" });
    }

    const fileExt = fileName.split(".").pop();
    const uniqueFileName = `${Date.now()}.${fileExt}`;
    const filePath = `projects/${projectId}/${folderId}/${uniqueFileName}`;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy !== email) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this project." });
    }

    const folder = project.folders.id(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (!Array.isArray(folder.files)) {
      folder.files = [];
    }

    folder.files.push({
      name: fileName,
      url: fileUrl,
      path: filePath,
      uploadedAt: new Date(),
    });

    await project.save();

    res.status(200).json({
      message: "File reference added successfully",
      file: {
        name: fileName,
        url: fileUrl,
        path: filePath,
      },
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
      return res.status(404).json({ message: "Project not found" });
    }

    const folder = project.folders.id(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const subfolder = folder.subfolders.id(subfolderId);
    if (!subfolder) {
      return res.status(404).json({ message: "Subfolder not found" });
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
      return res.status(404).json({ message: "Project not found" });
    }

    const folders = project.folders || [];
    const foldersWithSubfolders = folders.map((folder) => ({
      _id: folder._id,
      name: folder.name,
      files: (folder.files || []).map((file) => ({
        _id: file._id,
        name: file.name,
        url: file.url,
        path: file.path,
        uploadedAt: file.uploadedAt,
      })),
      subfolders: (folder.subfolders || []).map((subfolder) => ({
        _id: subfolder._id,
        name: subfolder.name,
        files: (subfolder.files || []).map((file) => ({
          _id: file._id,
          name: file.name,
          url: file.url,
          path: file.path,
          uploadedAt: file.uploadedAt,
        })),
      })),
    }));

    res.status(200).json(foldersWithSubfolders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectId, email } = req.body;

    if (!projectId || !email) {
      return res
        .status(400)
        .json({ error: "Project ID and email are required." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    if (project.createdBy !== email) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this project." });
    }

    await project.deleteOne();

    res.status(200).json({ message: "Project deleted successfully.", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFile = async (req, res) => {
  const {
    projectId,
    fileId,
    newName,
    folderId,
    isNested,
    parentFolderId,
    email,
  } = req.body;

  try {
    await connectToDatabase();

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.createdBy !== email) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this project" });
    }

    const updateFilename = (folders) => {
      return folders.map((folder) => {
        const updatedFiles = folder.files.map((file) =>
          file._id.toString() === fileId
            ? { ...file.toObject(), name: newName }
            : file
        );

        const updatedSubfolders =
          isNested && parentFolderId && folder._id.toString() === parentFolderId
            ? folder.subfolders.map((subfolder) =>
                subfolder._id.toString() === folderId
                  ? {
                      ...subfolder.toObject(),
                      files: subfolder.files.map((file) =>
                        file._id.toString() === fileId
                          ? { ...file.toObject(), name: newName }
                          : file
                      ),
                    }
                  : subfolder
              )
            : folder.subfolders;

        return {
          ...folder.toObject(),
          files: updatedFiles,
          subfolders: updatedSubfolders,
        };
      });
    };

    const updatedFolders = updateFilename(project.folders);
    project.folders = updatedFolders;

    await project.save();

    return res
      .status(200)
      .json({ message: "File renamed successfully", project });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update file" });
  }
};

export const deleteFile = async (req, res) => {
  const { projectId, fileId, folderId, isNested, parentFolderId, email } =
    req.body;

  try {
    await connectToDatabase();

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.createdBy !== email) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this project" });
    }

    const deleteFileFromFolders = (folders) => {
      return folders.map((folder) => {
        const filteredFiles = folder.files.filter(
          (file) => file._id.toString() !== fileId
        );

        const updatedSubfolders =
          isNested && parentFolderId && folder._id.toString() === parentFolderId
            ? folder.subfolders.map((subfolder) =>
                subfolder._id.toString() === folderId
                  ? {
                      ...subfolder.toObject(),
                      files: subfolder.files.filter(
                        (file) => file._id.toString() !== fileId
                      ),
                    }
                  : subfolder
              )
            : folder.subfolders;

        return {
          ...folder.toObject(),
          files: filteredFiles,
          subfolders: updatedSubfolders,
        };
      });
    };

    const updatedFolders = deleteFileFromFolders(project.folders);
    project.folders = updatedFolders;

    await project.save();

    return res
      .status(200)
      .json({ message: "File deleted successfully", project });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete file" });
  }
};
