import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Service } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';

const ServiceForm: React.FC<{ service: Service | Omit<Service, 'id'>, onSave: (service: Service | Omit<Service, 'id'>) => void, onCancel: () => void }> = ({ service, onSave, onCancel }) => {
    const [name, setName] = useState(service.name);
    const [price, setPrice] = useState(service.price);
    const [duration, setDuration] = useState(service.duration);

    const handleSave = () => {
        onSave({ ...service, name, price: Number(price), duration: Number(duration) });
    };

    return (
        <div className="space-y-4">
            <Input label="Nombre del Servicio" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Precio ($)" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
            <Input label="Duración (minutos)" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} />
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar Cambios</Button>
            </div>
        </div>
    );
};

export default function ServicesView() {
    const { services, addService, updateService, deleteService } = useAppContext();
    const [editingService, setEditingService] = useState<Service | Omit<Service, 'id'> | null>(null);
    const [deletingService, setDeletingService] = useState<Service | null>(null);

    const handleAddNew = () => {
        setEditingService({ name: '', price: 0, duration: 30 });
    };

    const handleSave = async (service: Service | Omit<Service, 'id'>) => {
        if ('id' in service && service.id) {
            await updateService(service as Service);
        } else {
            await addService(service);
        }
        setEditingService(null);
    };
    
    const handleConfirmDelete = async () => {
        if (deletingService) {
            await deleteService(deletingService.id);
            setDeletingService(null);
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Gestionar Servicios</h3>
                <Button onClick={handleAddNew}>Nuevo Servicio</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Servicio</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duración</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Precio</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {services.length > 0 ? (
                            services.map(service => (
                                <tr key={service.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{service.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{service.duration} min</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${service.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button size="sm" onClick={() => setEditingService(service)}>Editar</Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingService(service)}>Eliminar</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                    No hay servicios creados. ¡Añade el primero!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingService && (
                <Modal isOpen={!!editingService} onClose={() => setEditingService(null)} title={'id' in editingService && editingService.id ? 'Editar Servicio' : 'Añadir Servicio'}>
                    <ServiceForm 
                        service={editingService} 
                        onSave={handleSave} 
                        onCancel={() => setEditingService(null)} 
                    />
                </Modal>
            )}

            {deletingService && (
                <Modal isOpen={!!deletingService} onClose={() => setDeletingService(null)} title="Confirmar Eliminación">
                    <p className="text-gray-300">¿Estás seguro de que quieres eliminar el servicio "{deletingService.name}"? Esta acción no se puede deshacer.</p>
                    <div className="flex justify-end space-x-2 pt-6">
                        <Button variant="secondary" onClick={() => setDeletingService(null)}>Cancelar</Button>
                        <Button variant="danger" onClick={handleConfirmDelete}>Eliminar</Button>
                    </div>
                </Modal>
            )}
        </Card>
    );
}