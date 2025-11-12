
import { useEffect, useState, type FormEvent } from 'react';
import { Newspaper, Plus } from 'lucide-react'; 
import toast from 'react-hot-toast'; 
import DialogoCustomizado from './Dialog/Dialog';
import { Dialog } from '@base-ui-components/react';
import type { Journal } from '../interface';
import { useAuthStore } from '../stores/authStore';
import Loader from './Loading/Loading';


function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'Por favor, insira uma URL.' };
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'A URL deve começar com http:// ou https://',
      };
    }
  } catch (err: unknown) {
    let errorMessage = 'O formato da URL é inválido..';
  
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return { isValid: false, error: errorMessage };
  }

  return { isValid: true };
}


export default function ValidadeUrl() {
 const [journalList, setJournalList] = useState<Journal[]>([]);
 
 const [currentUrl, setCurrentUrl] = useState('');

 const [isFormLoading, setIsLoading] = useState(false);
 const [isListLoading, setIsListLoading] = useState(true);

 const token = useAuthStore((state) => state.token);

useEffect(() => {
  const fetchJournals = async () => {
    if (!token) {
      toast.error('Você não está autenticado.');
      setIsListLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8001/api/journal/me', { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const existingJournals: Journal[] = await response.json();
        setJournalList(existingJournals);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Falha ao carregar seus jornais.');
      }

    } catch (error) {
      console.error('Falha na requisição de jornais:', error);
      toast.error('Não foi possível conectar ao servidor.');
    
    } finally {
      setIsListLoading(false); // Para de carregar a lista
    }
  };

  fetchJournals();
  
 }, [token]);

 const handleAddJournal = async (event: FormEvent) => {
  event.preventDefault();

  const validation = validateUrl(currentUrl);

  if (validation.isValid) {

      setIsLoading(true); 
  
      if (!token) {
        toast.error('Erro de autenticação. Faça login novamente.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8001/api/journal', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            url: currentUrl 
          })
        });

        if (response.ok) {
          const newJournal: Journal = await response.json();
          setJournalList((prevList) => [...prevList, newJournal]);
          toast.success(`Jornal "${newJournal.name}" adicionado!`);
          setCurrentUrl(''); 
        
        } else {
          const errorData = await response.json();
          toast.error(errorData.detail || 'Falha ao adicionar o jornal.');
        }

      } catch (error) {
        console.error('Falha na requisição:', error);
        toast.error('Não foi possível conectar ao servidor.');
      
      } finally {
        setIsLoading(false); 
      }
    

  } else {
   toast.error(validation.error!);
  }
 };

  return (
  <div className='mt-12 p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100'>
   <DialogoCustomizado
    triggerText={
     <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Newspaper size={18} />
      Add Journal
     </span>
    }
    title="Adicionar Novo Jornal"
   >
    {}
    {isFormLoading ? (
          
     <div className="flex justify-center items-center py-10 text-gray-500">
            {}
      <Loader size="md" />
     </div>
    ) : (
         
     <form onSubmit={handleAddJournal}>
      <Dialog.Description className="mb-4 text-gray-600">
       Insira a URL completa (com https://) do jornal digital.
      </Dialog.Description>
      
      <input
       type="url"
       value={currentUrl}
       onChange={(e) => setCurrentUrl(e.target.value)}
       placeholder="https://www.jornalexemplo.com"
              // O 'disabled' é importante para evitar digitação durante o load
              disabled={isFormLoading} 
       style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginTop: '16px',
       }}
      />

      <button
       type="submit"
              // O 'disabled' impede cliques duplos
              disabled={isFormLoading} 
       style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '8px',
        marginTop: '16px',
                // Feedback visual de carregamento
        cursor: isFormLoading ? 'wait' : 'pointer', 
                opacity: isFormLoading ? 0.7 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
       }}
      >
       <Plus size={16} />
              {/* Texto dinâmico */}
       {isFormLoading ? 'Salvando...' : 'Salvar'}
      </button>
     </form>
    )}
   </DialogoCustomizado>

   <hr style={{ margin: '32px 0' }} />

   <h3 className="text-lg font-semibold">Jornais Adicionados:</h3>
   {}
   {isListLoading ? (
    <div className="flex justify-center items-center py-10 text-gray-500">
      <Loader size="md" />
    </div>
   ) : journalList.length === 0 ? (
    <p className="text-gray-500">Nenhum jornal adicionado ainda.</p>
   ) : (
    <ul className="list-disc pl-5 mt-2 space-y-1">
     {journalList.map((journal) => (
      <li key={journal.id}>
       <a href={journal.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {journal.name}
       </a>
      </li>
     ))}
    </ul>
   )}
  </div>
 );
}