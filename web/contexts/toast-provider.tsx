'use client'

import { ToastContainer } from 'react-toastify'
import { useTheme } from 'next-themes'
import 'react-toastify/dist/ReactToastify.css'

export function ToastProvider() {
  const { theme } = useTheme()

  return (
    <ToastContainer
      position="top-right"
      theme={theme === 'light' ? 'dark' : 'light'}
    />
  )
}