import {
    createProject,
    getProjects,
    getProjectById,
    addSubfolder,
    uploadFileToSubfolder,
    getSubfolderFiles,
    getProjectFoldersWithSubfolders,
    uploadFileToFolder,
    deleteProject,
    addFolder,
    updateProjectStatus,
    deleteFile,
    updateFile
} from "../controllers/project";

export default async function handler(req, res) {
    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: "Action parameter is required" });
    }

    try {
        if (req.method === "POST") {
            // Handle createProject with admin email
            if (action === "createProject") {
                const adminEmail = req.cookies.email; // Get admin email from cookies
                if (!adminEmail) {
                    return res.status(400).json({ message: "Admin email not found" });
                }
                req.body.createdBy = adminEmail; // Add to request body
                return await createProject(req, res);
            }

            // Handle all other POST actions normally
            switch (action) {
                case "addSubfolder":
                    return await addSubfolder(req, res);
                case "uploadFileToSubfolder":
                    return await uploadFileToSubfolder(req, res);
                case "getProjectFoldersWithSubfolders":
                    return await getProjectFoldersWithSubfolders(req, res);
                case "uploadFileToFolder":
                    return await uploadFileToFolder(req, res);
                case "deleteProject":
                    return await deleteProject(req, res);
                case "addFolder":
                    return await addFolder(req, res);
                case "deleteFile":
                    return await deleteFile(req, res);
                case "updateFileName":
                    return await updateFile(req, res);
                case "updateProjectStatus":
                    return await updateProjectStatus(req, res);
                default:
                    return res.status(400).json({ message: "Invalid action parameter" });
            }
        } else if (req.method === "GET") {
            // Handle getProjects with admin email filter
            if (action === "getProjects") {
                const adminEmail = req.cookies.email; // Get admin email from cookies
                if (!adminEmail) {
                    return res.status(400).json({ message: "Admin email not found" });
                }
                req.query.createdBy = adminEmail; // Add to query params
                return await getProjects(req, res);
            }

            // Handle all other GET actions normally
            switch (action) {
                case "getProjectById":
                    return await getProjectById(req, res);
                case "getSubfolderFiles":
                    return await getSubfolderFiles(req, res);
                default:
                    return res.status(400).json({ message: "Invalid action parameter" });
            }
        }

        return res.status(405).json({ message: "Method Not Allowed" });
    } catch (error) {
        console.error("API error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            code: "INTERNAL_SERVER_ERROR"
        });
    }
}