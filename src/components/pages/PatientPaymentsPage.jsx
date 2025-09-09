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
        wrapper: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200",
        icon: (
          <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414l2.293 2.293 6.493-6.493a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ),
        label: "SUCCESS",
      };
    }
    if (normalized === "FAILED") {
      return {
        wrapper: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200",
        icon: (
          <svg className="w-3.5 h-3.5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.828-10.828a1 1 0 00-1.414-1.414L10 7.172 8.586 5.758a1 1 0 10-1.414 1.414L8.586 8.586 7.172 10a1 1 0 101.414 1.414L10 10.414l1.414 1.414A1 1 0 0012.828 10L11.414 8.586l1.414-1.414z" clipRule="evenodd" />
          </svg>
        ),
        label: "FAILED",
      };
    }
    return {
      wrapper: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200",
      icon: (
        <svg className="w-3.5 h-3.5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
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
    <span className="inline-flex items-center gap-2 text-gray-800">
      {icon}
      <span className="capitalize">{String(mode).replace("_", " ")}</span>
    </span>
  );
};

const Pager = ({ page = { number: 0, totalPages: 1 }, onChange }) => (
  <div className="flex items-center justify-between mt-4">
    <button
      className="inline-flex items-center justify-center p-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
      disabled={page.number <= 0}
      onClick={() => onChange(page.number - 1)}
      aria-label="Previous page"
    >
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    </button>
    <span className="text-sm text-gray-600">
      Page <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 font-bold">{page.number + 1}</span> of {page.totalPages}
    </span>
    <button
      className="inline-flex items-center justify-center p-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
      disabled={page.number >= page.totalPages - 1}
      onClick={() => onChange(page.number + 1)}
      aria-label="Next page"
    >
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
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

  if (loading) return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  if (error) return <div className="max-w-6xl mx-auto p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500">View your recent transactions and filter by status, mode, and amount.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4">
          <form onSubmit={submitFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
            <select
              value={filters.paymentMode}
              onChange={(e) => setFilters((f) => ({ ...f, paymentMode: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Modes</option>
              <option value="debit_card">Debit Card</option>
              <option value="credit_card">Credit Card</option>
              <option value="net_banking">Net Banking</option>
              <option value="wallet">Wallet</option>
              <option value="upi">UPI</option>
            </select>
            <input
              type="number"
              placeholder="Min Amount"
              value={filters.minAmount}
              onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Max Amount"
              value={filters.maxAmount}
              onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
            <div className="lg:col-span-2 flex items-stretch gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={listLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 5a2 2 0 012-2h2.586a2 2 0 011.414.586l.414.414H15a2 2 0 012 2v1H3V5zM3 9h14v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm3 3a1 1 0 100 2h4a1 1 0 100-2H6z" />
                </svg>
                {listLoading ? "Applying..." : "Apply Filters"}
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="px-6 pb-2">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-800">
                <tr>
                  <th className="text-left px-4 py-4 font-semibold">Order ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Mode</th>
                  <th className="text-left px-4 py-3 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold">Reference</th>
                  <th className="text-left px-4 py-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center text-gray-500">No payments found</td>
                  </tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id} className="border-t even:bg-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{p.orderId}</td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3"><PaymentMode mode={p.paymentMode} /></td>
                    <td className="px-4 py-3 font-medium text-gray-900">₹{Number(p.orderAmount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{p.referenceId}</td>
                    <td className="px-4 py-3 text-gray-700">{formatISTDateTime(p.transactionTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-6 pb-6">
          {pageMeta.totalPages > 1 && (
            <Pager page={pageMeta} onChange={(n) => loadPayments(n)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientPaymentsPage;


