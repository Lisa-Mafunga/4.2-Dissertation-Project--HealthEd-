import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { BookOpen, Users, MessageSquare, FileText, User, LogOut, Heart } from 'lucide-react'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

interface StudentDashboardProps {
  user: any
  onLogout: () => void
  onNavigate: (page: string) => void
}

export function StudentDashboard({ user, onLogout, onNavigate }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState<boolean>(false)
  // reference loading so TypeScript "noUnusedLocals" doesn't complain (it's used in async flows)
  useEffect(() => { void loading }, [loading])
  const [stats, setStats] = useState({
    modulesCompleted: '0/12',
    communityPosts: 0,
    questionsAsked: 0,
    resourcesSaved: 0
  })
  const [recentActivity, setRecentActivity] = useState<Array<any>>([])
  const [recommendedModules, setRecommendedModules] = useState<Array<any>>([])
  useEffect(() => {
    fetchStats()
    fetchActivityAndModules()

    // Poll for updates every 5 seconds for near-real-time updates
    const interval = setInterval(() => {
      fetchStats()
      fetchActivityAndModules()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/stats/student/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setStats({
          modulesCompleted: result.modulesCompleted,
          communityPosts: result.communityPosts,
          questionsAsked: result.questionsAsked,
          resourcesSaved: result.resourcesSaved
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch recent activity and recommended modules, merge progress
  const fetchActivityAndModules = async () => {
    try {
      // Fetch course progress for this user
      const progressResp = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/course-progress/${user.username}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      })
      const progressJson = await progressResp.json()
      const progressList = progressJson.progress || []

      // Fetch modules list
      const modulesResp = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/modules`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      })
      const modulesJson = await modulesResp.json()
      const modules = modulesJson.modules || []

      // Build recommendedModules by merging modules with progress
      const recommended = modules.map((m: any) => {
        const p = progressList.find((pr: any) => pr.courseId === m.id)
        return {
          title: m.title,
          description: m.description || m.summary || '',
          progress: p ? p.progress : 0
        }
      })

      setRecommendedModules(recommended.slice(0, 10))

      // Fetch QA questions (to show recent Q&A activity)
      const qaResp = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/qa/questions`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      })
      const qaJson = await qaResp.json()
      const questions = qaJson.questions || []

      // Build activity entries from progress and questions
      const activityFromProgress = progressList.map((p: any) => ({
        type: 'module',
        title: `${p.completed ? 'Completed' : 'Progress'}: ${modules.find((m: any) => m.id === p.courseId)?.title || p.courseId}`,
        time: p.lastAccessed || new Date().toISOString(),
        ts: new Date(p.lastAccessed || Date.now()).getTime()
      }))

      const activityFromQuestions = questions.slice(0, 20).map((q: any) => ({
        type: q.status === 'pending' ? 'question' : 'answer',
        title: `${q.status === 'pending' ? 'Asked' : 'Answered'}: ${q.question}`,
        time: q.createdAt || q.created_at || new Date().toISOString(),
        ts: new Date(q.createdAt || q.created_at || Date.now()).getTime()
      }))

      // Combine and sort by timestamp desc
      const combined = [...activityFromProgress, ...activityFromQuestions]
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 6)
        .map(a => ({ ...a, time: timeAgo(a.ts) }))

      setRecentActivity(combined)
    } catch (err) {
      console.error('Failed to fetch activity/modules:', err)
    }
  }

  // Simple time-ago helper for display
  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  const quickStats = [
    { label: 'Modules Completed', value: stats.modulesCompleted, icon: BookOpen },
    { label: 'Community Posts', value: stats.communityPosts, icon: Users },
    { label: 'Resources Saved', value: stats.resourcesSaved, icon: FileText }
  ]

  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl text-primary">Student Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={() => onNavigate('profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'education', label: 'Educational Modules' },
              { id: 'community', label: 'Community' },
              { id: 'qa', label: 'Q&A Forum' },
              { id: 'resources', label: 'Resources' }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab(tab.id)
                  onNavigate(tab.id)
                }}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl">{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'module' ? 'bg-green-500' :
                          activity.type === 'post' ? 'bg-blue-500' :
                          activity.type === 'question' ? 'bg-yellow-500' : 'bg-purple-500'
                        }`} />
                        <div className="flex-1">
                          <p>{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Modules */}
              <Card>
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                  <CardDescription>Recommended modules for you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendedModules.map((module, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4>{module.title}</h4>
                          <Badge variant="outline">{module.progress}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => onNavigate('education')}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span>Browse Modules</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => onNavigate('qa')}
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span>Ask Question</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => onNavigate('community')}
                  >
                    <Users className="h-6 w-6" />
                    <span>Join Discussion</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => onNavigate('resources')}
                  >
                    <FileText className="h-6 w-6" />
                    <span>Find Resources</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="h-8 w-8 text-secondary" />
                <h3 className="text-xl font-bold">HealthEdu</h3>
              </div>
              <p className="text-gray-400">
                Empowering students with comprehensive sexual health education and support.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Educational Modules</li>
                <li>Community Forums</li>
                <li>Anonymous Q&A</li>
                <li>Health Resources</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                Email: support@healthedu.com<br />
                Phone: (555) 123-4567<br />
                Available 24/7
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HealthEdu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}