import { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import { Task } from '../types';
import { storage } from '../storage';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
    
    // Refresh tasks when component mounts
    const interval = setInterval(loadTasks, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = () => {
    const loadedTasks = storage.getTasks();
    setTasks(loadedTasks);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-serif text-[#1a1f2e]">Tasks</h1>
        <p className="text-[#5a5f72] mt-2">
          Organize your tasks with categories, priorities, step-by-step plans, and meaningful reflections
        </p>
      </div>

      <div className="max-w-4xl">
        <TaskList />
      </div>
    </div>
  );
}