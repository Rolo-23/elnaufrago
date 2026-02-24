
import React, { useState } from 'react';
import { format, isSameDay, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppContext } from '../context/AppContext';
import { Booking, BookingStatus } from '../types';
import { Calendar } from './ui/Calendar';
import { Card } from './ui/Card';
import { STATUS_COLORS, STATUS_TEXT, CLOSED_DAYS_OF_WEEK } from '../constants';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { ManualBookingModal } from './ManualBookingModal';

const BookingCard: React.FC<{ booking: Booking, onStatusChange: (status: BookingStatus) => void }> = ({ booking, onStatusChange }) => {
    const { services, barbers } = useAppContext();
    const service = services.find(s => s.id === booking.serviceId);
    const barber = barbers.find(b => b.id === booking.barberId);

    return (
        <div className="bg-gray-700 p-4 rounded-lg mb-3 shadow-md border-l-4 border-brand">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-white">{booking.client.name}</p>
                    <p className="text-sm text-gray-300">{service?.name}</p>
                    <p className="text-xs text-gray-400">con {barber?.name}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold text-brand-light">{format(booking.startTime, 'HH:mm')}</p>
                    <p className="text-sm text-gray-400">{booking.client.phone}</p>
                </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[booking.status]} text-gray-900`}>
                    {STATUS_TEXT[booking.status]}
                </span>
                <div className="flex space-x-2">
                    {booking.status === BookingStatus.Pending && <Button size="sm" variant="success" onClick={() => onStatusChange(BookingStatus.Confirmed)}>Confirmar</Button>}
                    {booking.status === BookingStatus.Confirmed && <Button size="sm" variant="primary" onClick={() => onStatusChange(BookingStatus.Completed)}>Completar</Button>}
                    {booking.status !== BookingStatus.Cancelled && booking.status !== BookingStatus.Completed && <Button size="sm" variant="danger" onClick={() => onStatusChange(BookingStatus.Cancelled)}>Cancelar</Button>}
                </div>
            </div>
        </div>
    );
};

export default function AdminCalendarView() {
    const { bookings, updateBookingStatus } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const { showToast } = useToast();

    const bookingsForSelectedDay = bookings
        .filter(b => isSameDay(b.startTime, selectedDate) && b.status !== BookingStatus.Completed && b.status !== BookingStatus.Cancelled)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    const isDayClosed = CLOSED_DAYS_OF_WEEK.includes(getDay(selectedDate));

    const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
        const result = await updateBookingStatus(bookingId, status);
        if (result.success) {
            if (result.whatsappUrl) {
                const toastMsg = status === BookingStatus.Confirmed 
                    ? 'Turno confirmado. ¿Enviar notificación?'
                    : 'Turno cancelado. ¿Notificar al cliente?';
                
                showToast(toastMsg, status === BookingStatus.Confirmed ? 'success' : 'info', {
                    label: 'Enviar WhatsApp',
                    onClick: () => window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer'),
                });
            } else {
                 showToast(`Turno actualizado a ${STATUS_TEXT[status].toLowerCase()}.`, 'success');
            }
        } else {
            showToast('Error al actualizar el estado del turno.', 'error');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Card>
                    <h3 className="text-xl font-semibold mb-4 text-white">Seleccionar Fecha</h3>
                    <Calendar 
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        bookings={bookings}
                    />
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="text-xl font-semibold text-white">
                            Turnos del {format(selectedDate, 'dd/MM', { locale: es })}
                        </h3>
                        <Button onClick={() => setIsManualModalOpen(true)}>
                            + Agendar Turno
                        </Button>
                    </div>

                    {isDayClosed && <p className="text-yellow-400 bg-yellow-900/50 p-3 rounded-lg mb-4">Este día el local se encuentra cerrado.</p>}
                    
                    {bookingsForSelectedDay.length > 0 ? (
                        <div>
                            {bookingsForSelectedDay.map(booking => (
                                <BookingCard 
                                    key={booking.id} 
                                    booking={booking}
                                    onStatusChange={(status) => handleStatusUpdate(booking.id, status)}
                                />
                            ))}
                        </div>
                    ) : (
                        !isDayClosed && <p className="text-gray-400 py-4">No hay turnos agendados para este día.</p>
                    )}
                </Card>
            </div>
            
            <ManualBookingModal 
                isOpen={isManualModalOpen} 
                onClose={() => setIsManualModalOpen(false)}
                preSelectedDate={selectedDate}
            />
        </div>
    );
}
