const Product = require('../models/Product');
const SearchHistory = require('../models/SearchHistory');
const Review = require('../models/Review');
const ProductView = require('../models/ProductView');
const User = require('../models/User');

// @desc    Get search autocomplete suggestions
// @route   GET /api/search/autocomplete
// @access  Public
exports.getAutocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Search in product titles and tags
    const products = await Product.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ],
      isApproved: true,
      status: 'Available'
    })
    .select('title tags category')
    .limit(10);

    // Extract unique suggestions
    const suggestions = new Set();
    products.forEach(product => {
      // Add title if matches
      if (product.title.toLowerCase().includes(q.toLowerCase())) {
        suggestions.add(product.title);
      }
      // Add matching tags
      product.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(q.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    // Get popular search terms from history
    const popularSearches = await SearchHistory.aggregate([
      {
        $match: {
          searchTerm: { $regex: q, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$searchTerm',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      { $limit: 5 }
    ]);

    popularSearches.forEach(item => {
      suggestions.add(item._id);
    });

    res.json({
      success: true,
      data: Array.from(suggestions).slice(0, 10)
    });
  } catch (error) {
    console.error('Error getting autocomplete:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Save search history
// @route   POST /api/search/history
// @access  Private
exports.saveSearchHistory = async (req, res) => {
  try {
    const { searchTerm, filters } = req.body;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters'
      });
    }

    // Count results
    const query = buildSearchQuery(searchTerm, filters);
    const resultCount = await Product.countDocuments(query);

    // Save to history
    const history = await SearchHistory.create({
      userId: req.user.id,
      searchTerm: searchTerm.trim(),
      filters: filters || {},
      resultCount
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error saving search history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user search history
// @route   GET /api/search/history
// @access  Private
exports.getSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('searchTerm filters resultCount createdAt');

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting search history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete search history
// @route   DELETE /api/search/history/:id
// @access  Private
exports.deleteSearchHistory = async (req, res) => {
  try {
    await SearchHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Search history deleted'
    });
  } catch (error) {
    console.error('Error deleting search history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to build search query
const buildSearchQuery = (searchTerm, filters = {}) => {
  const query = {
    isApproved: true,
    status: 'Available'
  };

  // Text search
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ];
  }

  // Filters
  if (filters.category) query.category = filters.category;
  if (filters.condition) query.condition = filters.condition;
  if (filters.location) query.location = filters.location;
  
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  if (filters.dateRange) {
    query.createdAt = { $gte: new Date(filters.dateRange) };
  }

  // Tag filter
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  // Rating filter
  if (filters.minRating) {
    query.averageRating = { $gte: Number(filters.minRating) };
  }

  return query;
};

module.exports.buildSearchQuery = buildSearchQuery;

