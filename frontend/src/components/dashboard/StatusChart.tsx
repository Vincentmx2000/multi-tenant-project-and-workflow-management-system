import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export interface StatusChartProps {
  tasksByStatus?: Record<string, number>;
}

export interface StatusDataItem {
  name: 'To Do' | 'In Progress' | 'Done';
  value: number;
}

const COLOR_MAP: Record<string, string> = {
  'To Do': '#94a3b8',
  'In Progress': '#f59e0b',
  Done: '#0d9488',
};

export const StatusChart: React.FC<StatusChartProps> = ({ tasksByStatus = {} }) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Format status object into recharts-compatible data array
  const formattedData: StatusDataItem[] = [
    { name: 'To Do', value: tasksByStatus.todo || tasksByStatus['to-do'] || 0 },
    {
      name: 'In Progress',
      value: tasksByStatus['in-progress'] || tasksByStatus.in_progress || 0,
    },
    { name: 'Done', value: tasksByStatus.done || tasksByStatus.completed || 0 },
  ];

  const total = formattedData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center py-12">
        <p className="text-slate-400 text-sm font-medium">No tasks logged yet for status charts.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Task Status Distribution</h3>
          <p className="text-xs text-slate-500">Breakdown of current task progress across all projects</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-lg transition-all ${
              chartType === 'pie'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pie
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-lg transition-all ${
              chartType === 'bar'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          ) : (
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusChart;
