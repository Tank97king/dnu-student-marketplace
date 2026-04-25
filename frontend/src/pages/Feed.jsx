import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFollowingFeed, fetchPosts } from '../store/slices/postSlice'
import { fetchSuggestions, followUser } from '../store/slices/followSlice'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'
import StoriesBar from '../components/StoriesBar'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function Feed() {
  const dispatch = useDispatch()
  const { posts, loading, pagination } = useSelector(state => state.post)
  const { user } = useSelector(state => state.auth)
  const { suggestions } = useSelector(state => state.follow)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [feedMode, setFeedMode] = useState('all') // all | following

  useEffect(() => {
    loadPosts(1, feedMode)
    if (user) dispatch(fetchSuggestions())
  }, [dispatch])

  useEffect(() => {
    setPage(1)
    loadPosts(1, feedMode)
  }, [feedMode])

  const loadPosts = async (pageNum = 1, mode = 'all') => {
    try {
      const thunk = mode === 'following' ? fetchFollowingFeed : fetchPosts
      const result = await dispatch(thunk({ page: pageNum, limit: 10 })).unwrap()
      setHasMore(pageNum < result.pagination.pages)
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadPosts(nextPage, feedMode)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-3 max-w-2xl">
          {/* Stories Bar */}
          {user && <StoriesBar />}

          {/* Feed mode */}
          {user && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setFeedMode('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  feedMode === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFeedMode('following')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  feedMode === 'following'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                }`}
              >
                Đang theo dõi
              </button>
            </div>
          )}

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
              {feedMode === 'following'
                ? 'Chưa có bài đăng từ người bạn theo dõi.'
                : 'Chưa có bài đăng nào. Hãy là người đầu tiên đăng bài!'}
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
        </div>

        {/* Sidebar */}
        {user && (
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                Gợi ý theo dõi
              </h3>
              {(suggestions || []).length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Chưa có gợi ý phù hợp.
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.slice(0, 6).map(s => (
                    <div key={s._id} className="flex items-center justify-between gap-3">
                      <Link to={`/users/${s._id}/profile`} className="flex items-center gap-2 min-w-0">
                        <img
                          src={s.avatar || 'https://via.placeholder.com/32'}
                          alt={s.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {s.nickname || s.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {s.bio || `${s.followerCount || 0} follower`}
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => dispatch(followUser(s._id)).then(() => dispatch(fetchSuggestions()))}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
                      >
                        Theo dõi
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link to="/explore" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Khám phá thêm →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

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

