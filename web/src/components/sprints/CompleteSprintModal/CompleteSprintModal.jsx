import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button/Button'
import { FormError } from '@/components/ui/FormError/FormError'
import { Modal } from '@/components/ui/Modal/Modal'
import { Select } from '@/components/ui/Select/Select'
import { toast } from '@/components/ui/Toast/toast'
import { errorMessage } from '@/lib/errors'
import { isOpenStatus } from '@/lib/options'
import { useCompleteSprint } from '@/lib/queries/sprints'
import { completedToast } from './CompleteSprintModal.helpers'

/**
 * "Completar sprint" (ENT-5), shared by the Sprints page and the board. A sprint can be completed
 * with work still open: this lists that work and asks where it goes — the Backlog (by default)
 * or a planned sprint. Done and cancelled tickets stay in the sprint as its history, and the
 * open ones keep their status when they move.
 *
 * Mount it only while it is open, inside <AnimatePresence> (it has no `isOpen`):
 *
 *     <AnimatePresence>
 *       {completing && (
 *         <CompleteSprintModal projectId={projectId} sprint={activeSprint} tickets={tickets}
 *           plannedSprints={planned} onClose={() => setCompleting(false)} />
 *       )}
 *     </AnimatePresence>
 *
 *   sprint          the active sprint (its summary)
 *   tickets         every ticket of the project; this keeps the sprint's open ones
 *   plannedSprints  the planned sprints, the possible destinations
 *   onCompleted     optional, gets the API's { sprint, movedTickets } after it worked
 *
 * It closes only when the API said yes; on an error it stays open with the message. The focus
 * starts on Cancelar: completing cannot be undone.
 */
export function CompleteSprintModal({ projectId, sprint, tickets, plannedSprints, onClose, onCompleted }) {
  const [destination, setDestination] = useState('')
  const [error, setError] = useState('')
  const completeSprint = useCompleteSprint(projectId)
  const footerRef = useRef(null)
  const submitting = completeSprint.isPending

  const openTickets = tickets.filter((ticket) => ticket.sprintId === sprint.id && isOpenStatus(ticket.status))
  const destinations = [
    { value: '', label: 'Backlog' },
    ...plannedSprints.map((planned) => ({ value: String(planned.id), label: planned.name })),
  ]

  /* Runs after Modal's own effect, which focuses the panel (a child's effects run first), so this
     one gets the last word — same trick as ConfirmModal. */
  useEffect(() => {
    footerRef.current?.querySelector('button')?.focus()
  }, [])

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleConfirm() {
    setError('')
    try {
      const result = await completeSprint.mutateAsync({
        sprintId: sprint.id,
        moveOpenTicketsTo: destination || null,
      })
      const destinationName = plannedSprints.find((planned) => String(planned.id) === destination)?.name
      toast.success(completedToast(result.movedTickets, destinationName))
      onCompleted?.(result)
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <Modal isOpen onClose={handleClose} title={`Completar ${sprint.name}`}>
      <div className="flex flex-col gap-4">
        {error && <FormError>{error}</FormError>}

        {openTickets.length === 0 ? (
          <p className="text-body text-label-secondary">
            No quedan tickets abiertos: todo lo del sprint está hecho o cancelado.
          </p>
        ) : (
          <>
            <p className="text-body text-label-secondary">
              Este sprint tiene{' '}
              <span className="font-medium text-label">
                {openTickets.length === 1 ? '1 ticket abierto' : `${openTickets.length} tickets abiertos`}
              </span>
              . Siguen con su estado donde los mandes; los hechos y cancelados quedan en el sprint.
            </p>

            <ul className="max-h-48 overflow-y-auto rounded-control bg-fill-quaternary px-3 py-2">
              {openTickets.map((ticket) => (
                <li key={ticket.id} className="flex gap-2 py-1 text-footnote">
                  <span className="mono shrink-0 whitespace-nowrap text-label-secondary">{ticket.code}</span>
                  <span className="min-w-0 truncate text-label">{ticket.title}</span>
                </li>
              ))}
            </ul>

            <div>
              <label htmlFor="complete-sprint-destination" className="mb-1 block text-subheadline text-label">
                Mover los abiertos a
              </label>
              <Select
                id="complete-sprint-destination"
                variant="field"
                value={destination}
                options={destinations}
                disabled={submitting}
                onChange={setDestination}
              />
            </div>
          </>
        )}

        <p className="text-footnote text-label-secondary">Un sprint completado no se puede reabrir ni editar.</p>

        <div ref={footerRef} className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Completando…' : 'Completar sprint'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
