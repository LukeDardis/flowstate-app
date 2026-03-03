import { Task, TimeBlock, WorkSession } from './types';

const TASKS_KEY = 'flowstate_tasks';
const BLOCKS_KEY = 'flowstate_blocks';
const SESSIONS_KEY = 'flowstate_sessions';

export const storage = {
  // Tasks
  getTasks: (): Task[] => {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },
  
  // Time Blocks
  getBlocks: (): TimeBlock[] => {
    const data = localStorage.getItem(BLOCKS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveBlocks: (blocks: TimeBlock[]) => {
    localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  },
  
  // Work Sessions
  getSessions: (): WorkSession[] => {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveSessions: (sessions: WorkSession[]) => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },
};