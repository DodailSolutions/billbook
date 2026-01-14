'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  MessageCircle, 
  Send,
  Search,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react'

interface WhatsAppContact {
  id: string
  name: string
  phone: string
  avatar?: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
  online?: boolean
}

interface WhatsAppMessage {
  id: string
  contact_id: string
  message: string
  timestamp: string
  sent_by_me: boolean
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  media_url?: string
  media_type?: string
}

export default function WhatsAppCRMPage() {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const [userRegion, setUserRegion] = useState<string | null>(null)
  const [regionLoading, setRegionLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check user region first
    fetch('/api/user/region')
      .then(res => res.json())
      .then(data => {
        setUserRegion(data.region)
        setRegionLoading(false)
        
        // Only load WhatsApp data if user is in India
        if (data.region === 'IN') {
          checkConnection()
          loadContacts()
        }
      })
      .catch(() => {
        setRegionLoading(false)
        setUserRegion('IN')
      })
  }, [])

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id)
    }
  }, [selectedContact])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/whatsapp/status')
      const data = await response.json()
      setConnected(data.connected)
    } catch (error) {
      console.error('Error checking connection:', error)
      setConnected(false)
    }
  }

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/whatsapp/contacts')
      const data = await response.json()
      setContacts(data.contacts || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (contactId: string) => {
    try {
      const response = await fetch(`/api/whatsapp/messages?contact_id=${contactId}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || sending) return

    try {
      setSending(true)
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: selectedContact.id,
          phone: selectedContact.phone,
          message: newMessage
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([...messages, data.message])
        setNewMessage('')
        // Update contact's last message
        setContacts(contacts.map(c => 
          c.id === selectedContact.id 
            ? { ...c, last_message: newMessage, last_message_time: new Date().toISOString() }
            : c
        ))
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const _sendInvoice = async (invoiceId: string) => {
    if (!selectedContact) return

    try {
      const response = await fetch('/api/whatsapp/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: selectedContact.id,
          phone: selectedContact.phone,
          invoice_id: invoiceId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([...messages, data.message])
      }
    } catch (error) {
      console.error('Error sending invoice:', error)
    }
  }

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  )

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'sent':
        return <Check className="h-4 w-4 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  // Region check - Only available for India
  if (regionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (userRegion !== 'IN') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Feature Not Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              WhatsApp CRM is currently only available for India region users.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This feature uses WhatsApp Business API which is optimized for Indian businesses and compliance requirements.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              WhatsApp Not Connected
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your WhatsApp account to start using the CRM
            </p>
            <Button 
              onClick={() => window.location.href = '/whatsapp-connect'}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Connect WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-green-600" />
          WhatsApp CRM
        </h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No contacts found</div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full p-4 flex items-start gap-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {contact.name}
                      </h3>
                      {contact.last_message_time && (
                        <span className="text-xs text-gray-500">
                          {formatTime(contact.last_message_time)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {contact.last_message || contact.phone}
                      </p>
                      {contact.unread_count && contact.unread_count > 0 && (
                        <span className="ml-2 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {contact.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {selectedContact.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedContact.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sent_by_me ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md rounded-lg px-4 py-2 ${
                      message.sent_by_me
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    {message.media_url && (
                      <div className="mb-2">
                        {message.media_type === 'image' ? (
                          <Image
                            src={message.media_url}
                            alt="Attachment"
                            width={300}
                            height={200}
                            className="rounded"
                          />
                        ) : (
                          <a href={message.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline">
                            <FileText className="h-4 w-4" />
                            View Attachment
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sent_by_me && getMessageStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p>Select a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
