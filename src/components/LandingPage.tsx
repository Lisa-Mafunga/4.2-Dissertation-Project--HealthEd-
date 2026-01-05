import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ChevronLeft, ChevronRight, BookOpen, Users, MessageSquare, Shield, Heart } from 'lucide-react'
import img1 from '../assets/images/1.avif';
import img2 from '../assets/images/2.avif';
import img3 from '../assets/images/3.avif';
import img4 from '../assets/images/4.avif';

interface LandingPageProps {
  onLoginClick: () => void
  onServiceClick: (service: string) => void
  onAboutClick?: () => void
  onContactClick?: () => void
  onFeedbackClick?: () => void
}

const heroSlides = [
  {
    image: img1,
    title: 'Your Health, Your Education, Your Future',
    subtitle: 'Empowering university students with comprehensive sexual health education and resources.'
  },
  {
    image: img2,
    title: 'Expert Healthcare Guidance',
    subtitle: 'Connect with qualified healthcare professionals for reliable sexual health information.'
  },
  {
    image: img3,
    title: 'Safe & Anonymous Support',
    subtitle: 'Ask questions anonymously and get answers from healthcare professionals in a safe environment.'
  },
  {
    image: img4,
    title: 'Evidence-Based Education',
    subtitle: 'Access reliable, up-to-date information on STIs, pregnancy, and sexual wellness.'
  }
];

const services = [
  {
    id: 'education',
    icon: BookOpen,
    title: 'Educational Modules',
    description: 'Comprehensive learning materials on sexual health topics'
  },
  {
    id: 'community',
    icon: Users,
    title: 'Community Space',
    description: 'Connect with peers in topic-specific discussion channels'
  },
  {
    id: 'qa',
    icon: MessageSquare,
    title: 'Anonymous Q&A',
    description: 'Ask questions anonymously and get professional answers'
  },
  {
    id: 'resources',
    icon: Shield,
    title: 'Health Resources',
    description: 'Access to external resources and local health services'
  }
]

export function LandingPage({ onLoginClick, onServiceClick, onAboutClick, onContactClick, onFeedbackClick }: LandingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
  setCurrentSlide((prev: number) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev: number) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev: number) => (prev - 1 + heroSlides.length) % heroSlides.length)

  const handleServiceClick = (serviceId: string) => {
    onServiceClick(serviceId)
  }

  return (
  <div className="min-h-screen pt-20">
      {/* Header */}
  <header className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-secondary" />
              <h1 className="text-2xl font-bold text-primary">HealthEdu</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-primary">Home</a>
              <a href="#services" className="text-gray-700 hover:text-primary">Services</a>
              <button onClick={() => onAboutClick && onAboutClick()} className="text-gray-700 hover:text-primary">About</button>
              <button onClick={() => onContactClick && onContactClick()} className="text-gray-700 hover:text-primary">Contact</button>
              <button onClick={() => onFeedbackClick && onFeedbackClick()} className="text-gray-700 hover:text-primary">Feedback</button>
            </nav>
            <div>
              <Button onClick={onLoginClick} className="bg-primary hover:bg-primary/90">
                Signup/Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Slideshow */}
  <section
    id="home"
    className="relative"
    style={{
      height: '80vh',
      backgroundImage: `url(${heroSlides[currentSlide].image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      transition: 'background-image 0.5s ease-in-out'
    }}
  >
    {/* Optional: Remove or lighten overlay for better visibility */}
    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }}></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              {heroSlides[currentSlide].title}
            </h2>
            <p className="text-xl md:text-2xl mb-8">
              {heroSlides[currentSlide].subtitle}
            </p>
            <div className="space-x-4">
              <Button 
                size="lg" 
                onClick={onLoginClick}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
        {/* Slide Controls */}
        <button
          onClick={prevSlide}
          style={{ zIndex: 30 }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-primary/80 border border-gray-300 rounded-full p-2 shadow-lg flex items-center justify-center"
        >
          <ChevronLeft className="h-6 w-6 text-black" />
        </button>
        <button
          onClick={nextSlide}
          style={{ zIndex: 30 }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-primary/80 border border-gray-300 rounded-full p-2 shadow-lg flex items-center justify-center"
        >
          <ChevronRight className="h-6 w-6 text-black" />
        </button>
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* About Section */}
      {(() => {
        const features = [
          {
            icon: Heart,
            title: 'Comprehensive Care',
            description: 'Complete sexual health education covering all aspects of wellness and safety.'
          },
          {
            icon: Shield,
            title: 'Safe & Confidential',
            description: 'Anonymous Q&A forum and secure platform for sensitive health discussions.'
          },
          {
            icon: Users,
            title: 'Community Support',
            description: 'Connect with peers and healthcare professionals in a supportive environment.'
          },
          {
            icon: BookOpen,
            title: 'Evidence-Based',
            description: 'All content reviewed and approved by certified healthcare professionals.'
          }
        ];
        return (
          <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl mb-4 sm:mb-6 font-bold">About HealthEd</h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  HealthEd is a comprehensive sexual health education platform designed specifically for university students. 
                  We provide reliable information, professional guidance, and a supportive community to help you make informed 
                  decisions about your health and wellbeing.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="text-center bg-white p-6 sm:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl mb-3 sm:mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive sexual health education and support services designed for university students
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <Card 
                  key={service.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleServiceClick(service.id)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>


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