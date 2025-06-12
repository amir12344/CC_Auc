

"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Mail } from './messaging/Mail'
import { accounts, mails } from './messaging/data'


export default function Messages() {
  const [layout, setLayout] = useState<number[] | undefined>(undefined)
  const [collapsed, setCollapsed] = useState<boolean | undefined>(undefined)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // This effect runs only on the client
    setIsClient(true)
    try {
      const cookieStore = document.cookie
        .split(';')
        .reduce((cookies: Record<string, string>, cookie) => {
          const [name, value] = cookie.trim().split('=')
          if (name && value) {
            cookies[name] = value
          }
          return cookies
        }, {})

      const layoutValue = cookieStore['react-resizable-panels:layout:mail']
      const collapsedValue = cookieStore['react-resizable-panels:collapsed']
      
      if (layoutValue) {
        setLayout(JSON.parse(decodeURIComponent(layoutValue)))
      }
      
      if (collapsedValue) {
        setCollapsed(JSON.parse(decodeURIComponent(collapsedValue)))
      }
    } catch (error) {
      console.error('Error parsing cookie values:', error)
    }
  }, [])

  if (!isClient) {
    // Show a loading state or placeholder while cookies are being read
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <Mail
          accounts={accounts}
          mails={mails}
          defaultLayout={layout || undefined}
          defaultCollapsed={collapsed || undefined}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}