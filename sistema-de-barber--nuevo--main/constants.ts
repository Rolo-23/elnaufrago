import { BookingStatus } from './types';

export const CLOSED_DAYS_OF_WEEK = [0, 1]; // Sunday, Monday

export const MIN_BOOKING_ADVANCE_HOURS = 2;

export const STATUS_COLORS: { [key in BookingStatus]: string } = {
  [BookingStatus.Pending]: 'bg-yellow-500',
  [BookingStatus.Confirmed]: 'bg-green-500',
  [BookingStatus.Cancelled]: 'bg-red-500',
  [BookingStatus.Completed]: 'bg-blue-500',
};

export const STATUS_TEXT: { [key in BookingStatus]: string } = {
  [BookingStatus.Pending]: 'Pendiente',
  [BookingStatus.Confirmed]: 'Confirmado',
  [BookingStatus.Cancelled]: 'Cancelado',
  [BookingStatus.Completed]: 'Completado',
};