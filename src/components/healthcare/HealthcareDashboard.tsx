import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'
import { User, LogOut, MessageSquare, FileText, Upload, Send, Clock, CheckCircle, Edit, Trash2, BookOpen, GraduationCap, Heart } from 'lucide-react'
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

interface User {
  name: string
  id: string
  email: string
  username: string
}

interface HealthcareDashboardProps {
  user: User
  onLogout: () => void
}

interface Question {
  id: string
  question: string
  category: string
  status: 'pending' | 'answered'
  answer?: string
  answered_by?: string
  created_at: string
}

interface Resource {
  id: string
  title: string
  description: string
  type: 'Articles' | 'Books' | 'Videos' | 'PDFs'
  category: string
  url: string
  uploaded_by: string
  created_at: string
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  content_type: 'link' | 'document' | 'video'
  content_url: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  uploaded_by: string
  created_at: string
}

const categories = ['STIs', 'Contraception', 'Pregnancy', 'Mental Health', 'General Health']
const resourceTypes = ['Articles', 'Books', 'Videos', 'PDFs']
const difficulties = ['Beginner', 'Intermediate', 'Advanced']

export function HealthcareDashboard({ user, onLogout }: HealthcareDashboardProps) {
    const [questions, setQuestions] = useState<Question[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    totalStudentsHelped: 0,
    resourcesUploaded: 0,
    modulesUploaded: 0,
    topicBreakdown: {} as Record<string, number>
  })

  const [activeTab, setActiveTab] = useState<'questions' | 'resources' | 'courses'>('questions')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<string>('')
  const [showResourceForm, setShowResourceForm] = useState<boolean>(false)
  const [showCourseForm, setShowCourseForm] = useState<boolean>(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null)
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'Articles' as const,
    category: 'General Health',
    url: ''
  })
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'General Health',
    duration: '30 min',
    difficulty: 'Beginner' as const,
    contentType: 'link' as 'link' | 'document' | 'video',
    contentUrl: ''
  })
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)

  useEffect(() => {
    fetchQuestions()
    fetchResources()
    fetchCourses()
    fetchStats()
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchQuestions()
      fetchResources()
      fetchStats()
    }, 10000) // Poll every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/qa/questions`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.questions) {
        setQuestions(result.questions)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      // Loading complete
    }
  }

  const fetchResources = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/resources?uploadedBy=${user.name}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.resources) {
        setResources(result.resources)
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/modules`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.modules) {
        setCourses(result.modules)
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/stats/healthcare/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setStats({
          questionsAnswered: result.questionsAnsweredByUser,
          totalStudentsHelped: result.totalQuestionsAnswered,
          resourcesUploaded: result.resourcesUploaded,
          modulesUploaded: result.modulesUploaded || 0,
          topicBreakdown: result.topicBreakdown || {}
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleAnswerQuestion = async () => {
    if (!selectedQuestion || !answer.trim()) {
      toast.error('Please enter an answer')
      return
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/qa/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          answer: answer,
          answeredBy: user.name
        })
      })

      const result = await response.json()
      if (result.success) {
        setQuestions(questions.map((q: Question) => 
          q.id === selectedQuestion.id ? result.question : q
        ))
        setSelectedQuestion(null)
        setAnswer('')
        fetchStats() // Refresh stats
        toast.success('Answer submitted successfully!')
      } else {
        toast.error('Failed to submit answer')
      }
    } catch (error) {
      console.error('Failed to answer question:', error)
      toast.error('Failed to submit answer')
    }
  }

  const handleUploadResource = async () => {
    if (!newResource.title || !newResource.description || !newResource.url) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          ...newResource,
          uploadedBy: user.name
        })
      })

      const result = await response.json()
      if (result.success) {
        setResources([result.resource, ...resources])
        setNewResource({
          title: '',
          description: '',
          type: 'Articles',
          category: 'General Health',
          url: ''
        })
        setShowResourceForm(false)
        fetchStats()
        toast.success('Resource uploaded successfully!')
      }
    } catch (error) {
      console.error('Failed to upload resource:', error)
      toast.error('Failed to upload resource')
    }
  }

  const handleEditResource = async () => {
    if (!editingResource) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          title: editingResource.title,
          description: editingResource.description,
          type: editingResource.type,
          category: editingResource.category,
          url: editingResource.url
        })
      })

      const result = await response.json()
      if (result.success) {
        setResources(resources.map((r: Resource) => r.id === editingResource.id ? result.resource : r))
        setEditingResource(null)
        toast.success('Resource updated successfully!')
      }
    } catch (error) {
      console.error('Failed to update resource:', error)
      toast.error('Failed to update resource')
    }
  }

  const handleDeleteResource = async () => {
    if (!deletingResource) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/resources/${deletingResource.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setResources(resources.filter((r: Resource) => r.id !== deletingResource.id))
        setDeletingResource(null)
        fetchStats()
        toast.success('Resource deleted successfully!')
      }
    } catch (error) {
      console.error('Failed to delete resource:', error)
      toast.error('Failed to delete resource')
    }
  }

  const handleUploadCourse = async () => {
    if (!newCourse.title || !newCourse.description || !newCourse.contentUrl) {
      toast.error('Please fill in all fields including content URL')
      return
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          ...newCourse,
          uploadedBy: user.username
        })
      })

      const result = await response.json()
      if (result.success) {
        setCourses([result.module, ...courses])
        setNewCourse({
          title: '',
          description: '',
          category: 'General Health',
          duration: '30 min',
          difficulty: 'Beginner',
          contentType: 'link',
          contentUrl: ''
        })
        setShowCourseForm(false)
        toast.success('Module uploaded successfully!')
      } else {
        toast.error(result.error || 'Failed to upload module')
      }
    } catch (error) {
      console.error('Failed to upload module:', error)
      toast.error('Failed to upload module')
    }
  }

  const handleEditCourse = async () => {
    if (!editingCourse) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/modules/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          title: editingCourse.title,
          description: editingCourse.description,
          category: editingCourse.category,
          duration: editingCourse.duration,
          difficulty: editingCourse.difficulty,
          contentType: editingCourse.content_type,
          contentUrl: editingCourse.content_url
        })
      })

      const result = await response.json()
      if (result.success) {
        setCourses(courses.map((c: Course) => c.id === editingCourse.id ? result.module : c))
        setEditingCourse(null)
        toast.success('Module updated successfully!')
      }
    } catch (error) {
      console.error('Failed to update module:', error)
      toast.error('Failed to update module')
    }
  }

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/modules/${deletingCourse.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setCourses(courses.filter((c: Course) => c.id !== deletingCourse.id))
        setDeletingCourse(null)
        toast.success('Module deleted successfully!')
      }
    } catch (error) {
      console.error('Failed to delete module:', error)
      toast.error('Failed to delete module')
    }
  }

  const pendingQuestions = questions.filter((q: Question) => q.status === 'pending')
  const answeredQuestions = questions.filter((q: Question) => q.status === 'answered')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl text-primary">Healthcare Professional Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl">{pendingQuestions.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl">{stats.questionsAnswered}</p>
                  <p className="text-sm text-muted-foreground">Answered Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl">{stats.resourcesUploaded}</p>
                  <p className="text-sm text-muted-foreground">Resources Uploaded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl">{stats.modulesUploaded}</p>
                  <p className="text-sm text-muted-foreground">Modules Uploaded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Helped - Topic Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Students Helped: {stats.totalStudentsHelped}
            </CardTitle>
            <CardDescription>Breakdown of topics where you've helped students</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.topicBreakdown).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.topicBreakdown).map(([topic, count]) => {
                  const percentage = stats.questionsAnswered > 0 
                    ? (count / stats.questionsAnswered) * 100 
                    : 0
                  return (
                    <div key={topic} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{topic}</span>
                        <span className="text-muted-foreground">{count} questions ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No questions answered yet. Start helping students to see topic breakdown!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="questions">Q&A Management</TabsTrigger>
            <TabsTrigger value="resources">Resource Management</TabsTrigger>
            <TabsTrigger value="courses">Educational Modules</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Questions */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Questions ({pendingQuestions.length})</CardTitle>
                  <CardDescription>Questions waiting for your expert response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {pendingQuestions.map((question) => (
                      <div
                        key={question.id}
                        onClick={() => setSelectedQuestion(question)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedQuestion?.id === question.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">{question.category}</Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(question.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{question.question}</p>
                      </div>
                    ))}
                    {pendingQuestions.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No pending questions</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Answer Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Answer Question</CardTitle>
                  <CardDescription>
                    {selectedQuestion ? 'Provide a helpful response' : 'Select a question to answer'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedQuestion ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">{selectedQuestion.category}</Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(selectedQuestion.created_at)}
                          </span>
                        </div>
                        <p>{selectedQuestion.question}</p>
                      </div>
                      <div>
                        <Label htmlFor="answer">Your Response</Label>
                        <Textarea
                          id="answer"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Provide a comprehensive, professional response..."
                          className="min-h-[120px] mt-2"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleAnswerQuestion} className="bg-primary hover:bg-primary/90">
                          <Send className="h-4 w-4 mr-2" />
                          Submit Answer
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Select a question from the list to provide an answer</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Answers */}
            <Card>
              <CardHeader>
                <CardTitle>Recently Answered Questions</CardTitle>
                <CardDescription>Your recent responses to student questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {answeredQuestions.filter(q => q.answered_by === user.name).slice(0, 5).map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">{question.category}</Badge>
                        <Badge className="bg-green-100 text-green-800">Answered</Badge>
                      </div>
                      <p className="mb-2">{question.question}</p>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                        <p className="text-sm text-gray-700">{question.answer}</p>
                        <p className="text-xs text-blue-700 mt-1">— {question.answered_by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl">Educational Resources</h2>
              <Dialog open={showResourceForm} onOpenChange={setShowResourceForm}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Resource</DialogTitle>
                    <DialogDescription>
                      Add a new educational resource for students to access.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resourceTitle">Title</Label>
                      <Input
                        id="resourceTitle"
                        value={newResource.title}
                        onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                        placeholder="Resource title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="resourceDescription">Description</Label>
                      <Textarea
                        id="resourceDescription"
                        value={newResource.description}
                        onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                        placeholder="Brief description of the resource..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resourceType">Type</Label>
                        <select
                          id="resourceType"
                          value={newResource.type}
                          onChange={(e) => setNewResource({...newResource, type: e.target.value as any})}
                          className="w-full p-2 border rounded-md"
                        >
                          {resourceTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="resourceCategory">Category</Label>
                        <select
                          id="resourceCategory"
                          value={newResource.category}
                          onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="resourceUrl">URL/Link</Label>
                      <Input
                        id="resourceUrl"
                        value={newResource.url}
                        onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowResourceForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUploadResource} className="bg-primary hover:bg-primary/90">
                        Upload Resource
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{resource.category}</Badge>
                      <Badge variant="secondary">{resource.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{resource.description}</CardDescription>
                    <div className="text-sm text-gray-500 mb-4">
                      <p>Uploaded by: {resource.uploaded_by}</p>
                      <p>Date: {formatDate(resource.created_at)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setEditingResource(resource)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeletingResource(resource)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl">Educational Modules</h2>
              <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Upload Course
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Course</DialogTitle>
                    <DialogDescription>
                      Create a new educational module for students to learn from.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="courseTitle">Title</Label>
                      <Input
                        id="courseTitle"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                        placeholder="Course title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="courseDescription">Description</Label>
                      <Textarea
                        id="courseDescription"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                        placeholder="Course description..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="courseCategory">Category</Label>
                        <select
                          id="courseCategory"
                          value={newCourse.category}
                          onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="courseDuration">Duration</Label>
                        <Input
                          id="courseDuration"
                          value={newCourse.duration}
                          onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                          placeholder="30 min"
                        />
                      </div>
                      <div>
                        <Label htmlFor="courseDifficulty">Difficulty</Label>
                        <select
                          id="courseDifficulty"
                          value={newCourse.difficulty}
                          onChange={(e) => setNewCourse({...newCourse, difficulty: e.target.value as any})}
                          className="w-full p-2 border rounded-md"
                        >
                          {difficulties.map((diff) => (
                            <option key={diff} value={diff}>{diff}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contentType">Content Type</Label>
                      <select
                        id="contentType"
                        value={newCourse.contentType}
                        onChange={(e) => setNewCourse({...newCourse, contentType: e.target.value as any})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="link">Link/URL</option>
                        <option value="document">Document</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="contentUrl">Content URL</Label>
                      <Input
                        id="contentUrl"
                        value={newCourse.contentUrl}
                        onChange={(e) => setNewCourse({...newCourse, contentUrl: e.target.value})}
                        placeholder="https://... or upload link"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCourseForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUploadCourse} className="bg-primary hover:bg-primary/90">
                        Upload Course
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length > 0 ? courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant="secondary">{course.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{course.description}</CardDescription>
                    <div className="text-sm text-gray-500 mb-4">
                      <p>Duration: {course.duration}</p>
                      <p>Type: {course.content_type || 'link'}</p>
                      <p>Uploaded by: {course.uploaded_by}</p>
                      <p>Date: {formatDate(course.created_at)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setEditingCourse(course)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeletingCourse(course)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No modules uploaded yet. Click "Upload Course" to create your first module!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Resource Dialog */}
      <Dialog open={!!editingResource} onOpenChange={(open: boolean) => !open && setEditingResource(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update the details of this educational resource.
            </DialogDescription>
          </DialogHeader>
          {editingResource && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({...editingResource, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingResource.description}
                  onChange={(e) => setEditingResource({...editingResource, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editType">Type</Label>
                  <select
                    id="editType"
                    value={editingResource.type}
                    onChange={(e) => setEditingResource({...editingResource, type: e.target.value as any})}
                    className="w-full p-2 border rounded-md"
                  >
                    {resourceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="editCategory">Category</Label>
                  <select
                    id="editCategory"
                    value={editingResource.category}
                    onChange={(e) => setEditingResource({...editingResource, category: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="editUrl">URL/Link</Label>
                <Input
                  id="editUrl"
                  value={editingResource.url}
                  onChange={(e) => setEditingResource({...editingResource, url: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingResource(null)}>
                  Cancel
                </Button>
                <Button onClick={handleEditResource} className="bg-primary hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Resource Confirmation Dialog */}
      <AlertDialog open={!!deletingResource} onOpenChange={(open: boolean) => !open && setDeletingResource(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingResource?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResource} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Course/Module Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open: boolean) => !open && setEditingCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Educational Module</DialogTitle>
            <DialogDescription>
              Update the details of this educational module.
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCourseTitle">Title</Label>
                <Input
                  id="editCourseTitle"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editCourseDescription">Description</Label>
                <Textarea
                  id="editCourseDescription"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCourseCategory">Category</Label>
                  <select
                    id="editCourseCategory"
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="editCourseDifficulty">Difficulty</Label>
                  <select
                    id="editCourseDifficulty"
                    value={editingCourse.difficulty}
                    onChange={(e) => setEditingCourse({...editingCourse, difficulty: e.target.value as any})}
                    className="w-full p-2 border rounded-md"
                  >
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="editCourseDuration">Duration</Label>
                <Input
                  id="editCourseDuration"
                  value={editingCourse.duration}
                  onChange={(e) => setEditingCourse({...editingCourse, duration: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editContentType">Content Type</Label>
                <select
                  id="editContentType"
                  value={editingCourse.content_type || 'link'}
                  onChange={(e) => setEditingCourse({...editingCourse, content_type: e.target.value as any})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="link">Link/URL</option>
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <Label htmlFor="editContentUrl">Content URL</Label>
                <Input
                  id="editContentUrl"
                  value={editingCourse.content_url || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, content_url: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingCourse(null)}>
                  Cancel
                </Button>
                <Button onClick={handleEditCourse} className="bg-primary hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation Dialog */}
      <AlertDialog open={!!deletingCourse} onOpenChange={(open: boolean) => !open && setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCourse?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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