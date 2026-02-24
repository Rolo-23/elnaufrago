import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { Select } from './ui/Select';

const HourSelect: React.FC<{ label: string; value: number; onChange: (value: number) => void; }> = ({ label, value, onChange }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
    return (
        <Select label={label} value={value} onChange={e => onChange(Number(e.target.value))}>
            {hours.map(hour => (
                <option key={hour} value={hour}>
                    {`${String(hour).padStart(2, '0')}:00`}
                </option>
            ))}
        </Select>
    );
};

export default function SettingsView() {
    const { adminPhoneNumber, updateAdminPhoneNumber, businessHoursStart, businessHoursEnd, updateBusinessHours, appName, updateAppName } = useAppContext();
    const { showToast } = useToast();
    
    const [phone, setPhone] = useState(adminPhoneNumber);
    const [startHour, setStartHour] = useState(businessHoursStart);
    const [endHour, setEndHour] = useState(businessHoursEnd);
    const [currentAppName, setCurrentAppName] = useState(appName);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setPhone(adminPhoneNumber);
        setStartHour(businessHoursStart);
        setEndHour(businessHoursEnd);
        setCurrentAppName(appName);
    }, [adminPhoneNumber, businessHoursStart, businessHoursEnd, appName]);

    const handleSave = async () => {
        setIsLoading(true);
        await Promise.all([
            updateAdminPhoneNumber(phone),
            updateBusinessHours(startHour, endHour),
            updateAppName(currentAppName)
        ]);
        setIsLoading(false);
        showToast("Configuración guardada con éxito", "success");
    };
    
    const handleTestWhatsApp = () => {
        if (!phone.trim()) {
            showToast("Por favor, ingresa un número de WhatsApp primero.", "error");
            return;
        }
        const testMessage = `Prueba de notificación de ${appName}`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(testMessage)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <Card>
            <h3 className="text-2xl font-bold text-white mb-6">Configuración General</h3>
            <div className="max-w-md space-y-6">
                <div>
                     <h4 className="text-lg font-semibold text-gray-100 mb-2">Personalización</h4>
                     <Input
                        label="Nombre de la Aplicación"
                        value={currentAppName}
                        onChange={(e) => setCurrentAppName(e.target.value)}
                        placeholder="Ej: Barber Trap"
                    />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-2">Notificaciones</h4>
                    <Input
                        label="Número de WhatsApp"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej: 5491122334455"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Ingresa el número completo con código de país, sin '+' ni espacios. Aquí se enviarán las notificaciones de nuevos turnos.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-2">Horario de Atención</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <HourSelect label="Apertura" value={startHour} onChange={setStartHour} />
                        <HourSelect label="Cierre" value={endHour} onChange={setEndHour} />
                    </div>
                </div>

                <div className="pt-4 flex items-center flex-wrap gap-2">
                    <Button onClick={handleSave} isLoading={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button onClick={handleTestWhatsApp} variant="secondary">
                        Enviar test de WhatsApp
                    </Button>
                </div>
            </div>
        </Card>
    );
}