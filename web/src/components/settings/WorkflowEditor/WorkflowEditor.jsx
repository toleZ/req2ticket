import { useState } from 'react'
import { Check, Minus } from 'lucide-react'

import { Button } from '@/components/ui/Button/Button'
import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal'
import { toast } from '@/components/ui/Toast/toast'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { TICKET_STATUS_OPTIONS } from '@/lib/options'
import { useDeleteWorkflow, useSaveWorkflow } from '@/lib/queries/workflow'
import { DEFAULT_WORKFLOW } from '@/lib/workflow'
import { ACTIONS, SECTION, SECTION_INTRO, SECTION_TITLE } from '../Settings.styles'
import { deadEnds, sameKeys, toKeys, toTransitions, transitionKey } from './WorkflowEditor.helpers'

/**
 * The project's workflow (ENT-3): which status may move to which, as a grid — rows are "desde",
 * columns "hacia", a checkbox at each crossing. The statuses themselves are the same for every
 * project; the workflow only decides the moves between them.
 *
 * Without a workflow, tickets move freely and this offers to create one from the template. Before
 * saving, a status with no way out is marked and Guardar stays off with the reason. Without
 * workflow.edit the grid is read only: ticks and dashes, no controls.
 *
 * Mount it with a key that changes when the saved workflow does (its updatedAt): the draft is
 * seeded once from `workflow`.
 */
export function WorkflowEditor({ projectId, workflow, canEdit }) {
  const saved = workflow ? toKeys(workflow.transitions) : []
  const [draft, setDraft] = useState(saved)
  const [isCreating, setIsCreating] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const saveWorkflow = useSaveWorkflow(projectId)
  const deleteWorkflow = useDeleteWorkflow(projectId)

  const editing = Boolean(workflow) || isCreating
  const problems = deadEnds(draft)
  const firstProblem = Object.values(problems)[0]
  const changed = isCreating || !sameKeys(draft, saved)
  const saving = saveWorkflow.isPending

  function toggle(from, to, on) {
    const key = transitionKey(from, to)
    setDraft(on ? [...draft, key] : draft.filter((item) => item !== key))
  }

  function startCreating() {
    setDraft(toKeys(DEFAULT_WORKFLOW))
    setIsCreating(true)
  }

  async function handleSave() {
    try {
      await saveWorkflow.mutateAsync(toTransitions(draft))
      setIsCreating(false)
      toast.success('Workflow guardado')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  async function handleRemove() {
    await deleteWorkflow.mutateAsync()
    toast.success('Workflow quitado. Los tickets se mueven libremente.')
  }

  return (
    <section className={SECTION} aria-labelledby="settings-workflow">
      <h2 id="settings-workflow" className={SECTION_TITLE}>
        Workflow
      </h2>
      <p className={SECTION_INTRO}>
        Qué cambios de estado se permiten. Los estados son los mismos para todos los proyectos; el workflow decide
        solo los caminos entre ellos.
      </p>

      {!editing ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-body text-label-secondary">
            Este proyecto no tiene workflow: los tickets se mueven libremente.
          </p>
          {canEdit && (
            <Button size="sm" onClick={startCreating}>
              Crear workflow
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-group bg-grouped p-3 ring-[0.5px] ring-separator">
            <table className="w-full text-left">
              <caption className="sr-only">Transiciones permitidas: filas desde, columnas hacia</caption>
              <thead>
                <tr>
                  <th scope="col" className="eyebrow pb-2 pr-4 font-semibold">
                    Desde \ Hacia
                  </th>
                  {TICKET_STATUS_OPTIONS.map((to) => (
                    <th key={to.value} scope="col" className="eyebrow px-2 pb-2 text-center font-semibold">
                      {to.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TICKET_STATUS_OPTIONS.map((from) => (
                  <tr key={from.value} className="hairline-t">
                    <th scope="row" className="py-2 pr-4 text-subheadline font-normal">
                      <span className={problems[from.value] ? 'font-medium text-red-text' : 'text-label'}>
                        {from.label}
                      </span>
                      {problems[from.value] && (
                        <span className="block text-footnote text-red-text">{problems[from.value]}</span>
                      )}
                    </th>
                    {TICKET_STATUS_OPTIONS.map((to) => (
                      <td key={to.value} className="px-2 py-2 text-center">
                        {from.value === to.value ? (
                          <span className="text-label-quaternary" aria-hidden="true">
                            ·
                          </span>
                        ) : canEdit ? (
                          <Checkbox
                            id={`wf-${from.value}-${to.value}`}
                            checked={draft.includes(transitionKey(from.value, to.value))}
                            ariaLabel={`De ${from.label} a ${to.label}`}
                            disabled={saving}
                            onChange={(on) => toggle(from.value, to.value, on)}
                          />
                        ) : draft.includes(transitionKey(from.value, to.value)) ? (
                          <Check className="mx-auto size-4 text-green" aria-label={`De ${from.label} a ${to.label}: sí`} />
                        ) : (
                          <Minus
                            className="mx-auto size-4 text-label-tertiary"
                            aria-label={`De ${from.label} a ${to.label}: no`}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {canEdit && (
            <div className={cn(ACTIONS, 'mt-4')}>
              {firstProblem ? (
                <Tooltip label={firstProblem} wrapsDisabled>
                  <Button disabled>Guardar workflow</Button>
                </Tooltip>
              ) : (
                <Button onClick={handleSave} disabled={saving || !changed}>
                  {saving ? 'Guardando…' : 'Guardar workflow'}
                </Button>
              )}
              <Button variant="neutral" onClick={() => setDraft(toKeys(DEFAULT_WORKFLOW))} disabled={saving}>
                Usar plantilla
              </Button>
              {isCreating && (
                <Button variant="ghost" onClick={() => setIsCreating(false)} disabled={saving}>
                  Cancelar
                </Button>
              )}
              {workflow && (
                <Button variant="ghost" onClick={() => setIsRemoveOpen(true)} disabled={saving} className="ml-auto text-red-text">
                  Quitar workflow
                </Button>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={isRemoveOpen}
        title="Quitar el workflow"
        confirmLabel="Quitar workflow"
        pendingLabel="Quitando…"
        onClose={() => setIsRemoveOpen(false)}
        onConfirm={handleRemove}
      >
        <p>Los tickets van a poder moverse a cualquier estado.</p>
      </ConfirmModal>
    </section>
  )
}
