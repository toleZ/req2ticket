import { Check } from 'lucide-react'

import { LoadState } from '@/components/ui/LoadState/LoadState'
import { PERMISSION_LABELS, ROLE_OPTIONS } from '@/lib/options'
import { useRoles } from '@/lib/queries/account'

/**
 * "¿Qué puede hacer cada rol?" (PAGE-1): every role against every permission, in plain words.
 * Everyone sees it, not only Admins, so a Developer understands why they cannot start a sprint.
 *
 * The ticks come from the API (/api/roles), never from a copy of the matrix kept here. Being a
 * member is enough to see the whole project, so that row is ticked for everyone.
 */
export function RolesPanel() {
  const { data: roles, isPending, isError, refetch } = useRoles()

  if (isPending || isError) {
    return (
      <LoadState
        state={isError ? 'error' : 'loading'}
        loadingText="Cargando los roles…"
        errorText="No se pudieron cargar los roles."
        onRetry={refetch}
      />
    )
  }

  const permissions = Object.keys(PERMISSION_LABELS)

  return (
    <div className="mt-3 overflow-x-auto rounded-card bg-elevated shadow-card ring-[0.5px] ring-separator">
      <table className="w-full min-w-[640px] text-left">
        <caption className="sr-only">Qué puede hacer cada rol en el proyecto</caption>
        <thead className="hairline-b">
          <tr>
            <th scope="col" className="eyebrow px-4 py-2.5 font-semibold">
              Acción
            </th>
            {roles.map((role) => (
              <th key={role.role} scope="col" className="eyebrow px-2 py-2.5 text-center font-semibold">
                {ROLE_OPTIONS.find((option) => option.value === role.role)?.label ?? role.role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <PermissionRow label="Ver todo el proyecto" cells={roles.map(() => true)} />
          {permissions.map((permission) => (
            <PermissionRow
              key={permission}
              label={PERMISSION_LABELS[permission]}
              cells={roles.map((role) => role.permissions.includes(permission))}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PermissionRow({ label, cells }) {
  return (
    <tr className="not-first:hairline-t">
      <th scope="row" className="px-4 py-2 text-footnote font-normal text-label">
        {label}
      </th>
      {cells.map((allowed, index) => (
        <td key={index} className="px-2 py-2 text-center">
          {allowed ? (
            <Check className="mx-auto size-4 text-green" aria-label="Sí" />
          ) : (
            <span className="text-label-tertiary" aria-label="No">
              —
            </span>
          )}
        </td>
      ))}
    </tr>
  )
}
