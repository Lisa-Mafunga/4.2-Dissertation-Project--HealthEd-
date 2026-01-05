import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { BookOpen, Clock, CheckCircle, ArrowLeft, ExternalLink, FileText, Video, Heart } from 'lucide-react'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { toast } from 'sonner'

// Helper function to safely format dates
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString()
  } catch {
    return 'N/A'
  }
}

interface EducationModulesProps {
  onBack: () => void
  user: any
}

interface Module {
  id: string
  title: string
  description: string
  category: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  content_type: 'link' | 'document' | 'video'
  content_url: string
  uploaded_by: string
  created_at: string
}

export function EducationModules({ onBack, user }: EducationModulesProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())

  const categories = ['All', 'STIs', 'Contraception', 'Pregnancy', 'Mental Health', 'General Health']

  useEffect(() => {
    fetchModules()
    fetchProgress()
  }, [])

  const fetchModules = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/modules`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.modules) {
        setModules(result.modules)
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
      toast.error('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/course-progress/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.progress) {
        const progressMap: Record<string, number> = {}
        const completed = new Set<string>()
        
        result.progress.forEach((p: any) => {
          progressMap[p.courseId] = p.progress || 0
          if (p.completed) {
            completed.add(p.courseId)
          }
        })
        
        setProgress(progressMap)
        setCompletedModules(completed)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const handleModuleAccess = async (module: Module) => {
    // Open the content in a new tab
    window.open(module.content_url, '_blank')

    // Update progress
    const currentProgress = progress[module.id] || 0
    const newProgress = Math.min(currentProgress + 25, 100)
    
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/course-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          username: user.username,
          courseId: module.id,
          progress: newProgress,
          completed: newProgress === 100
        })
      })

      setProgress(prev => ({ ...prev, [module.id]: newProgress }))
      
      if (newProgress === 100) {
        setCompletedModules(prev => new Set([...prev, module.id]))
        toast.success('Module completed!')
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  const filteredModules = activeCategory === 'All' 
    ? modules 
    : modules.filter(m => m.category === activeCategory)

  const totalProgress = modules.length > 0
    ? Math.round(
        Object.values(progress).reduce((sum, p) => sum + p, 0) / modules.length
      )
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl text-primary">Educational Modules</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Learning Progress</CardTitle>
            <CardDescription>
              {completedModules.size} of {modules.length} modules completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={totalProgress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">{totalProgress}% Complete</p>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory}>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading modules...</p>
              </div>
            ) : filteredModules.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module) => {
                  const moduleProgress = progress[module.id] || 0
                  const isCompleted = completedModules.has(module.id)

                  return (
                    <Card key={module.id} className={isCompleted ? 'border-green-200 bg-green-50/30' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">{module.category}</Badge>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {module.duration}
                            </span>
                            <Badge variant="secondary">{module.difficulty}</Badge>
                          </div>

                          {moduleProgress > 0 && (
                            <div>
                              <Progress value={moduleProgress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {moduleProgress}% complete
                              </p>
                            </div>
                          )}

                          <Button
                            onClick={() => handleModuleAccess(module)}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            {getContentIcon(module.content_type)}
                            <span className="ml-2">
                              {isCompleted ? 'Review Module' : moduleProgress > 0 ? 'Continue' : 'Start Learning'}
                            </span>
                          </Button>

                          <div className="text-xs text-muted-foreground">
                            <p>Uploaded by: {module.uploaded_by}</p>
                            <p>Added: {formatDate(module.created_at)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-muted-foreground">
                    {activeCategory === 'All' 
                      ? 'No modules available yet. Healthcare professionals will upload educational content soon!' 
                      : `No modules available in ${activeCategory} category yet.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
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
