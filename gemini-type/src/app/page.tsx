import { createClient } from '@/lib/supabase/server' // 1. Import the server client
import Header from '@/components/Header'
import TypingBox from '@/components/TypingBox'
import Footer from '@/components/Footer'

// 2. Make the component async
export default async function Home() {
  // 3. Fetch user data on the server
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-between">
      {/* 4. Pass the user object as a prop */}
      <Header user={user} />
      <main className="w-full flex-grow flex items-center justify-center">
        {/* 4. Pass the user object as a prop */}
        <TypingBox user={user} />
      </main>
      <Footer />
    </div>
  )
}