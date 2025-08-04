import React, { useState } from 'react';

const MobileFilters = ({ 
  dateFilters, 
  statusOptions, 
  currentDateFilter, 
  currentStatus, 
  onDateFilterChange, 
  onStatusChange,
  showSearch = false,
  searchValue = "",
  onSearchChange = null,
  searchPlaceholder = "Search..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('date'); // 'date' or 'status'

  return (
    <div className="lg:hidden">
      {/* Mobile Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filters
          <span className="ml-1 text-xs bg-white/20 px-2 py-1 rounded-full">
            {[currentDateFilter, currentStatus].filter(f => f !== 'all' && f !== 'ALL').length}
          </span>
        </button>

        {/* Search Toggle (if enabled) */}
        {showSearch && (
          <button
            onClick={() => setActiveTab(activeTab === 'search' ? 'date' : 'search')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        )}
      </div>

      {/* Mobile Filter Panel */}
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg mb-6 overflow-hidden">
          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('date')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'date' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'status' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Status
            </button>
            {showSearch && (
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'search' 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Search
              </button>
            )}
          </div>

          {/* Filter Content */}
          <div className="p-4">
            {/* Date Filters */}
            {activeTab === 'date' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Date</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dateFilters.map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        onDateFilterChange(filter.value);
                        setIsOpen(false);
                      }}
                      className={`p-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        currentDateFilter === filter.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status Filters */}
            {activeTab === 'status' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Status</h3>
                <div className="space-y-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onStatusChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full p-3 rounded-lg text-sm font-medium border transition-all duration-200 text-left ${
                        currentStatus === option.value
                          ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {currentStatus === option.value && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            {activeTab === 'search' && showSearch && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Search</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all duration-200"
            >
              Close Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2 mb-4">
        {currentDateFilter !== 'all' && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {dateFilters.find(f => f.value === currentDateFilter)?.label}
            <button
              onClick={() => onDateFilterChange('all')}
              className="ml-1 hover:text-blue-900"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </span>
        )}
        {currentStatus !== 'ALL' && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            {statusOptions.find(s => s.value === currentStatus)?.label}
            <button
              onClick={() => onStatusChange('ALL')}
              className="ml-1 hover:text-green-900"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default MobileFilters; 