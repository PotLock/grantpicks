import React from 'react'
import Image from 'next/image'
import IconLoading from '../../../svgs/IconLoading'
import { prettyTruncate } from '@/utils/helper'
import { GPRound } from '@/models/round'
import { IGetProjectsResponse } from '@/services/stellar/project-registry'

interface OwnerAdminSectionProps {
  doc: GPRound
  admins: string[] | undefined
  projects: IGetProjectsResponse[]
  isLoading: boolean
  isValidating: boolean
  isLoadingProjects: boolean
}

const OwnerAdminSection: React.FC<OwnerAdminSectionProps> = ({
  doc,
  admins,
  projects,
  isLoading,
  isValidating,
  isLoadingProjects,
}) => {
  const getOwnerName = () => {
    const project = projects.find(project => project.owner === doc.owner?.id)
    return project?.name || prettyTruncate(doc.owner?.id || (doc.owner as unknown as string), 8, 'address')
  }

  const getOwnerId = () => doc.owner?.id || (doc.owner as unknown as string)

  return (
    <div className="mb-4 md:mb-5">
      {/* Owner Section */}
      <div className="border-b border-black/10 pb-2 flex items-center">
        <p className="text-xs font-semibold text-grantpicks-black-600">
          OWNER
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Image
          src={`https://www.tapback.co/api/avatar/${getOwnerId()}`}
          alt="owner"
          width={40}
          height={40}
        />
        <div className="py-4">
          <p className="text-base font-bold text-grantpicks-black-950">
            {getOwnerName()}
          </p>
        </div>
      </div>

      {/* Admins Section */}
      <div>
        {(isLoading || isValidating || isLoadingProjects) && (admins?.length || 0) > 0 ? (
          <div className="h-20 flex items-center justify-center w-full">
            <IconLoading size={24} className="fill-grantpicks-black-600" />
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-grantpicks-black-600">
              ADMIN{' '}
              <span className="text-sm font-bold text-grantpicks-black-600 ml-2">
                {admins?.length || ''}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-4 pt-3">
              {admins?.map((admin, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Image
                    src={`https://www.tapback.co/api/avatar/${admin}`}
                    alt="admin"
                    width={40}
                    height={40}
                  />
                  <div>
                    <p className="text-base font-bold text-grantpicks-black-950">
                      {prettyTruncate(admin, 8, 'address')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OwnerAdminSection
