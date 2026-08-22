import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Building2,
  Coins,
  ShieldCheck,
  CreditCard,
  ArrowLeftRight,
  FileText,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import type { DashboardData } from '../../services/types/dashboard'
import { getDashboardApi } from '../../services/api/dashboardApi'
import StatCard from '../../components/dashboard/StatCard'
import PropertyOverview from '../../components/dashboard/PropertyOverview'

import { useAuth } from '../../context/useAuth'
import { isSuperAdmin } from '../../utils/roleHelpers'

export const Dashboard = () => {
  const { user } = useAuth()
  const isSuper = isSuperAdmin(user?.role)

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getDashboardApi()
      setDashboardData(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load dashboard data.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-gray-400 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
            Loading dashboard...
          </span>
        </div>
      </div>
    )
  }

  if (errorMessage || !dashboardData) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#0F131C] p-8 text-center text-gray-400 max-w-lg mx-auto mt-10 select-none">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-200">
          Unable to load dashboard data
        </h3>
        <p className="mt-1 text-xs text-gray-400">
          {errorMessage || 'Please check your network connection and try again.'}
        </p>
        <button
          type="button"
          onClick={fetchDashboard}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    )
  }

  // Format helper for numbers (preserves 0 while mapping undefined to '—')
  const fmt = (val: number | undefined): string | number =>
    val !== undefined ? val : '—'

  // Format currency helper
  const formatCurrency = (val: number | undefined): string => {
    if (val === undefined) return '—'
    return `ETB ${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="space-y-6 md:space-y-8 select-none max-w-7xl mx-auto pb-10">
      {/* 1. Header Section */}
      <div className="rounded-xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100 tracking-tight">
          {isSuper ? 'Super Admin Dashboard' : 'Condominium Admin Dashboard'}
        </h1>
        <p className="mt-1 text-xs md:text-sm text-gray-400">
          {isSuper
            ? 'Real-time metrics and system statistics across your condominium network.'
            : 'Real-time metrics and property statistics for your assigned condominium.'}
        </p>
      </div>

      {/* 2. Primary Statistics Grid (8 Cards: 2 Rows of 4 Cards) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-200 tracking-tight">
          {isSuper ? 'System Overview & Metrics' : 'Property Overview & Metrics'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Total Users */}
          <StatCard
            title="Total Users"
            value={fmt(dashboardData.users?.total)}
            icon={Users}
            subtext={`Verified: ${fmt(dashboardData.users?.verified)} | Unverified: ${fmt(dashboardData.users?.unverified)}`}
          />

          {/* Card 2: Total Condominiums / Property Scope */}
          <StatCard
            title={isSuper ? 'Total Condominiums' : 'Property Scope'}
            value={isSuper ? fmt(dashboardData.condos?.total) : (user?.condoCode || '1 Condo')}
            icon={Building2}
            subtext={
              isSuper
                ? `Active: ${fmt(dashboardData.condos?.active)}`
                : `Status: Active Property`
            }
          />

          {/* Card 3: Total Equbs */}
          <StatCard
            title="Total Equbs"
            value={fmt(dashboardData.equbs?.total)}
            icon={Coins}
            subtext={`Active: ${fmt(dashboardData.equbs?.active)} | Pending: ${fmt(dashboardData.equbs?.pending)}`}
          />

          {/* Card 4: Total Iddirs */}
          <StatCard
            title="Total Iddirs"
            value={fmt(dashboardData.iddirs?.total)}
            icon={ShieldCheck}
            subtext={`Active: ${fmt(dashboardData.iddirs?.active)} | Inactive: ${fmt(dashboardData.iddirs?.inactive)}`}
          />

          {/* Card 5: Total Payments */}
          <StatCard
            title="Total Payments"
            value={fmt(dashboardData.payments?.total)}
            icon={CreditCard}
            subtext={`Approved: ${fmt(dashboardData.payments?.approved)} | Pending: ${fmt(dashboardData.payments?.pending)}`}
          />

          {/* Card 6: Total Transactions */}
          <StatCard
            title="Total Transactions"
            value={fmt(dashboardData.transactions?.total)}
            icon={ArrowLeftRight}
            subtext={`Completed: ${fmt(dashboardData.transactions?.completed)} | Pending: ${fmt(dashboardData.transactions?.pending)}`}
          />

          {/* Card 7: Total Reports */}
          <StatCard
            title="Total Reports"
            value={fmt(dashboardData.reports?.total)}
            icon={FileText}
            subtext={`Reported: ${fmt(dashboardData.reports?.reported)} | Resolved: ${fmt(dashboardData.reports?.resolved)}`}
          />

          {/* Card 8: Service Fees Collected */}
          <StatCard
            title="Service Fees Collected"
            value={formatCurrency(dashboardData.serviceFees?.totalCollectedAmount)}
            icon={DollarSign}
            subtext={`Collected: ${fmt(dashboardData.serviceFees?.collected)} | Pending: ${fmt(dashboardData.serviceFees?.pending)}`}
          />
        </div>
      </div>

      {/* 3. Property Overview Section */}
      <PropertyOverview
        blocksTotal={fmt(dashboardData.blocks?.total)}
        roomsTotal={fmt(dashboardData.rooms?.total)}
        roomsOccupied={fmt(dashboardData.rooms?.occupied)}
        roomsFree={fmt(dashboardData.rooms?.free)}
        roomsReserved={fmt(dashboardData.rooms?.reserved)}
      />
    </div>
  )
}

export default Dashboard
