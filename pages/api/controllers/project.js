import connectToDatabase from '../config/db';
import Project from '../models/project';

export const createProject = async (req, res) => {
  try {
    await connectToDatabase();

    const { projectName, projectTeam } = req.body;

    const newProject = new Project({
      projectName,
      projectTeam
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    await connectToDatabase();

    const projects = await Project.find();
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

