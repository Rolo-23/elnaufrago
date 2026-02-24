import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Service } from '../types';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Calendar } from './ui/Calendar';
import { Button } from './ui/Button';
import { BookingModal } from './BookingModal';
import { addMinutes, setHours, isBefore, isSameDay, getDay, startOfDay, format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { CLOSED_DAYS_OF_WEEK, MIN_BOOKING_ADVANCE_HOURS } from '../constants';

const Step: React.FC<{ number: number; title: string; children: React.ReactNode; isComplete: boolean }> = ({ number, title, children, isComplete }) => (
  <Card className={`transition-all duration-300 ${isComplete ? 'border-l-4 border-brand' : ''}`}>
    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
      <span className={`mr-3 inline-flex items-center justify-center w-8 h-8 rounded-full ${isComplete ? 'bg-brand text-gray-900' : 'bg-gray-700'}`}>
        {number}
      </span>
      {title}
    </h3>
    {children}
  </Card>
);

export default function BookingFlow() {
  const { services, barbers, bookings, isLoading, businessHoursStart, businessHoursEnd } = useAppContext();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (barbers.length === 1 && !selectedBarberId) {
      setSelectedBarberId(barbers[0].id);
    }
  }, [barbers, selectedBarberId]);

  const selectedService = useMemo(() => services.find(s => s.id === selectedServiceId), [services, selectedServiceId]);

  const availableSlots = useMemo(() => {
    // 1. Pre-computation checks: ensure we have all the data needed.
    if (!selectedService || !selectedBarberId || !selectedDate) {
        return [];
    }
    // A service must have a positive duration.
    if (!selectedService.duration || selectedService.duration <= 0) {
        return [];
    }

    // 2. Check for closed days.
    const dayOfWeek = getDay(selectedDate);
    if (CLOSED_DAYS_OF_WEEK.includes(dayOfWeek)) {
        return [];
    }

    // 3. Check for valid business hours configuration.
    if (businessHoursStart >= businessHoursEnd) {
        console.error("Invalid business hours: start time is after or same as end time.");
        return [];
    }

    // 4. Generate all potential 15-minute slots within business hours.
    const potentialSlots: Date[] = [];
    const serviceDuration = selectedService.duration;
    
    // Set up the day's boundaries in a clean way.
    const dayStartBoundary = setHours(startOfDay(selectedDate), businessHoursStart);
    const dayEndBoundary = setHours(startOfDay(selectedDate), businessHoursEnd);

    let currentTime = dayStartBoundary;
    while (isBefore(currentTime, dayEndBoundary)) {
        const slotEndTime = addMinutes(currentTime, serviceDuration);

        // A slot is valid if its end time is not after the closing time.
        if (!isAfter(slotEndTime, dayEndBoundary)) {
            potentialSlots.push(new Date(currentTime));
        }
        
        // Move to the next potential slot start time.
        currentTime = addMinutes(currentTime, 15);
    }
    
    // 5. Filter out slots that are unavailable.
    const barberBookingsForDay = bookings.filter(
        b => b.barberId === selectedBarberId && isSameDay(b.startTime, selectedDate)
    );
    
    const earliestBookingTime = addMinutes(new Date(), MIN_BOOKING_ADVANCE_HOURS * 60);

    return potentialSlots.filter(slot => {
        const slotEndTime = addMinutes(slot, serviceDuration);

        // A) Slot must be in the future (respecting advance booking time).
        if (isBefore(slot, earliestBookingTime)) {
            return false;
        }

        // B) Slot must not conflict with an existing booking.
        const hasConflict = barberBookingsForDay.some(booking => {
            const bookingStart = booking.startTime;
            const bookingEnd = booking.endTime;
            // Overlap condition: (StartA < EndB) and (StartB < EndA)
            return isBefore(slot, bookingEnd) && isBefore(bookingStart, slotEndTime);
        });
        
        return !hasConflict;
    });
}, [selectedService, selectedBarberId, selectedDate, bookings, businessHoursStart, businessHoursEnd]);


  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTime(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-400">Cargando... Llama a los barberos 💈</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-light">Reserva tu Turno</h2>
        <p className="text-gray-400 mt-2">Sigue los pasos para asegurar tu próximo corte.</p>
      </div>

      <div className="space-y-6">
        <Step number={1} title="Elige tu Servicio" isComplete={!!selectedServiceId}>
          <Select
            label="Servicios Disponibles"
            value={selectedServiceId || ''}
            onChange={(e) => {
              setSelectedServiceId(e.target.value);
              setSelectedTime(null);
            }}
          >
            <option value="" disabled>Selecciona un servicio...</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} (${service.price}) - {service.duration} min
              </option>
            ))}
          </Select>
           {/* Barber selection could be added here if needed, for now it auto-selects if only one */}
        </Step>

        {selectedServiceId && (
          <Step number={2} title="Selecciona una Fecha" isComplete={!!selectedDate}>
            <Calendar
              selectedDate={selectedDate}
              onDateChange={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
              bookings={bookings}
            />
          </Step>
        )}

        {selectedServiceId && selectedDate && (
           <Step number={3} title={`Horarios para ${format(selectedDate, 'eeee dd/MM', { locale: es })}`} isComplete={!!selectedTime}>
             {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {availableSlots.map(slot => (
                        <Button
                            key={slot.toISOString()}
                            variant="secondary"
                            onClick={() => handleTimeSelect(slot)}
                        >
                            {format(slot, 'HH:mm')}
                        </Button>
                    ))}
                </div>
             ) : (
                <p className="text-gray-400 text-center py-4">
                    No hay horarios disponibles para este día. Por favor, selecciona otra fecha.
                </p>
             )}
           </Step>
        )}
      </div>

      {selectedService && selectedTime && selectedBarberId && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bookingTime={selectedTime}
          service={selectedService}
          barberId={selectedBarberId}
        />
      )}
    </div>
  );
}