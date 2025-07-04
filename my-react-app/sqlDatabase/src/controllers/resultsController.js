import Result from '../models/Result.js';

export const createResult = async (req, res) => {
  try {
    const result = await Result.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createManyResults = async (req, res) => {
  try {
    const incoming = req.body;

    const validData = incoming.filter(item =>
      item.title && item.latitude_and_longitude
    );

    if (validData.length === 0) {
      return res.status(400).json({ message: 'No valid items to insert.' });
    }

    const inserted = await Result.bulkCreate(validData, {
      ignoreDuplicates: true, 
    });

    res.status(201).json({
      inserted: inserted.length,
      skipped: validData.length - inserted.length,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllResults = async (req, res) => {
  try {
    const results = await Result.findAll();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResultById = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
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
    const [updated] = await Result.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const updatedResult = await Result.findByPk(req.params.id);
    res.status(200).json(updatedResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteResult = async (req, res) => {
  try {
    const deleted = await Result.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
