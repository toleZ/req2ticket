import { SHEET_LABEL } from '@/components/tickets/TicketExtraFields/TicketExtraFields.styles'
import { cn } from '@/lib/cn'

export const SIDE_LABEL = cn(SHEET_LABEL, 'text-label-secondary')

export const FORM = 'flex min-h-0 flex-1 flex-col md:h-[min(44rem,calc(100dvh_-_2rem))] md:flex-none'

export const FIELD_ERROR = 'mt-1 animate-fade-in text-footnote text-red-text'

export const FORM_ERROR = 'mr-auto animate-fade-in text-footnote text-red-text'
