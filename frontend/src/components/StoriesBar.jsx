import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStories } from '../store/slices/storySlice'
import { Link } from 'react-router-dom'

export default function StoriesBar() {
  const dispatch = useDispatch()
  const { stories, loading } = useSelector(state => state.story)
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    if (user) {
      dispatch(fetchStories())
    }
  }, [dispatch, user])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <div className="flex space-x-4 overflow-x-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stories || stories.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {stories.map((storyGroup, index) => (
          <Link
            key={index}
            to={`/stories/${storyGroup.user._id}`}
            className="flex-shrink-0 flex flex-col items-center space-y-1"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-0.5">
                <img
                  src={storyGroup.user.avatar || 'https://via.placeholder.com/64'}
                  alt={storyGroup.user.name}
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-800"
                />
              </div>
              {storyGroup.stories && storyGroup.stories.length > 0 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{storyGroup.stories.length}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[64px]">
              {storyGroup.user.nickname || storyGroup.user.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

