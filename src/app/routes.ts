import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Schedule from './pages/Schedule';
import Notes from './pages/Notes';
import QuickStart from './pages/QuickStart';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'quick-start', Component: QuickStart },
      { path: 'tasks', Component: Tasks },
      { path: 'schedule', Component: Schedule },
      { path: 'notes', Component: Notes },
    ],
  },
]);