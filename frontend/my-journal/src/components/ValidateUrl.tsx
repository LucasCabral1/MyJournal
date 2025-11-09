// GerenciadorDeJornais.tsx
import { useState } from 'react';
import { Newspaper, Plus } from 'lucide-react'; // Ícones
import toast from 'react-hot-toast'; // Notificações
import DialogoCustomizado from './Dialog/Dialog';
import { Dialog } from '@base-ui-components/react';


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
  const [journalList, setJournalList] = useState<string[]>([]);
  
  const [currentUrl, setCurrentUrl] = useState('');

  const handleAddJournal = (event: React.FormEvent) => {
    event.preventDefault();


    const validation = validateUrl(currentUrl);

    if (validation.isValid) {
      setJournalList((prevList) => [...prevList, currentUrl]);
      toast.success('Jornal adicionado com sucesso!');
      setCurrentUrl(''); 

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
        <form onSubmit={handleAddJournal}>
          <Dialog.Description className="mb-4 text-gray-600">
            Insira a URL completa (com https://) do jornal digital.
          </Dialog.Description>
          
          <input
            type="url"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            placeholder="https://www.jornalexemplo.com"
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
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '8px',
              marginTop: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            Salvar
          </button>
        </form>
      </DialogoCustomizado>

      <hr style={{ margin: '32px 0' }} />

      <h3 className="text-lg font-semibold">Jornais Adicionados:</h3>
      {journalList.length === 0 ? (
        <p className="text-gray-500">Nenhum jornal adicionado ainda.</p>
      ) : (
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {journalList.map((url, index) => (
            <li key={index}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}