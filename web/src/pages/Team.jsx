import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { ChevronDown, Eye, LogOut, UserPlus } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { MemberList } from '@/components/team/MemberList/MemberList'
import { MemberModal } from '@/components/team/MemberModal/MemberModal'
import { RoleFilterBar } from '@/components/team/RoleFilterBar/RoleFilterBar'
import { RolesPanel } from '@/components/team/RolesPanel/RolesPanel'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { normalize } from '@/components/ui/FilterChip/FilterChip.helpers'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { SearchBox } from '@/components/ui/SearchBox/SearchBox'
import { toast } from '@/components/ui/Toast/toast'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentProject } from '@/hooks/useCurrentProject'
import { readSession } from '@/lib/auth'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { findOption, ROLE_OPTIONS, SPRINT_ACTIVE } from '@/lib/options'
import { PERMISSIONS } from '@/lib/permissions'
import { useAddMember, useChangeMemberRole, useLeaveProject, useMembers, useRemoveMember } from '@/lib/queries/members'
import { useSprints } from '@/lib/queries/sprints'
import { useTickets } from '@/lib/queries/tickets'
import { compareMembers, countAdmins, LAST_ADMIN_REASON } from '@/lib/roles'
import { changeParams } from '@/lib/urlFilters'

/* "4 tickets y 1 épica": the counts the API gives each member, in words. */
function assignedText(member) {
  const tickets = member.assignedTickets === 1 ? '1 ticket' : `${member.assignedTickets} tickets`
  const epics = member.ownedEpics === 1 ? '1 épica' : `${member.ownedEpics} épicas`
  if (member.assignedTickets && member.ownedEpics) return `Sus ${tickets} y ${epics} asignados quedarán sin asignar.`
  if (member.assignedTickets) return `Sus ${tickets} asignados quedarán sin asignar.`
  if (member.ownedEpics) return `Sus ${epics} quedarán sin responsable.`
  return 'No tiene tickets ni épicas asignados.'
}

/**
 * Equipo (PAGE-1): who is in the project and with which role. With members.manage you add people
 * by email, change roles inline and remove them; without it the same list shows read only.
 * The project always keeps one Admin: the last one is locked, with the reason.
 */
