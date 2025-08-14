import React from 'react'
import { Contact } from 'round-client'
import Link from 'next/link'
import Button from '../../../commons/Button'
import IconTelegram from '../../../svgs/IconTelegram'
import IconInstagram from '../../../svgs/IconInstagram'
import IconTwitter from '../../../svgs/IconTwitter'
import IconEmail from '../../../svgs/IconEmail'

interface ContactsSectionProps {
  contacts: Contact[]
}

const RoundDetailContact: React.FC<{ contact: Contact }> = ({ contact }) => {
  const generateLink = () => {
    const name = contact.name.toLowerCase()
    if (name.includes('telegram')) {
      return `https://t.me/${contact.value}`
    } else if (name.includes('instagram')) {
      return `https://instagram.com/${contact.value}`
    } else if (name.includes('twitter')) {
      return `https://x.com/${contact.value}`
    } else if (name.includes('email')) {
      return `mailto:${contact.value}`
    }
    return ''
  }

  const getIcon = () => {
    const name = contact.name.toLowerCase()
    if (name.includes('telegram')) {
      return <IconTelegram size={18} className="fill-grantpicks-black-400" />
    } else if (name.includes('instagram')) {
      return <IconInstagram size={18} className="stroke-grantpicks-black-400" />
    } else if (name.includes('twitter')) {
      return <IconTwitter size={18} className="fill-grantpicks-black-400" />
    } else if (name.includes('email')) {
      return <IconEmail size={18} className="fill-grantpicks-black-400" />
    }
    return null
  }

  const getDisplayValue = () => {
    const name = contact.name.toLowerCase()
    if (name.includes('telegram') || name.includes('instagram') || name.includes('twitter') || name.includes('email')) {
      return `@${contact.value}`
    }
    return contact.value
  }

  return (
    <div className="flex items-center justify-between pt-3">
      <div className="flex items-center space-x-3">
        <div className="bg-grantpicks-black-50 rounded-full w-10 h-10 flex items-center justify-center">
          {getIcon()}
        </div>
        <p className="text-grantpicks-black-950 font-semibold text-base">
          {getDisplayValue()}
        </p>
      </div>
      <Link href={generateLink()} target="_blank">
        <Button
          color="alpha-50"
          onClick={() => { }}
          className="!text-sm !font-semibold"
        >
          Chat
        </Button>
      </Link>
    </div>
  )
}

const ContactsSection: React.FC<ContactsSectionProps> = ({ contacts }) => {
  return (
    <div>
      <div className="border-b border-black/10 pb-2 flex items-center">
        <p className="text-xs font-semibold text-grantpicks-black-600">
          CONTACTS
        </p>
      </div>
      {contacts.length === 0 ? (
        <div className="flex items-center justify-center h-20">
          <p className="text-center text-sm text-grantpicks-black-400">
            No contacts yet
          </p>
        </div>
      ) : (
        <div>
          {contacts.map((contact, idx) => (
            <RoundDetailContact key={idx} contact={contact} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ContactsSection
