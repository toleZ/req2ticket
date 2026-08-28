import { useEffect, useState } from 'react'
import { Check, Copy, Trash2, X } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { ACCENT_COLORS, EPIC_PRIORITY_OPTIONS, EPIC_STATUS_OPTIONS } from '@/lib/epicOptions'
import { errorMessage } from '@/lib/errors'
import { findOption } from '@/lib/options'
import { summarizeTickets } from '@/lib/ticketStats'
import { validateEpicForm } from '@/lib/validate'

const HEADER = 'hairline-b flex shrink-0 items-center gap-2 px-5 py-3'

const FOOTER = 'hairline-t flex shrink-0 flex-wrap items-center justify-end gap-2 px-5 py-3'

const BODY = 'flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden'

const MAIN_COL = 'flex min-w-0 flex-1 flex-col gap-5 p-5 md:min-h-0 md:overflow-y-auto'

const SIDE_COL = `shrink-0 border-t border-separator bg-fill-quaternary p-5
  md:min-h-0 md:w-80 md:overflow-y-auto md:border-t-0 md:border-l`

const CODE_BUTTON = `mono inline-flex items-center gap-1.5 rounded-control px-1.5 py-1
  text-label-secondary transition-colors duration-fast ease-out-quad hover:bg-fill-tertiary
  hover:text-label`

const ICON_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control text-label-secondary
  transition-colors duration-fast ease-out-quad hover:bg-fill-tertiary hover:text-label
  disabled:opacity-50`

const DELETE_BUTTON = `grid size-8 shrink-0 place-items-center rounded-control text-label-tertiary
  transition-colors duration-fast ease-out-quad hover:bg-red/12 hover:text-red
  disabled:opacity-50`

const SIDE_SELECT = `w-full min-w-0 rounded-control border border-separator bg-elevated px-2 py-1
  text-footnote text-label transition-colors duration-fast hover:border-separator-opaque
  disabled:opacity-50`

const SWATCH = 'size-6 shrink-0 rounded-full transition-transform duration-fast'

/* El nombre de la épica, editable en el lugar: sin fondo ni borde en reposo, los dos
   aparecen al pasar por encima o al enfocarlo.

   Es un <textarea> y no un <input> para que el texto largo se lea entero:
   `field-sizing-content` hace crecer la caja en vez de scrollear, y donde no esté soportado
   queda en la fila de `rows`, igual que el input de antes.

   `font-display` a mano porque la regla de index.css sólo alcanza a h1–h4, y esto es un
   campo. El `-mx-2` compensa el `px-2` para que el texto quede alineado con lo de abajo. */
const HEADING = `-mx-2 w-[calc(100%+1rem)] resize-none rounded-control border border-transparent
  bg-transparent px-2 py-1 font-display text-title2 text-label transition-colors duration-fast
  ease-out-quad field-sizing-content hover:border-separator focus:border-separator
  focus:bg-fill-tertiary focus:outline-none disabled:opacity-50`

const FIELD_LABEL = 'mb-1 block text-subheadline font-medium text-label'

const CONTROL_TEXTAREA = `w-full resize-none rounded-control border border-separator
  bg-fill-tertiary px-3 py-2 text-body text-label transition-colors duration-fast
  placeholder:text-label-tertiary hover:border-separator-opaque disabled:opacity-50`

/* Una fila "etiqueta → valor". La etiqueta es <label> sólo cuando hay un control al que
   apuntar: un <label> sin destino el lector de pantalla lo anuncia como clickeable. */
const DETAIL_ROW = 'grid grid-cols-[5rem_1fr] items-center gap-2 py-1'

const DETAIL_LABEL = 'text-footnote text-label-secondary'

const DETAIL_VALUE = 'flex min-w-0 items-center justify-end gap-1.5'

/* `type` va explícito en todos: el default adentro de un <form> es "submit", y sin él
   Cancelar guardaría la épica en vez de cerrar. */
const GHOST_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  px-4 py-2 text-body font-medium text-label-secondary transition-colors duration-fast
  ease-out-quad hover:bg-fill-tertiary hover:text-label disabled:opacity-50`

const SUBMIT_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-blue px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

const DANGER_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-red px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

function toDetailValues(epic) {
  return {
    name: epic.name,
    description: epic.description ?? '',
    accentColor: epic.accentColor ?? 'blue',
    priority: epic.priority,
    status: epic.status,
    ownerId: epic.ownerId ? String(epic.ownerId) : '',
  }
}

