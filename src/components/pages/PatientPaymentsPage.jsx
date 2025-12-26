import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchPatientProfile, fetchPatientPayments } from "../../api/api";
import { formatISTDateTime } from "../../utils/dateTime";

const StatusPill = ({ status = "" }) => {
  const normalized = String(status).toUpperCase();
  const { wrapper, icon, label } = useMemo(() => {
    if (normalized === "SUCCESS") {
      return {
        wrapper: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: (
          <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414l2.293 2.293 6.493-6.493a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ),
        label: "SUCCESS",
      };
    }
    if (normalized === "FAILED") {
      return {
        wrapper: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200",
        icon: (
          <svg className="w-3.5 h-3.5 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.828-10.828a1 1 0 00-1.414-1.414L10 7.172 8.586 5.758a1 1 0 10-1.414 1.414L8.586 8.586 7.172 10a1 1 0 101.414 1.414L10 10.414l1.414 1.414A1 1 0 0012.828 10L11.414 8.586l1.414-1.414z" clipRule="evenodd" />
          </svg>
        ),
        label: "FAILED",
      };
    }
    return {
      wrapper: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200",
      icon: (
        <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11a.75.75 0 011.5 0v4a.75.75 0 11-1.5 0V7zm.75 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      label: normalized,
    };
  }, [normalized]);
  return (
    <span className={wrapper}>
      {icon}
      <span>{label}</span>
    </span>
  );
};

const PaymentMode = ({ mode = "" }) => {
  const normalized = String(mode).toLowerCase();
  const icon = useMemo(() => {
    if (normalized.includes("wallet")) {
      return (
        <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 7H3a2 2 0 00-2 2v6a2 2 0 002 2h18a2 2 0 002-2v-1h-6a2 2 0 110-4h6V9a2 2 0 00-2-2zM17 12a1 1 0 100 2h7v-2h-7z" />
        </svg>
      );
    }
    if (normalized.includes("card")) {
      return (
        <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 6a2 2 0 012-2h14a2 2 0 012 2v2H3V6zm0 4h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8zm3 5h4a1 1 0 010 2H6a1 1 0 110-2z" />
        </svg>
      );
    }
    if (normalized.includes("net") || normalized.includes("bank")) {
      return (
        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3l9 6v2H3V9l9-6zm9 9v8H3v-8h18zM5 18h2v-4H5v4zm4 0h2v-4H9v4z" />
        </svg>
      );
    }
    if (normalized.includes("upi")) {
      return (
        <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 5h16a2 2 0 012 2v1H2V7a2 2 0 012-2zm-2 5h20v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-7zm5 3a1 1 0 100 2h10a1 1 0 100-2H7z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 7h18v10H3V7zm2 2v6h14V9H5z" />
      </svg>
    );
  }, [normalized]);
  return (
    <span className="inline-flex items-center gap-2 text-gray-700 font-medium">
      {icon}
      <span className="capitalize">{String(mode).replace("_", " ")}</span>
    </span>
  );
};

const Pager = ({ page = { number: 0, totalPages: 1 }, onChange }) => (
  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
    <button
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm"
      disabled={page.number <= 0}
      onClick={() => onChange(page.number - 1)}
      aria-label="Previous page"
    >
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
      Previous
    </button>
    <span className="text-sm text-gray-600 font-medium">
      Page <span className="inline-flex items-center justify-center min-w-[32px] px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">{page.number + 1}</span> of <span className="font-bold">{page.totalPages}</span>
    </span>
    <button
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm"
      disabled={page.number >= page.totalPages - 1}
      onClick={() => onChange(page.number + 1)}
      aria-label="Next page"
    >
      Next
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
);

const SkeletonRow = () => (
  <tr className="border-t border-gray-200 animate-pulse">
    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
  </tr>
);

const PatientPaymentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);
  const [pageMeta, setPageMeta] = useState({ number: 0, totalPages: 0, size: 10, totalElements: 0 });
  const [filters, setFilters] = useState({ status: "ALL", paymentMode: "ALL", minAmount: "", maxAmount: "" });

  // Guard: only PATIENT role
  useEffect(() => {
    if (!user) return; // Router will already block unauthenticated
    if (user.role?.toLowerCase() !== "patient") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Load patientId from profile
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const profile = await fetchPatientProfile();
        const id = profile?.id || profile?.patientId || user?.id;
        setPatientId(id);
      } catch (e) {
        setError("Failed to load patient profile");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const loadPayments = async (page = 0) => {
    if (!patientId) return;
    try {
      setListLoading(true);
      const data = await fetchPatientPayments(patientId, {
        status: filters.status,
        paymentMode: filters.paymentMode,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        page,
        size: 10,
        sort: "id,desc",
      });
      const list = data?._embedded?.paymentEntityList || [];
      setPayments(list);
      setPageMeta(data?.page || { number: page, totalPages: 1, size: 10, totalElements: list.length });
    } catch (e) {
      setError("Failed to load payments");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) loadPayments(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const submitFilters = (e) => {
    e.preventDefault();
    loadPayments(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading your payments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 sm:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Payment History</h1>
                <p className="text-blue-100 text-sm md:text-base">Track and manage all your transaction records</p>
              </div>
              <div className="hidden sm:block">
                <svg className="w-16 h-16 text-white opacity-20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 6a2 2 0 012-2h14a2 2 0 012 2v2H3V6zm0 4h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8zm3 5h4a1 1 0 010 2H6a1 1 0 110-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="px-6 sm:px-8 py-6 bg-gray-50 border-b border-gray-200">
            <form onSubmit={submitFilters}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="ALL">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Payment Mode</label>
                  <select
                    value={filters.paymentMode}
                    onChange={(e) => setFilters((f) => ({ ...f, paymentMode: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="ALL">All Modes</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="net_banking">Net Banking</option>
                    <option value="wallet">Wallet</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Min Amount</label>
                  <input
                    type="number"
                    placeholder="₹ 0.00"
                    value={filters.minAmount}
                    onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Max Amount</label>
                  <input
                    type="number"
                    placeholder="₹ 0.00"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-2 flex items-end gap-3">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={listLoading}
                  >
                    {listLoading ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Filtering...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        Apply Filters
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ status: "ALL", paymentMode: "ALL", minAmount: "", maxAmount: "" });
                      setTimeout(() => loadPayments(0), 0);
                    }}
                    className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
                    disabled={listLoading}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="px-6 sm:px-8 py-6">
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Reference ID</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Mode</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Reference</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listLoading && !payments.length && (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  )}
                  {!listLoading && payments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                          <svg className="w-20 h-20 text-gray-300 mb-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 6a2 2 0 012-2h14a2 2 0 012 2v2H3V6zm0 4h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8zm3 5h4a1 1 0 010 2H6a1 1 0 110-2z" />
                          </svg>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Payments Found</h3>
                          <p className="text-gray-500 text-sm max-w-md">You don't have any payment transactions yet. Your payment history will appear here once you make a transaction.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition-colors duration-150 cursor-pointer group">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 group-hover:bg-blue-100 transition-colors">
                          {p.referenceId}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap"><StatusPill status={p.status} /></td>
                      <td className="px-5 py-4 whitespace-nowrap"><PaymentMode mode={p.paymentMode} /></td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-bold text-base">₹{Number(p.orderAmount).toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-gray-600 text-sm font-medium">{p.referenceId}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">{formatISTDateTime(p.transactionTime)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageMeta.totalPages > 1 && (
              <Pager page={pageMeta} onChange={(n) => loadPayments(n)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPaymentsPage;