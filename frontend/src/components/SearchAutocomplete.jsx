import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';

export default function SearchAutocomplete({ value, onChange, onSelect, placeholder = "Tìm kiếm...", inputClassName = "" }) {
  const { user } = useSelector(state => state.auth);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (user && value.length === 0) {
      loadSearchHistory();
    }
  }, [user]);

  useEffect(() => {
    if (value.length >= 2) {
      const timer = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    try {
      setLoading(true);
      const response = await api.get(`/search/autocomplete?q=${encodeURIComponent(query)}`);
      const suggestionsData = response.data.data || [];
      setSuggestions(suggestionsData);
      setShowSuggestions(suggestionsData.length > 0);
      console.log('[SearchAutocomplete] Suggestions:', suggestionsData);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSearchHistory = async () => {
    if (!user) return;
    try {
      const response = await api.get('/search/history');
      setSearchHistory(response.data.data || []);
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const handleSelect = async (suggestion) => {
    onSelect(suggestion);
    setShowSuggestions(false);
    
    // Save to history if user is logged in
    if (user) {
      try {
        await api.post('/search/history', {
          searchTerm: suggestion,
          filters: {}
        });
        loadSearchHistory();
      } catch (error) {
        console.error('Error saving search history:', error);
      }
    }
  };

  const handleDeleteHistory = async (historyId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/search/history/${historyId}`);
      loadSearchHistory();
    } catch (error) {
      console.error('Error deleting search history:', error);
    }
  };

  const displayItems = value.length >= 2 ? suggestions : (searchHistory.slice(0, 5));

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${inputClassName || ''}`}
      />
      
      {showSuggestions && displayItems.length > 0 && (
        <div className="absolute z-40 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto top-full left-0">
          {value.length === 0 && searchHistory.length > 0 && (
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
              Lịch sử tìm kiếm
            </div>
          )}
          {value.length >= 2 && (
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
              Gợi ý
            </div>
          )}
          {displayItems.map((item, index) => {
            const historyItem = typeof item === 'object' ? item : null;
            const displayText = historyItem ? historyItem.searchTerm : item;
            const historyId = historyItem ? historyItem._id : null;
            
            return (
              <div
                key={index}
                onClick={() => handleSelect(displayText)}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-gray-600 dark:text-gray-300">🔍</span>
                  <span className="text-gray-800 dark:text-gray-200">{displayText}</span>
                  {historyItem && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({historyItem.resultCount} kết quả)
                    </span>
                  )}
                </div>
                {historyItem && user && (
                  <button
                    onClick={(e) => handleDeleteHistory(historyId, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
}

