import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addPostToCollection,
  createCollection,
  fetchCollections,
  removePostFromCollection
} from '../store/slices/collectionSlice'

export default function SaveToCollectionModal({ postId, onClose }) {
  const dispatch = useDispatch()
  const { collections, loading } = useSelector(state => state.collection)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    dispatch(fetchCollections())
  }, [dispatch])

  const membership = useMemo(() => {
    const map = new Map()
    for (const c of collections || []) {
      const has = (c.posts || []).some(p => (p?._id || p)?.toString() === postId?.toString())
      map.set(c._id, has)
    }
    return map
  }, [collections, postId])

  const toggle = async (collectionId) => {
    const isIn = membership.get(collectionId)
    if (isIn) {
      await dispatch(removePostFromCollection({ collectionId, postId })).unwrap()
    } else {
      await dispatch(addPostToCollection({ collectionId, postId })).unwrap()
    }
    dispatch(fetchCollections())
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await dispatch(createCollection({ name: name.trim(), description: description.trim(), isPublic: true })).unwrap()
    setName('')
    setDescription('')
    setCreating(false)
    dispatch(fetchCollections())
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">Lưu vào bộ sưu tập</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {(collections || []).length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Bạn chưa có bộ sưu tập nào. Tạo mới bên dưới.
              </div>
            ) : (
              (collections || []).map((c) => {
                const isIn = membership.get(c._id)
                return (
                  <button
                    key={c._id}
                    onClick={() => toggle(c._id)}
                    disabled={loading}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {c.postCount ?? (c.posts?.length || 0)} bài
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${isIn ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isIn ? 'Đã lưu' : 'Lưu'}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            {!creating ? (
              <button
                onClick={() => setCreating(true)}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                + Tạo bộ sưu tập mới
              </button>
            ) : (
              <form onSubmit={handleCreate} className="space-y-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên bộ sưu tập"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả (tuỳ chọn)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    Tạo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

