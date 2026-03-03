import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, ListOrdered, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Task } from '../types';
import { storage } from '../storage';
import { toast } from 'sonner';

interface TaskListProps {
  onSelectTask?: (task: Task) => void;
  selectedTaskId?: string;
  compact?: boolean;
}

export default function TaskList({ onSelectTask, selectedTaskId, compact = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedBlocks: 1,
    category: 'none' as 'none' | 'work' | 'social' | 'networking' | 'spiritual' | 'exercise/PT',
    steps: [''],
    reflection: {
      skills: '',
      virtues: '',
      service: '',
    },
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const loadedTasks = storage.getTasks();
    setTasks(loadedTasks);
  };

  const handleAddTask = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: formData.priority,
      estimatedBlocks: formData.estimatedBlocks,
      category: formData.category === 'none' ? undefined : formData.category,
      steps: formData.steps.filter(s => s.trim() !== ''),
      reflection: {
        skills: formData.reflection.skills || undefined,
        virtues: formData.reflection.virtues || undefined,
        service: formData.reflection.service || undefined,
      },
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
    
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      estimatedBlocks: 1,
      category: 'none',
      steps: [''],
      reflection: {
        skills: '',
        virtues: '',
        service: '',
      },
    });
    setShowAddForm(false);
    toast.success('Task added successfully');
  };

  const handleUpdateTask = (id: string) => {
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            estimatedBlocks: formData.estimatedBlocks,
            category: formData.category === 'none' ? undefined : formData.category,
            steps: formData.steps.filter(s => s.trim() !== ''),
            reflection: {
              skills: formData.reflection.skills || undefined,
              virtues: formData.reflection.virtues || undefined,
              service: formData.reflection.service || undefined,
            },
          }
        : task
    );

    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
    setEditingId(null);
    toast.success('Task updated successfully');
  };

  const handleToggleComplete = (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
    toast.success('Task deleted');
  };

  const handleEditClick = (task: Task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      estimatedBlocks: task.estimatedBlocks || 1,
      category: task.category || 'none',
      steps: task.steps && task.steps.length > 0 ? task.steps : [''],
      reflection: {
        skills: task.reflection?.skills || '',
        virtues: task.reflection?.virtues || '',
        service: task.reflection?.service || '',
      },
    });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, ''],
    });
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({
      ...formData,
      steps: newSteps,
    });
  };

  const removeStep = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      steps: newSteps.length > 0 ? newSteps : [''],
    });
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'work':
        return 'bg-[#eaedfe] text-[#4f6ef7] border-[#4f6ef7]';
      case 'social':
        return 'bg-[#fde8ec] text-[#e85d75] border-[#e85d75]';
      case 'networking':
        return 'bg-[#eaedfe] text-[#4f6ef7] border-[#4f6ef7]';
      case 'spiritual':
        return 'bg-[#fef3e2] text-[#f0a030] border-[#f0a030]';
      case 'exercise/PT':
        return 'bg-[#e4f7f0] text-[#2dba7e] border-[#2dba7e]';
      default:
        return 'bg-[#f0ede8] text-[#5a5f72] border-[#e8e4de]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-[#fde8ec] text-[#e85d75] border-[#e85d75]';
      case 'medium':
        return 'bg-[#fef3e2] text-[#f0a030] border-[#f0a030]';
      case 'low':
        return 'bg-[#e4f7f0] text-[#2dba7e] border-[#2dba7e]';
      default:
        return 'bg-[#f0ede8] text-[#5a5f72] border-[#e8e4de]';
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {tasks.filter(t => !t.completed).map((task) => (
          <div
            key={task.id}
            onClick={() => onSelectTask?.(task)}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedTaskId === task.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  {task.estimatedBlocks && (
                    <span className="text-xs text-gray-500">
                      {task.estimatedBlocks} block{task.estimatedBlocks > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Task Button */}
      {!showAddForm && !editingId && (
        <Button onClick={() => setShowAddForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card className="p-4">
          <div className="space-y-3">
            <Input
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Estimated Blocks</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.estimatedBlocks}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedBlocks: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Category (optional)</label>
              <Select
                value={formData.category}
                onValueChange={(value: 'none' | 'work' | 'social' | 'networking' | 'spiritual' | 'exercise/PT') =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="spiritual">Spiritual</SelectItem>
                  <SelectItem value="exercise/PT">Exercise/PT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <ListOrdered className="h-4 w-4 mr-2 text-indigo-600" />
                <h5 className="font-medium text-gray-900">Step-by-Step Breakdown</h5>
              </div>
              <p className="text-xs text-gray-500">What needs to be accomplished?</p>
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                  <Input
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                  />
                  {formData.steps.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={addStep}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-amber-600" />
                <h5 className="font-medium text-gray-900">Reflection</h5>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  What particular skills will this task hone?
                </label>
                <Textarea
                  placeholder="e.g., Communication, problem-solving, technical skills..."
                  value={formData.reflection.skills}
                  onChange={(e) => setFormData({ ...formData, reflection: { ...formData.reflection, skills: e.target.value } })}
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  What virtues will this task cultivate?
                </label>
                <Textarea
                  placeholder="e.g., Patience, discipline, compassion..."
                  value={formData.reflection.virtues}
                  onChange={(e) => setFormData({ ...formData, reflection: { ...formData.reflection, virtues: e.target.value } })}
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  How will this task help me grow in service of others?
                </label>
                <Textarea
                  placeholder="e.g., Helping clients, supporting team, contributing to community..."
                  value={formData.reflection.service}
                  onChange={(e) => setFormData({ ...formData, reflection: { ...formData.reflection, service: e.target.value } })}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {editingId ? (
                <>
                  <Button onClick={() => handleUpdateTask(editingId)} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        title: '',
                        description: '',
                        priority: 'medium',
                        estimatedBlocks: 1,
                        category: 'none',
                        steps: [''],
                        reflection: {
                          skills: '',
                          virtues: '',
                          service: '',
                        },
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleAddTask} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className={`p-4 ${task.completed ? 'opacity-60' : ''} ${
              selectedTaskId === task.id ? 'ring-2 ring-indigo-500' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleComplete(task.id)}
                className="mt-1"
              />
              <div
                className="flex-1"
              >
                <h4
                  className={`font-medium text-gray-900 ${
                    task.completed ? 'line-through' : ''
                  }`}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  {task.estimatedBlocks && (
                    <span className="text-xs text-gray-500">
                      {task.estimatedBlocks} block{task.estimatedBlocks > 1 ? 's' : ''} (
                      {task.estimatedBlocks * 90} min)
                    </span>
                  )}
                  {task.category && (
                    <Badge variant="outline" className={getCategoryColor(task.category)}>
                      {task.category}
                    </Badge>
                  )}
                </div>
                
                {/* Steps Section */}
                {task.steps && task.steps.length > 0 && (
                  <div className="mt-3 space-y-1 bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <ListOrdered className="h-3 w-3 mr-1 text-indigo-600" />
                      Steps:
                    </div>
                    <ol className="space-y-1">
                      {task.steps.map((step, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="mr-2 text-gray-400">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Reflection Section */}
                {(task.reflection?.skills || task.reflection?.virtues || task.reflection?.service) && (
                  <div className="mt-3 space-y-2 bg-amber-50 p-3 rounded-md">
                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Lightbulb className="h-3 w-3 mr-1 text-amber-600" />
                      Reflection:
                    </div>
                    {task.reflection.skills && (
                      <div>
                        <p className="text-xs font-medium text-gray-600">Skills:</p>
                        <p className="text-sm text-gray-700">{task.reflection.skills}</p>
                      </div>
                    )}
                    {task.reflection.virtues && (
                      <div>
                        <p className="text-xs font-medium text-gray-600">Virtues:</p>
                        <p className="text-sm text-gray-700">{task.reflection.virtues}</p>
                      </div>
                    )}
                    {task.reflection.service && (
                      <div>
                        <p className="text-xs font-medium text-gray-600">Service:</p>
                        <p className="text-sm text-gray-700">{task.reflection.service}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditClick(task)}
                  disabled={editingId !== null || showAddForm}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && !showAddForm && (
        <div className="text-center py-12 text-gray-500">
          <p>No tasks yet. Add your first task to get started!</p>
        </div>
      )}
    </div>
  );
}