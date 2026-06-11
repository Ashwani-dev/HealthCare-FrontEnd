import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Search,
  RotateCcw,
  Copy,
  Check,
  Wallet,
  Banknote,
  Building,
  QrCode,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Activity,
  ArrowUpRight,
  TrendingDown,
  Info
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchPatientProfile, fetchPatientPayments } from "../../api/api";
import { formatISTDateTime } from "../../utils/dateTime";
import { Spinner } from "../ui";

// Animated indicator/pulse for modern visual quality
const StatusPill = ({ status = "" }) => {
  const normalized = String(status).toUpperCase();
  const { wrapper, icon, label, dotColor } = useMemo(() => {
    if (normalized === "SUCCESS") {
      return {
        wrapper: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        label: "SUCCESS",
        dotColor: "bg-emerald-500",
      };
    }
    if (normalized === "FAILED") {
      return {
        wrapper: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-sm",
        icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
        label: "FAILED",
        dotColor: "bg-rose-500",
      };
    }
    return {
      wrapper: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50/80 text-amber-800 border border-amber-200/60 shadow-sm",
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
      label: normalized,
      dotColor: "bg-amber-500",
    };
  }, [normalized]);

  return (
    <span className={wrapper}>
      {icon}
      <span className="font-semibold tracking-wide text-[10px] sm:text-xs">{label}</span>
      <span className="relative flex h-2 w-2 ml-0.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
      </span>
    </span>
  );
};

