import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Task } from '../types';

interface TimerProps {
  onSessionComplete?: (duration: number) => void;
  selectedTask?: Task | null;
}

const WORK_DURATION = 90 * 60; // 90 minutes in seconds
const BREAK_DURATION = 15 * 60; // 15 minutes in seconds

export default function Timer({ onSessionComplete, selectedTask }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (!isBreak) {
      // Work session completed
      setCompletedSessions((prev) => prev + 1);
      if (onSessionComplete) {
        onSessionComplete(WORK_DURATION);
      }
      
      // Play notification sound (using browser's default)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyAzvLZiTUIGGi777eeUAsQUKrk8bdjHAU7k9nyz3ksCC15y/LdkDwKE1+26eylUxELR6Df8rpqIAUqfc3y24k1CBt1vO+3nlYMEFSs5PC4YhwFOpXY8tB3LAgoeMzx3o8+CRJcuOjsokgTC0Oh4PK7aBwFKX7M8t2INQkdeL7vt55XCxFUreb0u2kdBTmX1/PSdSsHJ3vH8d6OPgkSXLnp7aVLEwtEod/yuWgcBSl+zPLdiDUIH3i+77eeVwwRVKzl8bhjHAU5ltjy0HUrByV7yPHejz0KElq56+ykSRMLQZ/e8bhqHQUofsvx34g2CRt0uu+znlgLEVOr5fG4ZBwFOJXX8tB0KwckfMjx34w/CRJZuOnsokgTC0Ge3fO7aRwGKX7L8d6INQgadb3vsp5ZCxBTq+Xxu2McBTiU1/LQdSsHI3vI8d2OPgkSWbjn7KNJEwpDnt7yu2kdBSh/zfHeiDYJG3a97rSeVwoRUqrk8LhjHAU4lNXy0HYrByR9yPHeij8IElm46OyllEwSCUCf3vO6aRwGJ4DM8d2JNggbdb3vs55YCxBTreTwumYcBTeT1/LReSwHJHzJ8d6NQAkQWbjp66VKEgpCnd3zu2keBih/zPLfiTYIGXW97rOeWAsQVK3m8LtiGwU3ldfy0HYrByN8yPHej0AJEFi45uuoSxIKQZze8rpqHQYogMzy3Yk2CBl0vu+znlkLEFOt5fC7ZhwFN5TW8tF0LAckfcnx3o4/CBJYuOTqqksSDECe3fK6aR4GJ4DM8t6JNggZdL7vs6BXCxFTruXwu2UdBTeV1vLPdCsHJHzI8d+PQAkPWLjm7KhLEQpBnt3yuWkeByiAzPLdiTcJGnW+77OeWQsQU63l8LtnHAY3lNby0HQrByR9yfHejT8JEFa45uuqSxEKPp7e8bppHQcngMrx3Io2CRp0vvCznlgMEFOt5fC7ZhwGN5TW8tF0LAckfcnx3o0/CRBWuOTsqEsRCj+e3vK5ax4HJ4DK8dyJNwgbdL7vs55XDRBSrOTxu2UdBzeU1vLRdiwGJHzJ8d6OPggRV7fk6qlMEQo+nd3yungeByeAyvHdiTcIG3S+77OeWAwRUqzl8LpmHQU3k9Xy0XYsCiN7yPHeij4JEVi25Oyoyw==');
      audio.play().catch(() => {}); // Ignore errors if autoplay is blocked
      
      setIsBreak(true);
      setTimeLeft(BREAK_DURATION);
    } else {
      // Break completed
      setIsBreak(false);
      setTimeLeft(WORK_DURATION);
    }
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_DURATION : WORK_DURATION);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak
    ? ((BREAK_DURATION - timeLeft) / BREAK_DURATION) * 100
    : ((WORK_DURATION - timeLeft) / WORK_DURATION) * 100;

  return (
    <Card className="p-8">
      <div className="text-center">
        {isBreak ? (
          <div className="mb-4">
            <Coffee className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Break Time</h2>
            <p className="text-gray-600 mt-1">Take a 15-minute break</p>
          </div>
        ) : (
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Work Session</h2>
            {selectedTask ? (
              <p className="text-gray-600 mt-1">{selectedTask.title}</p>
            ) : (
              <p className="text-gray-600 mt-1">90-minute focus session</p>
            )}
          </div>
        )}

        {/* Timer Display */}
        <div className="relative mb-8">
          <svg className="transform -rotate-90 w-64 h-64 mx-auto">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              className={isBreak ? 'text-green-500' : 'text-indigo-600'}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-900">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <Button
            size="lg"
            onClick={handleStartPause}
            className={isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button size="lg" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Session Counter */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Sessions completed today: <span className="font-semibold text-gray-900">{completedSessions}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
