interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center text-3xl z-40"
      style={{ boxShadow: '0 8px 32px 0 var(--shadow)' }}
      title="Создать новое дело"
    >
      +
    </button>
  );
}
