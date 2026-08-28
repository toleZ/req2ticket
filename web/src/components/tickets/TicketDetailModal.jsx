import { useEffect, useState } from 'react'
import { Check, Copy, Trash2, X } from 'lucide-react'

import { TicketExtraFields } from '@/components/tickets/TicketExtraFields'
import { TicketPointsField } from '@/components/tickets/TicketPointsField'
import { TicketTypeIcon } from '@/components/tickets/TicketTypeIcon'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatDateTime, timeAgo } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { findOption } from '@/lib/options'
import {
  DESCRIPTION_PLACEHOLDER,
  EXTRA_FIELDS,
  toExtraFieldsPayload,
  toFormValues,
} from '@/lib/ticketExtraFields'
import { TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS, TICKET_TYPE_OPTIONS } from '@/lib/ticketOptions'
import { validateTicketForm } from '@/lib/validate'

const HEADER = 'hairline-b flex shrink-0 items-center gap-2 px-5 py-3'

const FOOTER = 'hairline-t flex shrink-0 flex-wrap items-center justify-end gap-2 px-5 py-3'

/* Móvil: una sola columna y scrollea la hoja. Desde md: dos columnas y scrollea cada una por
   su lado, que es para lo que Modal tiene el tamaño `lg` (ver el comentario de SIZE_CLASSES).
   `min-h-0` no es decorativo: un hijo flex arranca en `min-height: auto`, se niega a achicarse
   por debajo de su contenido y el overflow no llega a activarse nunca. */
const BODY = 'flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden'

const MAIN_COL = 'flex min-w-0 flex-1 flex-col gap-5 p-5 md:min-h-0 md:overflow-y-auto'

/* La separación cambia de lado en md porque las columnas pasan de apiladas a lado a lado.
   Va con `border` y no con las utilidades `hairline-*`: esas fijan un borde de 0.5px sin
   variante para apagarlo, y acá hace falta justamente apagar el de arriba en md. */
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

/* El recuadro azul del diseño. La opacidad va sobre el acento (`bg-blue/8`) y no sobre un gris
   fijo: --sys-blue cambia solo en modo oscuro, así que el recuadro acompaña sin un `dark:`. */
const STORY_CALLOUT = 'rounded-card bg-blue/8 p-4 ring-[0.5px] ring-blue/20'

const STORY_TEXTAREA = `w-full resize-none bg-transparent text-body text-label
  placeholder:text-label-tertiary focus:outline-none disabled:opacity-50`

const SIDE_SELECT = `w-full min-w-0 rounded-control border border-separator bg-elevated px-2 py-1
  text-footnote text-label transition-colors duration-fast hover:border-separator-opaque
  disabled:opacity-50`

const META = 'hairline-t mt-4 flex flex-col gap-0.5 pt-3 text-caption text-label-tertiary'

/* El título del ticket, editable en el lugar: sin fondo ni borde en reposo, los dos
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
   apuntar (el tipo del ticket no lo tiene): un <label> sin destino el lector de pantalla lo anuncia como clickeable. */
const DETAIL_ROW = 'grid grid-cols-[5rem_1fr] items-center gap-2 py-1'

const DETAIL_LABEL = 'text-footnote text-label-secondary'

const DETAIL_VALUE = 'flex min-w-0 items-center justify-end gap-1.5'

/* `type` va explícito en todos: el default adentro de un <form> es "submit", y sin él
   Cancelar guardaría el ticket en vez de cerrar. */
const GHOST_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  px-4 py-2 text-body font-medium text-label-secondary transition-colors duration-fast
  ease-out-quad hover:bg-fill-tertiary hover:text-label disabled:opacity-50`

const SUBMIT_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-blue px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

const DANGER_BUTTON = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control
  bg-red px-4 py-2 text-body font-medium text-white transition-[filter] duration-fast
  hover:brightness-110 disabled:opacity-50`

/* Los valores del formulario, todos string — que es lo que devuelve un <input>. La conversión
   a número pasa una sola vez, en lib/api/tickets.js. */
function toDetailValues(ticket) {
  return {
    title: ticket.title,
    description: ticket.description ?? '',
    epicId: String(ticket.epicId),
    priority: ticket.priority,
    status: ticket.status,
    points: String(ticket.points),
    assigneeId: ticket.assigneeId ? String(ticket.assigneeId) : '',
    sprintId: ticket.sprintId ? String(ticket.sprintId) : '',
  }
}

