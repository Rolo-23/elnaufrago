
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Booking, Service, Barber, Notification, Client, BookingStatus } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabaseClient';

interface AppContextType {
  bookings: Booking[];
  services: Service[];
  barbers: Barber[];
  notifications: Notification[];
  adminPhoneNumber: string;
  businessHoursStart: number;
  businessHoursEnd: number;
  appName: string;
  isLoading: boolean;
  addBooking: (client: Omit<Client, 'id'>, serviceId: string, barberId: string, startTime: Date) => Promise<{ success: boolean; whatsappUrl?: string }>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<{ success: boolean; whatsappUrl?: string }>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  addNotification: (message: string) => void;
  markNotificationsAsRead: () => void;
  updateAdminPhoneNumber: (phone: string) => Promise<void>;
  updateBusinessHours: (start: number, end: number) => Promise<void>;
  updateAppName: (name: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminPhoneNumber, setAdminPhoneNumber] = useState('');
  const [businessHoursStart, setBusinessHoursStart] = useState(9);
  const [businessHoursEnd, setBusinessHoursEnd] = useState(19);
  const [appName, setAppName] = useState('Barber Trap');
  const [isLoading, setIsLoading] = useState(true);

  const addNotification = useCallback((message: string) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      message,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [barbersRes, servicesRes, bookingsRes, settingsRes] = await Promise.all([
        supabase.from('barbers').select('*'),
        supabase.from('services').select('*'),
        supabase.from('bookings').select('*, client:clients(*)'),
        supabase.from('settings').select('*')
      ]);

      if (barbersRes.error) throw barbersRes.error;
      setBarbers(barbersRes.data || []);

      if (servicesRes.error) throw servicesRes.error;
      setServices(servicesRes.data || []);

      if (bookingsRes.error) throw bookingsRes.error;
      const mappedBookings = (bookingsRes.data || []).map(b => ({
        id: b.id,
        client: b.client as Client,
        serviceId: b.service_id,
        barberId: b.barber_id,
        startTime: new Date(b.start_time),
        endTime: new Date(b.end_time),
        status: b.status,
      })) as Booking[];
      setBookings(mappedBookings);
      
      if (settingsRes.data) {
        const settingsMap = new Map(settingsRes.data.map(s => [s.key, s.value]));
        setAdminPhoneNumber(String(settingsMap.get('admin_phone_number') || ''));
        setBusinessHoursStart(Number(settingsMap.get('business_hours_start') || 9));
        setBusinessHoursEnd(Number(settingsMap.get('business_hours_end') || 19));
        setAppName(String(settingsMap.get('app_name') || 'Barber Trap'));
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      addNotification("Error al cargar los datos desde la base de datos.");
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addBooking = useCallback(async (client: Omit<Client, 'id'>, serviceId: string, barberId: string, startTime: Date): Promise<{ success: boolean; whatsappUrl?: string }> => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return { success: false };

    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .upsert({ name: client.name, phone: client.phone, email: client.email }, { onConflict: 'phone' })
        .select()
        .single();

      if (clientError) throw clientError;
      if (!clientData) throw new Error("Could not create or find client.");

      const newBookingData = {
        client_id: clientData.id,
        service_id: serviceId,
        barber_id: barberId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: BookingStatus.Pending,
      };

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert(newBookingData)
        .select('*, client:clients(*)')
        .single();
      
      if (bookingError) {
        console.error("Error creating booking:", bookingError);
        return { success: false };
      }

      if (bookingData) {
        const newBooking: Booking = {
          id: bookingData.id,
          client: bookingData.client as Client,
          serviceId: bookingData.service_id,
          barberId: bookingData.barber_id,
          startTime: new Date(bookingData.start_time),
          endTime: new Date(bookingData.end_time),
          status: bookingData.status,
        };
        setBookings(prev => [...prev, newBooking].sort((a,b) => a.startTime.getTime() - b.startTime.getTime()));
        
        const formattedDate = format(startTime, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
        const notificationMessage = `Nueva Reserva! Cliente: ${client.name}, Fecha: ${formattedDate}, Servicio: ${service.name}, Teléfono: ${client.phone}.`;
        addNotification(notificationMessage);

        let whatsappUrl: string | undefined = undefined;
        if (adminPhoneNumber) {
          const whatsappMessage = `*Nueva Reserva - ${appName}* 💈\n\n*Cliente:* ${client.name}\n*Servicio:* ${service.name}\n*Fecha:* ${format(startTime, "eeee dd/MM", { locale: es })}\n*Hora:* ${format(startTime, "HH:mm", { locale: es })}\n*Teléfono:* ${client.phone}`;
          whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        }

        return { success: true, whatsappUrl };
      }
      return { success: false };
    } catch (error) {
      console.error("Error in addBooking process:", error);
      return { success: false };
    }
  }, [services, addNotification, adminPhoneNumber, appName]);

  const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<{ success: boolean; whatsappUrl?: string }> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select('*, client:clients(*)')
        .single();

      if (error) throw error;
      
      if (data) {
        const updatedBooking: Booking = {
          id: data.id,
          client: data.client as Client,
          serviceId: data.service_id,
          barberId: data.barber_id,
          startTime: new Date(data.start_time),
          endTime: new Date(data.end_time),
          status: data.status,
        };

        setBookings(prev =>
          prev.map(b => (b.id === bookingId ? updatedBooking : b))
        );
        
        const service = services.find(s => s.id === updatedBooking.serviceId);
        let notifMessage = '';
        let whatsappUrl: string | undefined = undefined;

        if (status === BookingStatus.Confirmed) {
            notifMessage = `Turno de ${updatedBooking.client.name} ha sido confirmado.`;
            if (updatedBooking.client.phone) {
                const sanitizedPhone = String(updatedBooking.client.phone).replace(/\D/g, '');
                if (sanitizedPhone) {
                    const whatsappMessage = `*¡Turno Confirmado en ${appName}!* ✅\n\n¡Hola ${updatedBooking.client.name}!\n\nTe confirmamos tu turno para el servicio de *${service?.name}*.\n\n*Fecha:* ${format(updatedBooking.startTime, "eeee dd/MM/yyyy", { locale: es })}\n*Hora:* ${format(updatedBooking.startTime, "HH:mm", { locale: es })}\n\n¡Te esperamos!`;
                    whatsappUrl = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(whatsappMessage)}`;
                }
            }
        } else if (status === BookingStatus.Cancelled) {
          notifMessage = `Turno de ${updatedBooking.client.name} (${service?.name || 'servicio'}) ha sido cancelado.`;
          if (updatedBooking.client.phone) {
            const sanitizedPhone = String(updatedBooking.client.phone).replace(/\D/g, '');
            if (sanitizedPhone) {
                const whatsappMessage = `Hola ${updatedBooking.client.name}, te escribimos de *${appName}*.\n\nLo sentimos no estamos disponibles esa fecha ¿para cuando podriamos reprogramar? , disculpa las molestias`;
                whatsappUrl = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(whatsappMessage)}`;
            }
          }
        } else if (status === BookingStatus.Completed) {
            notifMessage = `Turno de ${updatedBooking.client.name} (${service?.name || 'servicio'}) completado y archivado.`;
        }

        if (notifMessage) addNotification(notifMessage);
        return { success: true, whatsappUrl };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating booking status:', error);
      addNotification("Error al actualizar el estado del turno.");
      return { success: false };
    }
  };
    
  const addService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setServices(prev => [...prev, data]);
        addNotification(`Nuevo servicio "${data.name}" añadido.`);
      }
    } catch (error) {
      console.error('Error adding service:', error);
      addNotification("Error al añadir el nuevo servicio.");
    }
  };

  const updateService = async (updatedService: Service) => {
    try {
        const { data, error } = await supabase
            .from('services')
            .update({ name: updatedService.name, price: updatedService.price, duration: updatedService.duration })
            .eq('id', updatedService.id)
            .select()
            .single();
        if (error) throw error;
        if(data) {
            setServices(prev =>
              prev.map(s => (s.id === updatedService.id ? data as Service : s))
            );
            addNotification(`Servicio "${updatedService.name}" actualizado.`);
        }
    } catch (error) {
        console.error('Error updating service:', error);
        addNotification("Error al actualizar el servicio.");
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', serviceId);
        if (error) throw error;
        const deletedServiceName = services.find(s => s.id === serviceId)?.name;
        setServices(prev => prev.filter(s => s.id !== serviceId));
        addNotification(`Servicio "${deletedServiceName}" eliminado.`);
    } catch (error) {
        console.error('Error deleting service:', error);
        addNotification("Error al eliminar el servicio.");
    }
  };
    
  const updateAdminPhoneNumber = async (phone: string) => {
    try {
        const { error } = await supabase
            .from('settings')
            .upsert({ key: 'admin_phone_number', value: phone });
        if (error) throw error;
        setAdminPhoneNumber(phone);
    } catch (error) {
        console.error('Error updating admin phone number:', error);
        addNotification("Error al guardar el número de teléfono.");
    }
  };

  const updateBusinessHours = async (start: number, end: number) => {
    try {
        const { error } = await supabase.from('settings').upsert([
            { key: 'business_hours_start', value: String(start) },
            { key: 'business_hours_end', value: String(end) }
        ]);
        if (error) throw error;
        setBusinessHoursStart(start);
        setBusinessHoursEnd(end);
    } catch (error) {
        console.error('Error updating business hours:', error);
        addNotification("Error al guardar el horario de atención.");
    }
  };

  const updateAppName = async (name: string) => {
    try {
        const { error } = await supabase
            .from('settings')
            .upsert({ key: 'app_name', value: name });
        if (error) throw error;
        setAppName(name);
    } catch (error) {
        console.error('Error updating app name:', error);
        addNotification("Error al guardar el nombre de la aplicación.");
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{ bookings, services, barbers, notifications, adminPhoneNumber, businessHoursStart, businessHoursEnd, appName, isLoading, addBooking, updateBookingStatus, addService, updateService, deleteService, addNotification, markNotificationsAsRead, updateAdminPhoneNumber, updateBusinessHours, updateAppName }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
