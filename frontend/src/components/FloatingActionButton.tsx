interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition flex items-center justify-center text-3xl z-40"
      title="Создать новое дело"
    >
      +
    </button>
  );
}
