export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  estimatedBlocks?: number; // How many 90-minute blocks needed
  priority: 'low' | 'medium' | 'high';
  category?: 'work' | 'social' | 'networking' | 'spiritual' | 'exercise/PT';
  steps?: string[]; // Step-by-step breakdown
  reflection?: {
    skills?: string; // What particular skills will this task hone?
    virtues?: string; // What virtues will this task cultivate?
    service?: string; // How will this task help me grow in service of others?
  };
}

export interface TimeBlock {
  id: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  type: 'work' | 'break' | 'meeting' | 'lunch';
  taskId?: string; // Reference to a task
  title?: string; // For meetings or custom blocks
  description?: string;
}

export interface WorkSession {
  id: string;
  startTime: string;
  endTime?: string;
  taskId?: string;
  completed: boolean;
  duration: number; // in milliseconds
}