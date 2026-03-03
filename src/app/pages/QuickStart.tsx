import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Edit2, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Task } from '../types';
import { storage } from '../storage';
import { toast } from 'sonner';

export default function QuickStart() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(90 * 60); // 90 minutes in seconds
  const [customTitle, setCustomTitle] = useState('');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState('90');
  const [totalTime, setTotalTime] = useState(90 * 60); // Total time for progress calculation

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            toast.success('Work session completed! Time for a break.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  const loadTasks = () => {
    const loadedTasks = storage.getTasks();
    setTasks(loadedTasks.filter((t) => !t.completed));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedTaskId && !customTitle) {
      toast.error('Please select a task or enter a custom session title');
      return;
    }
    setIsRunning(true);
    toast.success('Work session started!');
  };

  const handlePause = () => {
    setIsRunning(false);
    toast.info('Session paused');
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(totalTime);
    toast.info('Timer reset');
  };

  const handleEditTime = () => {
    setIsEditingTime(true);
    setEditMinutes(Math.floor(totalTime / 60).toString());
  };

  const handleSaveTime = () => {
    const minutes = parseInt(editMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error('Please enter a valid number of minutes');
      return;
    }
    if (minutes > 480) {
      toast.error('Maximum duration is 480 minutes (8 hours)');
      return;
    }
    const newTotalTime = minutes * 60;
    setTotalTime(newTotalTime);
    setTimeRemaining(newTotalTime);
    setIsEditingTime(false);
    setIsRunning(false);
    toast.success(`Timer set to ${minutes} minutes`);
  };

  const handleCancelEditTime = () => {
    setIsEditingTime(false);
    setEditMinutes(Math.floor(totalTime / 60).toString());
  };

  const getProgressPercentage = () => {
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quick Start</h1>
        <p className="text-gray-600 mt-1">Jump back into work when interrupted</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Card */}
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center gap-3">
              {isEditingTime ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    className="w-20 px-3 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    max="480"
                    disabled={isRunning}
                  />
                  <span className="text-xl font-semibold text-gray-900">Minute Work Session</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveTime}
                    disabled={isRunning}
                    className="ml-2"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEditTime}
                    disabled={isRunning}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {Math.floor(totalTime / 60)}-Minute Work Session
                  </h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditTime}
                    disabled={isRunning}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-64 h-64">
              <svg className="transform -rotate-90 w-64 h-64">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 112}
                  strokeDashoffset={2 * Math.PI * 112 * (1 - getProgressPercentage() / 100)}
                  className="text-indigo-600 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{formatTime(timeRemaining)}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {isRunning ? 'In Progress' : timeRemaining === 0 ? 'Complete' : 'Ready to Start'}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Session Info */}
            {(selectedTask || customTitle) && (
              <div className="w-full p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Session:</p>
                <p className="font-semibold text-gray-900">
                  {selectedTask ? selectedTask.title : customTitle}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              {!isRunning ? (
                <Button size="lg" onClick={handleStart} disabled={timeRemaining === 0}>
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={handlePause}>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Task Selection Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What are you working on?</h2>
          
          <div className="space-y-4">
            {/* Task Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Select from your tasks
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value);
                  if (e.target.value) setCustomTitle('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isRunning}
              >
                <option value="">-- Select a task --</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} {task.priority && `(${task.priority})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Custom Title */}
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Enter custom session title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => {
                  setCustomTitle(e.target.value);
                  if (e.target.value) setSelectedTaskId('');
                }}
                placeholder="e.g., Catch up on emails, Quick bug fix"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isRunning}
              />
            </div>

            {/* Quick Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Quick Start Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Perfect for when you're interrupted mid-session</li>
                    <li>• Select a task or create a custom session</li>
                    <li>• Focus for the full 90 minutes for maximum productivity</li>
                    <li>• Take a 15-minute break after completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}