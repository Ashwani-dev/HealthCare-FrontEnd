import React, { useEffect, useState } from "react";
import { fetchDoctorsSearch, fetchDoctorsBySpecialization, fetchDoctorProfileById } from "../../api/api";
import BookAppointment from "../patient/BookAppointment";
import { useAuth } from "../../context/AuthContext";
import { FaSearch } from "react-icons/fa";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "@heroicons/react/solid";

const specializations = [
  "Anxiety", "Depression", "Trauma", "Relationships", "Family Counseling", "CBT", "Counseling psychology"
];
const genders = ["MALE", "FEMALE"];
const languages = ["English", "Hindi", "Kannada"];
const approaches = ["Cognitive Behavioral Therapy", "Psychodynamic Therapy", "Family Therapy", "Mindfulness"];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const FindTherapistPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    specialization: [],
    gender: "",
    language: [],
    approach: [],
  });
  const [modalDoctor, setModalDoctor] = useState(null);
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const therapistsPerPage = 6;

  const debouncedSearch = useDebounce(search, 400);

  const { user } = useAuth();

  // Type-ahead suggestions for specializations and names
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      return;
    }
    // Suggest from specializations and doctor names
    const lower = search.toLowerCase();
    const specMatches = specializations.filter(s => s.toLowerCase().includes(lower));
    const nameMatches = doctors
      .map(d => d.full_name)
      .filter(n => n && n.toLowerCase().includes(lower));
    setSuggestions([...new Set([...specMatches, ...nameMatches])].slice(0, 5));
  }, [search, doctors]);

  // Fetch from backend on search change
  useEffect(() => {
    setLoading(true);
    fetchDoctorsSearch(debouncedSearch).then((data) => {
      setDoctors(data);
      setLoading(false);
    });
  }, [debouncedSearch]);

  // Frontend filter for gender, language, approach
  const filteredDoctors = doctors.filter(doc => {
    const matchesGender =
      !filters.gender ||
      (doc.gender && (filters.gender === "No preference" || doc.gender === filters.gender));
    const matchesLang =
      !filters.language.length ||
      (doc.languages && filters.language.some(lang => doc.languages.includes(lang)));
    const matchesApproach =
      !filters.approach.length ||
      (doc.approaches && filters.approach.some(app => doc.approaches.includes(app)));
    return matchesGender && matchesLang && matchesApproach;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDoctors.length / therapistsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * therapistsPerPage,
    currentPage * therapistsPerPage
  );

  // Reset to first page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters]);

  // Filter UI state
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [expandedSections, setExpandedSections] = useState({
    specialization: true,
    gender: false,
    language: false,
    approach: false,
  });
  const [seeMore, setSeeMore] = useState({ specialization: false, approach: false });
  const clearFilters = () => {
    const emptyFilters = { specialization: [], gender: "", language: [], approach: [] };
    setFilters(emptyFilters);
    setPendingFilters(emptyFilters);
    // Refetch all doctors when clearing filters (use current search term or empty string)
    setLoading(true);
    fetchDoctorsSearch(search || "").then((data) => {
      setDoctors(data);
      setLoading(false);
    });
  };

  // Update pending filters on sidebar change
  const handlePendingFilterChange = (type, value) => {
    setPendingFilters(f => {
      if (Array.isArray(f[type])) {
        return {
          ...f,
          [type]: f[type].includes(value)
            ? f[type].filter(v => v !== value)
            : [...f[type], value]
        };
      } else {
        return { ...f, [type]: value };
      }
    });
  };
  const applyFilters = () => {
    const hasSpecialization = pendingFilters.specialization.length > 0;
    const hasGender = pendingFilters.gender && pendingFilters.gender !== "";
    
    if (hasSpecialization || hasGender) {
      setLoading(true);
      
      // Get first specialization (or empty string if none selected)
      const specialization = hasSpecialization ? pendingFilters.specialization[0] : "";
      
      // Get gender (convert to uppercase for backend, or empty string if none selected)
      const gender = hasGender ? pendingFilters.gender : "";
      
      fetchDoctorsBySpecialization(specialization, gender)
        .then((data) => {
          setDoctors(data);
          setLoading(false);
          setFilters(pendingFilters);
        })
        .catch((error) => {
          console.error("Failed to fetch doctors by filters:", error);
          setLoading(false);
        });
    } else {
      // No backend filters applied, just update local filters
      setFilters(pendingFilters);
    }
  };

  // Expand/collapse
  const toggleSection = (section) => setExpandedSections(s => ({ ...s, [section]: !s[section] }));
  const toggleSeeMore = (section) => setSeeMore(s => ({ ...s, [section]: !s[section] }));

  // Handle view profile
  const handleViewProfile = async (doctor) => {
    setProfileDoctor(doctor);
    setProfileExpanded(false);
    setProfileLoading(true);
    setProfileData(null);
    try {
      const data = await fetchDoctorProfileById(doctor.id);
      setProfileData(data);
    } catch (error) {
      console.error("Failed to fetch doctor profile:", error);
      // Fallback to basic doctor data if API fails
      setProfileData(doctor);
    } finally {
      setProfileLoading(false);
    }
  };

  // Filter counts
  const getCount = (type, value) => {
    return doctors.filter(doc => {
      if (type === "specialization") {
        // Check both specialization and specializations array
        return doc.specialization === value || (doc.specializations && doc.specializations.includes(value));
      }
      if (type === "gender") {
        // Handle case-insensitive matching for gender (backend returns MALE/FEMALE, filter uses Male/Female)
        return doc.gender && doc.gender.toUpperCase() === value.toUpperCase();
      }
      if (type === "language") return doc.languages && doc.languages.includes(value);
      if (type === "approach") return doc.approaches && doc.approaches.includes(value);
      return false;
    }).length;
  };

  // Tags for active filters
  const activeTags = [];
  if (filters.specialization.length) filters.specialization.forEach(s => activeTags.push({ type: "specialization", value: s }));
  if (filters.gender) activeTags.push({ type: "gender", value: filters.gender });
  if (filters.language.length) filters.language.forEach(l => activeTags.push({ type: "language", value: l }));
  if (filters.approach.length) filters.approach.forEach(a => activeTags.push({ type: "approach", value: a }));
  const removeTag = (type, value) => {
    setFilters(f => {
      let updated;
      if (Array.isArray(f[type])) {
        updated = { ...f, [type]: f[type].filter(v => v !== value) };
      } else {
        updated = { ...f, [type]: "" };
      }
      
      // If removing a specialization or gender, refetch from backend
      if (type === "specialization" || type === "gender") {
        setLoading(true);
        const specs = Array.isArray(updated.specialization) ? updated.specialization : [];
        const hasSpec = specs.length > 0;
        const hasGender = updated.gender && updated.gender !== "";
        
        if (hasSpec || hasGender) {
          const specialization = hasSpec ? specs[0] : "";
          const gender = hasGender ? updated.gender.toUpperCase() : "";
          
          fetchDoctorsBySpecialization(specialization, gender)
            .then((data) => {
              setDoctors(data);
              setLoading(false);
            })
            .catch((error) => {
              console.error("Failed to fetch doctors:", error);
              setLoading(false);
            });
        } else {
          // No filters active, fetch all
          fetchDoctorsSearch("")
            .then((data) => {
              setDoctors(data);
              setLoading(false);
            })
            .catch((error) => {
              console.error("Failed to fetch doctors:", error);
              setLoading(false);
            });
        }
      }
      return updated;
    });
    
    setPendingFilters(f => {
      if (Array.isArray(f[type])) {
        return { ...f, [type]: f[type].filter(v => v !== value) };
      } else {
        return { ...f, [type]: "" };
      }
    });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-10 px-2">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Your Journey to Mental Wellness Starts Here</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-8">
            Seamlessly connect with expert mental health professionals tailored to your specific needs and preferences.
          </p>
          {/* Enhanced Search Bar with Icon and Suggestions */}
          <div className="flex flex-col items-center w-full max-w-xl mx-auto">
            <div className="relative w-full flex">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch />
              </span>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 text-lg"
                placeholder="Search by name, specialty, or concern..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
              />
              <button
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md shadow-md transition duration-300 ease-in-out"
                onClick={() => setSearch(search)}
                type="button"
              >
                Search
              </button>
            </div>
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-12 w-full bg-white border border-gray-200 rounded shadow-lg max-w-xl mx-auto">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-left"
                    onClick={() => setSearch(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>
        {/* Filter Tags */}
        {activeTags.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-center">
            {activeTags.map((tag, i) => (
              <span key={tag.type + tag.value} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2">
                {tag.type.charAt(0).toUpperCase() + tag.type.slice(1)}: {tag.value}
                <button className="ml-2 text-blue-600 hover:text-blue-900" onClick={() => removeTag(tag.type, tag.value)}>
                  <XIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
          {/* Filters Sidebar (desktop) */}
          <aside className="hidden md:block w-64 bg-white rounded-xl shadow p-4 h-fit">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-blue-700 text-xl">Filters</h2>
              <button className="text-blue-600 hover:underline text-sm" onClick={clearFilters}>Clear All</button>
            </div>
            {/* Specialization */}
            <div className="mb-4">
              <button type="button" className="flex items-center w-full font-semibold text-lg mb-2" onClick={() => toggleSection("specialization")}>Specialization {expandedSections.specialization ? <ChevronUpIcon className="w-5 h-5 ml-2" /> : <ChevronDownIcon className="w-5 h-5 ml-2" />}</button>
              {expandedSections.specialization && (
                <div>
                  {(seeMore.specialization ? specializations : specializations.slice(0, 5)).map(spec => (
                    <label key={spec} className="block text-sm mb-1">
                      <input
                        type="checkbox"
                        checked={pendingFilters.specialization.includes(spec)}
                        onChange={() => handlePendingFilterChange("specialization", spec)}
                        className="mr-2"
                      />
                      {spec} <span className="text-sm text-gray-500 ml-1">({getCount("specialization", spec)})</span>
                    </label>
                  ))}
                  {specializations.length > 5 && (
                    <button className="text-blue-600 hover:underline text-xs mt-1" onClick={() => toggleSeeMore("specialization")}>{seeMore.specialization ? "See Less" : "See More..."}</button>
                  )}
                </div>
              )}
            </div>
            {/* Gender */}
            <div className="mb-4">
              <button type="button" className="flex items-center w-full font-semibold text-lg mb-2" onClick={() => toggleSection("gender")}>Gender {expandedSections.gender ? <ChevronUpIcon className="w-5 h-5 ml-2" /> : <ChevronDownIcon className="w-5 h-5 ml-2" />}</button>
              {expandedSections.gender && (
                <div>
                  {genders.map(g => (
                    <label key={g} className="block text-sm mb-1">
                      <input
                        type="radio"
                        checked={pendingFilters.gender === g}
                        onChange={() => handlePendingFilterChange("gender", g)}
                        className="mr-2"
                      />
                      {g} <span className="text-sm text-gray-500 ml-1">({getCount("gender", g)})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Language */}
            <div className="mb-4">
              <button type="button" className="flex items-center w-full font-semibold text-lg mb-2" onClick={() => toggleSection("language")}>Language {expandedSections.language ? <ChevronUpIcon className="w-5 h-5 ml-2" /> : <ChevronDownIcon className="w-5 h-5 ml-2" />}</button>
              {expandedSections.language && (
                <div>
                  {(languages).map(lang => (
                    <label key={lang} className="block text-sm mb-1">
                      <input
                        type="checkbox"
                        checked={pendingFilters.language.includes(lang)}
                        onChange={() => handlePendingFilterChange("language", lang)}
                        className="mr-2"
                      />
                      {lang} <span className="text-sm text-gray-500 ml-1">({getCount("language", lang)})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Therapy Approach */}
            <div className="mb-4">
              <button type="button" className="flex items-center w-full font-semibold text-lg mb-2" onClick={() => toggleSection("approach")}>Therapy Approach {expandedSections.approach ? <ChevronUpIcon className="w-5 h-5 ml-2" /> : <ChevronDownIcon className="w-5 h-5 ml-2" />}</button>
              {expandedSections.approach && (
                <div>
                  {(seeMore.approach ? approaches : approaches.slice(0, 5)).map(app => (
                    <label key={app} className="block text-sm mb-1">
                      <input
                        type="checkbox"
                        checked={pendingFilters.approach.includes(app)}
                        onChange={() => handlePendingFilterChange("approach", app)}
                        className="mr-2"
                      />
                      {app} <span className="text-sm text-gray-500 ml-1">({getCount("approach", app)})</span>
                    </label>
                  ))}
                  {approaches.length > 5 && (
                    <button className="text-blue-600 hover:underline text-xs mt-1" onClick={() => toggleSeeMore("approach")}>{seeMore.approach ? "See Less" : "See More..."}</button>
                  )}
                </div>
              )}
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full mt-6" onClick={applyFilters}>
              Apply Filters
            </button>
          </aside>
          {/* Main Content */}
          <main className="flex-1">
            {/* Search Bar & Mobile Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              {/* Mobile Filters Button remains */}
              <button
                className="md:hidden bg-blue-600 text-white px-4 py-2 rounded shadow"
                onClick={() => setShowFilters(true)}
              >
                Filters
              </button>
            </div>
            {/* Therapist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center text-gray-500">Loading therapists...</div>
              ) : filteredDoctors.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No therapists found matching your criteria. Try adjusting your filters or <a href='/contact' className='underline text-blue-600'>contact support</a> for assistance.</div>
              ) : (
                paginatedDoctors.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                    {/* Photo */}
                    <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center mb-3 overflow-hidden">
                      {/* Replace with real photo if available */}
                      <span className="text-3xl text-blue-700 font-bold">{doc.full_name.charAt(0)}</span>
                    </div>
                    <div className="font-semibold text-lg text-blue-900 mb-1">{doc.full_name}</div>
                    <div className="text-blue-600 text-sm mb-1">{doc.specialization}</div>
                    <div className="text-gray-600 text-xs mb-2 text-center min-h-[32px]">{doc.snippet || "Compassionate, experienced therapist."}</div>
                    {/* Specializations */}
                    <div className="text-xs text-gray-500 mb-2 text-center">
                      {doc.specializations ? doc.specializations.slice(0, 3).join(", ") : doc.specialization}
                    </div>
                    {/* Mini bio/intro */}
                    <div className="text-gray-700 text-xs mb-3 text-center min-h-[32px]">{doc.bio || "Dedicated to helping you thrive."}</div>
                    {/* Rating (optional) */}
                    {doc.rating && (
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-sm font-semibold text-gray-700">{doc.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {/* Availability snippet (optional) */}
                    {doc.nextAvailable && (
                      <div className="text-xs text-green-700 mb-2">Next available: {doc.nextAvailable}</div>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <button
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                        onClick={() => handleViewProfile(doc)}
                      >
                        View Profile
                      </button>
                      <button
                        className="border border-blue-500 text-blue-700 px-4 py-1 rounded hover:bg-blue-100 transition"
                        onClick={() => setModalDoctor(doc)}
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
                <button
                  className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
        {/* Book Appointment Modal */}
        {modalDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-2 relative animate-fadeIn">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => setModalDoctor(null)}
                title="Close"
              >
                &times;
              </button>
              <BookAppointment
                doctor={modalDoctor}
                patientId={user?.userId}
                onBooked={() => setModalDoctor(null)}
                onCancel={() => setModalDoctor(null)}
              />
            </div>
          </div>
        )}
        {/* Mobile Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs mx-2 relative animate-fadeIn">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => setShowFilters(false)}
                title="Close"
              >
                &times;
              </button>
              <h2 className="font-bold text-blue-700 mb-3">Filters</h2>
              {/* Same filter controls as sidebar */}
              <div className="mb-4">
                <div className="font-semibold mb-1">Specialization</div>
                {specializations.map(spec => (
                  <label key={spec} className="block text-sm mb-1">
                    <input
                      type="checkbox"
                      checked={pendingFilters.specialization.includes(spec)}
                      onChange={() => handlePendingFilterChange("specialization", spec)}
                      className="mr-2"
                    />
                    {spec}
                  </label>
                ))}
              </div>
              <div className="mb-4">
                <div className="font-semibold mb-1">Gender</div>
                {genders.map(g => (
                  <label key={g} className="block text-sm mb-1">
                    <input
                      type="radio"
                      checked={pendingFilters.gender === g}
                      onChange={() => handlePendingFilterChange("gender", g)}
                      className="mr-2"
                    />
                    {g}
                  </label>
                ))}
              </div>
              <div className="mb-4">
                <div className="font-semibold mb-1">Language</div>
                {languages.map(lang => (
                  <label key={lang} className="block text-sm mb-1">
                    <input
                      type="checkbox"
                      checked={pendingFilters.language.includes(lang)}
                      onChange={() => handlePendingFilterChange("language", lang)}
                      className="mr-2"
                    />
                    {lang}
                  </label>
                ))}
              </div>
              <div className="mb-4">
                <div className="font-semibold mb-1">Therapy Approach</div>
                {approaches.map(app => (
                  <label key={app} className="block text-sm mb-1">
                    <input
                      type="checkbox"
                      checked={pendingFilters.approach.includes(app)}
                      onChange={() => handlePendingFilterChange("approach", app)}
                      className="mr-2"
                    />
                    {app}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={() => { applyFilters(); setShowFilters(false); }}>Apply Filters</button>
                <button className="bg-gray-300 text-gray-700 px-4 py-1 rounded" onClick={clearFilters}>Clear Filters</button>
              </div>
            </div>
          </div>
        )}
        {/* Doctor Profile Modal */}
        {profileDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4" onClick={() => setProfileDoctor(null)}>
            <div
              className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-2 relative animate-fadeIn transition-all duration-300 ${profileExpanded ? 'max-h-[90vh]' : 'max-h-[70vh]'
                } overflow-hidden flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl z-10"
                onClick={() => {
                  setProfileDoctor(null);
                  setProfileExpanded(false);
                  setProfileData(null);
                }}
                title="Close"
              >
                &times;
              </button>

              {/* Profile Content */}
              <div className="overflow-y-auto flex-1">
                {profileLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading profile...</div>
                ) : profileData ? (
                  <div className="p-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
                      {/* Avatar */}
                      <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <span className="text-4xl text-blue-700 font-bold">
                          {profileData.full_name?.charAt(0) || profileDoctor.full_name?.charAt(0) || "D"}
                        </span>
                      </div>

                      {/* Basic Info */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center mb-1">
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                {profileData.full_name || profileDoctor.full_name || "Doctor"}
                            </h2>
                            {(profileData.gender === 'MALE' || profileData.gender === 'FEMALE') && (
                                <div className="flex items-center ml-4">
                                    <span className="text-2xl text-gray-400 font-light mr-3">•</span> 
                                    <p className="text-xl font-medium text-gray-600">
                                        {profileData.gender}
                                    </p>
                                </div>
                            )}
                        </div>
                        <p className="text-lg text-blue-600 mb-2">
                          {profileData.specialization || profileDoctor.specialization || "Therapist"}
                        </p>
                        {profileData.medical_experience !== undefined && (
                          <p className="text-sm text-gray-600">
                            {profileData.medical_experience} years of experience
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        className="w-full flex items-center justify-between text-left mb-4 hover:bg-gray-50 p-2 rounded transition-colors"
                        onClick={() => setProfileExpanded(!profileExpanded)}
                      >
                        <span className="font-semibold text-gray-900">
                          {profileExpanded ? "Hide Details" : "View Full Profile"}
                        </span>
                        {profileExpanded ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </button>

                      {/* Expanded Content */}
                      {profileExpanded && (
                        <div className="space-y-4 animate-fadeIn">
                          {/* Contact Information */}
                          {(profileData.email || profileData.contact_number) && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                              <div className="space-y-1 text-sm text-gray-700">
                                {profileData.email && (
                                  <p><span className="font-medium">Email:</span> {profileData.email}</p>
                                )}
                                {profileData.contact_number && (
                                  <p><span className="font-medium">Phone:</span> {profileData.contact_number}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Specialization Details */}
                          {(profileData.specialization || profileData.specializations) && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Specializations</h3>
                              <p className="text-sm text-gray-700">
                                {profileData.specializations
                                  ? profileData.specializations.join(", ")
                                  : profileData.specialization || profileDoctor.specialization}
                              </p>
                            </div>
                          )}

                          {/* Experience */}
                          {profileData.medical_experience !== undefined && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                              <p className="text-sm text-gray-700">
                                {profileData.medical_experience} years of medical experience
                              </p>
                            </div>
                          )}

                          {/* Bio/Description */}
                          {(profileData.bio || profileData.description || profileDoctor.bio) && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {profileData.bio || profileData.description || profileDoctor.bio || "Compassionate, experienced therapist dedicated to helping you thrive."}
                              </p>
                            </div>
                          )}

                          {/* Additional Info */}
                          {profileData.username && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Username</h3>
                              <p className="text-sm text-gray-700">{profileData.username}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">Failed to load profile</div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 p-4 flex gap-3">
                <button
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
                  onClick={() => {
                    setModalDoctor(profileDoctor);
                    setProfileDoctor(null);
                  }}
                >
                  Book Session
                </button>
                <button
                  className="flex-1 border border-blue-500 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 transition font-semibold"
                  onClick={() => {
                    setProfileDoctor(null);
                    setProfileExpanded(false);
                    setProfileData(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindTherapistPage; 