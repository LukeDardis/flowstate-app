import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { TimeBlock, Task } from '../types';
import { storage } from '../storage';
import { toast } from 'sonner';

interface WeekViewProps {
  tasks: Task[];
}

export default function WeekView({ tasks }: WeekViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [blockType, setBlockType] = useState<'work' | 'break' | 'meeting' | 'lunch'>('work');
  const [blockTitle, setBlockTitle] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = () => {
    const loadedBlocks = storage.getBlocks();
    setBlocks(loadedBlocks);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  // Wake up section: 6 AM - 9 AM (not bound by 90-minute blocks)
  const wakeUpSlots = Array.from({ length: 6 }, (_, i) => {
    const hour = 6 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });
  
  // Main work blocks: 9 AM - 6 PM (90-minute iterations)
  const workSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = 9 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });
  
  // Evening section: 6 PM onwards (dinner and other activities)
  const eveningSlots = Array.from({ length: 8 }, (_, i) => {
    const hour = 18 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const getBlocksForDateTime = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blocks.filter(
      (block) => block.date === dateStr && block.startTime === time
    );
  };

  const handleAddBlock = () => {
    if (!selectedDate) return;

    const endHour = parseInt(selectedTime.split(':')[0]);
    const endMinute = parseInt(selectedTime.split(':')[1]);
    
    let duration = 90; // Default work block
    if (blockType === 'break') duration = 15;
    if (blockType === 'meeting') duration = 60; // Default meeting length
    if (blockType === 'lunch') duration = 60; // Default lunch length

    const totalMinutes = endHour * 60 + endMinute + duration;
    const newEndHour = Math.floor(totalMinutes / 60);
    const newEndMinute = totalMinutes % 60;

    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: selectedTime,
      endTime: `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`,
      type: blockType,
      taskId: selectedTaskId || undefined,
      title: blockTitle || undefined,
    };

    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    storage.saveBlocks(updatedBlocks);
    
    setShowAddDialog(false);
    setBlockTitle('');
    setSelectedTaskId('');
    setSelectedTime('09:00');
    toast.success('Time block added');
  };

  const handleDeleteBlock = (id: string) => {
    const updatedBlocks = blocks.filter((block) => block.id !== id);
    setBlocks(updatedBlocks);
    storage.saveBlocks(updatedBlocks);
    toast.success('Time block removed');
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'work':
        return 'bg-indigo-100 border-indigo-300 text-indigo-900';
      case 'break':
        return 'bg-green-100 border-green-300 text-green-900';
      case 'meeting':
        return 'bg-purple-100 border-purple-300 text-purple-900';
      case 'lunch':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const getTaskById = (taskId?: string) => {
    return tasks.find((t) => t.id === taskId);
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-lg">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          size="sm"
          onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
        >
          Today
        </Button>
      </div>

      {/* Week Grid */}
      <Card className="p-4 overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header Row */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-sm font-medium text-gray-600">Time</div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`text-center ${
                  isSameDay(day, new Date()) ? 'text-indigo-600 font-semibold' : 'text-gray-900'
                }`}
              >
                <div className="text-sm">{format(day, 'EEE')}</div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>
            ))}
          </div>

          {/* Wake Up Section Label */}
          <div className="grid grid-cols-8 gap-2 mb-2 mt-4">
            <div className="col-span-8">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                  Wake Up Routine (6-9 AM)
                </span>
                <div className="flex-1 h-px bg-amber-200" />
              </div>
            </div>
          </div>

          {/* Wake Up Time Slots */}
          {wakeUpSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-sm text-amber-700 py-2 font-medium">{time}</div>
              {weekDays.map((day) => {
                const dayBlocks = getBlocksForDateTime(day, time);
                return (
                  <div
                    key={`${day.toISOString()}-${time}`}
                    className="min-h-[50px] border border-amber-200 bg-amber-50/30 rounded p-1 relative hover:bg-amber-50 cursor-pointer"
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedTime(time);
                      setShowAddDialog(true);
                    }}
                  >
                    {dayBlocks.length === 0 ? (
                      <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100">
                        <Plus className="h-4 w-4 text-amber-400" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {dayBlocks.map((block) => {
                          const task = getTaskById(block.taskId);
                          return (
                            <div
                              key={block.id}
                              className={`text-xs p-1 rounded border ${getBlockColor(block.type)} relative group`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="font-medium truncate">
                                {task ? task.title : block.title || block.type}
                              </div>
                              <div className="text-xs opacity-75">
                                {block.startTime} - {block.endTime}
                              </div>
                              <button
                                onClick={() => handleDeleteBlock(block.id)}
                                className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Work Section Label */}
          <div className="grid grid-cols-8 gap-2 mb-2 mt-6">
            <div className="col-span-8">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                  90-Minute Work Blocks (9 AM onwards)
                </span>
                <div className="flex-1 h-px bg-indigo-200" />
              </div>
            </div>
          </div>

          {/* Work Time Slots */}
          {workSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-sm text-gray-600 py-2">{time}</div>
              {weekDays.map((day) => {
                const dayBlocks = getBlocksForDateTime(day, time);
                return (
                  <div
                    key={`${day.toISOString()}-${time}`}
                    className="min-h-[60px] border border-gray-200 rounded p-1 relative hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedTime(time);
                      setShowAddDialog(true);
                    }}
                  >
                    {dayBlocks.length === 0 ? (
                      <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100">
                        <Plus className="h-4 w-4 text-gray-400" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {dayBlocks.map((block) => {
                          const task = getTaskById(block.taskId);
                          return (
                            <div
                              key={block.id}
                              className={`text-xs p-1 rounded border ${getBlockColor(block.type)} relative group`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="font-medium truncate">
                                {task ? task.title : block.title || block.type}
                              </div>
                              <div className="text-xs opacity-75">
                                {block.startTime} - {block.endTime}
                              </div>
                              <button
                                onClick={() => handleDeleteBlock(block.id)}
                                className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Evening Section Label */}
          <div className="grid grid-cols-8 gap-2 mb-2 mt-6">
            <div className="col-span-8">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-pink-700 bg-pink-50 px-3 py-1 rounded-full">
                  Evening Activities (6 PM onwards)
                </span>
                <div className="flex-1 h-px bg-pink-200" />
              </div>
            </div>
          </div>

          {/* Evening Time Slots */}
          {eveningSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-sm text-pink-700 py-2 font-medium">{time}</div>
              {weekDays.map((day) => {
                const dayBlocks = getBlocksForDateTime(day, time);
                return (
                  <div
                    key={`${day.toISOString()}-${time}`}
                    className="min-h-[50px] border border-pink-200 bg-pink-50/30 rounded p-1 relative hover:bg-pink-50 cursor-pointer"
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedTime(time);
                      setShowAddDialog(true);
                    }}
                  >
                    {dayBlocks.length === 0 ? (
                      <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100">
                        <Plus className="h-4 w-4 text-pink-400" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {dayBlocks.map((block) => {
                          const task = getTaskById(block.taskId);
                          return (
                            <div
                              key={block.id}
                              className={`text-xs p-1 rounded border ${getBlockColor(block.type)} relative group`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="font-medium truncate">
                                {task ? task.title : block.title || block.type}
                              </div>
                              <div className="text-xs opacity-75">
                                {block.startTime} - {block.endTime}
                              </div>
                              <button
                                onClick={() => handleDeleteBlock(block.id)}
                                className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-100 border border-indigo-300" />
          <span>Work Block (90 min)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
          <span>Break (15 min)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300" />
          <span>Meeting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
          <span>Lunch</span>
        </div>
      </div>

      {/* Add Block Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Block</DialogTitle>
            <DialogDescription>
              Add a new time block to your schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date & Time</label>
              <p className="text-sm text-gray-600">
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Block Type</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={blockType === 'work' ? 'default' : 'outline'}
                  onClick={() => setBlockType('work')}
                  className="w-full"
                >
                  Work (90m)
                </Button>
                <Button
                  variant={blockType === 'lunch' ? 'default' : 'outline'}
                  onClick={() => setBlockType('lunch')}
                  className="w-full"
                >
                  Lunch (60m)
                </Button>
                <Button
                  variant={blockType === 'break' ? 'default' : 'outline'}
                  onClick={() => setBlockType('break')}
                  className="w-full"
                >
                  Break (15m)
                </Button>
                <Button
                  variant={blockType === 'meeting' ? 'default' : 'outline'}
                  onClick={() => setBlockType('meeting')}
                  className="w-full"
                >
                  Meeting (60m)
                </Button>
              </div>
            </div>

            {blockType === 'work' && tasks.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Assign Task (Optional)</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">None</option>
                  {tasks
                    .filter((t) => !t.completed)
                    .map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {(blockType === 'meeting' || blockType === 'lunch' || (blockType === 'work' && !selectedTaskId)) && (
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder={blockType === 'lunch' ? 'e.g., Lunch break, Lunch meeting' : 'Enter block title'}
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAddBlock} className="flex-1">
                Add Block
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}