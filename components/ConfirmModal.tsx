import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-50">{title}</h3>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-4 border-t border-zinc-800 flex items-center justify-end gap-3 bg-zinc-950/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-zinc-400 hover:text-zinc-200 font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