/**
 * La ficha de un ticket: todo lo que tiene, en una hoja a dos columnas, y el único lugar
 * desde donde se lo edita.
 *
 * Es un formulario con botón de Guardar, no un panel que guarda campo por campo. Lo que se
 * escribe vive en el estado local hasta que se aprieta Guardar; el modal se cierra sólo si el
 * PUT salió bien, igual que los modales de alta.
 *
 * La columna izquierda cambia con el tipo (historia, tarea, bug o fix) porque la lista de
 * campos sale de EXTRA_FIELDS. Los dos que son `select` — la severidad de un bug, el riesgo de
 * regresión de un fix — se dibujan a la derecha, con el estado y la prioridad: son metadatos,
 * no contenido, y ahí es donde se leen.
 *
 * No recibe `isOpen`: la página lo monta cuando elegís un ticket y lo desmonta al cerrar.
 * Eso es lo que deja sembrar el formulario en el useState y olvidarse — cada apertura es un
 * montaje nuevo, así que nunca queda estado del ticket anterior. La alternativa (dejarlo
 * montado con un `isOpen`) obliga a resincronizar el formulario a mano cada vez que cambia
 * el ticket, y sincronizar estado con props desde un efecto es justo lo que React desaconseja
 * y lo que el eslint del proyecto rechaza (react-hooks/set-state-in-effect).
 *
 * Lo que se paga: al desmontarse se va también el <AnimatePresence> que vive adentro de
 * Modal, así que la hoja no tiene animación de salida. La de entrada sí. Es el precio de no
 * tener que sincronizar nada.
 */
