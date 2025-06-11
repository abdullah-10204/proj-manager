import connectToDatabase from '../config/db';
import CheckList from '../models/checklist';

const initializeChecklist = async (req, res) => {
  try {
    await CheckList.initializeChecklist();
    res.status(201).json({ message: 'Checklist initialized successfully' });
  } catch (error) {
    console.error('Error initializing checklist:', error);
    res.status(500).json({ message: 'Server error while initializing checklist' });
  }
};

const getAllChecklistItems = async (req, res) => {
    try {
        await connectToDatabase();
        const items = await CheckList.find().sort({ category: 1, controlItem: 1 });
        
        res.json(items);
    } catch (error) {
        console.error('Error fetching checklist items:', error);
        res.status(500).json({ message: 'Server error while fetching checklist items' });
    }
};

const getItemsByCategory = async (req, res) => {
    try {
        await connectToDatabase();
        const { category } = req.body;
        const items = await CheckList.find({ category }).sort({ controlItem: 1 });

        if (!items || items.length === 0) {
            return res.status(404).json({ message: 'No items found for this category' });
        }

        res.json(items);
    } catch (error) {
        console.error('Error fetching items by category:', error);
        res.status(500).json({ message: 'Server error while fetching items by category' });
    }
};

const updateAnswer = async (req, res) => {
    try {
        await connectToDatabase();

        const { answer, id } = req.body;

        if (!answer) {
            return res.status(400).json({ message: 'Answer is required' });
        }

        const updatedItem = await CheckList.findByIdAndUpdate(
            id,
            { answer },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Checklist item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating answer:', error);
        res.status(500).json({ message: 'Server error while updating answer' });
    }
};

const bulkUpdateAnswers = async (req, res) => {
    try {
        await connectToDatabase();

        const { updates } = req.body;

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ message: 'Invalid updates format' });
        }

        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { _id: update.id },
                update: { $set: { answer: update.answer } }
            }
        }));

        const result = await CheckList.bulkWrite(bulkOps);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No items were updated' });
        }

        res.json({
            message: 'Bulk update successful',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({ message: 'Server error during bulk update' });
    }
};

const getChecklistItemById = async (req, res) => {
    try {
        await connectToDatabase();

        const item = await CheckList.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Checklist item not found' });
        }

        res.json(item);
    } catch (error) {
        console.error('Error fetching checklist item:', error);
        res.status(500).json({ message: 'Server error while fetching checklist item' });
    }
};

export {
    getAllChecklistItems,
    getItemsByCategory,
    updateAnswer,
    bulkUpdateAnswers,
    getChecklistItemById
};