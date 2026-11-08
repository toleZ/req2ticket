import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { AccountSection } from '@/components/settings/AccountSection/AccountSection'
import { readSession } from '@/lib/auth'
import { useMe } from '@/lib/queries/account'

/**
 * Mi cuenta (PAGE-2), opened from the user menu at the foot of the sidebar: your name and your
 * password. It lives outside any project (/account), so it is the same page whichever project
 * you are in, and it works for someone who is not in any project yet.
 */
export function Account() {
  const { data: me } = useMe()
  const user = me ?? readSession()?.user

  return (
    <section>
      <PageHeader title="Mi cuenta" />
      {user && <AccountSection key={user.id} user={user} />}
    </section>
  )
}
