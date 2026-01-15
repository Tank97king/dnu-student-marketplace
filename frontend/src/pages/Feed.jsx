import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPosts } from '../store/slices/postSlice'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'
import StoriesBar from '../components/StoriesBar'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function Feed() {
  const dispatch = useDispatch()
  const { posts, loading, pagination } = useSelector(state => state.post)
  const { user } = useSelector(state => state.auth)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadPosts(1)
  }, [dispatch])

  const loadPosts = async (pageNum = 1) => {
    try {
      const result = await dispatch(fetchPosts({ page: pageNum, limit: 10 })).unwrap()
      setHasMore(pageNum < result.pagination.pages)
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadPosts(nextPage)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Stories Bar */}
      {user && <StoriesBar />}

      {/* Create Post Button */}
      {user && (
        <div className="mb-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow"
          >
            <img
              src={user.avatar || 'https://via.placeholder.com/40'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="flex-1 text-left text-gray-500 dark:text-gray-400">
              Bạn đang nghĩ gì?
            </span>
            <PlusIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      )}

      {/* Posts */}
      {loading && page === 1 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Đang tải...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Chưa có bài đăng nào. Hãy là người đầu tiên đăng bài!
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
          
          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Đang tải...' : 'Tải thêm'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadPosts(1)
          }}
        />
      )}
    </div>
  )
}

