import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, Heart } from 'lucide-react'
import { toast } from 'sonner'

interface ContactProps {
  onBack: () => void
}

export function Contact({ onBack }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you within 24-48 hours.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      })
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl text-primary">Contact Us</h1>
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4 text-gray-900">Get in Touch</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or feedback? We're here to help. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                Email Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">General Inquiries:</p>
              <a href="mailto:info@healthed.ac.zw" className="text-primary hover:underline">
                info@healthed.ac.zw
              </a>
              <p className="text-sm text-gray-600 mt-4 mb-2">Healthcare Professionals:</p>
              <a href="mailto:healthcare@healthed.ac.zw" className="text-primary hover:underline">
                healthcare@healthed.ac.zw
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                Call Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">Support Hotline:</p>
              <a href="tel:+263771234567" className="text-primary hover:underline">
                +263 77 123 4567
              </a>
              <p className="text-sm text-gray-600 mt-4 mb-2">Emergency Line:</p>
              <a href="tel:+263772345678" className="text-primary hover:underline">
                +263 77 234 5678
              </a>
              <p className="text-xs text-gray-500 mt-2">Available 24/7 for emergencies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Visit Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-2">
                University Health Center<br />
                Main Campus<br />
                Harare, Zimbabwe
              </p>
              <div className="mt-4 flex items-start space-x-2">
                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p>Mon-Fri: 8:00 AM - 5:00 PM</p>
                  <p>Sat: 9:00 AM - 1:00 PM</p>
                  <p>Sun: Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Inquiry Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Brief subject of your message"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Please provide details about your inquiry..."
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={submitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm mb-1">How quickly will I get a response?</h4>
                  <p className="text-sm text-gray-600">
                    We aim to respond to all inquiries within 24-48 hours during business days.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm mb-1">Is my information confidential?</h4>
                  <p className="text-sm text-gray-600">
                    Yes, all communications are strictly confidential and protected by our privacy policy.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm mb-1">Can I schedule an in-person consultation?</h4>
                  <p className="text-sm text-gray-600">
                    Yes, please call our support hotline or send an email to schedule an appointment.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Notice */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">Medical Emergencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-800">
                  If you're experiencing a medical emergency, please call <strong>911</strong> or 
                  visit your nearest emergency room immediately. This platform is not for emergency 
                  medical situations.
                </p>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Connect With Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Follow us on social media for health tips, updates, and community events.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-primary hover:underline text-sm">Facebook</a>
                  <a href="#" className="text-primary hover:underline text-sm">Twitter</a>
                  <a href="#" className="text-primary hover:underline text-sm">Instagram</a>
                  <a href="#" className="text-primary hover:underline text-sm">LinkedIn</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
