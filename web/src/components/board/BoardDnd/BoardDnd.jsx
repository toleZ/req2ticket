/* No hace falta leer esto para cambiar cómo se ve una tarjeta: that is BoardCard, and a column
   is BoardColumn. This file only wires dnd-kit — who can be dragged, where it may land, and what
   happens on drop.

   How it works, briefly:
   - Each card is a draggable (its id is the ticket's id); each column a droppable (its id is the
     status). While a card is dragged, every column asks statusBlockReason() whether the card may
     land there: if not, it dims, shows the reason while hovered, and a drop on it does nothing.
     The API checks the move again anyway; this only keeps you from trying.
   - With the mouse, a card starts moving after 6px, so a plain click opens it. With a finger,
     after holding it for a moment: a quick swipe still scrolls between columns.
   - A column counts as "under" the card when the pointer is inside it (pointerWithin).
   - Dragging needs a mouse or a finger. Without them, the status changes from the ticket's
     detail or the card's "…" menu.
   - The card under the pointer is a copy (DragOverlay); the original stays dimmed in place. */
import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

import { BoardCard } from '@/components/board/BoardCard/BoardCard'
import { BoardCardMenu } from '@/components/board/BoardCardMenu/BoardCardMenu'
import { BoardColumn } from '@/components/board/BoardColumn/BoardColumn'
import { sortCards } from '@/components/board/board.helpers'
import { cn } from '@/lib/cn'
import { statusBlockReason, statusContext } from '@/lib/workflow'
import { CARD_HANDLE, COLUMNS } from './BoardDnd.styles'

/**
 * The board's columns and cards, draggable.
 *
 *   columns         the statuses to draw ({ value, label, tone })
 *   tickets         the cards (already filtered), as TicketSummary
 *   allTickets      every ticket of the project: a card's parent may be off the board, and
 *                   reopening a child needs its parent open
 *   workflow        the project's workflow, or null
 *   epics, members  to colour the card and put a face on it
 *   canWrite        tickets.write: without it nothing is draggable and there is no menu
 *   savingId        the ticket whose move is being saved: it cannot be dragged again yet
 *   onMove(ticket, status), onCancel(ticket), onOpen(ticket)
 */
export function BoardDnd({
  columns,
  tickets,
  allTickets,
  workflow,
  epics,
  members,
  canWrite,
  savingId,
  onMove,
  onCancel,
  onOpen,
}) {
  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  )

  const active = tickets.find((ticket) => ticket.id === activeId)
  const epicOf = (ticket) => epics.find((epic) => epic.id === ticket.epicId)
  const assigneeOf = (ticket) => members.find((member) => member.id === ticket.assigneeId)
  // The board shows the active sprint only, so no card is in a completed one: no sprints needed.
  const blockReason = (ticket, status) => statusBlockReason(ticket, status, workflow, statusContext(ticket, allTickets))

  function columnState(status) {
    if (!active) return 'idle'
    if (status !== active.status && blockReason(active, status)) return 'blocked'
    return overId === status && status !== active.status ? 'over' : 'open'
  }

  function reset() {
    setActiveId(null)
    setOverId(null)
  }

  function handleDragEnd({ active: dragged, over }) {
    const ticket = tickets.find((item) => item.id === dragged.id)
    reset()
    if (!ticket || !over || over.id === ticket.status) return
    if (blockReason(ticket, over.id)) return
    onMove(ticket, over.id)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active: dragged }) => setActiveId(dragged.id)}
      onDragOver={({ over }) => setOverId(over?.id ?? null)}
      onDragEnd={handleDragEnd}
      onDragCancel={reset}
    >
      <div className={COLUMNS}>
        {columns.map((column) => {
          const cards = sortCards(tickets.filter((ticket) => ticket.status === column.value))
          const state = columnState(column.value)

          return (
            <DroppableColumn
              key={column.value}
              column={column}
              count={cards.length}
              state={state}
              reason={state === 'blocked' && overId === column.value ? blockReason(active, column.value) : null}
            >
              {cards.map((ticket) => (
                <DraggableCard
                  key={ticket.id}
                  ticket={ticket}
                  epic={epicOf(ticket)}
                  assignee={assigneeOf(ticket)}
                  canWrite={canWrite}
                  saving={ticket.id === savingId}
                  cancelReason={blockReason(ticket, 'cancelled')}
                  onCancel={onCancel}
                  onOpen={onOpen}
                />
              ))}
            </DroppableColumn>
          )
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {active && <BoardCard ticket={active} epic={epicOf(active)} assignee={assigneeOf(active)} lifted />}
      </DragOverlay>
    </DndContext>
  )
}

function DroppableColumn({ column, count, state, reason, children }) {
  const { setNodeRef } = useDroppable({ id: column.value })

  return (
    // min-w-0: from lg the wrapper is a grid cell, and the column has to fit it, not its content.
    <div ref={setNodeRef} className="flex min-w-0">
      <BoardColumn status={column} count={count} state={state} reason={reason}>
        {children}
      </BoardColumn>
    </div>
  )
}

function DraggableCard({ ticket, epic, assignee, canWrite, saving, cancelReason, onCancel, onOpen }) {
  const canDrag = canWrite && !saving
  const { listeners, setNodeRef, isDragging } = useDraggable({ id: ticket.id, disabled: !canDrag })

  return (
    <div className="relative">
      {/* tabIndex + Enter: the card is a <div> (dnd-kit needs one), so it has to be made
          reachable with Tab and openable with Enter by hand, like a button would be. */}
      <div
        ref={setNodeRef}
        {...listeners}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(ticket)}
        onClick={() => onOpen(ticket)}
        className={cn(CARD_HANDLE, canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer', isDragging && 'opacity-40')}
      >
        <BoardCard ticket={ticket} epic={epic} assignee={assignee} saving={saving} />
      </div>

      {canWrite && (
        <BoardCardMenu ticket={ticket} cancelReason={cancelReason} disabled={saving} onCancel={onCancel} />
      )}
    </div>
  )
}
