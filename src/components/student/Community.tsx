import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { ArrowLeft, Hash, MessageSquare, Plus, Search, Heart, MessageCircle, Send } from 'lucide-react'
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

interface CommunityProps {
  onBack: () => void
  user: any
}

interface Channel {
  id: string
  name: string
  description: string
  members: number
  posts: number
}

interface Post {
  id: string
  channel_id: string
  title: string
  content: string
  author: string
  likes: number
  replies: number
  created_at: string
}

interface Reply {
  id: string
  post_id: string
  content: string
  author: string
  created_at: string
}

const channelColors: Record<string, string> = {
  'general': 'bg-green-100 text-green-800 border-green-200',
  'sti': 'bg-blue-100 text-blue-800 border-blue-200',
  'campus': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'mental': 'bg-purple-100 text-purple-800 border-purple-200',
  'relationships': 'bg-pink-100 text-pink-800 border-pink-200',
  'contraception': 'bg-orange-100 text-orange-800 border-orange-200'
}

export function Community({ onBack, user }: CommunityProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchChannels()
    
    // Poll for updates
    const interval = setInterval(() => {
      if (selectedChannel) {
        fetchPosts(selectedChannel.id)
        fetchChannels()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [selectedChannel])

  useEffect(() => {
    if (selectedChannel) {
      fetchPosts(selectedChannel.id)
    }
  }, [selectedChannel])

  useEffect(() => {
    if (selectedPost) {
      fetchReplies(selectedPost.id)
    }
  }, [selectedPost])

  const fetchChannels = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/community/channels`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.channels) {
        setChannels(result.channels)
        if (!selectedChannel && result.channels.length > 0) {
          setSelectedChannel(result.channels[0])
        } else if (selectedChannel) {
          // Update selected channel with new data
          const updated = result.channels.find((c: Channel) => c.id === selectedChannel.id)
          if (updated) setSelectedChannel(updated)
        }
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async (channelId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/community/posts/${channelId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.posts) {
        setPosts(result.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const fetchReplies = async (postId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/community/posts/${postId}/replies`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      if (result.replies) {
        setReplies(result.replies)
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !selectedChannel) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          title: newPost.title,
          content: newPost.content,
          author: user.username
        })
      })

      const result = await response.json()
      if (result.success) {
        setPosts([result.post, ...posts])
        setNewPost({ title: '', content: '' }) // Reset form
        setShowCreatePost(false) // Close dialog
        fetchChannels() // Update channel post count
        toast.success('Post created successfully!')
      } else {
        toast.error(result.error || 'Failed to create post')
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      toast.error('Failed to create post')
    }
  }

  const handleLikePost = async (post: Post) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/community/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          username: user.username,
          channelId: selectedChannel?.id
        })
      })

      const result = await response.json()
      if (result.success) {
        // Update the post in the list
        if (selectedChannel) {
          fetchPosts(selectedChannel.id)
        }
        
        // Update liked posts set
        const newLiked = new Set(likedPosts)
        if (result.liked) {
          newLiked.add(post.id)
        } else {
          newLiked.delete(post.id)
        }
        setLikedPosts(newLiked)
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handleAddReply = async () => {
    if (!replyContent.trim() || !selectedPost) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/community/posts/${selectedPost.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          content: replyContent,
          author: user.username,
          channelId: selectedChannel?.id
        })
      })

      const result = await response.json()
      if (result.success) {
        setReplies([...replies, result.reply])
        setReplyContent('')
        // Update post replies count in local state
        setPosts(posts.map(p => 
          p.id === selectedPost.id ? { ...p, replies: (p.replies || 0) + 1 } : p
        ))
        toast.success('Reply added!')
      } else {
        toast.error('Failed to add reply')
      }
    } catch (error) {
      console.error('Failed to add reply:', error)
      toast.error('Failed to add reply')
    }
  }

  const getChannelColor = (channelId: string) => {
    return channelColors[channelId] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl text-gray-900">Community Space</h1>
                <p className="text-lg text-gray-600 mt-2">
                  Connect with peers and discuss sexual health topics in a safe environment
                </p>
              </div>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar - Channels */}
          <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 flex items-center">
                  <Hash className="h-4 w-4 mr-1" />
                  channels
                </h2>
              </div>
              
              <div className="space-y-2">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChannel?.id === channel.id 
                        ? `${getChannelColor(channel.id)} border` 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3>{channel.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{channel.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {channel.posts} posts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {selectedChannel && (
              <div className="p-6">
                {/* Channel Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getChannelColor(selectedChannel.id)}`}>
                      <Hash className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl">{selectedChannel.name}</h2>
                      <p className="text-gray-600">{selectedChannel.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select className="px-3 py-1 border rounded-md text-sm">
                      <option>Most Recent</option>
                      <option>Most Popular</option>
                      <option>Oldest First</option>
                    </select>
                    <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                      <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          New Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Post</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                          Share your thoughts, ask questions, or start a discussion in {selectedChannel.name}.
                        </DialogDescription>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="postTitle">Post Title</Label>
                            <Input
                              id="postTitle"
                              value={newPost.title}
                              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                              placeholder="Enter post title..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="postContent">Content</Label>
                            <Textarea
                              id="postContent"
                              value={newPost.content}
                              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                              placeholder="Share your thoughts, ask questions, or start a discussion..."
                              className="min-h-[120px]"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreatePost} className="bg-teal-600 hover:bg-teal-700">
                              Create Post
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={`Search in ${selectedChannel.name}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Posts */}
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg text-gray-900 mb-2">No posts found</h3>
                      <p className="text-gray-600 mb-4">Be the first to post in {selectedChannel.name}.</p>
                      <Button 
                        onClick={() => setShowCreatePost(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        Create First Post
                      </Button>
                    </div>
                  ) : (
                    posts.filter(post => 
                      !searchQuery || 
                      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      post.content.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((post) => (
                      <Card key={post.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-gray-900 mb-1">{post.title}</h3>
                            <p className="text-gray-700 text-sm">{post.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>By {post.author}</span>
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button 
                              className={`flex items-center space-x-1 transition-colors ${
                                likedPosts.has(post.id) ? 'text-red-500' : 'hover:text-red-500'
                              }`}
                              onClick={() => handleLikePost(post)}
                            >
                              <Heart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                              <span>{post.likes}</span>
                            </button>
                            <button 
                              className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                              onClick={() => setSelectedPost(post)}
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.replies}</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies Dialog */}
  <Dialog open={!!selectedPost} onOpenChange={(open: boolean) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              Join the discussion and share your thoughts with the community.
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{selectedPost.content}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>By {selectedPost.author}</span>
                  <span>{formatDate(selectedPost.created_at)}</span>
                </div>
              </div>

              <div>
                <h3 className="mb-3">Replies ({replies.length})</h3>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {replies.map((reply) => (
                    <div key={reply.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 text-sm">{reply.content}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span>{reply.author}</span>
                        <span>{formatDate(reply.created_at)}</span>
                      </div>
                    </div>
                  ))}
                  {replies.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No replies yet. Be the first to reply!</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replyContent">Add a Reply</Label>
                  <Textarea
                    id="replyContent"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddReply} className="bg-teal-600 hover:bg-teal-700">
                      <Send className="h-4 w-4 mr-2" />
                      Post Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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