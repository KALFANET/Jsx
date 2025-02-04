import React, { useState } from 'react';
import { 
  Layout, 
  Monitor,
  Activity,
  Package,
  Users,
  Settings,
  Terminal,
  Bell,
  Menu,
  X
} from 'lucide-react';

const MainClient = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'High CPU usage on PC-001', time: '2 min ago' },
    { id: 2, type: 'info', message: 'New device connected: MAC-002', time: '5 min ago' }
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'devices', label: 'Devices', icon: Monitor },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'software', label: 'Software', icon: Package },
    { id: 'remote', label: 'Remote Control', icon: Terminal },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const MenuItem = ({ item }) => (
    <button
      onClick={() => setCurrentPage(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        currentPage === item.id 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <item.icon className="h-5 w-5" />
      {sidebarOpen && <span>{item.label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'w-64' : 'w-16'
      } bg-white border-r flex flex-col transition-all duration-300`}>
        {/* Logo & Toggle */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Layout className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">Network Manager</span>
            </div>
          ) : (
            <Layout className="h-6 w-6 text-blue-600 mx-auto" />
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <Menu className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <div className="font-medium">Admin User</div>
                <div className="text-xs text-gray-500">admin@company.com</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b h-16">
          <div className="flex items-center justify-between px-6 h-full">
            <h1 className="text-xl font-semibold">
              {menuItems.find(item => item.id === currentPage)?.label}
            </h1>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <span className="text-sm">Admin</span>
                <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Content will be rendered here based on currentPage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Quick Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Total Devices</div>
                <div className="text-2xl font-semibold">24</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Online</div>
                <div className="text-2xl font-semibold">18</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 mb-1">Alerts</div>
                <div className="text-2xl font-semibold">3</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-md font-medium mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${
                        notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></span>
                      <span>{notification.message}</span>
                    </div>
                    <span className="text-sm text-gray-500">{notification.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainClient;