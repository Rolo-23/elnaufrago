
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = onLogin(password);
      if (!success) {
        setError('Contraseña incorrecta. Intenta de nuevo.');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Acceso de Administrador">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-gray-300 text-sm">Ingresa la contraseña para acceder al panel de administración.</p>
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="pt-4 flex justify-end">
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Entrar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};