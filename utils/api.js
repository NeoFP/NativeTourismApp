// Mock data for testing
const mockData = {
  dashboard: {
    reviews: {
      positive: 65,
      negative: 15,
      neutral: 20,
    },
    monthlyStats: [
      { month: 'Jan', count: 30 },
      { month: 'Feb', count: 45 },
      { month: 'Mar', count: 55 },
      { month: 'Apr', count: 40 },
    ],
  },
  issues: [
    { id: 1, title: 'Wi-Fi Connectivity', severity: 'High', votes: 45 },
    { id: 2, title: 'Room Service Delay', severity: 'Medium', votes: 32 },
    { id: 3, title: 'Parking Space', severity: 'Low', votes: 28 },
  ],
  solutions: [
    { id: 1, issueId: 1, description: 'Upgraded router installation', status: 'Implemented' },
    { id: 2, issueId: 2, description: 'Added more staff', status: 'In Progress' },
    { id: 3, issueId: 3, description: 'New parking area construction', status: 'Planned' },
  ],
};

export const api = {
  getDashboardData: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockData.dashboard), 1000);
    });
  },
  
  getIssues: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockData.issues), 1000);
    });
  },
  
  getSolutions: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockData.solutions), 1000);
    });
  },
}; 