import { useState } from 'react'

import { Button } from '@/components/ui/Button/Button'
import { FormError } from '@/components/ui/FormError/FormError'
import { TextAreaField } from '@/components/ui/Field/TextAreaField'
import { TextField } from '@/components/ui/Field/TextField'
import { Modal } from '@/components/ui/Modal/Modal'
import { RequiredNote } from '@/components/ui/SheetField/SheetField'
import { errorMessage } from '@/lib/errors'
import { useCreateProject } from '@/lib/queries/projects'
import { INITIAL_VALUES, suggestKey, validateProjectForm } from './CreateProjectModal.helpers'

/**
 * "Nuevo proyecto" (ENT-1): name, key and description. The key is suggested from the name as you
 * type (the initials, upper-cased) until you edit it yourself, and the preview under it shows
 * what the codes will look like — because it can never change afterwards.
 *
 * `onCreated(project)` runs once the API created it; the shell opens it.
 */
export function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [keyEdited, setKeyEdited] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const createProject = useCreateProject()
  const submitting = createProject.isPending

  function handleChange(e) {
    const { name, value } = e.target
    const next = { ...values, [name]: value }

    if (name === 'name' && !keyEdited) next.key = suggestKey(value)
    if (name === 'key') {
      next.key = value.toUpperCase()
      setKeyEdited(true)
    }

    setValues(next)
    if (errors[name]) setErrors({ ...errors, [name]: validateProjectForm(next)[name] })
  }

  function reset() {
    setValues(INITIAL_VALUES)
    setKeyEdited(false)
    setErrors({})
    setFormError('')
  }

  function handleClose() {
    if (submitting) return
    reset()
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateProjectForm(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setFormError('')
    try {
      const project = await createProject.mutateAsync(values)
      reset()
      onCreated(project)
    } catch (err) {
      /* A key already in use is a problem of that field, so the message goes under it. */
      if (/key/i.test(err.message) || err.fieldErrors?.key) {
        setErrors({ ...found, key: 'Esa key ya está en uso. Probá con otra.' })
      } else {
        setFormError(errorMessage(err))
      }
    }
  }

  const preview = values.key || 'KEY'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo proyecto">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && <FormError>{formError}</FormError>}

        <TextField
          id="project-name"
          name="name"
          label="Nombre"
          placeholder="Tienda Online"
          value={values.name}
          disabled={submitting}
          error={errors.name}
          onChange={handleChange}
        />

        <div>
          <TextField
            id="project-key"
            name="key"
            label="Key"
            placeholder="TND"
            autoComplete="off"
            value={values.key}
            disabled={submitting}
            error={errors.key}
            onChange={handleChange}
          />
          <p className="mt-1.5 text-footnote text-label-secondary">
            Tus tickets se verán como <span className="mono font-medium text-label">{preview}-UH-1</span>.
            {' '}No se puede cambiar después.
          </p>
        </div>

        <TextAreaField
          id="project-description"
          name="description"
          label="Descripción"
          optional
          rows={3}
          maxLength={2000}
          placeholder="De qué se trata el proyecto"
          value={values.description}
          disabled={submitting}
          onChange={handleChange}
        />

        <div className="flex items-center gap-2 pt-2">
          <RequiredNote />
          <Button variant="ghost" onClick={handleClose} disabled={submitting} className="ml-auto">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear proyecto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
