import * as React from 'react';
import { Dialog } from '@base-ui-components/react/dialog';
// Assumindo que o arquivo de estilos está no mesmo nível ou acessível
import styles from './Dialog/dialog-styles.module.css'; 
import { CheckCircle } from 'lucide-react';

// Esta é a interface que esperamos da sua API de /refresh
export interface RefreshStatus {
  message: string;
  new_articles_found: number;
  total_articles: number;
}

interface RefreshDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshData: RefreshStatus | null;
}

export default function RefreshDialog({
  open,
  onOpenChange,
  refreshData,
}: RefreshDialogProps) {
  
  // Não renderiza nada se não houver dados
  if (!refreshData) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.Backdrop} />
        <Dialog.Popup className={styles.Popup}>
          
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="text-green-500 mb-4" size={48} />
            
            <Dialog.Title className={styles.Title}>
              Atualização Concluída!
            </Dialog.Title>

            <div className="mt-4 text-gray-700 space-y-2">
              <p>{refreshData.message || "Busca de novos artigos finalizada."}</p>
              <p className="mt-2">
                Novos artigos adicionados:{" "}
                <strong className="text-gray-900">{refreshData.new_articles_found}</strong>
              </p>
              <p>
                Total de artigos salvos:{" "}
                <strong className="text-gray-900">{refreshData.total_articles}</strong>
              </p>
            </div>
          </div>

          <div className={styles.Actions}>
            <Dialog.Close className={styles.Button}>
              Fechar
            </Dialog.Close>
        </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}