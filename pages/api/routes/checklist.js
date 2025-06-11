import {
    getAllChecklistItems,
    getItemsByCategory,
    updateAnswer,
    bulkUpdateAnswers,
    getChecklistItemById
} from "../controllers/checklist";

export default async function handler(req, res) {
    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: "Action parameter is required" });
    }

    try {
        if (req.method === "POST") {
            switch (action) {
                case "getAllChecklistItems":
                    return await getAllChecklistItems(req, res);
                case "getItemsByCategory":
                    return await getItemsByCategory(req, res);
                case "updateAnswer":
                    return await updateAnswer(req, res);
                case "bulkUpdateAnswers":
                    return await bulkUpdateAnswers(req, res);
                case "getChecklistItemById":
                    return await getChecklistItemById(req, res);
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