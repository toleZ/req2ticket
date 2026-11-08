/* The permission names the API speaks (ProjectPermissions.cs). A screen never checks a role:
   it asks for one of these with can(), which reads the project's `myPermissions`.

       const { can } = useCurrentProject()
       {can(PERMISSIONS.TICKETS_WRITE) && <Button>Nuevo ticket</Button>}

   The rule for what to do without the permission (AUTH-1):
     - an action you cannot take: the button does not appear;
     - a field you cannot edit: it shows as text (readOnly), not as a disabled input;
     - an action a business rule blocks (not your role): the button shows disabled, with the
       reason in a Tooltip. */
export const PERMISSIONS = {
  TICKETS_WRITE: 'tickets.write',
  TICKETS_DELETE: 'tickets.delete',
  EPICS_MANAGE: 'epics.manage',
  SPRINTS_MANAGE: 'sprints.manage',
  WORKFLOW_EDIT: 'workflow.edit',
  PROJECT_EDIT: 'project.edit',
  PROJECT_ARCHIVE: 'project.archive',
  MEMBERS_MANAGE: 'members.manage',
  PROJECTS_DELETE: 'projects.delete',
}
