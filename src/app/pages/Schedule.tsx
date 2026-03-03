import { useState, useEffect } from 'react';
import WeekView from '../components/WeekView';
import GoogleCalendarSettings from '../components/GoogleCalendarSettings';
import { Task } from '../types';
import { storage } from '../storage';

export default function Schedule() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const loadedTasks = storage.getTasks();
    setTasks(loadedTasks);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Work Schedule</h1>
        <p className="text-gray-600 mt-2">
          Plan your week with 90-minute work blocks, breaks, and meetings
        </p>
      </div>

      <GoogleCalendarSettings />

      <WeekView tasks={tasks} />
    </div>
  );
}