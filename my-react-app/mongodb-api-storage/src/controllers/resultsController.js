import Result from '../models/Result.js';

export const createResult = async (req, res) => {
    try {
        const result = new Result(req.body);
        await result.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const createManyResults = async (req, res) => {
    try {
        const incoming = req.body;
        const inserted = [];
        for (const doc of incoming) {
            const exists = await Result.findOne(doc);
            if (!exists) {
                inserted.push(doc);
            }
        }
        if (inserted.length > 0) {
            await Result.insertMany(inserted);
        }
        res.status(201).json({ inserted: inserted.length, skipped: incoming.length - inserted.length });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllResults = async (req, res) => {
    try {
        const results = await Result.find();
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getResultById = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateResult = async (req, res) => {
    try {
        const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteResult = async (req, res) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};