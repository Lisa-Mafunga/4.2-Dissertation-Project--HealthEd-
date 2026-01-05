import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { MessageCircle, X, Send, HelpCircle } from 'lucide-react'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

interface FAQ {
  question: string
  answer: string
  keywords: string[]
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showFAQs, setShowFAQs] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Sexual Health Education assistant. Browse our frequently asked questions below or ask your own question. For detailed medical advice, visit our Q&A Forum.',
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const faqs: FAQ[] = [
    {
      question: 'What types of contraception are available?',
      answer: 'There are many types of contraception available including condoms, birth control pills, IUDs, implants, patches, and emergency contraception. Each has different effectiveness rates, side effects, and methods of use. Condoms are the only method that also protects against STIs. For personalized advice, please consult with a healthcare professional.',
      keywords: ['contraception', 'birth control', 'condom', 'pill', 'iud']
    },
    {
      question: 'How can I prevent STIs?',
      answer: 'STIs (Sexually Transmitted Infections) can be prevented through: 1) Using condoms consistently and correctly, 2) Getting regular STI testing, 3) Open communication with partners about sexual health, 4) Limiting number of sexual partners, 5) Getting vaccinated (HPV, Hepatitis B). Common STIs include chlamydia, gonorrhea, herpes, HPV, and HIV.',
      keywords: ['sti', 'std', 'infection', 'disease', 'prevention']
    },
    {
      question: 'How often should I get tested for STIs?',
      answer: 'Regular STI testing is important for sexually active individuals. The CDC recommends at least annual testing for sexually active people. If you have multiple partners or engage in high-risk behavior, testing every 3-6 months is recommended. Tests can be done at healthcare clinics, student health centers, or through at-home testing kits.',
      keywords: ['testing', 'test', 'screening', 'check']
    },
    {
      question: 'What should I do if I think I\'m pregnant?',
      answer: 'If you think you might be pregnant: 1) Take a home pregnancy test (most accurate 1 week after missed period), 2) Schedule an appointment with a healthcare provider, 3) Discuss your options and next steps. Healthcare providers can provide counseling, prenatal care, or information about all available options.',
      keywords: ['pregnancy', 'pregnant', 'test']
    },
    {
      question: 'What is consent?',
      answer: 'Consent is freely given, enthusiastic agreement to participate in sexual activity. Key points: 1) It must be clear and ongoing, 2) It can be withdrawn at any time, 3) It cannot be given if someone is intoxicated, unconscious, or coerced, 4) Silence or lack of resistance is NOT consent, 5) Past consent doesn\'t mean future consent.',
      keywords: ['consent', 'permission', 'agreement']
    },
    {
      question: 'Where can I find more resources?',
      answer: 'You can find additional resources in our Resources section, including links to local health services, educational materials, support groups, and counseling services. You can also post questions anonymously in our Q&A Forum where healthcare professionals provide personalized responses.',
      keywords: ['resources', 'help', 'support', 'services']
    },
    {
      question: 'What are the signs of common STIs?',
      answer: 'Common STI symptoms include unusual discharge, burning during urination, sores or bumps, itching, and pain during sex. However, many STIs have NO symptoms, which is why regular testing is crucial. If you notice any symptoms or had unprotected sex, get tested immediately.',
      keywords: ['symptoms', 'signs', 'discharge', 'burning']
    },
    {
      question: 'Is emergency contraception safe?',
      answer: 'Yes, emergency contraception (like Plan B) is safe and effective when taken within 72 hours of unprotected sex. The sooner you take it, the more effective it is. It\'s available over-the-counter at pharmacies. It\'s not the same as the abortion pill and won\'t harm an existing pregnancy.',
      keywords: ['emergency', 'plan b', 'morning after']
    }
  ]

  const handleFAQClick = (faq: FAQ) => {
    setShowFAQs(false)
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: faq.question,
      isBot: false,
      timestamp: new Date()
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: faq.answer,
      isBot: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, botMessage])
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    setShowFAQs(false)

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    // Simple keyword matching for FAQ responses
    const lowerInput = inputMessage.toLowerCase()
    let matchedFAQ: FAQ | null = null

    for (const faq of faqs) {
      if (faq.keywords.some(keyword => lowerInput.includes(keyword))) {
        matchedFAQ = faq
        break
      }
    }

    let botResponse = matchedFAQ 
      ? matchedFAQ.answer
      : "I understand you're asking about this topic. For specific medical questions or detailed personalized information, I recommend posting in our anonymous Q&A Forum where healthcare professionals can provide comprehensive responses tailored to your situation."

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      isBot: true,
      timestamp: new Date()
    }

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage])
    }, 500)

    setInputMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[32rem] shadow-xl z-40 flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Health Education Assistant
            </CardTitle>
            <CardDescription className="text-xs">
              Browse FAQs or ask a question
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 px-4 pt-4">
              {showFAQs && messages.length === 1 && (
                <div className="space-y-2 pb-4">
                  <p className="text-sm mb-3">Frequently Asked Questions:</p>
                  {faqs.map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => handleFAQClick(faq)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <p className="text-sm">{faq.question}</p>
                    </button>
                  ))}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 For personalized medical advice, visit our <strong>Q&A Forum</strong> where healthcare professionals provide detailed responses.
                    </p>
                  </div>
                </div>
              )}
              
              {(!showFAQs || messages.length > 1) && (
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-sm ${
                          message.isBot
                            ? 'bg-muted text-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  {messages.length > 1 && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowFAQs(true)
                          setMessages([messages[0]])
                        }}
                        className="text-xs"
                      >
                        View FAQs
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" className="bg-primary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}