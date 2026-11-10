import { useState } from 'react'

import { todayIso } from '@/components/ui/DatePicker/DatePicker.helpers'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { DatePicker } from '@/components/ui/DatePicker/DatePicker'
import { SheetField } from '@/components/ui/SheetField/SheetField'
import { SPRINT_COMPLETED } from '@/lib/options'
import { overlappingSprints } from './StartSprintModal.helpers'

/**
 * "Iniciar sprint" with its dates. The planned ones were a guess, so starting confirms them:
 * the start comes in as today and the end as planned, both editable. If they overlap another
 * sprint it says so, without stopping you (two sprints can share a day). The API refuses an end
 * in the past; the modal shows its answer and stays open.
 *
 *   onStart({ startDate, endDate })   returns the request's promise
 *
 * Mounted only while open (the parent renders it conditionally), so the dates start fresh.
 */
export function StartSprintModal({ sprint, sprints, onClose, onStart }) {
  const [startDate, setStartDate] = useState(todayIso())
  const [endDate, setEndDate] = useState(sprint.endDate)

  const others = sprints.filter((other) => other.id !== sprint.id && other.status !== SPRINT_COMPLETED)
  const overlaps = overlappingSprints(others, startDate, endDate)
  const endInPast = endDate < todayIso()

  return (
    <ConfirmModal
      isOpen
      title={`Iniciar ${sprint.name}`}
      confirmLabel="Iniciar sprint"
      pendingLabel="Iniciando…"
      confirmVariant="primary"
      onClose={onClose}
      onConfirm={() => onStart({ startDate, endDate })}
    >
      <p>Pasa a ser el sprint activo hasta que lo completes. Confirmá sus fechas:</p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <SheetField label="Inicio" htmlFor="start-sprint-start" required>
          <DatePicker
            id="start-sprint-start"
            value={startDate}
            range={{ start: startDate, end: endDate }}
            onChange={setStartDate}
          />
        </SheetField>
        <SheetField label="Fin" htmlFor="start-sprint-end" required>
          <DatePicker
            id="start-sprint-end"
            value={endDate}
            min={startDate}
            range={{ start: startDate, end: endDate }}
            onChange={setEndDate}
          />
        </SheetField>
      </div>

      {endInPast && <p className="mt-2 text-footnote text-red-text">La fecha de fin ya pasó.</p>}
      {overlaps.length > 0 && (
        <p className="mt-2 text-footnote text-label-secondary">
          Se superpone con {overlaps.map((other) => other.name).join(', ')}.
        </p>
      )}
    </ConfirmModal>
  )
}
