import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Activity } from '../types';
import ActivityCard from './ActivityCard';

interface DraggableActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  onReschedule: (activity: Activity) => void;
}

export const DraggableActivityCard: React.FC<DraggableActivityCardProps> = ({
  activity,
  onEdit,
  onDelete,
  onComplete,
  onReschedule,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      <ActivityCard
        activity={activity}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
        onReschedule={onReschedule}
      />
    </div>
  );
};
