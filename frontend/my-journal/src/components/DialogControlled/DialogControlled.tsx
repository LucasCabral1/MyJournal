
import * as React from 'react';
import { Dialog } from '@base-ui-components/react/dialog';
import styles from './dialog-styles.module.css';

interface ControlledDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode; 
  popupClassName?: string;
}

export default function ControlledDialog({
  open,
  onOpenChange,
  title,
  children,
  actions, 
  popupClassName,
}: ControlledDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.Backdrop} />

        <Dialog.Popup
          className={`${styles.Popup} ${popupClassName || ''}`}
        >
          <Dialog.Title className={styles.Title}>{title}</Dialog.Title>

         
          <div className="mb-6">{children}</div>

          <div className={`${styles.Actions} flex justify-end gap-3 items-center`}>
            {actions}
            <Dialog.Close className={styles.Button}>Fechar</Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}