export function Team() {
  const { projectId, project, can } = useCurrentProject()
  const members = useMembers(projectId)
  const { data: tickets = [] } = useTickets(projectId)
  const { data: sprints = [] } = useSprints(projectId)
  const addMember = useAddMember(projectId)
  const changeRole = useChangeMemberRole(projectId)
  const removeMember = useRemoveMember(projectId)
  const leaveProject = useLeaveProject(projectId)
  const navigate = useNavigate()

  /* The search and the role filter live in the URL like the other lists', so a reload or the
     back button keeps them. The text is also held in state: a box bound only to the URL lost
     letters under fast typing. */
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const roleFilter = params.get('rol') ?? ''

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isRolesOpen, setIsRolesOpen] = useState(false)
  // By id, so the confirmation reads the member as the list holds them now.
  const [removeId, setRemoveId] = useState(null)
  const [selfDemotion, setSelfDemotion] = useState(null)
  const [isLeaveOpen, setIsLeaveOpen] = useState(false)

  const meId = readSession()?.user?.id
  const canManage = can(PERMISSIONS.MEMBERS_MANAGE)
  const list = members.data ?? []
  const adminCount = countAdmins(list)
  // A SuperAdmin may look at a project without being in it: then there is nothing to leave.
  const me = list.find((member) => member.id === meId) ?? null
  const iAmLastAdmin = me?.role === 'admin' && adminCount === 1
  const loadState = members.isError ? 'error' : members.isPending ? 'loading' : 'ready'

  function handleSearchChange(text) {
    setSearch(text)
    changeParams(setParams, (next) => (text ? next.set('q', text) : next.delete('q')), true)
  }

  function handleRoleFilterChange(role) {
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
  const visibleMembers = [...list]
    .sort(compareMembers)
    .filter(
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

  let meta = null
  if (loadState === 'ready') {
    meta = `${list.length} ${list.length === 1 ? 'integrante' : 'integrantes'}`
    if (activeSprint) meta += ` · ${busyIds.size} con tickets en ${activeSprint.name}`
  }

  async function handleAdd(values) {
    const added = await addMember.mutateAsync(values)
    toast.success(`${added.name} se sumó como ${findOption(ROLE_OPTIONS, added.role)?.label}`)
  }

  /* Lowering yourself from Admin is the one change you cannot undo alone: it asks first. */
  function handleChangeRole(member, role) {
    if (member.id === meId && member.role === 'admin' && role !== 'admin') {
      setSelfDemotion({ member, role })
      return
    }
    saveRole(member, role)
  }

  async function saveRole(member, role) {
    try {
      await changeRole.mutateAsync({ userId: member.id, role })
      toast.success(`${member.name} ahora es ${findOption(ROLE_OPTIONS, role)?.label}`)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  /* After leaving, this project is not mine any more: "/" opens another one (or says I have
     none). The project list is already fresh when the mutation resolves (useLeaveProject). */
  async function handleLeave() {
    await leaveProject.mutateAsync()
    toast.success(`Saliste de ${project.name}`)
    navigate('/', { replace: true })
  }

  async function handleRemove(member) {
    await removeMember.mutateAsync(member.id)
    toast.success(`${member.name} ya no es parte del proyecto`)
  }

  const removing = list.find((member) => member.id === removeId) ?? null
  const isFiltered = Boolean(query || roleFilter)
  const savingId = changeRole.isPending ? changeRole.variables?.userId : null

  return (
    <section>
      <PageHeader title="Equipo" meta={meta}>
        {/* Any member may leave; the last Admin may not, or nobody could manage the project. */}
        {me &&
          (iAmLastAdmin ? (
            <Tooltip label={LAST_ADMIN_REASON} wrapsDisabled align="end">
              <Button size="sm" variant="neutral" disabled className="shrink-0">
                <LogOut className="size-4" aria-hidden="true" />
                Salir del proyecto
              </Button>
            </Tooltip>
          ) : (
            <Button size="sm" variant="neutral" onClick={() => setIsLeaveOpen(true)} className="shrink-0">
              <LogOut className="size-4" aria-hidden="true" />
              Salir del proyecto
            </Button>
          ))}
        {canManage && (
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="shrink-0">
            <UserPlus className="size-4" aria-hidden="true" />
            Agregar integrante
          </Button>
        )}
      </PageHeader>

      <button
        type="button"
        aria-expanded={isRolesOpen}
        onClick={() => setIsRolesOpen(!isRolesOpen)}
        className="mt-2 inline-flex items-center gap-1 text-footnote font-medium text-blue-text hover:underline"
      >
        ¿Qué puede hacer cada rol?
        <ChevronDown
          className={cn('size-3.5 transition-transform duration-fast ease-out-quad', isRolesOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {isRolesOpen && <RolesPanel />}

      {loadState === 'ready' && list.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <SearchBox value={search} placeholder="Buscar por nombre o email" onChange={handleSearchChange} />
          <RoleFilterBar members={list} value={roleFilter} onChange={handleRoleFilterChange} />
        </div>
      )}

      {loadState === 'ready' && !canManage && (
        <p className="mt-3 flex items-center gap-1.5 text-footnote text-label-secondary">
          <Eye className="size-3.5 shrink-0" aria-hidden="true" />
          {project?.isArchived
            ? 'El proyecto está archivado: el equipo no se puede cambiar.'
            : 'Solo los Admin del proyecto pueden gestionar el equipo.'}
        </p>
      )}

      <LoadState
        state={loadState}
        isEmpty={list.length === 0}
        loadingText="Cargando el equipo…"
        errorText="No se pudo cargar el equipo."
        emptyText="Todavía no hay integrantes."
        onRetry={members.refetch}
        className="mt-4"
      />

      {loadState === 'ready' && list.length > 0 && visibleMembers.length === 0 && (
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
          meId={meId}
          adminCount={adminCount}
          canManage={canManage}
          savingId={savingId}
          onChangeRole={handleChangeRole}
          onRemove={(member) => setRemoveId(member.id)}
        />
      )}

      {/* The sheet mounts only while it is open, so every opening starts its form from scratch. */}
      <AnimatePresence>
        {isAddOpen && <MemberModal key="add" members={list} onClose={() => setIsAddOpen(false)} onSubmit={handleAdd} />}
      </AnimatePresence>

      <AnimatePresence>
        {removing && (
          <ConfirmModal
            key={removing.id}
            isOpen
            title="Quitar del proyecto"
            confirmLabel="Quitar del proyecto"
            pendingLabel="Quitando…"
            onClose={() => setRemoveId(null)}
            onConfirm={() => handleRemove(removing)}
          >
            <p>
              Vas a quitar a <strong className="font-semibold text-label">{removing.name}</strong> del proyecto.{' '}
              {assignedText(removing)} Se lo puede volver a agregar después.
            </p>
          </ConfirmModal>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isLeaveOpen}
        title="Salir del proyecto"
        confirmLabel="Salir del proyecto"
        pendingLabel="Saliendo…"
        onClose={() => setIsLeaveOpen(false)}
        onConfirm={handleLeave}
      >
        <p>
          Vas a dejar de ver <strong className="font-semibold text-label">{project?.name}</strong>.{' '}
          {me && assignedText(me)} Para volver, alguien con rol Admin te tiene que agregar de nuevo.
        </p>
      </ConfirmModal>

      <AnimatePresence>
        {selfDemotion && (
          <ConfirmModal
            key="self-demotion"
            isOpen
            title="Dejar de ser Admin"
            confirmLabel={`Pasar a ${findOption(ROLE_OPTIONS, selfDemotion.role)?.label}`}
            pendingLabel="Guardando…"
            onClose={() => setSelfDemotion(null)}
            onConfirm={() => changeRole.mutateAsync({ userId: selfDemotion.member.id, role: selfDemotion.role })}
          >
            <p>Vas a dejar de poder gestionar el equipo y el proyecto. ¿Continuar?</p>
          </ConfirmModal>
        )}
      </AnimatePresence>
    </section>
  )
}
