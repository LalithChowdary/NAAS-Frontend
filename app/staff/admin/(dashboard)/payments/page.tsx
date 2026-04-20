"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  CheckCircle,
  CreditCard,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { fetchAllPaymentsAndUnpaidBills, recordPayment } from "../../actions";

// Types derived from actual DTO structure
interface Payment {
  id: string;
  billId: string;
  billingMonth: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: "CASH" | "CHEQUE";
  chequeNumber?: string;
  receiptNote?: string;
  paidAt: string;
}

interface UnpaidBill {
  id: string;
  customerId: string;
  customerName: string;
  billingMonth: string;
  totalAmount: number;
}

type FilterMode = "ALL" | "CASH" | "CHEQUE";
type FilterStatus = "ALL" | "COMPLETED" | "PENDING";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<UnpaidBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<FilterMode>("ALL");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

  // Record Payment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Receipt Modal
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Modal Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | "">("");
  const [selectedBillId, setSelectedBillId] = useState<string | "">("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "CHEQUE">("CASH");
  const [chequeNumber, setChequeNumber] = useState<string>("");
  const [receiptNote, setReceiptNote] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchAllPaymentsAndUnpaidBills();
      if (!result.ok) {
        setError(result.message || "Failed to load payments.");
        return;
      }
      setPayments(result.data?.payments || []);
      setUnpaidBills(result.data?.unpaidBills || []);
    } catch {
      setError("An unexpected error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Derived state for the modal's dependent dropdowns
  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, string>();
    unpaidBills.forEach((b) => map.set(String(b.customerId), b.customerName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [unpaidBills]);

  const availableBills = useMemo(() => {
    if (!selectedCustomerId) return [];
    return unpaidBills.filter((b) => b.customerId === selectedCustomerId);
  }, [unpaidBills, selectedCustomerId]);

  // Auto-fill amount when a bill is selected
  useEffect(() => {
    if (selectedBillId) {
      const bill = unpaidBills.find((b) => b.id === selectedBillId);
      if (bill) {
        setPaymentAmount(bill.totalAmount.toString());
      }
    } else {
      setPaymentAmount("");
    }
  }, [selectedBillId, unpaidBills]);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillId || !paymentAmount) return;

    try {
      setSubmitLoading(true);
      setSubmitError("");

      const finalReceiptNote = receiptNote
        ? `${receiptNote} (Recorded on ${paymentDate})`
        : `Recorded on ${paymentDate}`;

      const res = await recordPayment(
        selectedBillId as string,
        parseFloat(paymentAmount),
        paymentMode,
        paymentMode === "CHEQUE" ? chequeNumber : "",
        finalReceiptNote
      );

      if (!res.ok) {
        setSubmitError(res.message || "Failed to record payment.");
        return;
      }

      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch {
      setSubmitError("An unexpected error recorded the payment.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomerId("");
    setSelectedBillId("");
    setPaymentAmount("");
    setPaymentMode("CASH");
    setChequeNumber("");
    setReceiptNote("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setSubmitError("");
  };

  const handlePrintReceipt = (payment: Payment) => {
    setReceiptPayment(payment);
    // Small delay to allow the DOM to render, then print
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch =
        p.customerName.toLowerCase().includes(searchStr) ||
        (p.chequeNumber && p.chequeNumber.toLowerCase().includes(searchStr));
      const matchesMode = modeFilter === "ALL" || p.paymentMethod === modeFilter;
      const simulatedStatus = p.paymentMethod === "CHEQUE" ? "PENDING" : "COMPLETED";
      const matchesStatus = statusFilter === "ALL" || statusFilter === simulatedStatus;
      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [payments, searchQuery, modeFilter, statusFilter]);

  const formatMoney = (val: number) => `₹${val.toFixed(2)}`;

  const formatDate = (isoStr: string) =>
    new Date(isoStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const receiptNumber = (id: string) =>
    `RCP-${id.replace(/-/g, "").substring(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">

      {/* ── Print Styles ──────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-receipt, #print-receipt * { visibility: visible !important; }
          #print-receipt {
            position: fixed !important;
            inset: 0 !important;
            z-index: 9999 !important;
            background: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          @page { size: A5 portrait; margin: 0; }
        }
      `}</style>

      {/* ── Hidden Print Receipt ─────────────────────────────────────────── */}
      {receiptPayment && (
        <div
          id="print-receipt"
          ref={receiptRef}
          className="hidden print:flex fixed inset-0 bg-white items-center justify-center"
        >
          <div style={{ width: "148mm", padding: "12mm", fontFamily: "Georgia, serif", color: "#111" }}>
            {/* Header */}
            <div style={{ textAlign: "center", borderBottom: "2px solid #111", paddingBottom: "8mm", marginBottom: "8mm" }}>
              <p style={{ fontSize: "22pt", fontWeight: "bold", letterSpacing: "2px", margin: 0 }}>NAAS</p>
              <p style={{ fontSize: "9pt", color: "#555", margin: "2mm 0 0" }}>Newspaper & Magazine Subscription Service</p>
              <p style={{ fontSize: "8pt", color: "#888", margin: "1mm 0 0" }}>Official Payment Receipt</p>
            </div>

            {/* Receipt Meta */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6mm", fontSize: "9pt" }}>
              <div>
                <p style={{ margin: 0, color: "#555" }}>Receipt No.</p>
                <p style={{ margin: "1mm 0 0", fontWeight: "bold", fontFamily: "monospace" }}>{receiptNumber(receiptPayment.id)}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, color: "#555" }}>Date of Payment</p>
                <p style={{ margin: "1mm 0 0", fontWeight: "bold" }}>{formatDate(receiptPayment.paidAt)}</p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px dashed #ccc", margin: "4mm 0" }} />

            {/* Customer Section */}
            <div style={{ marginBottom: "6mm" }}>
              <p style={{ fontSize: "8pt", color: "#888", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 2mm" }}>Billed To</p>
              <p style={{ fontSize: "12pt", fontWeight: "bold", margin: 0 }}>{receiptPayment.customerName}</p>
              <p style={{ fontSize: "9pt", color: "#555", margin: "1mm 0 0" }}>Billing Period: {receiptPayment.billingMonth}</p>
            </div>

            <div style={{ borderTop: "1px dashed #ccc", margin: "4mm 0" }} />

            {/* Payment Details */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", marginBottom: "6mm" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "2mm 0", fontWeight: "600", color: "#555", textTransform: "uppercase", fontSize: "8pt" }}>Description</th>
                  <th style={{ textAlign: "right", padding: "2mm 0", fontWeight: "600", color: "#555", textTransform: "uppercase", fontSize: "8pt" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "3mm 0" }}>Monthly Subscription Fee — {receiptPayment.billingMonth}</td>
                  <td style={{ padding: "3mm 0", textAlign: "right", fontWeight: "bold" }}>{formatMoney(receiptPayment.amount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #111" }}>
                  <td style={{ padding: "3mm 0 0", fontWeight: "bold", fontSize: "11pt" }}>Total Paid</td>
                  <td style={{ padding: "3mm 0 0", textAlign: "right", fontWeight: "bold", fontSize: "11pt" }}>{formatMoney(receiptPayment.amount)}</td>
                </tr>
              </tfoot>
            </table>

            <div style={{ borderTop: "1px dashed #ccc", margin: "4mm 0" }} />

            {/* Payment Method */}
            <div style={{ marginBottom: "6mm", fontSize: "9pt" }}>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "2mm 0" }}>
                <span style={{ color: "#555" }}>Payment Method</span>
                <span style={{ fontWeight: "bold" }}>{receiptPayment.paymentMethod}</span>
              </div>
              {receiptPayment.paymentMethod === "CHEQUE" && receiptPayment.chequeNumber && (
                <div style={{ display: "flex", justifyContent: "space-between", margin: "2mm 0" }}>
                  <span style={{ color: "#555" }}>Cheque Reference</span>
                  <span style={{ fontWeight: "bold", fontFamily: "monospace" }}>{receiptPayment.chequeNumber}</span>
                </div>
              )}
              {receiptPayment.receiptNote && (
                <div style={{ display: "flex", justifyContent: "space-between", margin: "2mm 0" }}>
                  <span style={{ color: "#555" }}>Note</span>
                  <span style={{ maxWidth: "60%", textAlign: "right" }}>{receiptPayment.receiptNote}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px dashed #ccc", margin: "4mm 0" }} />

            {/* Status Banner */}
            <div style={{
              background: receiptPayment.paymentMethod === "CASH" ? "#f0fdf4" : "#fffbeb",
              border: `1px solid ${receiptPayment.paymentMethod === "CASH" ? "#bbf7d0" : "#fde68a"}`,
              borderRadius: "4mm",
              padding: "3mm 4mm",
              textAlign: "center",
              marginBottom: "8mm",
              fontSize: "10pt",
              fontWeight: "bold",
              color: receiptPayment.paymentMethod === "CASH" ? "#15803d" : "#92400e",
            }}>
              {receiptPayment.paymentMethod === "CASH" ? "✓ PAYMENT RECEIVED IN FULL" : "⏳ CHEQUE RECEIVED — PENDING CLEARANCE"}
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", fontSize: "7.5pt", color: "#aaa" }}>
              <p style={{ margin: 0 }}>This is a computer-generated receipt and does not require a signature.</p>
              <p style={{ margin: "1mm 0 0" }}>NAAS Platform · Thank you for your subscription.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track customer payments, view history, and record new transactions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-[#EFEFEF] bg-white rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50"
            aria-label="Refresh payments"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center text-sm border border-rose-100">
          <div className="h-4 w-4 mr-2 shrink-0 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">!</div>
          {error}
        </div>
      )}

      {/* ── Filters Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white p-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by customer name or cheque ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-none bg-transparent rounded-xl text-sm focus:outline-none focus:ring-0"
          />
        </div>
        <div className="w-px bg-[#EFEFEF] hidden lg:block mx-1" />
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value as FilterMode)}
          className="border-none bg-gray-50 lg:bg-transparent rounded-xl text-sm focus:outline-none focus:ring-0 px-4 py-2 font-medium text-gray-600"
        >
          <option value="ALL">All Modes</option>
          <option value="CASH">Cash</option>
          <option value="CHEQUE">Cheque</option>
        </select>
        <div className="w-px bg-[#EFEFEF] hidden lg:block mx-1" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
          className="border-none bg-gray-50 lg:bg-transparent rounded-xl text-sm focus:outline-none focus:ring-0 px-4 py-2 font-medium text-gray-600"
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending (Cheques)</option>
        </select>
      </div>

      {/* ── Payments Table ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#EFEFEF] rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
            <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment Date</th>
                <th className="px-6 py-4">Payment Mode</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Note</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Loading payments...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 text-gray-300" />
                    </div>
                    <span>No payments found.</span>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <span>No payments match your current criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FBFBFD] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.customerName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.billingMonth}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatMoney(p.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(p.paidAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                        p.paymentMethod === "CASH"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                        {p.paymentMethod === "CASH"
                          ? <Banknote className="h-3 w-3 mr-1" />
                          : <CreditCard className="h-3 w-3 mr-1" />}
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {p.paymentMethod === "CHEQUE" && p.chequeNumber ? (
                        <span className="font-mono text-xs">{p.chequeNumber}</span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate" title={p.receiptNote}>
                      {p.receiptNote || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                        p.paymentMethod === "CASH"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {p.paymentMethod === "CASH" ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handlePrintReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Print Receipt"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Record Payment Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFEFEF]">
              <h2 className="text-lg font-medium text-gray-900">Record Payment</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl">
                  {submitError}
                </div>
              )}

              <div className="space-y-3">
                {/* Customer Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer</label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      setSelectedBillId("");
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all appearance-none"
                  >
                    <option value="">Select a customer with unpaid bills...</option>
                    {uniqueCustomers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {uniqueCustomers.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1.5 flex items-center">
                      ⚠ No customers currently have unpaid bills to collect.
                    </p>
                  )}
                </div>

                {/* Bill Select */}
                {selectedCustomerId !== "" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Unpaid Bill</label>
                    <select
                      required
                      value={selectedBillId}
                      onChange={(e) => setSelectedBillId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all appearance-none"
                    >
                      <option value="">Select bill to pay...</option>
                      {availableBills.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.billingMonth} — ₹{b.totalAmount.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 cursor-not-allowed"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Full bill amount must be paid.</p>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setPaymentMode("CASH"); setChequeNumber(""); }}
                      className={`flex items-center justify-center p-2.5 rounded-xl border text-sm font-medium transition-all ${
                        paymentMode === "CASH"
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Banknote className="h-4 w-4 mr-2" /> Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("CHEQUE")}
                      className={`flex items-center justify-center p-2.5 rounded-xl border text-sm font-medium transition-all ${
                        paymentMode === "CHEQUE"
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <CreditCard className="h-4 w-4 mr-2" /> Cheque
                    </button>
                  </div>
                </div>

                {/* Cheque # (Conditional) */}
                {paymentMode === "CHEQUE" && (
                  <div className="animate-in slide-in-from-top-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cheque Reference / No.</label>
                    <input
                      type="text"
                      required
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
                      placeholder="e.g. 000123"
                    />
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Collection Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none text-gray-700"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Receipt will reflect server timestamp in production.</p>
                </div>

                {/* Receipt Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Receipt Note / Reference (Optional)</label>
                  <textarea
                    value={receiptNote}
                    onChange={(e) => setReceiptNote(e.target.value)}
                    placeholder="e.g. Transaction ID, remarks, etc."
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitLoading || uniqueCustomers.length === 0}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {submitLoading
                    ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    : <CheckCircle className="h-4 w-4 mr-2" />}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
