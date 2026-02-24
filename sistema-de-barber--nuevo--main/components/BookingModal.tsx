import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { Service } from '../types';
import { useToast } from './ui/Toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingTime: Date;
  service: Service;
  barberId: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, bookingTime, service, barberId }) => {
  const { addBooking } = useAppContext();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'form' | 'success'>('form');
  const [whatsappUrl, setWhatsappUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      // Allow animations to finish before resetting state
      const timer = setTimeout(() => {
        setView('form');
        setName('');
        setPhone('');
        setError('');
        setWhatsappUrl(undefined);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !phone.trim()) {
      setError('Por favor, completa tu nombre y teléfono.');
      return;
    }
    
    const sanitizedPhone = phone.replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(sanitizedPhone)) {
      setError('El formato del teléfono no es válido. Ingresa solo números, incluyendo código de país.');
      return;
    }
    
    setIsLoading(true);
    const result = await addBooking({ name, phone: sanitizedPhone }, service.id, barberId, bookingTime);
    setIsLoading(false);
    if (result.success) {
      showToast('¡Turno reservado con éxito!', 'success');
      setWhatsappUrl(result.whatsappUrl);
      setView('success');
    } else {
      setError('El horario ya no está disponible o hubo un error. Por favor, selecciona otro.');
      showToast('Conflicto de horario. Intenta de nuevo.', 'error');
    }
  };

  const handleNotifyAndClose = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
    onClose();
  };
  
  const renderForm = () => (
    <div className="text-gray-300">
      <p><strong className="text-gray-100">Servicio:</strong> {service.name}</p>
      <p><strong className="text-gray-100">Fecha:</strong> {format(bookingTime, "eeee dd 'de' MMMM", { locale: es })}</p>
      <p><strong className="text-gray-100">Hora:</strong> {format(bookingTime, 'HH:mm', { locale: es })}</p>
      <hr className="my-4 border-gray-600"/>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Nombre Completo" 
          placeholder="Ej: Juan Pérez" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
        <div>
            <Input 
              label="Teléfono (WhatsApp)" 
              placeholder="Ej: 5491122334455" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
            <p className="text-xs text-gray-400 mt-1">
              Incluye código de país y área, sin '+' ni espacios.
            </p>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="pt-4 flex justify-end">
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Reservando...' : 'Confirmar Turno'}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-2xl font-bold text-white mb-2">¡Turno Reservado!</h3>
        <p className="mb-6">Tu turno para el {format(bookingTime, "dd/MM 'a las' HH:mm", { locale: es })} ha sido agendado.</p>
        {whatsappUrl ? (
          <>
            <p className="mb-4 text-sm text-gray-400">
              Haz clic en el botón para notificar al barbero por WhatsApp y finalizar la reserva.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={handleNotifyAndClose} size="lg" className="w-full sm:w-auto">
                Notificar por WhatsApp
              </Button>
              <Button onClick={onClose} variant="secondary" size="lg" className="w-full sm:w-auto">
                Cerrar sin Notificar
              </Button>
            </div>
          </>
        ) : (
            <div className="flex justify-center pt-2">
                <Button onClick={onClose} size="lg">
                    ¡Entendido!
                </Button>
            </div>
        )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={view === 'form' ? "Confirmar Reserva" : "Reserva Exitosa"}>
      {view === 'form' ? renderForm() : renderSuccess()}
    </Modal>
  );
};
