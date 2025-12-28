import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, UsersIcon, FileTextIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'draft' | 'scheduled';
  timeLimit: number;
  date: string;
  participants: number;
  questions: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusColors = {
  active: 'bg-green-500',
  draft: 'bg-yellow-500',
  scheduled: 'bg-blue-500',
};

const statusLabels = {
  active: 'Active',
  draft: 'Draft',
  scheduled: 'Scheduled',
};

export function QuizCard({
  id,
  title,
  description,
  status,
  timeLimit,
  date,
  participants,
  questions,
  onEdit,
  onDelete,
}: QuizCardProps) {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1.5">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Badge variant="secondary" className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(id)}>
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{timeLimit} minutes</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{participants} participants</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileTextIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{questions} questions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 