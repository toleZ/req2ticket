import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { UserPlus } from 'lucide-react'

import { ProjectTable } from '@/components/admin/ProjectTable/ProjectTable'
import { UserFormModal } from '@/components/admin/UserFormModal/UserFormModal'
import { UserTable } from '@/components/admin/UserTable/UserTable'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Banner } from '@/components/ui/Banner/Banner'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { LoadState } from '@/components/ui/LoadState/LoadState'
import { SegmentedField } from '@/components/ui/SegmentedField/SegmentedField'
import { toast } from '@/components/ui/Toast/toast'
import { readSession } from '@/lib/auth'
import { PLATFORM_SUPER_ADMIN } from '@/lib/options'
import { useProjects } from '@/lib/queries/projects'
import { loadStateOf, retryAll } from '@/lib/queries/loadState'
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '@/lib/queries/users'
import { NotFound } from '@/pages/NotFound'

const TABS = [
  { value: 'users', label: 'Usuarios' },
  { value: 'projects', label: 'Proyectos' },
]

/* Administración (/admin), only for a SuperAdmin: the users of the platform and every project.
   Anyone else gets the not-found page — the API would refuse them anyway (403). It lives outside
   any project, like Mi cuenta, and opens from the user menu. */
export function Admin() {
  const isSuperAdmin = readSession()?.user?.platformRole === PLATFORM_SUPER_ADMIN
  if (!isSuperAdmin) return <NotFound />
  return <AdminPage />
}

function AdminPage() {
  const [tab, setTab] = useState('users')
  const [editing, setEditing] = useState(null) // null closed, 'new', or the user being edited
  const [deleting, setDeleting] = useState(null)

  const usersQuery = useUsers()
  const projectsQuery = useProjects()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const meId = readSession()?.user?.id
  const users = usersQuery.data ?? []
  const projects = projectsQuery.data ?? []
  const loadState = loadStateOf(usersQuery, projectsQuery)
  const withoutAdmin = projects.filter((project) => project.adminCount === 0)

  async function handleSubmit(values) {
    if (editing === 'new') {
      const created = await createUser.mutateAsync(values)
      toast.success(`${created.name} se creó`)
    } else {
      await updateUser.mutateAsync({ userId: editing.id, values })
      toast.success(`${values.name.trim()} se guardó`)
    }
  }

  async function handleDelete() {
    await deleteUser.mutateAsync(deleting.id)
    toast.success(`${deleting.name} se borró`)
  }

  const meta =
    loadState === 'ready'
      ? `${users.length} ${users.length === 1 ? 'usuario' : 'usuarios'} · ${projects.length} ${projects.length === 1 ? 'proyecto' : 'proyectos'}`
      : null

  return (
    <section>
      <PageHeader title="Administración" meta={meta}>
        {tab === 'users' && (
          <Button size="sm" onClick={() => setEditing('new')} className="shrink-0">
            <UserPlus className="size-4" aria-hidden="true" />
            Crear usuario
          </Button>
        )}
      </PageHeader>

      <div className="mt-4 max-w-xs">
        <SegmentedField name="admin-tab" legend="Sección" options={TABS} value={tab} onChange={setTab} />
      </div>

      <LoadState
        state={loadState}
        loadingText="Cargando…"
        errorText="No se pudo cargar la administración."
        onRetry={() => retryAll(usersQuery, projectsQuery)}
        className="mt-4"
      />

      {loadState === 'ready' && tab === 'users' && (
        <UserTable users={users} meId={meId} onEdit={setEditing} onDelete={setDeleting} />
      )}

      {loadState === 'ready' && tab === 'projects' && (
        <>
          {withoutAdmin.length > 0 && (
            <div className="mt-4">
              <Banner tone="warning" title={withoutAdmin.length === 1 ? 'Un proyecto sin Admin' : `${withoutAdmin.length} proyectos sin Admin`}>
                Nadie adentro puede gestionarlos. Entrá a su Equipo y agregá a alguien como Admin.
              </Banner>
            </div>
          )}
          <ProjectTable projects={projects} />
        </>
      )}

      <AnimatePresence>
        {editing && (
          <UserFormModal
            key={editing === 'new' ? 'new' : editing.id}
            user={editing === 'new' ? null : editing}
            isMe={editing !== 'new' && editing.id === meId}
            onClose={() => setEditing(null)}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleting !== null}
        title="Borrar usuario"
        confirmLabel="Borrar usuario"
        pendingLabel="Borrando…"
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      >
        {deleting && (
          <p>
            Se borra la cuenta de <strong className="font-semibold text-label">{deleting.name}</strong> y sale de
            todos sus proyectos. Sus tickets quedan sin asignar. No se puede deshacer.
          </p>
        )}
      </ConfirmModal>
    </section>
  )
}
