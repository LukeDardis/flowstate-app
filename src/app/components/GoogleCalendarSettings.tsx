import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Cloud, CloudOff, Calendar } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

export default function GoogleCalendarSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
    
    // Listen for OAuth popup messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'google-auth-success') {
        checkConnectionStatus();
        toast.success('Google Calendar connected successfully!');
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ed111199/google/status`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ed111199/google/auth/url`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Open OAuth popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        data.authUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast.error('Failed to connect to Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ed111199/google/disconnect`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        setIsConnected(false);
        toast.success('Google Calendar disconnected');
      } else {
        toast.error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      // Get scheduled events from local storage
      const scheduleData = localStorage.getItem('flowstate-schedule');
      if (!scheduleData) {
        toast.info('No events to sync');
        return;
      }

      const schedule = JSON.parse(scheduleData);
      const events = Object.values(schedule)
        .flat()
        .filter((event: any) => event.type === 'work')
        .map((event: any) => ({
          title: event.title || 'Work Session',
          description: `90-minute work block - ${event.title || 'Focused work time'}`,
          startDateTime: new Date(event.start).toISOString(),
          endDateTime: new Date(event.end).toISOString(),
        }));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ed111199/google/sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const successCount = data.results.filter((r: any) => r.success).length;
        toast.success(`Synced ${successCount} event(s) to Google Calendar`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to sync events');
      }
    } catch (error) {
      console.error('Error syncing events:', error);
      toast.error('Failed to sync events');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
            {isConnected ? (
              <Cloud className="h-5 w-5 text-green-600" />
            ) : (
              <CloudOff className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Google Calendar</h3>
            <p className="text-sm text-gray-600 mt-1">
              {isConnected
                ? 'Connected - Sync your FlowState schedule to Google Calendar'
                : 'Connect to sync your work blocks with Google Calendar'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isLoading}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Sync Events
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isLoading}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={handleConnect} disabled={isLoading}>
              Connect
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}