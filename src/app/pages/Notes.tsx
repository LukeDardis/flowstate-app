import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2, Save, X, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const saved = localStorage.getItem('flowtime-notes');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotes(parsed);
      if (parsed.length > 0 && !selectedNote) {
        setSelectedNote(parsed[0]);
      }
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('flowstate-notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    toast.success('New note created');
  };

  const startEditing = () => {
    if (!selectedNote) return;
    setIsEditing(true);
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
  };

  const saveEdit = () => {
    if (!selectedNote) return;
    
    const updatedNote: Note = {
      ...selectedNote,
      title: editTitle,
      content: editContent,
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id ? updatedNote : note
    );
    saveNotes(updatedNotes);
    setSelectedNote(updatedNote);
    setIsEditing(false);
    toast.success('Note saved');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    saveNotes(updatedNotes);
    
    if (selectedNote?.id === id) {
      setSelectedNote(updatedNotes[0] || null);
    }
    toast.success('Note deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-1">Journal your thoughts and reflections</p>
        </div>
        <Button onClick={createNewNote}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <Card className="p-4 lg:col-span-1">
          <h2 className="font-semibold text-lg mb-4">All Notes</h2>
          <div className="space-y-2">
            {notes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No notes yet. Create your first note to get started.
              </p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors group ${
                    selectedNote?.id === note.id
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{note.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-100 rounded transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Note Editor */}
        <Card className="p-6 lg:col-span-2">
          {!selectedNote ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No note selected</h3>
              <p className="text-gray-500 mb-6">Select a note or create a new one to start writing</p>
              <Button onClick={createNewNote}>
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Note title"
                className="text-xl font-semibold"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Start writing..."
                className="w-full min-h-[400px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <Button onClick={saveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedNote.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {format(new Date(selectedNote.updatedAt), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="prose max-w-none">
                {selectedNote.content ? (
                  <div className="whitespace-pre-wrap text-gray-700">{selectedNote.content}</div>
                ) : (
                  <p className="text-gray-400 italic">No content yet. Click Edit to start writing.</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}