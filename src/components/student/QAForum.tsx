import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { ArrowLeft, AlertTriangle, Search, Plus, HelpCircle, Heart } from 'lucide-react'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

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

interface QAForumProps {
  onBack: () => void
  user?: any
}

interface Question {
  id: string
  question: string
  category: string
  status: 'pending' | 'answered'
  answer?: string
  answered_by?: string
  created_at: string
  answered_at?: string
}

const categories = [
  'General Health', 'Contraception', 'STI Testing', 'Mental Health', 
  'Relationships', 'Pregnancy', 'LGBTQ+', 'Other'
]

export function QAForum({ onBack, user }: QAForumProps) {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [questionCategory, setQuestionCategory] = useState('General Health')
  const [isUrgent, setIsUrgent] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  // mark user as used to avoid unused variable diagnostic when not needed
  void user

  useEffect(() => {
    fetchQuestions()
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
      setLoading(false)
    }
  }

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/qa/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          question: newQuestion,
          category: questionCategory
        })
      })

      const result = await response.json()
      if (result.success) {
        setQuestions([result.question, ...questions])
        setNewQuestion('')
        setQuestionCategory('General Health')
        setIsUrgent(false)
        setShowQuestionForm(false)
      }
    } catch (error) {
      console.error('Failed to submit question:', error)
    }
  }

  const filteredQuestions = questions.filter((q: Question) => {
    const matchesSearch = !searchQuery || q.question.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || q.category === selectedCategory
    const matchesStatus = selectedStatus === 'All Status' || q.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Q&A Forum</h1>
            <p className="text-lg text-gray-600 mt-2">
              Ask your sexual health questions anonymously and get answers from verified healthcare professionals. Your privacy and confidentiality are our top priorities.
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Emergency Notice */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Emergency Notice:</h3>
                <p className="text-red-800 text-sm mt-1">
                  If you're experiencing a medical emergency or urgent symptoms, please contact emergency services (911) or visit your nearest emergency room immediately. This forum is not for emergency medical situations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option>All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option>All Status</option>
              <option value="pending">Pending</option>
              <option value="answered">Answered</option>
            </select>
            <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ask Your Question Anonymously</DialogTitle>
                  <p className="text-sm text-gray-600">Your question will be posted anonymously. Healthcare professionals will provide verified answers.</p>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="questionText">Describe your question or concern in detail. The more information you provide, the better our healthcare professionals can help you.</Label>
                    <Textarea
                      id="questionText"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Enter your question here..."
                      className="min-h-[120px] mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categorySelect">Category:</Label>
                      <select
                        id="categorySelect"
                        value={questionCategory}
                        onChange={(e) => setQuestionCategory(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <Checkbox
                        id="urgent"
                        checked={isUrgent}
                        onCheckedChange={setIsUrgent}
                      />
                      <Label htmlFor="urgent" className="text-sm">Mark as urgent</Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowQuestionForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitQuestion} className="bg-blue-600 hover:bg-blue-700">
                      Submit Question
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-4">Be the first to ask a question!</p>
            <Button 
              onClick={() => setShowQuestionForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ask Question
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{question.question}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Anonymous</span>
                        <span>{formatDate(question.created_at)}</span>
                        <Badge variant="outline">{question.category}</Badge>
                        <Badge variant={question.status === 'answered' ? 'default' : 'secondary'}>
                          {question.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {question.answer ? (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <p className="text-gray-700 mb-2">{question.answer}</p>
                      <p className="text-sm font-medium text-blue-700">— {question.answered_by}</p>
                      {question.answered_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Answered on {formatDate(question.answered_at)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <HelpCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Waiting for healthcare professional response...</p>
                      <p className="text-sm mt-1">Questions are typically answered within 24-48 hours</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Important Disclaimer */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Important Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              The information provided in this Q&A forum is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers regarding medical conditions and concerns.
            </p>
          </CardContent>
        </Card>
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