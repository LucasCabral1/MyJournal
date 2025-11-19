import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  CalendarDays,
  Shield,
  CheckCircle,
  Edit,
  AlertTriangle,
  BookMarked,
  CircleUser,
  Bell,
  AtSign,
  Newspaper,
} from 'lucide-react';
import Button from '../components/Button';
import { useAuthStore } from '../stores/store'; 
import toast from 'react-hot-toast';
import Loader from '../components/Loading/Loading';
import type { User } from '../interface';
import InfoCard from '../components/InfoCard';


const API_BASE_URL = '/api';


type UserFormData = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  newsletter_opt_in?: boolean;
};

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    newsletter_opt_in: false,
  });

  const handleEditClick = () => {
    console.log('User before edit:', user);
    if (!user) return;
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username,
      email: user.email,
      newsletter_opt_in: user.newsletter_opt_in,
    });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingUpdate(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Falha ao atualizar o perfil.');
      }

      const updatedUser: User = await response.json();


      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');

    } catch (err: unknown) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setError('Usuário não autenticado. Por favor, faça login.');
        setIsLoading(false);
        toast.error('Usuário não autenticado.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (!response.ok) {
          toast.error('Falha ao buscar dados do perfil.');
          throw new Error('Falha ao buscar dados do perfil.');
        }

        const data: User = await response.json();
        setUser(data);
      } catch (err: unknown) {
        let errorMessage = 'Ocorreu um erro inesperado.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (e : unknown) {
      return e + 'Data inválida'  ;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto my-12 px-4">
        <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100 text-red-600">
          <AlertTriangle size={40} className="mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar perfil</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  const displayName =
    user.first_name || user.last_name
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : user.username;

  const statusSpan = (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {user.is_active ? 'Ativo' : 'Inativo'}
    </span>
  );

  const adminSpan = (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      user.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {user.is_admin ? 'Administrador' : 'Usuário'}
    </span>
  );

  const newsletterSpan = (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      user.newsletter_opt_in ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {user.newsletter_opt_in ? 'Inscrito' : 'Não inscrito'}
    </span>
  );

  return (
    <div className="container mx-auto my-12 px-4">
      <div className="p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
            className="inline-flex items-center justify-center p-5 bg-cyan-100 text-cyan-700 rounded-full mb-6"
          >
            <CircleUser size={40} />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {displayName}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mt-2 mb-6">
            @{user.username}
          </p>

          <Button
          variant="secondary"
          icon={<Edit size={18} />}
          onClick={handleEditClick}
          disabled={isEditing}
        >
          Editar Perfil
        </Button>
        </div>

        <hr className="my-8 border-gray-200" />

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">
          Detalhes da Conta
        </h2>
       <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <InfoCard
              icon={<AtSign size={20} />}
              label="Username"
              isEditing={isEditing}
              displayValue={user.username}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />

            <InfoCard
              icon={<Mail size={20} />}
              label="Email"
              isEditing={isEditing}
              displayValue={user.email}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />

            <InfoCard
              icon={<CalendarDays size={20} />}
              label="Membro desde"
              isEditing={isEditing}
              displayValue={formatDate(user.created_at)}
              type="static"
            />

            <InfoCard
              icon={<CheckCircle size={20} />}
              label="Status"
              isEditing={isEditing}
              displayValue={statusSpan}
              type="static"
            />


            <InfoCard
              icon={<Shield size={20} />}
              label="Nível de Acesso"
              isEditing={isEditing}
              displayValue={adminSpan}
              type="static" 
              value={user.is_admin ? 'Administrador' : 'Usuário'} 
              disabled={true} 

            />

            <InfoCard
              icon={<Bell size={20} />}
              label="Resumo por Email"
              isEditing={isEditing}
              displayValue={newsletterSpan}
              type="checkbox"
              name="newsletter_opt_in"
              checked={formData.newsletter_opt_in}
              onChange={handleInputChange}
            />

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoadingUpdate}
              >
                {isLoadingUpdate ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelClick}
              >
                Cancelar
              </Button>
            </div>
          )}

          </div>  
        </form>

        <hr className="my-8 border-gray-200" />

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Suas Estatísticas
        </h2>
        <div className="flex flex-col sm:flex-row justify-around items-center gap-6">
          <StatCard
            icon={<BookMarked size={30} />}
            label="Artigos Salvos"
            value={user.articles.length}
          />
          <StatCard
            icon={<Newspaper size={30}/>}
            label="Journais Seguidos"
            value={user.journals.length}
          />
        </div>
      </div>
    </div>
  );
};







interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg w-full sm:w-1/2 md:w-1/3 border border-gray-200">
    <div className="text-cyan-600 mb-3">{icon}</div>
    <p className="text-4xl font-bold text-gray-900">{value}</p>
    <p className="text-md text-gray-600">{label}</p>
  </div>
);

export default ProfilePage;