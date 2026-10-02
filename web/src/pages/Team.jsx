import { useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Eye, UserPlus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { MemberList } from '@/components/team/MemberList/MemberList'
import { MemberModal } from '@/components/team/MemberModal/MemberModal'
import { RoleFilterBar } from '@/components/team/RoleFilterBar/RoleFilterBar'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { normalize } from '@/components/ui/FilterChip/FilterChip.helpers'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { SearchBox } from '@/components/ui/SearchBox/SearchBox'
import { createUser, deleteUser, updateUser } from '@/lib/api'
import { readSession } from '@/lib/auth'
import { changeParams } from '@/lib/urlFilters'
import { SPRINT_ACTIVE } from '@/lib/options'
import { canManageUsers, compareMembers } from '@/lib/roles'

export function Team() {
  const { tickets, setTickets, setEpics, sprints, users, setUsers, loadState, reload } = useOutletContext()

  /* The search and the role filter live in the URL like the other lists', so a reload or the
     back button keeps them. The text is also held in state: a box bound only to the URL lost
     letters under fast typing. */
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const roleFilter = params.get('rol') ?? ''

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  /* By id and not as an object, like the detail sheets: after saving the modal reads what the
     list holds now. */
  const [editMemberId, setEditMemberId] = useState(null)
  const [deleteMemberId, setDeleteMemberId] = useState(null)

  /* The signed-in user as the list has them, not as the login saved them: the API reads the
     role from the database on every request, so the list is what it will actually enforce.
     The session copy covers the moment before the list arrives. */
  const sessionUser = readSession()?.user
  const me = users.find((user) => user.id === sessionUser?.id) ?? sessionUser
  const canManage = canManageUsers(me?.role)

  function handleSearchChange(text) {
    setSearch(text)
    changeParams(setParams, (next) => (text ? next.set('q', text) : next.delete('q')), true)
  }

  function handleRoleChange(role) {
    changeParams(setParams, (next) => (role ? next.set('rol', role) : next.delete('rol')))
  }

  function clearFilters() {
    setSearch('')
    changeParams(setParams, (next) => {
      next.delete('q')
      next.delete('rol')
    })
  }

  const query = normalize(search.trim())
  const sortedMembers = [...users].sort(compareMembers)
  const visibleMembers = sortedMembers.filter(
    (member) =>
      (!roleFilter || member.role === roleFilter) &&
      (normalize(member.name).includes(query) || normalize(member.email).includes(query)),
  )

  /* Who has work in the sprint under way: the people assigned at least one of its tickets. */
  const activeSprint = sprints.find((sprint) => sprint.status === SPRINT_ACTIVE)
  const busyIds = new Set(
    tickets
      .filter((ticket) => activeSprint && ticket.sprintId === activeSprint.id && ticket.assigneeId)
      .map((ticket) => ticket.assigneeId),
  )
  const roleCount = new Set(users.map((user) => user.role)).size

  let meta = null
  if (loadState === 'ready') {
    meta = `${users.length} ${users.length === 1 ? 'integrante' : 'integrantes'} · ${roleCount} ${roleCount === 1 ? 'rol' : 'roles'}`
    if (activeSprint) meta += ` · ${busyIds.size} con tickets en ${activeSprint.name}`
  }

  async function handleCreate(values) {
    const created = await createUser(values)
    setUsers((prev) => [...prev, created])
  }

  /* The PUT answers 204 with no body, so the list is patched with what was sent. Tickets and
     epics carry the person's name next to the id, so a rename has to reach them too. */
  async function handleUpdate(member, values) {
    await updateUser(member.id, values)
    setUsers((prev) =>
      prev.map((user) =>
        user.id === member.id ? { ...user, name: values.name, email: values.email, role: values.role } : user,
      ),
    )

    if (values.name !== member.name) {
      setTickets((prev) =>
        prev.map((ticket) => {
          let next = ticket
          if (next.assigneeId === member.id) next = { ...next, assigneeName: values.name }
          if (next.reporterId === member.id) next = { ...next, reporterName: values.name }
          return next
        }),
      )
      setEpics((prev) => prev.map((epic) => (epic.ownerId === member.id ? { ...epic, ownerName: values.name } : epic)))
    }
  }

  /* The backend leaves the person's tickets and epics without them (SetNull), so the same has
     to happen here: otherwise they would keep showing someone who is no longer on the team. */
  async function handleDelete(member) {
    await deleteUser(member.id)
    setUsers((prev) => prev.filter((user) => user.id !== member.id))
    setTickets((prev) =>
      prev.map((ticket) => {
        let next = ticket
        if (next.assigneeId === member.id) next = { ...next, assigneeId: null, assigneeName: null }
        if (next.reporterId === member.id) next = { ...next, reporterId: null, reporterName: null }
        return next
      }),
    )
    setEpics((prev) =>
      prev.map((epic) => (epic.ownerId === member.id ? { ...epic, ownerId: null, ownerName: null } : epic)),
    )
  }

  const editMember = users.find((user) => user.id === editMemberId) ?? null
  const deleteMember = users.find((user) => user.id === deleteMemberId) ?? null
  const deleteAssigned = deleteMember ? tickets.filter((ticket) => ticket.assigneeId === deleteMember.id).length : 0
  const isFiltered = Boolean(query || roleFilter)

  return (
    <section>
      <PageHeader title="Equipo" meta={meta}>
        {canManage && (
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="shrink-0">
            <UserPlus className="size-4" aria-hidden="true" />
            Nuevo integrante
          </Button>
        )}
      </PageHeader>

      {loadState === 'ready' && users.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <SearchBox value={search} placeholder="Buscar por nombre o email" onChange={handleSearchChange} />
          <RoleFilterBar members={users} value={roleFilter} onChange={handleRoleChange} />
        </div>
      )}

      {loadState === 'ready' && !canManage && (
        <p className="mt-3 flex items-center gap-1.5 text-footnote text-label-secondary">
          <Eye className="size-3.5 shrink-0" aria-hidden="true" />
          Solo lectura: administrar integrantes requiere rol Admin.
        </p>
      )}

      <LoadState
        state={loadState}
        isEmpty={users.length === 0}
        loadingText="Cargando el equipo…"
        errorText="No se pudo cargar el equipo."
        emptyText="Todavía no hay integrantes."
        onRetry={reload}
        className="mt-4"
      />

      {loadState === 'ready' && users.length > 0 && visibleMembers.length === 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-body text-label-secondary">Nadie coincide con la búsqueda.</p>
          {isFiltered && (
            <Button variant="neutral" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {loadState === 'ready' && visibleMembers.length > 0 && (
        <MemberList
          members={visibleMembers}
          me={me}
          canManage={canManage}
          onEdit={(member) => setEditMemberId(member.id)}
          onDelete={(member) => setDeleteMemberId(member.id)}
        />
      )}

      {/* Each sheet mounts only while it is open, so every opening seeds its form from scratch.
          The keys keep "new" and "edit" from ever being mistaken for the same sheet. */}
      <AnimatePresence>
        {isCreateOpen && (
          <MemberModal
            key="new"
            me={me}
            members={users}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editMember && (
          <MemberModal
            key={editMember.id}
            member={editMember}
            me={me}
            members={users}
            onClose={() => setEditMemberId(null)}
            onSubmit={(values) => handleUpdate(editMember, values)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteMember && (
          <ConfirmModal
            key={deleteMember.id}
            isOpen
            title="Quitar del equipo"
            confirmLabel="Quitar del equipo"
            pendingLabel="Quitando…"
            onClose={() => setDeleteMemberId(null)}
            onConfirm={() => handleDelete(deleteMember)}
          >
            {deleteMember.name} pierde el acceso.{' '}
            {deleteAssigned > 0 &&
              `${deleteAssigned === 1 ? 'Su ticket asignado queda' : `Sus ${deleteAssigned} tickets asignados quedan`} sin responsable. `}
            No se puede deshacer.
          </ConfirmModal>
        )}
      </AnimatePresence>
    </section>
  )
}
