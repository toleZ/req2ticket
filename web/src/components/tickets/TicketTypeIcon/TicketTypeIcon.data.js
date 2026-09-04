import { BookOpen, Bug, ListTodo, Wrench } from 'lucide-react'

/* One icon per type. The rows used to draw a FileText for all four, which is as good as
   drawing nothing: an icon that does not distinguish does not inform. */
export const TYPE_ICONS = {
  userStory: BookOpen,
  task: ListTodo,
  bug: Bug,
  fix: Wrench,
}
