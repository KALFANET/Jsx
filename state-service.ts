// store/index.ts
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { endpoints } from '../services/api';
import { validate } from '../services/validation';

interface SystemState {
  // System Status
  status: {
    connected: boolean;
    lastUpdate: string;
    version: string;
    debugMode: boolean;
  };
  
  // Current Device
  currentDevice: {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'error';
    metrics: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
  } | null;
  
  // Settings
  settings: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    autoUpdate: boolean;
    notifications: boolean;
  };
  
  // Actions
  updateStatus: (status: Partial<SystemState['status']>) => void;
  updateCurrentDevice: (device: SystemState['currentDevice']) => void;
  updateSettings: (settings: Partial<SystemState['settings']>) => void;
  
  // System Actions
  checkConnection: () => Promise<boolean>;
  refreshMetrics: () => Promise<void>;
  executeCommand: (command: string) => Promise<void>;
}

const useSystemStore = create<SystemState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        status: {
          connected: false,
          lastUpdate: new Date().toISOString(),
          version: '1.0.0',
          debugMode: false
        },
        
        currentDevice: null,
        
        settings: {
          language: 'en',
          theme: 'system',
          autoUpdate: true,
          notifications: true
        },
        
        // Status Updates
        updateStatus: (newStatus) =>
          set((state) => ({
            status: { ...state.status, ...newStatus }
          })),
        
        updateCurrentDevice: (device) =>
          set({ currentDevice: device }),
        
        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
          })),
        
        // System Actions
        checkConnection: async () => {
          try {
            const response = await endpoints.getSystemStatus();
            const isConnected = response.data.status === 'connected';
            set((state) => ({
              status: {
                ...state.status,
                connected: isConnected,
                lastUpdate: new Date().toISOString()
              }
            }));
            return isConnected;
          } catch (error) {
            set((state) => ({
              status: {
                ...state.status,
                connected: false,
                lastUpdate: new Date().toISOString()
              }
            }));
            return false;
          }
        },
        
        refreshMetrics: async () => {
          const { currentDevice } = get();
          if (!currentDevice) return;
          
          try {
            const response = await endpoints.getPerformanceMetrics(currentDevice.id);
            set((state) => ({
              currentDevice: state.currentDevice
                ? { ...state.currentDevice, metrics: response.data }
                : null
            }));
          } catch (error) {
            console.error('Failed to refresh metrics:', error);
          }
        },
        
        executeCommand: async (command) => {
          const { currentDevice } = get();
          if (!currentDevice) return;
          
          try {
            // Validate command
            const validatedCommand = validate.command({
              type: 'system',
              command
            });
            
            // Execute command
            await endpoints.executeCommand(
              currentDevice.id,
              validatedCommand.command
            );
            
            // Refresh metrics after command
            await get().refreshMetrics();
          } catch (error) {
            console.error('Failed to execute command:', error);
            throw error;
          }
        }
      }),
      {
        name: 'system-store',
        partialize: (state) => ({
          settings: state.settings
        })
      }
    )
  )
);

export default useSystemStore;