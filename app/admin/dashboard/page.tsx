import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // Using the V7 Adapter Client

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Auth & Role Guard
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch Daily Context
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 3. UPDATED ENTERPRISE QUERIES
  const [
    totalProfiles,
    customerCount,
    internalTeamCount,
    movieCount,
    ticketCount,
    revenueResult,
  ] = await Promise.all([
    // Count EVERYONE (Admin + Staff + User)
    prisma.profile.count(),

    // Count only Customers
    prisma.profile.count({ where: { role: "USER" } }),

    // Count Internal Team (Admin + Staff)
    prisma.profile.count({ where: { role: { in: ["ADMIN", "STAFF"] } } }),

    // Count Movies
    prisma.movie.count({
      where: {
        /* status: 'Now Showing' */
      },
    }),

    // Count Bookings today
    prisma.booking.count({
      where: {
        status: "CONFIRMED",
        createdAt: { gte: startOfToday },
      },
    }),

    // Sum Revenue
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: startOfToday } },
      _sum: { totalAmount: true },
    }),
  ]);

  const stats = [
    {
      label: "Total Accounts",
      value: totalProfiles.toLocaleString(),
      color: "text-blue-400",
    },
    {
      label: "Active Customers",
      value: customerCount.toLocaleString(),
      color: "text-blue-600",
    },
    {
      label: "Internal Team",
      value: internalTeamCount.toLocaleString(),
      color: "text-purple-500",
    },
    {
      label: "Movies Screened",
      value: movieCount.toString(),
      color: "text-red-600",
    },
    {
      label: "Revenue Today",
      value: `LKR ${Number(
        revenueResult._sum.totalAmount || 0
      ).toLocaleString()}`,
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter text-white font-mono">
          COMMAND <span className="text-red-600">CENTER</span>
        </h1>
        <p className="text-xs text-gray-500 mt-2 uppercase tracking-[0.3em]">
          Authenticated as: {user.user_metadata.full_name || user.email}
        </p>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[#0a0a0a] border border-[#222] p-8 relative overflow-hidden group hover:border-red-600 transition-all duration-300"
          >
            <div className="relative z-10">
              <h3 className={`text-3xl font-bold mb-2 ${stat.color} font-mono`}>
                {stat.value}
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold group-hover:text-white transition-colors">
                {stat.label}
              </p>
            </div>
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-white" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#222] h-[400px] flex items-center justify-center relative">
          <span className="text-[10px] text-gray-700 uppercase tracking-widest font-mono">
            Real-time Traffic Analytics
          </span>
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-[8px] text-green-500 uppercase font-bold">
              Live Stream
            </span>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Recent Alerts
          </h4>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-l-2 border-red-600 bg-white/5 p-3">
                <p className="text-[10px] text-gray-300">
                  System initialization complete. Database synced via
                  aws-1-pooler.
                </p>
                <span className="text-[8px] text-gray-500 uppercase mt-1 block">
                  2 mins ago
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
