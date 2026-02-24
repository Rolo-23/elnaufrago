import React, { useMemo } from 'react';
import { format, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppContext } from '../context/AppContext';
import { BookingStatus } from '../types';
import { Card } from './ui/Card';

// FIX: Replaced JSX.Element with React.ReactNode to fix "Cannot find namespace 'JSX'" error.
const StatsCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card>
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-brand-dark mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </Card>
);

export default function StatsView() {
    const { bookings, services } = useAppContext();
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);
    
    const monthlyBookings = useMemo(() => {
        return bookings.filter(b => getMonth(b.startTime) === currentMonth && getYear(b.startTime) === currentYear);
    }, [bookings, currentMonth, currentYear]);

    const confirmedBookings = monthlyBookings.filter(b => b.status === BookingStatus.Confirmed);
    const totalRevenue = confirmedBookings.reduce((acc, booking) => {
        const service = services.find(s => s.id === booking.serviceId);
        return acc + (service?.price || 0);
    }, 0);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">
                Resumen de {format(now, 'MMMM yyyy', { locale: es })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard title="Turnos Completados (mes)" value={confirmedBookings.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
                <StatsCard title="Recaudación del Mes" value={`$${totalRevenue}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
            </div>
        </div>
    );
}