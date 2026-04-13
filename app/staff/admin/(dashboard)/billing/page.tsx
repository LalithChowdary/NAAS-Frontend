"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Eye,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  fetchAdminBills,
  generateAdminBills,
} from "../../actions";

type BillFilterStatus = "ALL" | "PAID" | "PENDING" | "OVERDUE";
type UiBillStatus = "PAID" | "PENDING" | "OVERDUE";

interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  billingMonth: string;
  totalAmount: number;
  dueDate: string;
  status: "PAID" | "UNPAID";
  createdAt: string;
}

function getDefaultGenerationMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

function getUiBillStatus(bill: Bill): UiBillStatus {
  if (bill.status === "PAID") return "PAID";
  const isOverdue = new Date(bill.dueDate) < new Date();
  return isOverdue ? "OVERDUE" : "PENDING";
}

function statusChipClass(status: UiBillStatus) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "OVERDUE":
      return "bg-rose-50 text-rose-600 border-rose-100";
    case "PENDING":
      return "bg-amber-50 text-amber-600 border-amber-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

function formatMoney(amount: number) {
  return `₹${amount.toFixed(2)}`;
}

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatBillingMonth(mmYyyy: string) {
  const [mm, yyyy] = mmYyyy.split("-");
  const date = new Date(parseInt(yyyy), parseInt(mm) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

export default function BillingDashboardPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillFilterStatus>("ALL");

  const [generating, setGenerating] = useState(false);
  const [generationMonth, setGenerationMonth] = useState(getDefaultGenerationMonth());

  const loadBills = async () => {
    try {
      setLoading(true);
      const result = await fetchAdminBills();
      if (!result.ok) {
        setBills([]);
        setError(result.message || "Failed to load bills. Please try again.");
        return;
      }
      setBills(result.data || []);
      setError("");
    } catch {
      setError("Failed to load bills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleGenerateBills = async () => {
    if (!generationMonth) return;
    const [year, month] = generationMonth.split("-");

    try {
      setGenerating(true);
      setError("");
      setSuccessMsg("");

      const result = await generateAdminBills(parseInt(year), parseInt(month));
      if (!result.ok) {
        setError(result.message || "Failed to generate bills. Please try again.");
        return;
      }

      setSuccessMsg(result.message || "Bills generated successfully.");
      await loadBills();
    } catch {
      setError("Failed to generate bills. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const uiStatus = getUiBillStatus(bill);
      const matchesStatus = statusFilter === "ALL" || uiStatus === statusFilter;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        bill.customerName.toLowerCase().includes(q) ||
        bill.customerId.toString().includes(q) ||
        bill.billingMonth.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [bills, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Billing Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review monthly customer bills, monitor due amounts, and generate new bills.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-auto">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="month"
              value={generationMonth}
              onChange={(e) => setGenerationMonth(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-40 border border-[#EFEFEF] bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
            />
          </div>
          <button
            onClick={handleGenerateBills}
            disabled={generating}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Generate
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center text-sm border border-rose-100">
          <div className="h-4 w-4 mr-2 shrink-0 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">!</div>
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center text-sm border border-emerald-100">
          <div className="h-4 w-4 mr-2 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
          {successMsg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 bg-white p-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search bills by customer or month..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-none bg-transparent rounded-xl text-sm focus:outline-none focus:ring-0"
          />
        </div>
        <div className="w-0.5 bg-[#EFEFEF] hidden lg:block mx-1" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BillFilterStatus)}
          className="border-none bg-gray-50 lg:bg-transparent rounded-xl text-sm focus:outline-none focus:ring-0 px-4 py-2 font-medium text-gray-600"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="bg-white border border-[#EFEFEF] rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Billing Period</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Loading bills...</p>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 text-gray-300" />
                    </div>
                    <span>No bills match the selected filters.</span>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const uiStatus = getUiBillStatus(bill);
                  return (
                    <tr key={bill.id} className="hover:bg-[#FBFBFD] transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">{bill.customerName}</div>
                        <div className="text-xs text-gray-400">#{bill.customerId}</div>
                      </td>
                      <td className="px-6 py-3">{formatBillingMonth(bill.billingMonth)}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">{formatMoney(bill.totalAmount)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${statusChipClass(uiStatus)}`}
                        >
                          {uiStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3">{formatDisplayDate(bill.dueDate)}</td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          href={`/staff/admin/billing/${bill.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
