import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ui/Toast';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedDate?: Date;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({ isOpen, onClose, preSelectedDate }) => {
  const { services, barbers, addBooking } = useAppContext();
  const { showToast } = useToast();
  
  const [serviceId, setServiceId] = useState('');
  const [barberId, setBarberId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form or set defaults
      const initialDate = preSelectedDate || new Date();
      setDate(format(initialDate, 'yyyy-MM-dd'));
      // Default time to next hour
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      setTime(format(nextHour, 'HH:mm'));
      
      setServiceId(services.length > 0 ? services[0].id : '');
      setBarberId(barbers.length > 0 ? barbers[0].id : '');
      setClientName('');
      setClientPhone('');
    }
  }, [isOpen, preSelectedDate, services, barbers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceId || !barberId || !date || !time || !clientName) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    setIsLoading(true);

    // Construct Date object from date and time strings
    const dateTimeString = `${date}T${time}`;
    const startTime = new Date(dateTimeString);

    const result = await addBooking(
      { name: clientName, phone: clientPhone || '0000000000' }, 
      serviceId, 
      barberId, 
      startTime
    );

    setIsLoading(false);

    if (result.success) {
      showToast('Turno agendado manualmente con éxito', 'success');
      onClose();
    } else {
      showToast('Error al agendar. Verifica disponibilidad.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar Turno Manualmente">
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
        <p className="text-sm text-gray-400 mb-4">
          Registra un turno recibido por WhatsApp o teléfono.
        </p>

        <Select 
          label="Servicio" 
          value={serviceId} 
          onChange={(e) => setServiceId(e.target.value)}
          required
        >
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
          ))}
        </Select>

        <Select 
          label="Barbero" 
          value={barberId} 
          onChange={(e) => setBarberId(e.target.value)}
          required
        >
          {barbers.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Fecha" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input 
            label="Hora" 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <Input 
          label="Nombre del Cliente" 
          placeholder="Ej: Cliente WhatsApp" 
          value={clientName} 
          onChange={(e) => setClientName(e.target.value)}
          required
        />

        <Input 
          label="Teléfono (Opcional)" 
          placeholder="Ej: 549..." 
          value={clientPhone} 
          onChange={(e) => setClientPhone(e.target.value)}
        />

        <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                Agendar Turno
            </Button>
        </div>
      </form>
    </Modal>
  );
};
