import connectToDatabase from '../config/db';
import Project from '../models/project';
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const getChecklistItems = async (req, res) => {
    try {
        await connectToDatabase();

        const { projectId } = req.body;

        let items;
        if (projectId) {
            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
            items = project.checklist;
        } else {
            items = predefinedChecklistItems;
        }

        items.sort((a, b) => a.controlItem.localeCompare(b.controlItem));

        res.json(items);
    } catch (error) {
        console.error('Error fetching checklist items:', error);
        res.status(500).json({ message: 'Server error while fetching checklist items' });
    }
};

const updateChecklistAnswer = async (req, res) => {
    try {
        await connectToDatabase();

        const { projectId, itemId, answer } = req.body;

        if (!projectId || !itemId || !answer) {
            return res.status(400).json({
                message: 'Project ID, item ID, and answer are required'
            });
        }

        const project = await Project.findOneAndUpdate(
            {
                _id: projectId,
                'checklist._id': itemId
            },
            {
                $set: {
                    'checklist.$.answer': answer,
                    'checklist.$.updatedAt': new Date()
                }
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project or checklist item not found' });
        }

        const updatedItem = project.checklist.find(item => item._id.equals(itemId));

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating checklist answer:', error);
        res.status(500).json({ message: 'Server error while updating checklist answer' });
    }
};

const getAllProjectsChecklists = async (req, res) => {
    try {
        await connectToDatabase();

        const projects = await Project.find()
            .select('projectName checklist projectStatus');

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects.map(project => ({
                projectName: project.projectName,
                projectId: project._id,
                checklist: project.checklist,
                projectStatus: project.projectStatus,
            }))
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const askAiQuestion = async (req, res) => {
    try {
        const { question, projectId } = req.body;

        if (!question || !projectId) {
            return res.status(400).json({ 
                error: 'Question and project ID are required' 
            });
        }

        await connectToDatabase();
        
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const checklistContext = project.checklist.map(item => 
            `Control Item: ${item.controlItem}\nObjective: ${item.controlObjective}\nAnswer: ${item.answer || 'Not answered'}`
        ).join('\n\n');

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a compliance expert assistant for the project "${project.projectName}". 
                    Provide clear, concise answers to compliance questions based on the project's checklist items.
                    Here are the project's current checklist items and answers:\n\n${checklistContext}`
                },
                {
                    role: "user",
                    content: question
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const answer = completion.choices[0]?.message?.content || "I couldn't generate an answer for this question.";

        return res.status(200).json({ 
            projectName: project.projectName,
            answer 
        });

    } catch (error) {
        console.error('AI Assistant Error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to process your question'
        });
    }
};

const askAiQuestionAboutAllProject = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        await connectToDatabase();
        
        const projects = await Project.find().select('projectName checklist');

        const projectsContext = projects.map(project => {
            const checklistSummary = project.checklist
                .filter(item => item.answer) // Only include answered items
                .map(item => `${item.controlItem}: ${item.answer}`)
                .join(', ');
            
            return `Project: ${project.projectName}\nChecklist Summary: ${checklistSummary || 'No answered items'}`;
        }).join('\n\n');

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a compliance expert assistant analyzing multiple projects. 
                    Provide insights and answers based on the collective data from all projects.
                    Here's a summary of projects and their checklist answers:\n\n${projectsContext}`
                },
                {
                    role: "user",
                    content: question
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const answer = completion.choices[0]?.message?.content || "I couldn't generate an answer for this question.";

        return res.status(200).json({ 
            totalProjects: projects.length,
            answer 
        });

    } catch (error) {
        console.error('AI Assistant Error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to process your question'
        });
    }
};

export {
    getChecklistItems,
    updateChecklistAnswer,
    getAllProjectsChecklists,
    askAiQuestion,
    askAiQuestionAboutAllProject
};