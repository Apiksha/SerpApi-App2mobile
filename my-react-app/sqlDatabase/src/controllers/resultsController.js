import Result from '../models/Result.js';

export const createResult = async (req, res) => {
  try {
    console.log('🔹 Single create request:', req.body);

    const result = await Result.create(req.body);

    res.status(201).json(result);
  } catch (error) {
    console.error('❌ createResult error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const createManyResults = async (req, res) => {
  try {
    const incoming = req.body;

    console.log(`🔹 Incoming items: ${incoming.length}`);

    const validData = incoming.filter(item =>
      item.title && item.latitude_and_longitude
    );

    console.log(`✅ Valid items: ${validData.length}`);
    if (validData[0]) console.log('🔍 First valid item:', validData[0]);

    if (validData.length === 0) {
      console.warn('⚠️ No valid items to insert.');
      return res.status(400).json({ message: 'No valid items to insert.' });
    }

    const inserted = await Result.bulkCreate(validData, {
      ignoreDuplicates: true,
    });

    console.log(`✅ Inserted: ${inserted.length}, Skipped: ${validData.length - inserted.length}`);

    res.status(201).json({
      inserted: inserted.length,
      skipped: validData.length - inserted.length,
    });

  } catch (error) {
    console.error('❌ createManyResults error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllResults = async (req, res) => {
  try {
    const results = await Result.findAll();
    res.status(200).json(results);
  } catch (error) {
    console.error('❌ getAllResults error:', error);
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
    console.error('❌ getResultById error:', error);
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
    console.error('❌ updateResult error:', error);
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
    console.error('❌ deleteResult error:', error);
    res.status(500).json({ message: error.message });
  }
};
