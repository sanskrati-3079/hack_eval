import React, { useContext, useEffect, useState } from 'react';
import { TeamContext } from '../context/TeamContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const { team } = useContext(TeamContext);

  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (team) {
      // Simulated analytics data based on team context
      const data = {
        activityData: [
          { name: 'Code Commits', value: team.analytics?.commitCount || 156 },
          { name: 'Code Reviews', value: team.analytics?.codeReviews || 24 },
          { name: 'Tests Written', value: team.analytics?.testsWritten || 89 },
          { name: 'Bugs Fixed', value: team.analytics?.bugsFixed || 15 },
          { name: 'Documentation', value: 20 },
        ],
        progressData: [
          { name: 'Planning', completed: 100 },
          { name: 'Design', completed: 85 },
          { name: 'Development', completed: 60 },
          { name: 'Testing', completed: 40 },
          { name: 'Documentation', completed: 30 },
        ],
        performanceData: [
          { day: 'Mon', score: 85 },
          { day: 'Tue', score: 88 },
          { day: 'Wed', score: 92 },
          { day: 'Thu', score: 90 },
          { day: 'Fri', score: 95 },
        ],
      };
      setAnalyticsData(data);
    }
  }, [team]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!analyticsData) {
    return <div className="analytics-container">Loading analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <h1>Team Analytics</h1>

      <div className="analytics-grid">
        <div className="chart-card">
          <h2>Activity Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.activityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {analyticsData.activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Project Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analyticsData.progressData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#8884d8" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Performance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={analyticsData.performanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[60, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                name="Performance Score"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stats-card">
          <h2>Key Metrics</h2>
          <div className="metrics-grid">
            <div className="metric">
              <h3>Team Velocity</h3>
              <p>{team?.analytics?.commitCount || 156} commits</p>
            </div>
            <div className="metric">
              <h3>Code Quality</h3>
              <p>A+ ({team?.score || 85}%)</p>
            </div>
            <div className="metric">
              <h3>Tests Coverage</h3>
              <p>{team?.analytics?.testsWritten || 89} tests</p>
            </div>
            <div className="metric">
              <h3>Bug Resolution</h3>
              <p>{team?.analytics?.bugsFixed || 15} fixed</p>
            </div>
          </div>
        </div>

        <div className="insights-card">
          <h2>Key Insights</h2>
          <ul>
            <li>High commit activity with {team?.analytics?.commitCount || 156} total commits</li>
            <li>Strong code review culture with {team?.analytics?.codeReviews || 24} reviews</li>
            <li>Robust testing with {team?.analytics?.testsWritten || 89} tests written</li>
            <li>Efficient bug resolution: {team?.analytics?.bugsFixed || 15} bugs fixed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;