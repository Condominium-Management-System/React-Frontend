import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  CreditCard,
  Clock,
  FileText,
  Sliders,
  Activity,
} from 'lucide-react'
import { mockDashboardData } from './dashboardMockData'
import StatCard from '../../components/dashboard/StatCard'
import RevenueChart from '../../components/dashboard/RevenueChart'
import PlaceholderCard from '../../components/dashboard/PlaceholderCard'
import QuickActionCard from '../../components/dashboard/QuickActionCard'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { welcome, stats, revenueData, recentActivityPlaceholder } =
    mockDashboardData

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      {/* 1. Welcome Section */}
      <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100 tracking-tight">
          {welcome.greeting}
        </h1>
        <p className="mt-1 text-sm text-gray-400">{welcome.subtitle}</p>
      </div>

      {/* 2. Statistics Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Total Condominiums"
          value={stats.totalCondominiums}
          icon={Building2}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={CreditCard}
        />
        <StatCard
          title="Pending Actions"
          value={stats.pendingActions}
          icon={Clock}
          badgeText="Action Required"
        />
      </div>

      {/* 3. Main Content Area (Revenue Chart & Activity Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Chart (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>

        {/* Recent Terminal Activity (Spans 1 column on desktop) */}
        <div className="lg:col-span-1 flex flex-col">
          <PlaceholderCard
            title={recentActivityPlaceholder.title}
            description="Audit & system activity logs"
            icon={Activity}
            message={recentActivityPlaceholder.message}
            actionLabel="Terminal Log Mode"
            className="h-full"
          />
        </div>
      </div>

      {/* 4. Quick Action Terminal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-gray-100 tracking-tight">
              Quick Action Terminal
            </h3>
            <p className="text-xs text-gray-400">
              Direct access to system administration workflows
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <QuickActionCard
            title="User Management"
            description="Manage system users, platform roles, and supervisor permissions."
            icon={Users}
            onClick={() => navigate('/users')}
          />
          <QuickActionCard
            title="Export Reports"
            description="Generate system audit reports and financial summaries."
            icon={FileText}
            isPlaceholder
          />
          <QuickActionCard
            title="System Settings"
            description="Configure platform settings, notification preferences, and global parameters."
            icon={Sliders}
            isPlaceholder
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
