export interface MonthlyRevenue {
  month: string
  amount: number
}

export interface DashboardMockData {
  welcome: {
    greeting: string
    subtitle: string
  }
  stats: {
    totalCondominiums: number
    totalUsers: string
    totalRevenue: string
    pendingActions: string
  }
  revenueData: MonthlyRevenue[]
  recentActivityPlaceholder: {
    title: string
    message: string
  }
}

export const mockDashboardData: DashboardMockData = {
  welcome: {
    greeting: 'Good morning, Solomon',
    subtitle: "Here's what's happening across your condominium network.",
  },
  stats: {
    totalCondominiums: 24,
    totalUsers: '1,420',
    totalRevenue: '$128,450',
    pendingActions: '5 Pending',
  },
  revenueData: [
    { month: 'Jan', amount: 42000 },
    { month: 'Feb', amount: 48000 },
    { month: 'Mar', amount: 55000 },
    { month: 'Apr', amount: 62000 },
    { month: 'May', amount: 71000 },
    { month: 'Jun', amount: 83000 },
    { month: 'Jul', amount: 91000 },
    { month: 'Aug', amount: 98000 },
    { month: 'Sep', amount: 106000 },
    { month: 'Oct', amount: 114000 },
    { month: 'Nov', amount: 121000 },
    { month: 'Dec', amount: 128450 },
  ],
  recentActivityPlaceholder: {
    title: 'Recent Terminal Activity',
    message: 'Activity logs will be displayed here once live terminal integration is active.',
  },
}
