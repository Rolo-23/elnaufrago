

import React, { useState } from 'react';
import AdminCalendarView from './AdminCalendarView';
import StatsView from './StatsView';
import ServicesView from './ServicesView';
import SettingsView from './SettingsView';
import NotificationsPanel from './NotificationsPanel';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/Button';

type AdminTab = 'calendar' | 'stats' | 'services' | 'settings';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 focus:outline-none ${
            active 
            ? 'border-brand text-brand-light' 
            : 'border-transparent text-gray-400 hover:text-gray-100 hover:border-gray-500'
        }`}
    >
        {children}
    </button>
);

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('calendar');
  const { notifications } = useAppContext();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-brand-light">Panel de Administración</h2>
        <div className="flex items-center space-x-4">
            <div className="relative">
                <NotificationsPanel />
                {unreadCount > 0 && 
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>
                }
            </div>
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Cerrar Sesión
            </Button>
        </div>
      </div>

      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>Calendario</TabButton>
            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>Estadísticas</TabButton>
            <TabButton active={activeTab === 'services'} onClick={() => setActiveTab('services')}>Servicios</TabButton>
            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Configuración</TabButton>
        </nav>
      </div>

      <div>
        {activeTab === 'calendar' && <AdminCalendarView />}
        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'services' && <ServicesView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}