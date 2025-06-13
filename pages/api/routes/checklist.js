import {
    updateChecklistAnswer,
    getChecklistItems,
    getAllProjectsChecklists,
    askAiQuestion
} from "../controllers/checklist";

export default async function handler(req, res) {
    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: "Action parameter is required" });
    }

    try {
        if (req.method === "POST") {
            switch (action) {
                case "updateChecklistAnswer":
                    return await updateChecklistAnswer(req, res);
                case "getChecklistItems":
                    return await getChecklistItems(req, res);
                case "getAllProjectsChecklists":
                    return await getAllProjectsChecklists(req, res);
                case "askAiQuestion":
                    return await askAiQuestion(req, res);
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