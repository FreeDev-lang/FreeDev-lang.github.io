import { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fabEntrance, floatingPanelVariants, overlayMotion } from '../utils/motion'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const predefinedResponses: Record<string, string> = {
  hello: 'Hello! How can I help you today?',
  hi: 'Hi there! What can I assist you with?',
  help: 'I can help you with:\n- Finding products\n- Order information\n- Shipping questions\n- Returns and refunds\n- Account issues\n\nWhat would you like to know?',
  products:
    'You can browse our products by visiting the Products page. We have a wide selection of furniture items. Would you like to know about a specific category?',
  shipping:
    'We offer shipping to most locations. Shipping costs and delivery times vary by location. You can check shipping options during checkout.',
  return:
    'We have a 30-day return policy. Items must be in original condition. Please contact support for return authorization.',
  price:
    'Prices vary by product. You can see detailed pricing on each product page. We also have sales and discounts available!',
  order:
    'To check your order status, please visit the Orders page in your account. You can also contact support with your order number.',
  default:
    "I'm here to help! You can ask me about:\n- Products and categories\n- Orders and shipping\n- Returns and refunds\n- Account questions\n\nHow can I assist you?",
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Fria Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim()

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return predefinedResponses.hello
    }
    if (lowerMessage.includes('help')) {
      return predefinedResponses.help
    }
    if (lowerMessage.includes('product')) {
      return predefinedResponses.products
    }
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return predefinedResponses.shipping
    }
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return predefinedResponses.return
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return predefinedResponses.price
    }
    if (lowerMessage.includes('order')) {
      return predefinedResponses.order
    }

    return predefinedResponses.default
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {!isOpen && (
        <motion.button
          variants={fabEntrance}
          initial="hidden"
          animate="visible"
          onClick={() => setIsOpen(true)}
          className="btn btn-primary fixed bottom-6 right-6 z-50 h-14 w-14 rounded-pill shadow-card-hover"
          aria-label="Open chatbot"
        >
          <Bot className="h-6 w-6" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close chat overlay"
              {...overlayMotion}
              className="fixed inset-0 z-40 bg-neutral-900/20 backdrop-blur-[2px] md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              variants={floatingPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="surface-overlay fixed bottom-6 right-6 z-50 flex h-[500px] w-[min(100vw-2rem,24rem)] flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between rounded-t-modal bg-primary-600 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <h3 className="text-body-sm font-semibold">Fria Assistant</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-pill p-1 transition-colors duration-brand hover:bg-primary-700"
                  aria-label="Close chatbot"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-primary-100">
                        <Bot className="h-4 w-4 text-primary-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-btn px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-50 text-neutral-900'
                      }`}
                    >
                      <p className="whitespace-pre-line text-body-sm">{message.text}</p>
                      <p
                        className={`mt-1 text-caption ${
                          message.sender === 'user' ? 'text-primary-100' : 'text-neutral-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-primary-100">
                        <User className="h-4 w-4 text-primary-700" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-secondary-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="input min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    className="btn btn-primary shrink-0 px-4"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
