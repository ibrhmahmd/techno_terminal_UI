import { useState, useMemo } from 'react'
import { AttendanceGrid } from '../attendance/AttendanceGrid'
import { LevelSelector } from './detail/LevelSelector'
import type { GroupLevelHistoryDTO, Session } from '../../api/academics'

interface AttendanceTabProps {
  groupId: number
  levels: GroupLevelHistoryDTO[]
  sessions: Session[]
  activeLevelId: number | null
  currentLevelNumber: number
  instructorName?: string
  onLevelChange: (levelId: number) => void
}

export function AttendanceTab({
  groupId,
  levels,
  sessions,
  activeLevelId,
  currentLevelNumber,
  instructorName,
  onLevelChange,
}: AttendanceTabProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(activeLevelId)
  
  const selectedLevel = useMemo(() => 
    levels.find(l => l.id === selectedLevelId) || null
  , [levels, selectedLevelId])
  
  const levelSessions = useMemo(() => 
    sessions.filter(s => s.level_number === selectedLevel?.level_number)
  , [sessions, selectedLevel])

  const handleLevelChange = (levelId: number) => {
    setSelectedLevelId(levelId)
    onLevelChange(levelId)
  }

  return (
    <div className="space-y-6">
      <LevelSelector 
        levels={levels}
        activeLevelId={selectedLevelId}
        onLevelChange={handleLevelChange}
        currentLevelNumber={currentLevelNumber}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <AttendanceGrid 
            sessions={levelSessions}
            groupId={groupId}
            level={selectedLevel?.level_number || currentLevelNumber}
            groupInstructorName={instructorName}
          />
        </div>
      </div>
    </div>
  )
}

export default AttendanceTab