/**
 * La ficha de una épica. Mismo esqueleto que TicketDetailModal — hoja `lg`, dos columnas,
 * pie con tres caras — y por los mismos motivos; los comentarios largos están allá.
 *
 * No muestra la lista de tickets de la épica: eso ya lo hace la fila desplegada, y ahí además
 * se puede hacer clic en cada uno. Repetirla acá sería una segunda copia que además no
 * llevaría a ningún lado, porque abrir el modal de un ticket desde adentro de este dejaría dos
 * hojas modales encimadas, con dos trampas de foco escuchando el mismo Escape.
 */
export function EpicDetailModal({ epic, tickets, users, onClose, onUpdateEpic, onDeleteEpic }) {
  const [values, setValues] = useState(() => toDetailValues(epic))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [copied, setCopied] = useState(false)
  const [footerMode, setFooterMode] = useState('edit')

  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const accent = findOption(ACCENT_COLORS, values.accentColor)
  const status = findOption(EPIC_STATUS_OPTIONS, values.status)
  const stats = summarizeTickets(tickets)

  function handleChange(e) {
    const nextValues = { ...values, [e.target.name]: e.target.value }
    setValues(nextValues)
    setDirty(true)

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: validateEpicForm(nextValues)[e.target.name] })
    }
  }

  /* Enter no hace nada: un nombre no lleva saltos de línea, y del que se pueda pegar se
     encarga el `.replace()` de handleSubmit. */
  function handleNameKeyDown(e) {
    if (e.key === 'Enter') e.preventDefault()
  }

  function handleAccentChange(accentColor) {
    setValues({ ...values, accentColor })
    setDirty(true)
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(epic.code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function handleRequestClose() {
    if (submitting) return

    if (footerMode !== 'edit') {
      setFooterMode('edit')
      return
    }

    if (dirty) {
      setFooterMode('confirmDiscard')
      return
    }

    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const found = validateEpicForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      await onUpdateEpic(epic, {
        /* `\s+` y no `trim()` solo: un salto de línea pegado desde el portapapeles es el
           único que puede entrar (Enter está bloqueado), y en un título no pinta nada. */
        name: values.name.replace(/\s+/g, ' ').trim(),
        description: values.description.trim(),
        accentColor: values.accentColor,
        priority: values.priority,
        status: values.status,
        ownerId: values.ownerId,
      })
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setFormError('')
    setSubmitting(true)
    try {
      // La página saca la épica de la lista, y con eso este modal se va solo.
      await onDeleteEpic(epic)
    } catch (err) {
      setFormError(errorMessage(err))
      setFooterMode('edit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={handleRequestClose}
      size="lg"
      ariaLabel={`${epic.code}: ${epic.name}`}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        <div className={HEADER}>
          {accent && (
            <span className={cn('size-2.5 shrink-0 rounded-full', accent.dotClass)} aria-hidden="true" />
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            aria-label={copied ? 'Código copiado' : `Copiar ${epic.code}`}
            className={CODE_BUTTON}
          >
            {epic.code}
            {copied ? (
              <Check className="size-3.5 text-green" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
          </button>

          {status && <Badge tone={status.tone}>{status.label}</Badge>}

          <span className="flex-1" />

          <button
            type="button"
            aria-label="Eliminar épica"
            disabled={submitting}
            onClick={() => setFooterMode('confirmDelete')}
            className={DELETE_BUTTON}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="Cerrar"
            onClick={handleRequestClose}
            className={ICON_BUTTON}
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </div>

        <div className={BODY}>
          <div className={MAIN_COL}>
            <div>
              <textarea
                rows={1}
                name="name"
                aria-label="Nombre"
                value={values.name}
                disabled={submitting}
                onChange={handleChange}
                onKeyDown={handleNameKeyDown}
                className={HEADING}
              />
              {errors.name && (
                <p className="mt-1 text-footnote text-red" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`epic-${epic.id}-description`} className={FIELD_LABEL}>
                Descripción
              </label>
              <textarea
                id={`epic-${epic.id}-description`}
                name="description"
                rows={4}
                value={values.description}
                disabled={submitting}
                onChange={handleChange}
                className={CONTROL_TEXTAREA}
              />
            </div>

            <div>
              <p className="mb-1.5 text-subheadline font-medium text-label">Avance</p>
              {stats.total === 0 ? (
                <p className="text-footnote text-label-tertiary">
                  Esta épica todavía no tiene tickets.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between text-footnote text-label-secondary">
                    <span>
                      {stats.completed} de {stats.total} tickets completados
                    </span>
                    <span>
                      {stats.pointsCompleted}/{stats.points} pts
                    </span>
                  </div>
                  <ProgressBar value={stats.completed} max={stats.total} className="mt-1.5" />
                </>
              )}
            </div>
          </div>

          <div className={SIDE_COL}>
            <div className={DETAIL_ROW}>
              <label htmlFor={`epic-${epic.id}-status`} className={DETAIL_LABEL}>
                Estado
              </label>
              <div className={DETAIL_VALUE}>
                <select
                  id={`epic-${epic.id}-status`}
                  name="status"
                  value={values.status}
                  disabled={submitting}
                  onChange={handleChange}
                  className={SIDE_SELECT}
                >
                  {EPIC_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={DETAIL_ROW}>
              <label htmlFor={`epic-${epic.id}-priority`} className={DETAIL_LABEL}>
                Prioridad
              </label>
              <div className={DETAIL_VALUE}>
                <select
                  id={`epic-${epic.id}-priority`}
                  name="priority"
                  value={values.priority}
                  disabled={submitting}
                  onChange={handleChange}
                  className={SIDE_SELECT}
                >
                  {EPIC_PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={DETAIL_ROW}>
              <label htmlFor={`epic-${epic.id}-owner`} className={DETAIL_LABEL}>
                Responsable
              </label>
              <div className={DETAIL_VALUE}>
                <select
                  id={`epic-${epic.id}-owner`}
                  name="ownerId"
                  value={values.ownerId}
                  disabled={submitting}
                  onChange={handleChange}
                  className={SIDE_SELECT}
                >
                  <option value="">Sin asignar</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Apilado y no en una fila de detalle: diez pastillas no entran al lado de la
                etiqueta. Es el mismo radiogroup del modal de alta — un <p> y no un <label>
                porque no hay un único control al que apuntar, y el nombre del grupo lo pone
                el aria-label. */}
            <div className="py-1">
              <p className="mb-1.5 text-footnote text-label-secondary">Color</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color de acento">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    role="radio"
                    aria-checked={values.accentColor === color.value}
                    aria-label={color.value}
                    disabled={submitting}
                    onClick={() => handleAccentChange(color.value)}
                    className={cn(
                      SWATCH,
                      color.dotClass,
                      values.accentColor === color.value &&
                        'scale-110 ring-2 ring-label ring-offset-2 ring-offset-elevated',
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Sin bloque de fechas, al contrario del modal de ticket: EpicResponse no trae
                createdAt ni updatedAt — la entidad Epic directamente no tiene esas columnas.
                No es un olvido, no las busques. */}
          </div>
        </div>

        <div className={FOOTER}>
          {formError && (
            <p role="alert" className="mr-auto text-footnote text-red">
              {formError}
            </p>
          )}

          {footerMode === 'edit' && (
            <>
              <button
                type="button"
                onClick={handleRequestClose}
                disabled={submitting}
                className={GHOST_BUTTON}
              >
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className={SUBMIT_BUTTON}>
                {submitting ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </>
          )}

          {footerMode === 'confirmDelete' && (
            <>
              <p className="mr-auto text-footnote text-label-secondary">
                Se eliminan también sus {stats.total === 1 ? 'ticket' : 'tickets'}. No se puede
                deshacer.
              </p>
              <button
                type="button"
                onClick={() => setFooterMode('edit')}
                disabled={submitting}
                className={GHOST_BUTTON}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className={DANGER_BUTTON}
              >
                {submitting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </>
          )}

          {footerMode === 'confirmDiscard' && (
            <>
              <p className="mr-auto text-footnote text-label-secondary">
                Hay cambios sin guardar. Si salís ahora se pierden.
              </p>
              <button
                type="button"
                onClick={() => setFooterMode('edit')}
                className={GHOST_BUTTON}
              >
                Seguir editando
              </button>
              <button type="button" onClick={onClose} className={DANGER_BUTTON}>
                Descartar
              </button>
            </>
          )}
        </div>
      </form>
    </Modal>
  )
}
