// Example backend endpoint
router.get('/sheets/search', async (req, res) => {
  const { po } = req.query;
  
  try {
    const sheets = await Sheet.find({
      poNumber: { $regex: po, $options: 'i' }
    });
    res.json(sheets);
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
});
