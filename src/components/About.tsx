import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, Heart, Shield, Users, Target } from 'lucide-react'

interface AboutProps {
  onBack: () => void
}

export function About({ onBack }: AboutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl text-primary">About HealthEd</h1>
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-gray-900">Empowering Students Through Education</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            HealthEd is a comprehensive sexual health education platform designed specifically for 
            university students, providing accurate information, professional guidance, and a 
            supportive community.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 mr-2 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                To provide accessible, comprehensive, and stigma-free sexual health education 
                to university students, empowering them to make informed decisions about their 
                sexual health and wellbeing. We believe every student deserves access to accurate 
                information and professional support.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-6 w-6 mr-2 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                A future where all university students have the knowledge, resources, and support 
                they need to maintain optimal sexual health. We envision a campus community where 
                sexual health conversations are normalized, stigma is eliminated, and students 
                feel empowered to seek help when needed.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h3 className="text-3xl text-center mb-8 text-gray-900">Our Core Values</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Privacy & Confidentiality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  Your privacy is our top priority. All questions are anonymous, and your personal 
                  information is protected with the highest security standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Professional Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  All content and responses are provided by qualified healthcare professionals 
                  with expertise in sexual and reproductive health.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Inclusive & Non-Judgmental
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  We provide inclusive, LGBTQ+-friendly resources and maintain a judgment-free 
                  environment where all students feel welcome and supported.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h3 className="text-3xl text-center mb-8 text-gray-900">What We Offer</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Educational Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  Comprehensive, interactive courses covering topics from STI prevention to 
                  healthy relationships, created by healthcare professionals.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Anonymous Q&A Forum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  Ask questions anonymously and receive evidence-based answers from verified 
                  healthcare professionals within 24-48 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  Connect with peers in moderated discussion channels where you can share 
                  experiences and support each other.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Curated Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  Access a library of vetted articles, videos, and documents covering all 
                  aspects of sexual health and wellness.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Us */}
        <Card className="bg-primary text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Why Choose HealthEd?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <p><strong>Evidence-Based:</strong> All information is backed by current medical research and best practices in sexual health education.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <p><strong>Student-Centered:</strong> Designed specifically for university students, addressing the unique challenges and questions you face.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <p><strong>24/7 Access:</strong> Learn at your own pace, whenever and wherever you need information.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <p><strong>Comprehensive Coverage:</strong> From prevention to mental health, we cover all aspects of sexual wellness.</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl mb-4 text-gray-900">Ready to Start Your Journey?</h3>
          <p className="text-gray-600 mb-6">
            Join thousands of students who are taking control of their sexual health education.
          </p>
          <Button onClick={onBack} size="lg" className="bg-primary hover:bg-primary/90">
            Get Started Today
          </Button>
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
