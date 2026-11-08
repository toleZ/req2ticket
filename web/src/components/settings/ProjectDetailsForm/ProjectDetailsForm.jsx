import { useState } from 'react'

import { Button } from '@/components/ui/Button/Button'
import { TextAreaField } from '@/components/ui/Field/TextAreaField'
import { TextField } from '@/components/ui/Field/TextField'
import { FormError } from '@/components/ui/FormError/FormError'
import { ReadOnlyValue } from '@/components/ui/ReadOnlyValue/ReadOnlyValue'
import { toast } from '@/components/ui/Toast/toast'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { errorMessage } from '@/lib/errors'
import { useUpdateProject } from '@/lib/queries/projects'
import { ACTIONS, FORM, ROW_LABEL, SECTION, SECTION_INTRO, SECTION_TITLE } from '../Settings.styles'

function validate(values) {
  const errors = {}
  const name = values.name.trim()
  if (!name) errors.name = 'Ingresá el nombre del proyecto'
  else if (name.length < 3 || name.length > 120) errors.name = 'El nombre tiene que tener entre 3 y 120 caracteres'
  return errors
}

/**
 * The project's name and description (PAGE-2). The key is shown but never editable: every code
 * of the project carries it. Without project.edit (or in an archived project) everything reads
 * as text, never as disabled inputs (AUTH-1).
 *
 * Mount it with `key={project.id}`: the form seeds itself once from `project`.
 */
export function ProjectDetailsForm({ project, canEdit }) {
  const [values, setValues] = useState({ name: project.name, description: project.description ?? '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const updateProject = useUpdateProject(project.id)
  const saving = updateProject.isPending

  const dirty = values.name !== project.name || values.description !== (project.description ?? '')

  function handleChange(e) {
    const next = { ...values, [e.target.name]: e.target.value }
    setValues(next)
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: validate(next)[e.target.name] })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setFormError('')
    try {
      await updateProject.mutateAsync(values)
      toast.success('Cambios guardados')
    } catch (err) {
      if (err?.fieldErrors?.name) setErrors({ name: 'El nombre tiene que tener entre 3 y 120 caracteres' })
      else setFormError(errorMessage(err))
    }
  }

  const keyRow = (
    <div>
      <p className={ROW_LABEL}>Key</p>
      <Tooltip label="La Key no se puede cambiar" align="start">
        <ReadOnlyValue variant="field" className="mono font-medium">
          {project.key}
        </ReadOnlyValue>
      </Tooltip>
    </div>
  )

  return (
    <section className={SECTION} aria-labelledby="settings-project">
      <h2 id="settings-project" className={SECTION_TITLE}>
        Proyecto
      </h2>
      <p className={SECTION_INTRO}>El nombre y la descripción que ve todo el equipo.</p>

      {canEdit ? (
        <form onSubmit={handleSubmit} noValidate className={FORM}>
          {formError && <FormError>{formError}</FormError>}
          <TextField
            id="project-settings-name"
            name="name"
            label="Nombre"
            value={values.name}
            disabled={saving}
            error={errors.name}
            onChange={handleChange}
          />
          {keyRow}
          <TextAreaField
            id="project-settings-description"
            name="description"
            label="Descripción"
            optional
            rows={3}
            maxLength={2000}
            value={values.description}
            disabled={saving}
            onChange={handleChange}
          />
          <div className={ACTIONS}>
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      ) : (
        <div className={FORM}>
          <div>
            <p className={ROW_LABEL}>Nombre</p>
            <ReadOnlyValue variant="field">{project.name}</ReadOnlyValue>
          </div>
          {keyRow}
          <div>
            <p className={ROW_LABEL}>Descripción</p>
            <ReadOnlyValue variant="field" empty="Sin descripción">
              {project.description}
            </ReadOnlyValue>
          </div>
        </div>
      )}
    </section>
  )
}
