import { ArrowUpRight, ArrowDownRight, Users, RefreshCcw, CreditCard, Banknote } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      name: "Total Customers",
      value: "2,845",
      change: "+12.5%",
      isPositive: true,
      icon: Users,
    },
    {
      name: "Active Subscriptions",
      value: "3,112",
      change: "+8.2%",
      isPositive: true,
      icon: RefreshCcw,
    },
    {
      name: "Monthly Revenue",
      value: "₹84,500",
      change: "+14.1%",
      isPositive: true,
      icon: Banknote,
    },
    {
      name: "Pending Dues",
      value: "₹12,400",
      change: "-2.4%",
      isPositive: true, // Decreasing dues is positive
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-gray-50/80 rounded-xl">
                  <Icon className="h-5 w-5 text-gray-700" strokeWidth={1.5} />
                </div>
                <div
                  className={`flex items-center text-sm font-medium ${
                    stat.isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {stat.change}
                  {stat.isPositive ? (
                    <ArrowUpRight className="ml-1 h-4 w-4" strokeWidth={2} />
                  ) : (
                    <ArrowDownRight className="ml-1 h-4 w-4" strokeWidth={2} />
                  )}
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
              <p className="text-3xl font-light text-gray-900 mt-1.5 tracking-tight">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 tracking-tight">Revenue Overview</h3>
            <select className="text-sm border-gray-200 rounded-lg text-gray-600 outline-none focus:ring-0 py-1.5 px-3 bg-gray-50 cursor-pointer">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 flex items-center justify-center bg-[#FBFBFD] rounded-xl border border-gray-100/50 border-dashed">
            <span className="text-gray-400 text-sm">Revenue Chart Visualization</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
          <h3 className="text-lg font-medium text-gray-900 mb-6 tracking-tight">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { title: "New customer registered", time: "2 hours ago", dot: "bg-emerald-400" },
              { title: "Invoice #INV-204 paid", time: "4 hours ago", dot: "bg-blue-400" },
              { title: "Subscription paused", time: "Yesterday", dot: "bg-amber-400" },
              { title: "Delivery route updated", time: "Yesterday", dot: "bg-gray-300" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start">
                <div className={`w-2 h-2 mt-2 rounded-full ${activity.dot}`}></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