const PaymentMode = ({ mode = "" }) => {
  const normalized = String(mode).toLowerCase();
  const { icon, label, bgClass } = useMemo(() => {
    if (normalized.includes("wallet")) {
      return {
        icon: <Wallet className="w-4 h-4 text-amber-600" />,
        label: "Wallet",
        bgClass: "bg-amber-50"
      };
    }
    if (normalized.includes("card")) {
      return {
        icon: <CreditCard className="w-4 h-4 text-indigo-600" />,
        label: normalized.includes("debit") ? "Debit Card" : "Credit Card",
        bgClass: "bg-indigo-50"
      };
    }
    if (normalized.includes("net") || normalized.includes("bank")) {
      return {
        icon: <Building className="w-4 h-4 text-blue-600" />,
        label: "Bank",
        bgClass: "bg-blue-50"
      };
    }
    if (normalized.includes("upi")) {
      return {
        icon: <QrCode className="w-4 h-4 text-emerald-600" />,
        label: "UPI",
        bgClass: "bg-emerald-50"
      };
    }
    return {
      icon: <Banknote className="w-4 h-4 text-gray-600" />,
      label: "Other",
      bgClass: "bg-gray-50"
    };
  }, [normalized]);

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${bgClass} text-gray-700 font-medium text-xs sm:text-sm border border-black/[0.03]`}>
      {icon}
      <span className="font-semibold text-gray-700">{label}</span>
    </span>
  );
};

// Copyable Reference ID for quick usability
const CopyableReference = ({ referenceId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div 
      className="flex items-center gap-2 group/copy cursor-pointer w-fit" 
      onClick={handleCopy}
      title="Click to copy Reference ID"
    >
      <span className="font-mono text-xs text-indigo-700 font-semibold bg-indigo-50/70 hover:bg-indigo-100/70 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all duration-200">
        {referenceId}
      </span>
      <div className="relative w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 border border-gray-200/60 transition-all">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 animate-scale-in" />
        ) : (
          <Copy className="w-3.5 h-3.5 transition-all opacity-70 group-hover/copy:opacity-100" />
        )}
      </div>
    </div>
  );
};

const Pager = ({ page = { number: 0, totalPages: 1 }, onChange }) => (
  <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
    <button
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed hover:shadow-sm active:scale-[0.98] transition-all duration-200 font-semibold text-xs sm:text-sm"
      disabled={page.number <= 0}
      onClick={() => onChange(page.number - 1)}
      aria-label="Previous page"
    >
      <ChevronLeft className="w-4 h-4" />
      <span>Previous</span>
    </button>
    <span className="text-xs sm:text-sm text-slate-500 font-semibold flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/50">
      <span>Page</span>
      <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded-md bg-indigo-600 text-white font-bold">{page.number + 1}</span>
      <span>of</span>
      <span className="font-bold text-slate-700">{page.totalPages || 1}</span>
    </span>
    <button
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed hover:shadow-sm active:scale-[0.98] transition-all duration-200 font-semibold text-xs sm:text-sm"
      disabled={page.number >= page.totalPages - 1}
      onClick={() => onChange(page.number + 1)}
      aria-label="Next page"
    >
      <span>Next</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

const MobilePaymentCard = ({ payment }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={payment.status} />
          <PaymentMode mode={payment.paymentMode} />
        </div>
        <div className="text-2xl font-black text-slate-900 pt-2 flex items-center gap-0.5">
          <span className="text-lg font-bold text-slate-500">₹</span>
          <span>{Number(payment.orderAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>
    
    <div className="space-y-3 pt-4 border-t border-slate-50">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference ID</span>
        <CopyableReference referenceId={payment.referenceId} />
      </div>
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
          <span className="text-slate-700 font-mono font-medium">{payment.orderId}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold">{formatISTDateTime(payment.transactionTime)}</span>
      </div>
    </div>
  </motion.div>
);

const SkeletonCard = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-6 bg-slate-100 rounded-full w-20"></div>
          <div className="h-6 bg-slate-100 rounded-full w-16"></div>
        </div>
        <div className="h-8 bg-slate-100 rounded w-24 mt-2"></div>
      </div>
    </div>
    <div className="space-y-3 pt-4 border-t border-slate-50">
      <div className="h-5 bg-slate-100 rounded w-1/2"></div>
      <div className="h-4 bg-slate-100 rounded w-2/3"></div>
      <div className="h-4 bg-slate-100 rounded w-1/3"></div>
    </div>
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
  const [showFilters, setShowFilters] = useState(false);

  // Guard: only PATIENT role
  useEffect(() => {
    if (!user) return;
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
        console.error("Error loading patient profile:", e);
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
      
      const list = data?._embedded?.paymentList || [];
      setPayments(list);
      setPageMeta(data?.page || { number: page, totalPages: 1, size: 10, totalElements: list.length });
    } catch (e) {
      console.error("Error loading payments:", e);
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
    setShowFilters(false);
  };

  // Dashboard calculations for visual stats overview card metrics (computed on list load)
  const stats = useMemo(() => {
    const successPayments = payments.filter((p) => String(p.status).toUpperCase() === "SUCCESS");
    const totalAmount = successPayments.reduce((acc, curr) => acc + Number(curr.orderAmount || 0), 0);
    const successCount = successPayments.length;
    const rate = payments.length > 0 ? Math.round((successCount / payments.length) * 100) : 0;
    
    return {
      totalAmount,
      successCount,
      successRate: rate,
      totalCount: payments.length,
    };
  }, [payments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-100/30 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Spinner size="lg" text="Loading your billing profile..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-100/30 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
              <div>
                <h3 className="text-rose-800 font-bold text-lg">System Error</h3>
                <p className="text-rose-700 text-sm mt-0.5">{error}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/25 to-blue-100/30 pb-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Header Card Section with modern depth and floating objects */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-6 sm:px-8 py-8 sm:py-10 overflow-hidden border-b border-blue-500/20">
            {/* Blurry glow shapes for premium dashboard texture */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-md">
                  <Activity className="w-3.5 h-3.5 text-white animate-pulse" />
                  Billing Account
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Payment History
                </h1>
                <p className="text-blue-100 text-sm sm:text-base font-semibold max-w-lg">
                  Track and monitor all your transactional records and bill details.
                </p>
              </div>
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="self-start md:self-auto p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-lg shadow-inner"
              >
                <CreditCard className="w-12 h-12 text-white" />
              </motion.div>
            </div>
          </div>

          {/* Dynamic Statistics Dashboard Panel (Computed on list load) */}
          <div className="px-6 sm:px-8 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Stat Card 1: Total Spent */}
              <motion.div 
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paid</span>
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-0.5">
                    <span className="text-lg font-bold text-slate-500">₹</span>
                    <span>{stats.totalAmount.toFixed(2)}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    Successful transactions on page
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </motion.div>

              {/* Stat Card 2: Successful / Total */}
              <motion.div 
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Count</span>
                  <h3 className="text-2xl font-black text-slate-800">
                    {stats.successCount} <span className="text-lg text-slate-400 font-medium">/ {stats.totalCount}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Transactions completed successfully</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                </div>
              </motion.div>

              {/* Stat Card 3: Completion Rate */}
              <motion.div 
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
                  <h3 className="text-2xl font-black text-slate-800">
                    {stats.successRate}%
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Ratio of successful transactions</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </motion.div>

            </div>
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden px-6 py-4 bg-slate-50/80 border-b border-slate-100">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Filter & Search Filters</span>
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>

          {/* Filters Card Layout */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block px-6 sm:px-8 py-6 bg-slate-50/50 border-b border-slate-100`}>
            <form onSubmit={submitFilters} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                
                {/* Filter field 1: Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-slate-400" />
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                      className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                      <option value="PENDING">Pending</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Filter field 2: Payment Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    Payment Mode
                  </label>
                  <div className="relative">
                    <select
                      value={filters.paymentMode}
                      onChange={(e) => setFilters((f) => ({ ...f, paymentMode: e.target.value }))}
                      className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                    >
                      <option value="ALL">All Modes</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="net_banking">Net Banking</option>
                      <option value="wallet">Wallet</option>
                      <option value="upi">UPI</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Filter field 3: Min Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-slate-400" />
                    Min Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="₹ 0.00"
                      value={filters.minAmount}
                      onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                      min="0"
                      step="0.01"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  </div>
                </div>

                {/* Filter field 4: Max Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-slate-400" />
                    Max Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="₹ 0.00"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                      min="0"
                      step="0.01"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  </div>
                </div>

                {/* Filter actions */}
                <div className="sm:col-span-2 lg:col-span-2 flex items-end gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                    disabled={listLoading}
                  >
                    {listLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        <span>Apply Filters</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ status: "ALL", paymentMode: "ALL", minAmount: "", maxAmount: "" });
                      setTimeout(() => loadPayments(0), 0);
                    }}
                    className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 hover:shadow-sm active:scale-[0.98] transition-all duration-200"
                    disabled={listLoading}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </form>
          </div>

          {/* Main List Workspace Section */}
          <div className="px-6 sm:px-8 py-6">
            
            {/* Mobile Cards Container */}
            <div className="block lg:hidden space-y-4">
              {listLoading && !payments.length && (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              )}
              {!listLoading && payments.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
                    <CreditCard className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Payments Found</h3>
                  <p className="text-slate-500 text-xs max-w-sm px-4">Your payment history will appear here once you perform consultations or transaction processes.</p>
                </div>
              )}
              
              <AnimatePresence mode="popLayout">
                {payments.map((p) => (
                  <MobilePaymentCard key={p.id} payment={p} />
                ))}
              </AnimatePresence>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/70 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference ID</th>
                    <th className="text-left px-6 py-4.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Mode</th>
                    <th className="text-left px-6 py-4.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-4.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                    <th className="text-left px-6 py-4.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  </tr>
                </thead>
                
                <tbody className="bg-white divide-y divide-slate-50 font-medium">
                  {!listLoading && payments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-20">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="p-4 bg-slate-50 rounded-3xl mb-4 border border-slate-100/60 shadow-inner">
                            <CreditCard className="w-12 h-12 text-slate-300" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-700 mb-1.5">No Payments Found</h3>
                          <p className="text-slate-400 text-sm max-w-md">Your payment history will appear here once you perform consultations or transaction processes.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {payments.map((p, idx) => (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-slate-50/70 transition-colors duration-150 group"
                    >
                      {/* Reference ID Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <CopyableReference referenceId={p.referenceId} />
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <StatusPill status={p.status} />
                      </td>
                      
                      {/* Mode Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <PaymentMode mode={p.paymentMode} />
                      </td>
                      
                      {/* Amount Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="text-slate-900 font-extrabold text-base flex items-center gap-0.5">
                          <span className="text-sm font-bold text-slate-400">₹</span>
                          <span>{Number(p.orderAmount).toFixed(2)}</span>
                        </span>
                      </td>
                      
                      {/* Order ID Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="text-slate-600 font-mono text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/50">
                          {p.orderId}
                        </span>
                      </td>
                      
                      {/* Date & Time Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs bg-slate-50/60 px-2.5 py-1.5 rounded-lg border border-slate-200/30 w-fit">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatISTDateTime(p.transactionTime)}</span>
                        </div>
                      </td>
                    </motion.tr>
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
    </motion.div>
  );
};

export default PatientPaymentsPage;