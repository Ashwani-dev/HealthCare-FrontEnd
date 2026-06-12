import React, { useState } from "react";
import AppointmentCard from "./AppointmentCard";
import MobileFilters from "./MobileFilters";
import { Search, ArrowUpDown, Calendar, Folder } from "lucide-react";

// Lucide React Icons for consistency
const SearchIcon = () => <Search className="w-4 h-4 text-slate-400" />;

const EmptyStateIcon = () => (
  <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const SortIcon = () => <ArrowUpDown className="w-4 h-4 text-slate-400" />;

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const DATE_FILTERS = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Week", value: "week" },
];

const SORT_OPTIONS = [
  { label: "Date (Oldest First)", value: "appointmentDate,startTime,asc" },
  { label: "Date (Newest First)", value: "appointmentDate,startTime,desc" },
];

function filterAppointments(appointments, status, dateFilter, search, searchField) {
  let filtered = appointments;
  
  // Status filtering
  if (status && status !== "ALL") {
    filtered = filtered.filter(a => a.status === status);
  }
  
  // Date filtering
  if (dateFilter && dateFilter !== "all") {
    const now = new Date();
    
    // Helper function to format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    if (dateFilter === "today") {
      const todayStr = formatLocalDate(now);
      filtered = filtered.filter(a => a.appointmentStartDate === todayStr);
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowStr = formatLocalDate(tomorrow);
      filtered = filtered.filter(a => a.appointmentStartDate === tomorrowStr);
    } else if (dateFilter === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const weekStartStr = formatLocalDate(weekStart);
      const weekEndStr = formatLocalDate(weekEnd);
      filtered = filtered.filter(a => {
        return a.appointmentStartDate >= weekStartStr && a.appointmentStartDate <= weekEndStr;
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100">
      {/* Results info */}
      <div className="text-xs sm:text-sm text-slate-500 font-semibold text-center sm:text-left bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/30">
        Showing <span className="text-slate-800 font-bold">{startElement}</span> to <span className="text-slate-800 font-bold">{endElement}</span> of <span className="text-slate-800 font-bold">{totalElements}</span> sessions
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          <span>Previous</span>
        </button>
        
        {/* Page numbers */}
        <div className="flex items-center gap-1.5">
          {pageNumbers.map((pageNum, index) => {
            const isCurrentPage = pageNum === currentPage;
            const isEllipsis = index > 0 && pageNumbers[index - 1] !== pageNum - 1;
            
            if (isEllipsis) {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-slate-400 font-semibold">
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[36px] px-2.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                  isCurrentPage
                    ? "bg-indigo-600 text-white border border-indigo-600 shadow-md hover:bg-indigo-700 shadow-indigo-500/10"
                    : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm active:scale-[0.98]"
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
          className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          <span>Next</span>
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
  currentUserId = null,
  userRole = "",
  // Pagination props
  isPaginated = false,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange = null,
  onSortChange = null,
  currentSort = "appointmentDate,startTime,desc",
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
    <div className="bg-white/90 border border-slate-100 rounded-3xl p-6 lg:p-8 min-h-[80vh] flex flex-col shadow-lg backdrop-blur-md">
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

      {/* Desktop Filters & Controls */}
      <div className="hidden lg:block mb-8">
        {/* Top Row: Date Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          {DATE_FILTERS.map(f => (
            <button
              key={f.value}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
                effectiveDateFilter === f.value 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md hover:bg-indigo-700 shadow-indigo-500/10" 
                  : "bg-slate-50 text-slate-600 border-slate-200/50 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm"
              }`}
              onClick={() => handleDateFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        {/* Bottom Row: Status Filters, Sort, and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2.5 flex-1">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
                  effectiveStatus === opt.value 
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-sm" 
                    : "bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                }`}
                onClick={() => handleStatusChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          {/* Right Side: Sort and Search */}
          <div className="flex items-center gap-4">
            {/* Sort Dropdown (only for paginated mode) */}
            {isPaginated && onSortChange && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <SortIcon />
                </div>
                <select
                  value={currentSort}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200 cursor-pointer"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Search Bar */}
            {showSearch && (
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm font-semibold"
                  value={effectiveSearch}
                  onChange={e => handleSearchChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Appointments List */}
      <div className="space-y-5 overflow-y-auto flex-1 pr-0 lg:pr-2">
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 border border-slate-100">
              <EmptyStateIcon />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Appointments Found</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              {effectiveSearch || effectiveStatus !== "ALL" || effectiveDateFilter !== "all"
                ? "Try adjusting your filters or search terms to see more results."
                : "You don't have any appointments yet scheduled."}
            </p>
          </div>
        ) : (
          filteredAppointments.map((appt, idx) => (
            <AppointmentCard 
              key={appt.id || appt.appointmentId || idx} 
              appointment={appt} 
              onAction={onAction} 
              onJoinCall={onJoinCall} 
              currentUserId={currentUserId}
              userRole={userRole}
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