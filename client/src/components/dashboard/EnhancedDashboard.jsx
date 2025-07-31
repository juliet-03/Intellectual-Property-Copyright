import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { clientsAPI, analyticsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EnhancedDashboard = () => {
  const [stats, setStats] = useState({});
  const [paymentTrends, setPaymentTrends] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // WebSocket for real-time updates
    const ws = new WebSocket(`ws://localhost:5000/ws?token=${localStorage.getItem('token')}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'stats_update') {
        setStats(prev => ({ ...prev, ...data.payload }));
      }
    };
    
    return () => ws.close();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, trendsRes, riskRes, activitiesRes] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getPaymentTrends(),
        analyticsAPI.getRiskDistribution(),
        analyticsAPI.getRecentActivities()
      ]);

      setStats(statsRes.data);
      setPaymentTrends(trendsRes.data);
      setRiskDistribution(riskRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="p-6 space-y-6">
      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Outstanding"
          value={`$${stats.totalOutstanding?.toLocaleString()}`}
          change={stats.outstandingChange}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Recovery Rate"
          value={`${stats.recoveryRate}%`}
          change={stats.recoveryChange}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="High Risk Accounts"
          value={stats.highRiskCount}
          change={stats.riskChange}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Active Cases"
          value={stats.activeCases}
          change={stats.casesChange}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Payment Trends (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
              <Line type="monotone" dataKey="collected" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="outstanding" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <div className={`flex items-center text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]} text-white`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
    <div className="flex-shrink-0">
      <CheckCircle className="text-green-500" size={20} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">{activity.description}</p>
      <p className="text-xs text-gray-500">{activity.timestamp}</p>
    </div>
  </div>
);

export default EnhancedDashboard;