import { Barber, Booking, Service, BookingStatus } from '../types';
import { setHours, setMinutes, addDays } from 'date-fns';

export const MOCK_BARBERS: Barber[] = [
  { id: 'barber-1', name: 'Carlos "El Navaja" López' },
];

export const MOCK_SERVICES: Service[] = [
  { id: 'service-1', name: 'Corte de Pelo', price: 15, duration: 30 },
  { id: 'service-2', name: 'Afeitado Clásico', price: 12, duration: 30 },
  { id: 'service-3', name: 'Corte y Barba', price: 25, duration: 60 },
  { id: 'service-4', name: 'Arreglo de Barba', price: 10, duration: 20 },
];

const today = new Date();
const tomorrow = addDays(today, 1);

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    client: { name: 'Juan Pérez', phone: '1122334455' },
    serviceId: 'service-1',
    barberId: 'barber-1',
    startTime: setMinutes(setHours(today, 10), 0),
    endTime: setMinutes(setHours(today, 10), 30),
    status: BookingStatus.Confirmed,
  },
  {
    id: 'booking-2',
    client: { name: 'Pedro Gómez', phone: '1133445566' },
    serviceId: 'service-3',
    barberId: 'barber-1',
    startTime: setMinutes(setHours(today, 11), 0),
    endTime: setMinutes(setHours(today, 12), 0),
    status: BookingStatus.Pending,
  },
   {
    id: 'booking-3',
    client: { name: 'Ana García', phone: '1144556677' },
    serviceId: 'service-2',
    barberId: 'barber-1',
    startTime: setMinutes(setHours(tomorrow, 14), 30),
    endTime: setMinutes(setHours(tomorrow, 15), 0),
    status: BookingStatus.Confirmed,
  },
];