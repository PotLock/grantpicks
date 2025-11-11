'use client'

import React, { useState, useRef, useEffect } from 'react'
import IconShare from '../../svgs/IconShare'
import IconInstagram from '../../svgs/IconInstagram'
import IconTelegram from '../../svgs/IconTelegram'
import IconTwitter from '../../svgs/IconTwitter'
import IconCopy from '../../svgs/IconCopy'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'

interface ShareButtonProps {
  roundId: string
  userAccount?: string
  title?: string
  type?: 'round' | 'list'
}

const ShareButton = ({ roundId, userAccount, title, type = 'round' }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Only show if user is logged in
  if (!userAccount) {
    return null
  }

  const getShareUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const path = type === 'list' ? `/list/${roundId}` : `/round/${roundId}`
    const url = new URL(`${baseUrl}${path}`)
    url.searchParams.set('referredBy', userAccount)
    return url.toString()
  }

  const shareUrl = getShareUrl()
  const encodedUrl = encodeURIComponent(shareUrl)
  const defaultText = type === 'list'
    ? 'Check out this list!'
    : 'Check out this funding round!'
  const shareText = encodeURIComponent(
    title
      ? `${title} - ${defaultText}`
      : defaultText
  )

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!', {
        style: toastOptions.success.style,
      })
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to copy link', {
        style: toastOptions.error.style,
      })
    }
  }

  const handleShare = (platform: string) => {
    let shareLink = ''

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`
        break
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`
        break
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy the link
        handleCopyLink()
        return
      default:
        return
    }

    window.open(shareLink, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        aria-label="Share"
      >
        <IconShare
          size={24}
          className="text-grantpicks-black-600"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Share {type === 'list' ? 'List' : 'Round'}
            </p>
          </div>

          <div className="py-1">
            {/* Twitter */}
            <button
              onClick={() => handleShare('twitter')}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
            >
              <IconTwitter
                size={20}
                className="text-grantpicks-black-600"
              />
              <span className="text-sm font-medium text-grantpicks-black-950">
                Twitter
              </span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => handleShare('telegram')}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
            >
              <IconTelegram
                size={20}
                className="text-grantpicks-black-600"
              />
              <span className="text-sm font-medium text-grantpicks-black-950">
                Telegram
              </span>
            </button>

            {/* Instagram */}
            <button
              onClick={() => handleShare('instagram')}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
            >
              <IconInstagram
                size={20}
                className="text-grantpicks-black-600"
              />
              <span className="text-sm font-medium text-grantpicks-black-950">
                Instagram
              </span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-t border-gray-100 mt-1 pt-3"
            >
              <IconCopy
                size={20}
                className="stroke-grantpicks-black-600"
              />
              <span className="text-sm font-medium text-grantpicks-black-950">
                Copy Link
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShareButton

