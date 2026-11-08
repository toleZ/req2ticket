import { X } from 'lucide-react'

import { HEADER } from '@/components/ui/DetailHeader/DetailHeader.styles'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { TYPE_CARDS } from './CreateTicketModal.data'
import { TYPE_CARD, TYPE_CARD_ICON, TYPE_GRID, TYPE_HEADING } from './CreateTicketModal.styles'

/* The create sheet's first step: what kind of ticket. Each card says in one line what the type
   is for. `onChoose(type)` moves on to the form. */
export function CreateTicketTypeStep({ onChoose, onClose }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={HEADER}>
        <h2 className={TYPE_HEADING}>¿Qué querés crear?</h2>
        <IconButton label="Cerrar" onClick={onClose}>
          <X className="size-4.5" aria-hidden="true" />
        </IconButton>
      </div>

      <div className={TYPE_GRID}>
        {TYPE_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button key={card.value} type="button" onClick={() => onChoose(card.value)} className={TYPE_CARD}>
              <span className={TYPE_CARD_ICON}>
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-headline text-label">{card.label}</span>
                <span className="mt-0.5 block text-footnote text-label-secondary">{card.text}</span>
              </span>
            </button>
          )
        })}
      </div>

      <p className="px-5 pb-5 text-footnote text-label-secondary">El tipo no se puede cambiar después.</p>
    </div>
  )
}
