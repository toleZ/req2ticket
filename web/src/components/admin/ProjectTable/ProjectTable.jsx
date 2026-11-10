import { useState } from 'react'
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ACTIONS_COL, HEAD, HEAD_CELL, ROLE_COL, TABLE, WRAP } from '@/components/team/MemberList/MemberList.styles'
import { ACTIONS, CELL, EMAIL, NAME, ROLE_CELL, ROW } from '@/components/team/MemberRow/MemberRow.styles'
import { Badge } from '@/components/ui/Badge/Badge'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { toast } from '@/components/ui/Toast/toast'
import { errorMessage } from '@/lib/errors'
import { projectPath } from '@/lib/navItems'
import { useDeleteProject, useSetProjectArchived } from '@/lib/queries/projects'

/**
 * Every project of the platform, archived ones included, for the SuperAdmin: its people, its
 * Admins and whether it is archived. A project with no Admin is flagged: nobody inside it can
 * manage it, so the SuperAdmin adds one from its Equipo page (the link).
 */
export function ProjectTable({ projects }) {
  return (
    <div className={WRAP}>
      <table className={TABLE}>
        <thead className={HEAD}>
          <tr>
            <th scope="col" className={HEAD_CELL}>
              Proyecto
            </th>
            <th scope="col" className={`${HEAD_CELL} ${ROLE_COL}`}>
              Equipo
            </th>
            <th scope="col" className={ACTIONS_COL}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// A row of its own: each one holds the hooks of its project (archive, delete).
function ProjectRow({ project }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const setArchived = useSetProjectArchived(project.id)
  const deleteProject = useDeleteProject(project.id)

  async function handleArchive() {
    try {
      await setArchived.mutateAsync(!project.isArchived)
      toast.success(project.isArchived ? `${project.key} se restauró` : `${project.key} quedó archivado`)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  async function handleDelete() {
    await deleteProject.mutateAsync()
    toast.success(`${project.key} borrado`)
  }

  const team = (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="text-footnote text-label-secondary">
        {project.memberCount} {project.memberCount === 1 ? 'integrante' : 'integrantes'}
      </span>
      {project.adminCount === 0 && (
        <Link to={projectPath(project.key, 'team')} title="Agregale un Admin desde su Equipo">
          <Badge tone="red">Sin Admin</Badge>
        </Link>
      )}
    </span>
  )

  return (
    <tr className={ROW}>
      <td className={CELL}>
        <Link to={projectPath(project.key)} className="group block min-w-0">
          <p className="flex min-w-0 items-center gap-2">
            <span className={`${NAME} group-hover:underline`}>{project.name}</span>
            {project.isArchived && <Badge>Archivado</Badge>}
          </p>
          <p className={`${EMAIL} mono`}>{project.key}</p>
        </Link>
        <div className="mt-1.5 sm:hidden">{team}</div>
      </td>

      <td className={ROLE_CELL}>{team}</td>

      <td className={CELL}>
        <div className={ACTIONS}>
          <IconButton
            label={project.isArchived ? `Restaurar ${project.key}` : `Archivar ${project.key}`}
            title={project.isArchived ? 'Restaurar' : 'Archivar'}
            disabled={setArchived.isPending}
            onClick={handleArchive}
          >
            {project.isArchived ? (
              <ArchiveRestore className="size-4" aria-hidden="true" />
            ) : (
              <Archive className="size-4" aria-hidden="true" />
            )}
          </IconButton>
          <IconButton label={`Borrar ${project.key}`} title="Borrar" variant="danger" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="size-4" aria-hidden="true" />
          </IconButton>
        </div>

        <ConfirmModal
          isOpen={isDeleteOpen}
          title={`Borrar ${project.name}`}
          confirmLabel="Borrar proyecto"
          pendingLabel="Borrando…"
          confirmText={project.key}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
        >
          <p>
            Se borra con todo lo suyo: épicas, sprints, tickets, workflow y equipo. No se puede deshacer. Para
            confirmar, escribí <span className="mono font-medium text-label">{project.key}</span>.
          </p>
        </ConfirmModal>
      </td>
    </tr>
  )
}
