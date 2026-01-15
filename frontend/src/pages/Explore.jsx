import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPosts } from '../store/slices/postSlice'
import PostCard from '../components/PostCard'
import api from '../utils/api'

export default function Explore() {
  const { hashtag } = useParams()
  const dispatch = useDispatch()
  const { posts, loading } = useSelector(state => state.post)
  const [trendingHashtags, setTrendingHashtags] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    loadTrendingHashtags()
    if (hashtag) {
      loadPostsByHashtag(hashtag)
    } else {
      loadPosts()
    }
  }, [hashtag])

  const loadTrendingHashtags = async () => {
    try {
      const response = await api.get('/hashtags/trending', { params: { limit: 20 } })
      setTrendingHashtags(response.data.data || [])
    } catch (error) {
      console.error('Error loading trending hashtags:', error)
    }
  }

  const loadPosts = async () => {
    try {
      const params = { limit: 20, sort: '-likeCount' }
      if (selectedCategory) {
        params.category = selectedCategory
      }
      await dispatch(fetchPosts(params)).unwrap()
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const loadPostsByHashtag = async (tag) => {
    try {
      await dispatch(fetchPosts({ hashtag: tag, limit: 20 })).unwrap()
    } catch (error) {
      console.error('Error loading posts by hashtag:', error)
    }
  }

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'Books', label: 'Sách' },
    { value: 'Electronics', label: 'Điện tử' },
    { value: 'Furniture', label: 'Nội thất' },
    { value: 'Clothing', label: 'Quần áo' },
    { value: 'Stationery', label: 'Văn phòng phẩm' },
    { value: 'Sports', label: 'Thể thao' },
    { value: 'Other', label: 'Khác' }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Trending Hashtags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
              Hashtag đang hot
            </h3>
            <div className="space-y-2">
              {trendingHashtags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/hashtags/${tag.name}`}
                  className="block text-blue-500 dark:text-blue-400 hover:underline"
                >
                  <div className="flex items-center justify-between">
                    <span>#{tag.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {tag.postCount} bài
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
              Lọc theo danh mục
            </h3>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                loadPosts()
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {hashtag && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                #{hashtag}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {posts.length} bài đăng
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Đang tải...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Chưa có bài đăng nào
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

