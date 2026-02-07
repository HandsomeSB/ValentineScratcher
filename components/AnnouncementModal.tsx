'use client';

interface AnnouncementModalProps {
  isOpen: boolean;
  isWin: boolean;
  newWord?: string;
  onNewCard: () => void;
  isGameComplete: boolean;
}

export default function AnnouncementModal({
  isOpen,
  isWin,
  newWord,
  onNewCard,
  isGameComplete,
}: AnnouncementModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4! modal-backdrop"
      style={{ backgroundColor: 'rgba(24, 24, 27, 0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}
    >
      <div
        className={`announcement-popup p-6! ${isWin ? 'result-win' : 'result-lose'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={`text-xl font-semibold mb-4 ${isWin ? 'text-emerald-600' : 'text-red-600'}`}>
          {isWin ? 'You Won a Word!' : 'No Match — Try Again'}
        </p>

        {isWin && newWord && (
          <p className="text-sm font-medium text-rose-600 mb-5">
            New word: &ldquo;{newWord}&rdquo;
          </p>
        )}

        <button onClick={onNewCard} className="btn btn-primary w-full">
          {isGameComplete ? 'See Final Message' : 'Try Another Card'}
        </button>
      </div>
    </div>
  );
}
