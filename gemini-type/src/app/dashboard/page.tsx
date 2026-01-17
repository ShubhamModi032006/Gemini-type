import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header' // Assuming your Header component
import Footer from '@/components/Footer' // Assuming your Footer component
import StatsChart from '@/components/StatsChart'

// Helper to format the data for the chart
const formatChartData = (data: any[]) => {
  return data.map(item => ({
    ...item,
    // Make sure accuracy is a number
    accuracy: Number(item.accuracy),
  }))
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Get the user. Redirect to login if not authenticated.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch all test results for this user
  // We order by 'taken_at' ASCENDING to make the graph plot correctly
  const { data: testResults, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('user_id', user.id)
    .order('taken_at', { ascending: true }) // Ascending for graph

  if (error) {
    console.error('Error fetching test results:', error)
  }

  const chartData = testResults ? formatChartData(testResults) : []

  // Create a reversed list for the "History" table
  const historyData = [...chartData].reverse()

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-between">
      <Header user={user} />
      <main className="w-full flex-grow flex items-start justify-center py-12">
        <div className="w-full max-w-4xl mx-auto p-4">
          <h1 className="text-4xl font-bold mb-8">
            Hello, {user.email}
          </h1>

          {/* Graph Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
            <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
            {chartData.length > 0 ? (
              <StatsChart data={chartData} />
            ) : (
              <p className="text-gray-400">Complete a test to see your progress!</p>
            )}
          </div>

          {/* History Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Test History</h2>
            <div className="space-y-4">
              {historyData.length > 0 ? (
                historyData.map((test) => (
                  <div
                    key={test.id}
                    className="grid grid-cols-5 gap-4 p-4 bg-gray-700 rounded-md items-center"
                  >
                    <div className="text-sm text-gray-300">
                      {new Date(test.taken_at).toLocaleDateString()}
                    </div>
                    <div className="font-semibold">
                      {test.test_level}
                    </div>
                    <div><span className="font-bold text-blue-400">{test.wpm}</span> WPM</div>
                    <div><span className="font-bold text-green-400">{test.accuracy}%</span> Acc</div>
                    <div><span className="font-bold text-red-400">{test.error_count}</span> Mistakes</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No test history yet.</p>
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}