import { useState } from 'react'

import { TicketExtraFields } from '@/components/tickets/TicketExtraFields'
import { errorMessage } from '@/lib/errors'
import { toExtraFieldsPayload, toFormValues } from '@/lib/ticketExtraFields'

const SAVE_BUTTON = `inline-flex shrink-0 items-center justify-center rounded-control bg-blue
  px-3 py-1.5 text-footnote font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

/**
 * Los campos extra de un ticket, dentro del panel que se abre en su fila.
 *
 * Va aparte de EditableTicketRow por una razón concreta: este componente se monta recién
 * cuando el panel se abre, así que su useState lee los datos del ticket en ese momento. Si
 * el estado viviera en la fila, habría que sincronizarlo a mano cada vez que el ticket se
 * recarga desde el servidor.
 *
 * Tiene botón de guardar en vez del autoguardado por campo que usan Estado, Sprint y
 * Prioridad: los extras son un objeto entero, no un campo suelto, y guardar en cada tecla
 * sería un PUT por letra.
 */
export function TicketExtrasPanel({ ticket, onUpdateTicket }) {
  const [extras, setExtras] = useState(toFormValues(ticket.type, ticket.extraFields))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function handleChange(name, value) {
    setExtras({ ...extras, [name]: value })
  }

  async function handleSave() {
    setSaveError('')
    setSaving(true)
    try {
      await onUpdateTicket(ticket, { extraFields: toExtraFieldsPayload(ticket.type, extras) })
    } catch (err) {
      setSaveError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 border-t border-separator pt-3">
      {saveError && (
        <p role="alert" className="text-footnote text-red">
          {saveError}
        </p>
      )}

      <TicketExtraFields
        type={ticket.type}
        values={extras}
        onChange={handleChange}
        disabled={saving}
        idPrefix={`ticket-${ticket.id}`}
      />

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving} className={SAVE_BUTTON}>
          {saving ? 'Guardando…' : 'Guardar campos'}
        </button>
      </div>
    </div>
  )
}
