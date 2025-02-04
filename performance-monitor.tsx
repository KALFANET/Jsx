import React, { useState } from 'react';
const metrics = useSystemStore(state => state.metrics);
await endpoints.getPerformanceMetrics(deviceId);
import { 
  CpuIcon, 
  HardDriveIcon, 
  NetworkIcon, 
  BarChartIcon,
  RefreshCwIcon,
  ClockIcon,
  DownloadIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceMonitor = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedDevice, setSelectedDevice] = useState('PC-001');

  // Mock performance data
  const performanceData = {
    cpu: {
      current: 45,
      history: [
        { time: '14:00', value: 32 },
        { time: '14:15', value: 45 },
        { time: '14:30', value: 38 },
        { time: '14:45', value: 42 },
        { time: '15:00', value: 45 }
      ]
    },
    ram: {
      total: 16,
      used: 8.5,
      history: [
        { time: '14:00', value: 7.2 },
        { time: '14:15', value: 8.1 },
        { time: '14:30', value: 8.5 },
        { time: '14:45', value: 8.3 },
        { time: '15:00', value: 8.5 }
      ]
    },
    network: {
      download: 5.2,
      upload: 1.8,
      history: [
        { time: '14:00', value: 3.2 },
        { time: '14:15', value: 4.5 },
        { time: '14:30', value: 5.2 },
        { time: '14:45', value: 4.8 },
        { time: '15:00', value: 5.2 }
      ]
    },
    disk: {
      read: 25,
      write: 15,
      usage: 75,
      history: [
        { time: '14:00', value: 65 },
        { time: '14:15', value: 68 },
        { time: '14:30', value: 72 },
        { time: '14:45', value: 74 },
        { time: '15:00', value: 75 }
      ]
    }
  };

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Performance Monitor</h1>
            <select 
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="PC-001">PC-001</option>
              <option value="MAC-002">MAC-002</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <RefreshCwIcon className="h-4 w-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <DownloadIcon className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* CPU Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CpuIcon className="h-5 w-5 text-blue-500" />
                <h2 className="font-medium">CPU Usage</h2>
              </div>
              <span className="text-2xl font-semibold">{performanceData.cpu.current}%</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.cpu.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChartIcon className="h-5 w-5 text-green-500" />
                <h2 className="font-medium">Memory Usage</h2>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold">
                  {performanceData.ram.used}GB / {performanceData.ram.total}GB
                </div>
                <div className="text-sm text-gray-500">
                  {((performanceData.ram.used / performanceData.ram.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.ram.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <NetworkIcon className="h-5 w-5 text-purple-500" />
                <h2 className="font-medium">Network Usage</h2>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  <span className="text-green-500">↓ {performanceData.network.download} MB/s</span>
                  {' / '}
                  <span className="text-blue-500">↑ {performanceData.network.upload} MB/s</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.network.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8B5CF6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disk Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDriveIcon className="h-5 w-5 text-orange-500" />
                <h2 className="font-medium">Disk Usage</h2>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  <span className="text-green-500">Read: {performanceData.disk.read} MB/s</span>
                  {' / '}
                  <span className="text-blue-500">Write: {performanceData.disk.write} MB/s</span>
                </div>
                <div className="text-sm text-gray-500">
                  {performanceData.disk.usage}% Used
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.disk.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#F97316" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;