export function TicketDetailModal({
  ticket,
  epics,
  sprints,
  users,
  onClose,
  onUpdateTicket,
  onDeleteTicket,
}) {
  const [values, setValues] = useState(() => toDetailValues(ticket))
  /* Los campos extra van en su propio objeto y no dentro de `values`: son los únicos que
     dependen del tipo, y toFormValues ya devuelve exactamente esta forma. */
  const [extras, setExtras] = useState(() => toFormValues(ticket.type, ticket.extraFields))
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [copied, setCopied] = useState(false)

  /* El pie tiene tres caras: el normal, el "¿seguro que lo borro?" y el "tenés cambios sin
     guardar". Las tres van acá y no en un ConfirmModal encima porque dos modales a la vez son
     dos useFocusTrap vivos, y ese hook escucha Escape en `document`: una sola tecla cerraría
     los dos. Cambiar el pie no tiene ese problema y además no tapa lo que estás por perder. */
  const [footerMode, setFooterMode] = useState('edit')

  /* El tick de "copiado" se apaga solo. El timer se limpia en el cleanup: sin eso, cerrar el
     modal antes de que termine dejaría un setTimeout apuntando a un componente que ya no está. */
  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const type = findOption(TICKET_TYPE_OPTIONS, ticket.type)
  const status = findOption(TICKET_STATUS_OPTIONS, values.status)
  /* Los ids de un <select> son strings y los de la API números, así que la comparación va por
     String() — es la misma conversión que hacen los filtros de la página de Tickets. */
  const assignee = users.find((user) => String(user.id) === values.assigneeId)

  /* Los campos extra repartidos en dos: el contenido a la izquierda, los desplegables a la
     derecha. Se filtra por `kind` y no por una lista de nombres para que un campo nuevo en
     lib/ticketExtraFields.js caiga solo en la columna que le toca. */
  const sideFields = (EXTRA_FIELDS[ticket.type] || []).filter((field) => field.kind === 'select')

  /* Alcanza con un booleano: comparar los objetos enteros contra una copia inicial detectaría
     el caso de escribir algo y volver a borrarlo, que no vale la molestia. Poner en true algo
     que ya está en true no vuelve a dibujar nada — React corta si el valor es el mismo. */
  function markDirty() {
    setDirty(true)
  }

  function handleChange(e) {
    const nextValues = { ...values, [e.target.name]: e.target.value }
    setValues(nextValues)
    markDirty()

    // Si el campo ya tenía error, se revisa mientras se escribe para que el mensaje
    // desaparezca apenas se corrige. Uno sin error todavía no se valida hasta el submit.
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: validateTicketForm(nextValues)[e.target.name] })
    }
  }

  /* Enter no hace nada: un título no lleva saltos de línea, y del que se pueda pegar se
     encarga el `.replace()` de handleSubmit. */
  function handleTitleKeyDown(e) {
    if (e.key === 'Enter') e.preventDefault()
  }

  function handlePointsChange(points) {
    setValues({ ...values, points })
    markDirty()
  }

  function handleExtraChange(name, value) {
    setExtras({ ...extras, [name]: value })
    markDirty()
  }

  async function handleCopyCode() {
    /* navigator.clipboard no existe fuera de HTTPS o localhost, y el navegador puede negar el
       permiso. No hay plan B: si falla, simplemente no aparece el tick. */
    try {
      await navigator.clipboard.writeText(ticket.code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  /* Por acá salen los tres caminos de cierre: la X, el clic en el fondo y Escape — los tres
     terminan en el `onClose` que recibe <Modal>. */
  function handleRequestClose() {
    // Con el PUT en vuelo, cerrar dejaría la lista con datos viejos y sin saber si se guardó.
    if (submitting) return

    // Escape sale primero de la confirmación, no del modal entero.
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

    const found = validateTicketForm(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setFormError('')
    setSubmitting(true)
    try {
      /* `type`, `parentId` y `reporterId` no van en el patch a propósito: updateTicket lo
         mezcla sobre el ticket entero, así que viajan intactos. El tipo además la API lo
         rechaza — el código del ticket lleva su prefijo. */
      await onUpdateTicket(ticket, {
        /* `\s+` y no `trim()` solo: un salto de línea pegado desde el portapapeles es el
           único que puede entrar (Enter está bloqueado), y en un título no pinta nada. */
        title: values.title.replace(/\s+/g, ' ').trim(),
        description: values.description.trim(),
        epicId: values.epicId,
        priority: values.priority,
        status: values.status,
        points: values.points,
        assigneeId: values.assigneeId,
        sprintId: values.sprintId,
        extraFields: toExtraFieldsPayload(ticket.type, extras),
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
      // La página saca el ticket de la lista, y con eso este modal se va solo.
      await onDeleteTicket(ticket)
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
      ariaLabel={`${ticket.code}: ${ticket.title}`}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        <div className={HEADER}>
          <TicketTypeIcon type={ticket.type} className="size-4.5" />

          <button
            type="button"
            onClick={handleCopyCode}
            aria-label={copied ? 'Código copiado' : `Copiar ${ticket.code}`}
            className={CODE_BUTTON}
          >
            {ticket.code}
            {copied ? (
              <Check className="size-3.5 text-green" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
          </button>

          {/* Sigue a `values.status` y no a `ticket.status`: mientras cambiás el estado en la
              columna derecha, la cabecera muestra lo que estás por guardar. */}
          {status && <Badge tone={status.tone}>{status.label}</Badge>}

          <span className="flex-1" />

          <button
            type="button"
            aria-label="Eliminar ticket"
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
                name="title"
                aria-label="Título"
                value={values.title}
                disabled={submitting}
                onChange={handleChange}
                onKeyDown={handleTitleKeyDown}
                className={HEADING}
              />
              {errors.title && (
                <p className="mt-1 text-footnote text-red" role="alert">
                  {errors.title}
                </p>
              )}
            </div>

            {/* La historia va en un recuadro aparte, como en el diseño. Es el mismo campo
                `description` de los otros tipos: la narrativa "Como… quiero… para…" dejó de
                ser tres campos y es texto libre, así que el gris de los conectores sobrevive
                donde puede — en el placeholder, que ya se dibuja en label-tertiary. */}
            {ticket.type === 'userStory' ? (
              <div className={STORY_CALLOUT}>
                <p className="eyebrow mb-2">Historia</p>
                <textarea
                  rows={3}
                  name="description"
                  aria-label="Historia"
                  value={values.description}
                  disabled={submitting}
                  onChange={handleChange}
                  placeholder={DESCRIPTION_PLACEHOLDER.userStory}
                  className={STORY_TEXTAREA}
                />
              </div>
            ) : (
              <div>
                <label htmlFor={`ticket-${ticket.id}-description`} className={FIELD_LABEL}>
                  Descripción
                </label>
                <textarea
                  id={`ticket-${ticket.id}-description`}
                  name="description"
                  rows={3}
                  value={values.description}
                  disabled={submitting}
                  onChange={handleChange}
                  className={CONTROL_TEXTAREA}
                />
              </div>
            )}

            <TicketExtraFields
              type={ticket.type}
              values={extras}
              onChange={handleExtraChange}
              disabled={submitting}
              idPrefix={`ticket-${ticket.id}`}
              kinds={['text', 'textarea', 'checklist']}
            />
          </div>

          <div className={SIDE_COL}>
            {/* El tipo no es un select: se asigna al crear y la API lo rechaza después, porque
                el código lleva su prefijo (UH-, TASK-, BUG-, FIX-) y un ticket que cambiara de
                tipo quedaría con un código que miente. Convertirlo es crear otro ticket. */}
            <div className={DETAIL_ROW}>
              <span className={DETAIL_LABEL}>Tipo</span>
              <div className={DETAIL_VALUE}>
                <span
                  title="El tipo se define al crear el ticket y no se puede cambiar."
                  className="flex items-center gap-1.5 text-footnote text-label"
                >
                  <TicketTypeIcon type={ticket.type} className="size-4" />
                  {type && type.label}
                </span>
              </div>
            </div>

            <div className={DETAIL_ROW}>
              <label htmlFor={`ticket-${ticket.id}-status`} className={DETAIL_LABEL}>
                Estado
              </label>
              <div className={DETAIL_VALUE}>
                <select
                  id={`ticket-${ticket.id}-status`}
                  name="status"
                  value={values.status}
                  disabled={submitting}
                  onChange={handleChange}
                  className={SIDE_SELECT}
                >
                  {TICKET_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={DETAIL_ROW}>
              <label htmlFor={`ticket-${ticket.id}-priority`} className={DETAIL_LABEL}>
                Prioridad
              </label>
              <div className={DETAIL_VALUE}>
                <select
                  id={`ticket-${ticket.id}-priority`}
                  name="priority"
                  value={values.priority}
                  disabled={submitting}
                  onChange={handleChange}
                  className={SIDE_SELECT}
                >
                  {TICKET_PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Los desplegables propios del tipo: la severidad de un bug, el riesgo de
                regresión de un fix. Salen de EXTRA_FIELDS igual que los de la izquierda, así
                que un tipo nuevo con su propio enum aparece acá sin tocar este archivo. */}
            {sideFields.map((field) => (
              <div key={field.name} className={DETAIL_ROW}>
                <label htmlFor={`ticket-${ticket.id}-${field.name}`} className={DETAIL_LABEL}>
                  {field.label}
                </label>
                <div className={DETAIL_VALUE}>
                  <select
                    id={`ticket-${ticket.id}-${field.name}`}
                    value={extras[field.name]}
                    disabled={submitting}
                    onChange={(e) => handleExtraChange(field.name, e.target.value)}
                    className={SIDE_SELECT}
                  >
                    <option value="">Sin definir</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {/* Sin opción vacía: la épica es obligatoria, la única relación del ticket que la
                API no acepta en null. */}
            <div className={DETAIL_ROW}>
              <label htmlFor={`ticket-${ticket.id}-epic`} className={DETAIL_LABEL}>
                Épica
              </label>
              <div className={DETAIL_VALUE}>
                <select
                  id={`ticket-${ticket.id}-epic`}
                  name="epicId"
                  value={values.epicId}
                  disabled={submitting}
                  onChange={handleChange}
                  className={SIDE_SELECT}
                >
                  {epics.map((epic) => (
                    <option key={epic.id} value={epic.id}>
                      {epic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={DETAIL_ROW}>
              <label htmlFor={`ticket-${ticket.id}-sprint`} className={DETAIL_LABEL}>
                Sprint
              </label>
              <div className={DETAIL_VALUE}>
                <select
                  id={`ticket-${ticket.id}-sprint`}
                  name="sprintId"
                  value={values.sprintId}
                  disabled={submitting}
                  onChange={handleChange}
                  className={SIDE_SELECT}
                >
                  <option value="">Sin sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={DETAIL_ROW}>
              <label htmlFor={`ticket-${ticket.id}-assignee`} className={DETAIL_LABEL}>
                Asignado
              </label>
              <div className={DETAIL_VALUE}>
                <select
                  id={`ticket-${ticket.id}-assignee`}
                  name="assigneeId"
                  value={values.assigneeId}
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
                {/* El nombre sale de `users` y no de `ticket.assigneeName`: ese es el que está
                    guardado, así que al elegir otro responsable el avatar se quedaría con las
                    iniciales del anterior hasta apretar Guardar. */}
                <Avatar name={assignee ? assignee.name : null} size="sm" />
              </div>
            </div>

            {/* Los puntos van apilados y no en una fila de detalle: siete botones no entran al
                lado de una etiqueta en una columna de 320px. */}
            <div className="py-1">
              <p className="mb-1 text-footnote text-label-secondary">Puntos</p>
              <TicketPointsField
                id={`ticket-${ticket.id}-points`}
                value={values.points}
                disabled={submitting}
                onChange={handlePointsChange}
              />
            </div>

            {/* Lo único que el modal muestra y no deja editar.

                En masculino, y no "Abierta por / Creada" como el diseño: ahí el ejemplo era
                una historia, pero este mismo modal dibuja también el ticket, el bug y el fix.

                `reporterName` puede venir null. La API lo completa con quien creó el ticket,
                pero hasta hace poco cada PUT lo borraba (ver el comentario en
                lib/api/tickets.js), así que los tickets guardados antes de ese arreglo se
                quedaron sin reporter. */}
            <div className={META}>
              <p>Reportado por {ticket.reporterName ?? 'alguien que ya no está registrado'}</p>
              <p title={formatDateTime(ticket.createdAt)}>Creado {timeAgo(ticket.createdAt)}</p>
              <p title={formatDateTime(ticket.updatedAt)}>
                Actualizado {timeAgo(ticket.updatedAt)}
              </p>
            </div>
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
                ¿Eliminar este ticket? No se puede deshacer.
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
