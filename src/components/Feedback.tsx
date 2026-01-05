import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

import { ArrowLeft, Star, Send, ThumbsUp, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface FeedbackProps {
  onBack: () => void
  user?: any
}

export function Feedback({ onBack, user }: FeedbackProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedbackData, setFeedbackData] = useState({
    category: 'general',
    title: '',
    description: '',
    suggestion: '',
    email: ''
  })
  const [submitting, setSubmitting] = useState(false)
  // mark user as read to avoid unused variable diagnostics when user is not used
  void user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please provide a rating')
      return
    }

    setSubmitting(true)

    try {
      // Build payload to match the feedback table: category, feedback, email (optional)
      const payload = {
        category: feedbackData.category,
        feedback: feedbackData.description || feedbackData.title,
        email: feedbackData.email && feedbackData.email.trim() !== '' ? feedbackData.email : null
      }

      const url = `https://${projectId}.supabase.co/rest/v1/feedback`
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
          Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
      })

      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(text || 'Failed to submit feedback')
      }

      toast.success('Thank you — your feedback was submitted successfully.')
      setRating(0)
      setFeedbackData({
        category: 'general',
        title: '',
        description: '',
        suggestion: '',
        email: ''
      })
    } catch (err) {
      console.error('Feedback submit error:', err)
      toast.error('Failed to submit feedback. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl text-primary">Feedback</h1>
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl mb-4 text-gray-900">We Value Your Feedback</h2>
          <p className="text-lg text-gray-600">
            Help us improve HealthEd by sharing your thoughts and suggestions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Share Your Experience</CardTitle>
            <CardDescription>
              Your feedback helps us create a better experience for all students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <Label className="mb-3 block">Overall Rating *</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-4 text-gray-600">
                      {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Fair' : 'Poor'}
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Feedback Category *</Label>
                <select
                  id="category"
                  value={feedbackData.category}
                  onChange={(e) => setFeedbackData({...feedbackData, category: e.target.value})}
                  className="w-full mt-2 p-2 border rounded-md bg-background"
                >
                  <option value="general">General Experience</option>
                  <option value="educational">Educational Modules</option>
                  <option value="community">Community Features</option>
                  <option value="qa">Q&A Forum</option>
                  <option value="resources">Resources</option>
                  <option value="technical">Technical Issues</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Feedback Title *</Label>
                <Input
                  id="title"
                  value={feedbackData.title}
                  onChange={(e) => setFeedbackData({...feedbackData, title: e.target.value})}
                  placeholder="Brief summary of your feedback..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Detailed Feedback *</Label>
                <Textarea
                  id="description"
                  value={feedbackData.description}
                  onChange={(e) => setFeedbackData({...feedbackData, description: e.target.value})}
                  placeholder="Please provide detailed feedback about your experience..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              {/* Suggestions */}
              <div>
                <Label htmlFor="suggestion">Suggestions for Improvement (Optional)</Label>
                <Textarea
                  id="suggestion"
                  value={feedbackData.suggestion}
                  onChange={(e) => setFeedbackData({...feedbackData, suggestion: e.target.value})}
                  placeholder="How can we make HealthEd better for you?"
                  className="min-h-[100px]"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={submitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Why Feedback Matters */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <ThumbsUp className="h-5 w-5 mr-2" />
              Why Your Feedback Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm space-y-2">
            <p>• Helps us understand what's working and what needs improvement</p>
            <p>• Guides our development priorities to better serve students</p>
            <p>• Ensures the platform meets your actual needs and expectations</p>
            <p>• Creates a better experience for the entire student community</p>
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
