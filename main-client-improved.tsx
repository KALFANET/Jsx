import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff,
  RefreshCw,
  Settings,
  AlertCircle,
  Check,
  X,
  Download,
  HardDrive,
  Activity,
  Info
} from 'lucide-react';
import useSystemStore from './store';
import { toast } from 'react-toastify';
import { validate } from './services/validation';

const NetworkManagerClient = () => {
  // Global state
  const { 
    status, 
    currentDevice, 
    settings,
    updateSettings,
    checkConnection,
    refreshMetrics,
    executeCommand
  } = useSystemStore();

  // Local state
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Effect for periodic checks
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await checkConnection();
        if (currentDevice) {
          await refreshMetrics();
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkConnection, refreshMetrics, currentDevice]);

  // Handle connection refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await checkConnection();
      await refreshMetrics();
      toast.success('Connection refreshed');
    } catch (error) {
      toast.error('Failed to refresh connection');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle settings update
  const handleSettingsUpdate = async (newSettings) => {
    try {
      const validatedSettings = validate.systemSettings({
        ...settings,
        ...newSettings
      });
      await updateSettings(validatedSettings);
      toast.success('Settings updated');
      setShowSettings(false);
    } catch (error) {
      toast.error('Failed to update settings: ' + error.message);
    }
  };

  // Get status icon based on connection state
  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="animate-spin text-blue-500" />;
    if (!status.connected) return <WifiOff className="text-red-500" />;
    return <Wifi className="text-green-500" />;
  };

  return (
    <div className="h-screen bg-gray-100">
      {/* Main Window */}