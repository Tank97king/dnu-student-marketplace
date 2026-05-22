import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function FollowListModal({ isOpen, onClose, userId, username, type, currentUser }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [myFollowingIds, setMyFollowingIds] = useState([])
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    if (isOpen) {
      fetchList()
    }
  }, [isOpen, userId, type])

  const fetchList = async () => {
    setLoading(true)
    try {
      // 1. Fetch the followers or following list of the target user
      const listRes = await api.get(`/users/${userId}/${type}`)
      setUsers(listRes.data.data || [])

      // 2. Fetch the following list of the logged-in user to check who they already follow
      if (currentUser) {
        const myFollowingRes = await api.get(`/users/${currentUser.id}/following`)
        const myFollowingUsers = myFollowingRes.data.data || []
        setMyFollowingIds(myFollowingUsers.map(u => u._id))
      }
    } catch (error) {
      console.error('Error fetching follow list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowAction = async (targetUser) => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    const targetUserId = targetUser._id
    const isAlreadyFollowing = myFollowingIds.includes(targetUserId)

    // Set loading for this specific user action
    setActionLoading(prev => ({ ...prev, [targetUserId]: true }))

    try {
      if (isAlreadyFollowing) {
        // Unfollow
        await api.delete(`/users/${targetUserId}/follow`)
        setMyFollowingIds(prev => prev.filter(id => id !== targetUserId))
      } else {
        // Follow
        await api.post(`/users/${targetUserId}/follow`)
        setMyFollowingIds(prev => [...prev, targetUserId])
      }
    } catch (error) {
      console.error('Error handling follow action:', error)
      alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.')
    } finally {
      setActionLoading(prev => ({ ...prev, [targetUserId]: false }))
    }
  }

  const handleUserClick = (targetUserId) => {
    onClose()
    navigate(`/users/${targetUserId}/profile`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[75vh] flex flex-col overflow-hidden animate-fade-in border border-gray-100 dark:border-gray-700">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'} của {username}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải danh sách...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {type === 'followers' ? 'Chưa có người theo dõi nào.' : 'Chưa theo dõi người dùng nào.'}
            </div>
          ) : (
            <div className="space-y-4">
              {users.map(u => {
                const isMe = currentUser && currentUser.id === u._id
                const isFollowing = myFollowingIds.includes(u._id)
                const isBtnLoading = actionLoading[u._id]

                return (
                  <div key={u._id} className="flex items-center justify-between gap-3">
                    {/* User profile info */}
                    <div 
                      onClick={() => handleUserClick(u._id)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <img
                        src={u.avatar || '/avatars/default_male.png'}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100 dark:border-gray-600"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {u.nickname || u.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {u.name}
                        </p>
                      </div>
                    </div>

                    {/* Follow/Unfollow button */}
                    {!isMe && currentUser && (
                      <button
                        onClick={() => handleFollowAction(u)}
                        disabled={isBtnLoading}
                        className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          isFollowing
                            ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                        } disabled:opacity-50`}
                      >
                        {isBtnLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                        ) : isFollowing ? (
                          'Đang theo dõi'
                        ) : (
                          'Theo dõi'
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
