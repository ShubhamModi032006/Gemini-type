import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SettingsContent from '@/components/SettingsContent'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Note: We don't redirect if not logged in, so users can still view theme/display settings

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-between">
      <Header user={user} />
      <SettingsContent user={user} />
      <Footer />
    </div>
  )
}
