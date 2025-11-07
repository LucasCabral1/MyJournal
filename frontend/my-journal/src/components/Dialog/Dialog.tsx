import * as React from 'react';
import { Dialog } from '@base-ui-components/react/dialog';
import styles from './dialog-styles.module.css'; // Vou assumir que o CSS é o mesmo

// Definimos os tipos de props que nosso componente aceitará
interface DialogoCustomizadoProps {
  triggerText: string;
  title: string;
  children: React.ReactNode; // Permite passar qualquer elemento React
}

export default function DialogoCustomizado({
  triggerText,
  title,
  children,
}: DialogoCustomizadoProps) {
  return (
    <Dialog.Root>
      {/* Usamos a prop 'triggerText' aqui */}
      <Dialog.Trigger className={styles.Button}>{triggerText}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.Backdrop} />
        <Dialog.Popup className={styles.Popup}>
          
          {/* Usamos a prop 'title' aqui */}
          <Dialog.Title className={styles.Title}>{title}</Dialog.Title>

          {/* 'children' é renderizado aqui. 
            Qualquer JSX que você passar entre <DialogoCustomizado>...</DialogoCustomizado>
            será inserido neste local.
          */}
          <div>{children}</div>

          <div className={styles.Actions}>
            <Dialog.Close className={styles.Button}>Fechar</Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}