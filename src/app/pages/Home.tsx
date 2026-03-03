import { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, Play, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import Timer from '../components/Timer';
import TaskList from '../components/TaskList';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Task } from '../types';
import { storage } from '../storage';

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const loadedTasks = storage.getTasks();
    setTasks(loadedTasks);
  };

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const totalEstimatedTime = incompleteTasks.reduce(
    (sum, task) => sum + (task.estimatedBlocks || 1) * 90,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif text-[#1a1f2e]">Dashboard</h1>
        <p className="text-[#5a5f72] mt-2">
          Focus on what matters with 90-minute work blocks and strategic breaks
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-[#e8e4de] shadow-[0_2px_16px_rgba(26,31,46,0.07)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#eaedfe] rounded-lg">
              <Target className="h-6 w-6 text-[#4f6ef7]" />
            </div>
            <div>
              <p className="text-sm text-[#5a5f72]">Active Tasks</p>
              <p className="text-2xl font-medium text-[#1a1f2e]">{incompleteTasks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-[#e8e4de] shadow-[0_2px_16px_rgba(26,31,46,0.07)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#e4f7f0] rounded-lg">
              <TrendingUp className="h-6 w-6 text-[#2dba7e]" />
            </div>
            <div>
              <p className="text-sm text-[#5a5f72]">Completed</p>
              <p className="text-2xl font-medium text-[#1a1f2e]">{completedTasks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-[#e8e4de] shadow-[0_2px_16px_rgba(26,31,46,0.07)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#fef3e2] rounded-lg">
              <Clock className="h-6 w-6 text-[#f0a030]" />
            </div>
            <div>
              <p className="text-sm text-[#5a5f72]">Estimated Time</p>
              <p className="text-2xl font-medium text-[#1a1f2e]">
                {Math.floor(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Timer selectedTask={selectedTask} />
        </div>

        {/* Quick Task Selection - Takes 1 column */}
        <div>
          <Card className="p-6 bg-white border border-[#e8e4de] shadow-[0_2px_16px_rgba(26,31,46,0.07)]">
            <h2 className="text-xl font-serif text-[#1a1f2e] mb-4">
              Select a Task
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {incompleteTasks.length > 0 ? (
                <TaskList
                  compact={true}
                  onSelectTask={setSelectedTask}
                  selectedTaskId={selectedTask?.id}
                />
              ) : (
                <div className="text-center py-8 text-[#5a5f72]">
                  <p className="mb-4">No active tasks</p>
                  <a
                    href="/tasks"
                    className="text-[#4f6ef7] hover:text-[#3d5de6] underline"
                  >
                    Create your first task
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <Card className="p-6 bg-gradient-to-r from-[#eaedfe] to-[#fde8ec] border border-[#e8e4de] shadow-[0_2px_16px_rgba(26,31,46,0.07)]">
        <h2 className="text-xl font-serif text-[#1a1f2e] mb-4">
          How FlowState Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#4f6ef7] text-white rounded-full flex items-center justify-center font-medium">
                1
              </div>
              <h3 className="font-medium">90-Minute Work Blocks</h3>
            </div>
            <p className="text-sm text-[#5a5f72]">
              Extended focus sessions allow you to dive deep into complex tasks and achieve flow state.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#4f6ef7] text-white rounded-full flex items-center justify-center font-medium">
                2
              </div>
              <h3 className="font-medium">15-Minute Breaks</h3>
            </div>
            <p className="text-sm text-[#5a5f72]">
              Strategic breaks help you recharge and maintain high productivity throughout the day.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#4f6ef7] text-white rounded-full flex items-center justify-center font-medium">
                3
              </div>
              <h3 className="font-medium">Integrated Planning</h3>
            </div>
            <p className="text-sm text-[#5a5f72]">
              Seamlessly schedule tasks, meetings, and deadlines in one unified calendar view.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/quick-start">
          <Card className="p-6 bg-white border border-[#e8e4de] shadow-[0_2px_16px_rgba(26,31,46,0.07)] hover:shadow-[0_4px_24px_rgba(26,31,46,0.12)] transition-shadow cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#eaedfe] rounded-lg">
                <Play className="h-6 w-6 text-[#4f6ef7]" />
              </div>
              <div>
                <h3 className="font-medium text-[#1a1f2e] mb-1">Quick Start</h3>
                <p className="text-sm text-[#5a5f72]">
                  Jump back into work when interrupted with a simple timer
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/schedule">
          <Card className="p-6 bg-white border border-[#e8e4de] shadow-[0_2px_16px_rgba(26,31,46,0.07)] hover:shadow-[0_4px_24px_rgba(26,31,46,0.12)] transition-shadow cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#e4f7f0] rounded-lg">
                <Calendar className="h-6 w-6 text-[#2dba7e]" />
              </div>
              <div>
                <h3 className="font-medium text-[#1a1f2e] mb-1">Work Schedule</h3>
                <p className="text-sm text-[#5a5f72]">
                  Organize tasks into 90-minute blocks throughout your week
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/notes">
          <Card className="p-6 bg-white border border-[#e8e4de] shadow-[0_2px_16px_rgba(26,31,46,0.07)] hover:shadow-[0_4px_24px_rgba(26,31,46,0.12)] transition-shadow cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#fef3e2] rounded-lg">
                <FileText className="h-6 w-6 text-[#f0a030]" />
              </div>
              <div>
                <h3 className="font-medium text-[#1a1f2e] mb-1">Notes & Journal</h3>
                <p className="text-sm text-[#5a5f72]">
                  Capture thoughts, reflections, and learnings from your work
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}