export enum BookingStatus {
  Pending = 'pendiente',
  Confirmed = 'confirmado',
  Cancelled = 'cancelado',
  Completed = 'completado',
}

export interface Client {
  id?: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface Barber {
  id: string;
  name: string;
}

export interface Booking {
  id: string;
  client: Client;
  serviceId: string;
  barberId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}