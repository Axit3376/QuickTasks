import { useState, useEffect, useRef } from 'react'
import './timer.css'

function TaskTimer({ task, onUpdateTime }) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // Initialize elapsed time from task's actual time
  useEffect(() => {
    if (task.actualTimeMinutes) {
      setElapsedSeconds(task.actualTimeMinutes * 60)
    }
  }, [task.actualTimeMinutes])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newSeconds = prev + 1
          // Auto-save every 30 seconds
          if (newSeconds % 30 === 0 && onUpdateTime) {
            onUpdateTime(task.id, Math.floor(newSeconds / 60))
          }
          return newSeconds
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      // Save time when stopped
      if (elapsedSeconds > 0 && onUpdateTime) {
        onUpdateTime(task.id, Math.floor(elapsedSeconds / 60))
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, elapsedSeconds, task.id, onUpdateTime])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggle = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsedSeconds(0)
    if (onUpdateTime) {
      onUpdateTime(task.id, 0)
    }
  }

  return (
    <div className="task-timer">
      <div className="task-timer-display">
        <span className="task-timer-label">Time:</span>
        <span className="task-timer-value">{formatTime(elapsedSeconds)}</span>
      </div>
      <div className="task-timer-controls">
        <button
          className={`task-timer-button ${isRunning ? 'task-timer-stop' : 'task-timer-start'}`}
          type="button"
          onClick={handleToggle}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        {elapsedSeconds > 0 && (
          <button
            className="task-timer-button task-timer-reset"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

export default TaskTimer


