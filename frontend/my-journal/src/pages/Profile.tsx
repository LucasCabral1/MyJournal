import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  CalendarDays,
  Shield,
  CheckCircle,
  Edit,
  AlertTriangle,
  BookMarked,
  Library,
} from 'lucide-react';
import Button from '../components/Button';
import { useAuthStore } from '../stores/authStore'; 
import toast from 'react-hot-toast';
import Loader from '../components/Loading/Loading';


interface UserProfileData {
  id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string; 
  is_active: boolean;
  is_admin: boolean;
  articles_count: number;
  journals_count: number;
}

const API_BASE_URL = '/api';

const ProfilePage: React.FC = () => {
  const [user, setUser] = React.useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

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

        const data: UserProfileData = await response.json();
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
            <User size={40} />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {displayName}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mt-2 mb-6">
            @{user.username}
          </p>

          <Button variant="secondary" icon={<Edit size={18} />}>
            Editar Perfil
          </Button>
        </div>

        <hr className="my-8 border-gray-200" />

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">
          Detalhes da Conta
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard icon={<Mail size={20} />} title="Email" value={user.email} />
          <InfoCard
            icon={<CalendarDays size={20} />}
            title="Membro desde"
            value={formatDate(user.created_at)}
          />
          <InfoCard
            icon={<CheckCircle size={20} />}
            title="Status"
            value={
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.is_active ? 'Ativo' : 'Inativo'}
              </span>
            }
          />
          <InfoCard
            icon={<Shield size={20} />}
            title="Nível de Acesso"
            value={
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_admin
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user.is_admin ? 'Administrador' : 'Usuário'}
              </span>
            }
          />
        </div>

        <hr className="my-8 border-gray-200" />

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Suas Estatísticas
        </h2>
        <div className="flex flex-col sm:flex-row justify-around items-center gap-6">
          <StatCard
            icon={<BookMarked size={30} />}
            label="Artigos Salvos"
            value={user.articles_count}
          />
          <StatCard
            icon={<Library size={30} />}
            label="Journals Seguidos"
            value={user.journals_count}
          />
        </div>
      </div>
    </div>
  );
};


interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value }) => (
  <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div className="text-cyan-600 mt-1 mr-3 flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-md font-semibold text-gray-900 break-words">
        {value}
      </p>
    </div>
  </div>
);


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