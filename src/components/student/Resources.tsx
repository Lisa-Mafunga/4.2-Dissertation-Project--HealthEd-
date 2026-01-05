import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { ArrowLeft, Search, FileText, Video, BookOpen, ExternalLink, Download, Heart } from 'lucide-react'
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

interface ResourcesProps {
  onBack: () => void
}

interface Resource {
  id: string
  title: string
  description: string
  type: 'Articles' | 'Books' | 'Videos' | 'PDFs'
  category: string
  url?: string
  uploaded_by: string
  created_at: string
}

const categories = ['All', 'STIs', 'Contraception', 'Pregnancy', 'Mental Health', 'General Health']
const resourceTypes = ['All', 'Articles', 'Books', 'Videos', 'PDFs']

export function Resources({ onBack }: ResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')

  useEffect(() => {
    fetchResources()
  }, [])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, selectedCategory, selectedType])

  const fetchResources = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/resources`, {
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
    } finally {
      setLoading(false)
    }
  }

  const filterResources = () => {
    let filtered = [...resources]

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(resource => resource.category === selectedCategory)
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter(resource => resource.type === selectedType)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query)
      )
    }

    setFilteredResources(filtered)
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Articles': return FileText
      case 'Books': return BookOpen
      case 'Videos': return Video
      case 'PDFs': return Download
      default: return FileText
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'STIs': 'bg-red-100 text-red-800',
      'Contraception': 'bg-blue-100 text-blue-800',
      'Pregnancy': 'bg-green-100 text-green-800',
      'Mental Health': 'bg-purple-100 text-purple-800',
      'General Health': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Educational Resources</h1>
            <p className="text-lg text-gray-600 mt-2">
              Evidence-based sexual health education resources for university students
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resources, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-primary" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="mb-6">
            {resourceTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredResources.length} resources
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">All Resources</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => {
                  const IconComponent = getResourceIcon(resource.type)
                  return (
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <Badge className={getCategoryColor(resource.category)}>
                            {resource.category}
                          </Badge>
                          <Badge variant="outline">
                            {resource.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {resource.description}
                        </CardDescription>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                          <span>By {resource.uploaded_by}</span>
                          <span>{formatDate(resource.created_at)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1" 
                            variant="outline"
                            onClick={() => {
                              if (!resource.url) return
                              window.open(resource.url, '_blank')
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Access Resource
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              if (!resource.url) return
                              const link = document.createElement('a')
                              link.href = resource.url
                              link.download = resource.title
                              link.target = '_blank'
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </Tabs>

        {/* Footer Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> All resources are curated by healthcare professionals and are intended for educational purposes. 
              For personalized medical advice, please consult with a qualified healthcare provider.
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