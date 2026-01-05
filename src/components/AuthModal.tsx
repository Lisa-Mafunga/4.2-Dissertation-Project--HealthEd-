import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (userData: any) => void
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [signupData, setSignupData] = useState({
    regNumber: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(loginData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        onLogin({
          type: result.user.userType,
          name: result.user.name || result.user.username,
          username: result.user.username
        })
        onClose()
        setLoginData({ username: '', password: '' })
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ ...signupData, userType: 'student' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        onLogin({
          type: result.user.userType,
          name: result.user.username,
          username: result.user.username
        })
        onClose()
        setSignupData({
          regNumber: '',
          username: '',
          password: '',
          confirmPassword: ''
        })
      } else {
        console.error('Signup error details:', result)
        setError(result.error || 'Signup failed')
        if (result.debug) {
          console.log('Debug info:', result.debug)
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/database/info`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      const result = await response.json()
      console.log('Database info:', result)
      
      if (result.success) {
        const tableInfo = Object.entries(result.tables).map(([table, status]) => `${table}: ${status}`).join('\n')
        const studentInfo = result.sampleData?.students?.length > 0 
          ? `\n\nStudents found:\n${result.sampleData.students.map((s: any) => JSON.stringify(s)).join('\n')}`
          : '\n\nNo students found in database'
        
        alert(`Database connection successful!\n\n${tableInfo}${studentInfo}`)
      } else {
        alert('Database connection failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to check database connection:', error)
      alert('Failed to check database connection: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const initializeChannels = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/init-channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      const result = await response.json()
      if (result.success) {
        alert('Community channels initialized successfully!')
      } else {
        alert('Failed to initialize channels: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to initialize channels:', error)
      alert('Failed to initialize channels: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Access Your Account</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <div className="text-sm text-muted-foreground">
              <p>Use your database credentials:</p>
              <p>• Students: Register with your registration number</p>
              <p>• Healthcare professionals: Use your assigned username/password</p>
              <p>• System administrators: Use admin credentials</p>
              <div className="flex gap-2 mt-2">
                <Button 
                  onClick={checkDatabaseConnection}
                  variant="outline" 
                  size="sm"
                >
                  Test Database
                </Button>
                <Button 
                  onClick={initializeChannels}
                  variant="outline" 
                  size="sm"
                >
                  Init Channels
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input
                  id="regNumber"
                  value={signupData.regNumber}
                  onChange={(e) => setSignupData({...signupData, regNumber: e.target.value})}
                  placeholder="Enter your registration number"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newUsername">Username</Label>
                <Input
                  id="newUsername"
                  value={signupData.username}
                  onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </form>
            <div className="text-sm text-muted-foreground">
              <p><strong>For Students Only:</strong> Enter your university registration number to create an account. Your registration number must be in the student database to proceed.</p>
              <p className="mt-2"><strong>Healthcare Professionals:</strong> Use the Login tab with your assigned credentials.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}