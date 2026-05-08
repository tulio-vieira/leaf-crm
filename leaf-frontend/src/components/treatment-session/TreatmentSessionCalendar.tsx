import { Calendar, momentLocalizer } from 'react-big-calendar'
import type { SlotInfo, View } from 'react-big-calendar'
import moment from 'moment'
import type { TreatmentSession } from '../../models/Domain'
import { useSearchParams } from 'react-router';
import { useState } from 'react';
import TreatmentSessionForm from '../treatment-session/TreatmentSessionForm';

const localizer = momentLocalizer(moment)

export type CalendarView = View
const validViews = ["agenda", "day", "month", "week", "work_week"]

interface Props {
  sessions: TreatmentSession[]
  allowWrites: boolean
  providerSlug: string
  patientId: string
  enabled: boolean
  onUpdateList: () => void
}

export function calcDateRange(date: Date, view: View): { start: string; end: string } {
  const m = moment(date)
  let start: moment.Moment
  let end: moment.Moment
  switch (view) {
    case 'week':
      start = m.clone().startOf('week')
      end = m.clone().endOf('week')
      break
    case 'work_week':
      start = m.clone().startOf('week').add(1, 'day')
      end = m.clone().startOf('week').add(5, 'days').endOf('day')
      break
    case 'day':
      start = m.clone().startOf('day')
      end = m.clone().endOf('day')
      break
    case 'agenda':
      start = m.clone().startOf('day')
      end = m.clone().add(30, 'days').endOf('day')
      break
    default: // month
      start = m.clone().startOf('month')
      end = m.clone().endOf('month')
  }
  return { start: start.toISOString(), end: end.toISOString() }
}

function TreatmentSessionCalendar({ providerSlug, patientId, sessions, onUpdateList, allowWrites, enabled }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingTarget, setEditingTarget] = useState<TreatmentSession | undefined>(undefined)
  const [slot, setSlot] = useState<{start: string, end: string} | undefined>(undefined)
  
  let date = new Date()
  if (searchParams.get("start_gt")) date = new Date(searchParams.get("start_gt") as string)

  let view: View = "month"
  let urlView = searchParams.get("view")
  if (urlView && validViews.includes(urlView)) view = urlView as View

  let events = sessions.map(s => ({
    id: s.id,
    title: s.name,
    start: new Date(s.start),
    end: new Date(s.end),
    resource: s,
  }))

  function handleSelectEvent({ resource }: {resource: TreatmentSession}) {
    if (!allowWrites) return
    setEditingTarget(resource)
  }

  function handleNavigate(newDate: Date) {
    const { start, end } = calcDateRange(newDate, view)
    searchParams.set("start_gt", start)
    searchParams.set("start_lt", end)
    setSearchParams(new URLSearchParams(searchParams))
  }

  function handleView (newView: View) {
    const { start, end } = calcDateRange(date, newView)
    searchParams.set("start_gt", start)
    searchParams.set("start_lt", end)
    searchParams.set("view", newView)
    setSearchParams(new URLSearchParams(searchParams))
  }
  
  function handleSessionCreateEdit() {
    setEditingTarget(undefined)
    setSlot(undefined)
    onUpdateList()
  }

  function handleSelectSlot({start: startDate, end: endDate}: SlotInfo) {
    if (!allowWrites) return
    if (view === "month") {
      startDate.setHours(9)
      endDate = new Date(startDate)
      endDate.setHours(10)
    }
    setSlot({
      start: startDate.toISOString(),
      end: endDate.toISOString()
    })
  }

  return (
    <>
      {editingTarget && <TreatmentSessionForm
        session={editingTarget}
        onSuccess={handleSessionCreateEdit}
        onClose={() => setEditingTarget(undefined)}
      />}
      {slot && <TreatmentSessionForm
        providerSlug={providerSlug}
        patientId={patientId}
        initialStart={slot.start}
        initialEnd={slot.end}
        onSuccess={handleSessionCreateEdit}
        onClose={() => setSlot(undefined)}
      />}
      <Calendar
        localizer={localizer}
        events={events}
        selectable={enabled}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        view={view}
        onView={handleView}
        date={date}
        onNavigate={handleNavigate}
        style={{ height: 600 }}
      />
    </>
  )
}

export default TreatmentSessionCalendar
