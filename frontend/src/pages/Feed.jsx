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
          {/* DNU Campus Hero Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 p-6 mb-6">
            {/* Background elements */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-yellow-300/15 blur-lg"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-orange-50">
                    🏫 DNU Student Hub
                  </span>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs text-orange-100 font-medium">Đang hoạt động</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 drop-shadow-sm">
                  Cộng Đồng Sinh Viên Đại Nam
                </h1>
                <p className="text-sm text-orange-55 max-w-md leading-relaxed">
                  Nơi kết nối, chia sẻ khoảnh khắc học đường và trao đổi giáo trình, đồ dùng học tập cùng bạn bè DNU.
                </p>
              </div>
              
              {user && (
                <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 bg-white text-orange-600 hover:bg-orange-50 active:scale-95 transition-all rounded-xl text-sm font-semibold shadow-md shadow-black/10 flex items-center gap-1.5"
                  >
                    <PlusIcon className="w-4 h-4 stroke-[3]" />
                    Đăng tin mới
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stories Bar */}
          {user && <StoriesBar />}

          {/* Feed mode tabs */}
          {user && (
            <div className="mb-6 flex bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl max-w-xs shadow-inner">
              <button
                onClick={() => setFeedMode('all')}
                className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-all ${
                  feedMode === 'all'
                    ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFeedMode('following')}
                className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-all ${
                  feedMode === 'following'
                    ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Đang theo dõi
              </button>
            </div>
          )}

          {/* Create Post Input Trigger Card */}
          {user && (
            <div className="mb-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 flex items-center space-x-3 hover:shadow-md transition-all duration-200 group"
              >
                <img
                  src={user.avatar || 'https://via.placeholder.com/40'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/10"
                />
                <span className="flex-1 text-left text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  Bạn đang nghĩ gì? Chia sẻ cùng sinh viên DNU nhé...
                </span>
                <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-950/40 transition-colors">
                  <PlusIcon className="w-5 h-5 text-orange-500" />
                </div>
              </button>
            </div>
          )}

          {/* Posts list */}
          {loading && page === 1 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm font-medium">Đang tải bảng tin...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 p-6 text-gray-500 dark:text-gray-400">
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Bảng tin trống</p>
              <p className="text-sm">
                {feedMode === 'following'
                  ? 'Chưa có bài đăng từ người bạn theo dõi.'
                  : 'Chưa có bài đăng nào. Hãy là người đầu tiên chia sẻ khoảnh khắc!'}
              </p>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
              
              {hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Đang tải thêm...' : 'Tải thêm bài viết'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        {user && (
          <div className="lg:col-span-1 space-y-5">
            {/* Gợi ý theo dõi */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/60">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                Gợi ý theo dõi
              </h3>
              {(suggestions || []).length === 0 ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 py-2">
                  Chưa có gợi ý phù hợp.
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.slice(0, 6).map(s => (
                    <div key={s._id} className="flex items-center justify-between gap-3">
                      <Link to={`/users/${s._id}/profile`} className="flex items-center gap-2 min-w-0 group">
                        <img
                          src={s.avatar || 'https://via.placeholder.com/32'}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-orange-500/20 transition-all"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-orange-500 transition-colors">
                            {s.nickname || s.name}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {s.bio || `${s.followerCount || 0} follower`}
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => dispatch(followUser(s._id)).then(() => dispatch(fetchSuggestions()))}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-semibold transition-colors"
                      >
                        Theo dõi
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                <Link
                  to="/explore"
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors flex items-center justify-between"
                >
                  <span>Khám phá thêm</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* DNU Utilities Card */}
            <div className="bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-gray-800/40 dark:to-gray-800/20 rounded-2xl border border-orange-200/40 dark:border-gray-700/50 p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">📢</span>
                <h4 className="text-xs font-bold text-orange-800 dark:text-orange-300">
                  Thông báo & Quy tắc
                </h4>
              </div>
              <ul className="space-y-2 text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Mọi tin đăng mua bán cần trung thực, ghi rõ tình trạng và giá cả.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Nên giao dịch trực tiếp tại khuôn viên trường (Campus DNU) để đảm bảo an toàn.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Không đăng tin liên quan đến các mặt hàng cấm hoặc vi phạm quy chế học tập.</span>
                </li>
              </ul>
              
              <div className="mt-4 pt-3 border-t border-orange-200/40 dark:border-gray-700/50">
                <Link
                  to="/help"
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center justify-between"
                >
                  <span>Hướng dẫn giao dịch an toàn</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* DNU Clubs Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  🎪 Câu lạc bộ DNU
                </h4>
                <span className="text-[10px] text-orange-500 font-semibold bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full">Hot</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'CLB Tình nguyện DNU', members: '120+ thành viên', icon: '🎨' },
                  { name: 'CLB Guitar & Nghệ thuật', members: '85+ thành viên', icon: '🎸' },
                  { name: 'CLB Thể thao Đại Nam', members: '200+ thành viên', icon: '⚽' }
                ].map((club, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <span className="text-base w-7 h-7 flex items-center justify-center bg-orange-100 dark:bg-orange-950/40 rounded-lg text-orange-600 dark:text-orange-350">{club.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{club.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{club.members}</p>
                    </div>
                  </div>
                ))}
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

