import * as React from 'react';
import { Dialog } from '@base-ui-components/react/dialog';
import styles from './dialog-styles.module.css';
import Button from '../Button'; 

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
          className={`${styles.Popup} ${popupClassName || ''} flex flex-col max-h-[70vh]`}
        >
          <Dialog.Title className={`${styles.Title} flex-shrink-0`}>
            {title}
          </Dialog.Title>

          <div className="flex-1 min-h-0 my-4 pr-2">
            {children}
          </div>

          <div className={`${styles.Actions} flex justify-end gap-3 items-center mt-auto flex-shrink-0 pt-4 border-t border-gray-100`}>
            {actions}
            <Button 
              variant="secondary" 
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}