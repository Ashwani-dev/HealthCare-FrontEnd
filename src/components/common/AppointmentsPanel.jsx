import React, { useState, useEffect } from "react";
import AppointmentCard from "./AppointmentCard";
import MobileFilters from "./MobileFilters";

const STATUS_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const DATE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Week", value: "week" },
];

const SORT_OPTIONS = [
  { label: "Date (Oldest First)", value: "appointmentDate,asc" },
  { label: "Date (Newest First)", value: "appointmentDate,desc" },
];

function filterAppointments(appointments, status, dateFilter, search, searchField) {
  let filtered = appointments;
  
  // Status filtering
  if (status && status !== "ALL") {
    filtered = filtered.filter(a => a.status === status);
  }
  
  // Date filtering
  if (dateFilter && dateFilter !== "all") {
    const today = new Date();
    if (dateFilter === "today") {
      const todayStr = today.toISOString().slice(0, 10);
      filtered = filtered.filter(a => a.appointmentDate === todayStr);
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);
      filtered = filtered.filter(a => a.appointmentDate === tomorrowStr);
    } else if (dateFilter === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      filtered = filtered.filter(a => {
        const d = new Date(a.appointmentDate);
        return d >= weekStart && d <= weekEnd;
      });
    }
  }
  
  // Search filtering
  if (search) {
    filtered = filtered.filter(a => (a[searchField] || "").toLowerCase().includes(search.toLowerCase()));
  }
  
  return filtered;
}

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange, totalElements, pageSize }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < maxVisiblePages - 1; i++) {
          pages.push(i);
        }
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        for (let i = totalPages - maxVisiblePages + 1; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startElement = currentPage * pageSize + 1;
  const endElement = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
      {/* Results info */}
      <div className="text-sm text-gray-600 text-center sm:text-left">
        Showing {startElement} to {endElement} of {totalElements} appointments
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-2 sm:px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">←</span>
        </button>
        
        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => {
            const isCurrentPage = pageNum === currentPage;
            const isEllipsis = index > 0 && pageNumbers[index - 1] !== pageNum - 1;
            
            if (isEllipsis) {
              return (
                <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-2 text-gray-500">
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isCurrentPage
                    ? "bg-blue-600 text-white border border-blue-600"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>
        
        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="px-2 sm:px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">→</span>
        </button>
      </div>
    </div>
  );
};

const AppointmentsPanel = ({ 
  appointments = [], 
  onAction, 
  onJoinCall, 
  searchField = "patientName", 
  searchPlaceholder = "Search by patient name...",
  // Pagination props
  isPaginated = false,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange = null,
  onSortChange = null,
  currentSort = "appointmentDate,desc",
  // Filter props for paginated mode
  onFilterChange = null,
  currentStatus = "ALL",
  currentDateFilter = "all",
  currentSearch = "",
  onSearchChange = null,
  // Search visibility
  showSearch = true
}) => {
  const [status, setStatus] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Use parent state if provided (for paginated mode), otherwise use local state
  const effectiveStatus = isPaginated ? currentStatus : status;
  const effectiveDateFilter = isPaginated ? currentDateFilter : dateFilter;
  const effectiveSearch = isPaginated ? currentSearch : search;

  // Apply filters only if not using pagination (client-side filtering)
  const filteredAppointments = isPaginated 
    ? appointments 
    : filterAppointments(appointments, status, dateFilter, search, searchField);

  // Handle filter changes
  const handleStatusChange = (newStatus) => {
    if (isPaginated && onFilterChange) {
      onFilterChange({ status: newStatus, dateFilter: effectiveDateFilter, search: effectiveSearch });
    } else {
      setStatus(newStatus);
    }
  };

  const handleDateFilterChange = (newDateFilter) => {
    if (isPaginated && onFilterChange) {
      onFilterChange({ status: effectiveStatus, dateFilter: newDateFilter, search: effectiveSearch });
    } else {
      setDateFilter(newDateFilter);
    }
  };

  const handleSearchChange = (newSearch) => {
    if (isPaginated && onSearchChange) {
      onSearchChange(newSearch);
    } else {
      setSearch(newSearch);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-8 h-[80vh] flex flex-col">
      {/* Mobile Filters */}
      <MobileFilters
        dateFilters={DATE_FILTERS}
        statusOptions={STATUS_OPTIONS}
        currentDateFilter={effectiveDateFilter}
        currentStatus={effectiveStatus}
        onDateFilterChange={handleDateFilterChange}
        onStatusChange={handleStatusChange}
        showSearch={showSearch}
        searchValue={effectiveSearch}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
      />

      {/* Desktop Filters & Search */}
      <div className="hidden lg:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        {/* Date Filters */}
        <div className="flex gap-3 flex-wrap">
          {DATE_FILTERS.map(f => (
            <button
              key={f.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                effectiveDateFilter === f.value 
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
              onClick={() => handleDateFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        {/* Status Filters */}
        <div className="flex gap-3 flex-wrap">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                effectiveStatus === opt.value 
                  ? "bg-blue-100 text-blue-700 border-blue-300 shadow-sm" 
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
              onClick={() => handleStatusChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        {/* Search - Only show if showSearch is true */}
        {showSearch && (
          <div className="flex-shrink-0">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 w-full lg:w-64"
              value={effectiveSearch}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Sort Options (only for paginated mode) */}
      {isPaginated && onSortChange && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 w-full sm:w-auto"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* Appointments List */}
      <div className="space-y-4 lg:space-y-6 overflow-y-auto flex-1 pr-0 lg:pr-2">
        {filteredAppointments.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 lg:mt-12 px-4">
            <div className="text-lg font-medium mb-2">No appointments found</div>
            <div className="text-sm">Try adjusting your filters or search terms</div>
          </div>
        ) : (
          filteredAppointments.map((appt, idx) => (
            <AppointmentCard 
              key={appt.id || appt.appointmentId || idx} 
              appointment={appt} 
              onAction={onAction} 
              onJoinCall={onJoinCall} 
            />
          ))
        )}
      </div>

      {/* Pagination (only for paginated mode) */}
      {isPaginated && onPageChange && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalElements={totalElements}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default AppointmentsPanel; 