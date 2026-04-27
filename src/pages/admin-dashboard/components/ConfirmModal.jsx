import React from 'react';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';

const ConfirmModal = ({ isOpen, title, message, confirmLabel, confirmVariant = 'default', onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-foreground opacity-50" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Icon name="AlertTriangle" size={20} color="var(--color-warning)" />
          </div>
          <div>
            <h3 id="confirm-title" className="font-heading font-semibold text-foreground text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 font-body">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;