import { RegistrationExternal } from "lists-client"
import { useEffect, useState } from "react"
import useAppStorage from "@/stores/zustand/useAppStorage"
import { getProjectApplicant } from "@/services/stellar/project-registry"
import { Project } from "project-registry-client"
import Image from "next/image"
import Menu from '@/app/components/commons/Menu'
import { useSingleList } from "./hooks/useSingleList"
import { mutate } from "swr"

type StatusTag = "Pending" | "Approved" | "Rejected" | "Graylisted" | "Blacklisted"

export const ListProjects = ({ listId, isOwner }: { listId: string, isOwner: boolean }) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusTag>("Approved")
  const [menuOpen, setMenuOpen] = useState(false)

  const { registrations: projects, isLoadingRegistrations: isLoading, handleUpdateProjectStatus } = useSingleList({
    listId,
    requiredStatus: { tag: selectedStatus, values: undefined }
  })

  const handleStatusUpdate = async (projectId: bigint, status: { tag: StatusTag, values: undefined }) => {
    await handleUpdateProjectStatus(projectId, status)
    await mutate(`list-registrations-${listId}-${selectedStatus}`)
  }

  const filteredProjects = projects || []

  return (
    <div className="mt-8 mx-auto px-4">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div className="font-semibold text-lg">
            Members <span className="text-gray-500 font-normal">({filteredProjects.length})</span>
          </div>
          <div className="relative">
            <button
              className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[160px] flex items-center justify-between gap-2 bg-white"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {selectedStatus}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <Menu
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              position="right-0 mt-2"
              className="min-w-[160px]"
            >
              <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-xl shadow-lg">
                {Object.keys(listRegistrationStatuses).map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 text-left text-sm hover:bg-gray-100 ${selectedStatus === status ? 'font-semibold text-blue-600' : ''}`}
                    onClick={() => {
                      setSelectedStatus(status as StatusTag)
                      setMenuOpen(false)
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </Menu>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {
            isLoading && !filteredProjects ? (
              <div className="mt-8 mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
                </div>
              </div>
            ) : (
              filteredProjects.length === 0 ? (
                <div className="col-span-full text-center h-[200px] flex items-center justify-center text-gray-400">No projects found for this status.</div>
              ) : (
                filteredProjects.map((project: RegistrationExternal) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isOwner={isOwner}
                    handleUpdateProjectStatus={handleStatusUpdate}
                  />
                ))
              )
            )
          }
        </div>
      </div>
    </div>
  )
}

const ProjectCard = ({
  project,
  isOwner,
  handleUpdateProjectStatus
}: {
  project: RegistrationExternal,
  isOwner: boolean,
  handleUpdateProjectStatus: (projectId: bigint, status: { tag: StatusTag, values: undefined }) => Promise<void>
}) => {
  const [projectDetails, setProjectDetails] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const storage = useAppStorage()

  useEffect(() => {
    let isMounted = true
    const fetchProjectDetails = async () => {
      if (storage.chainId === 'stellar') {
        setIsLoading(true)
        setError(false)
        try {
          const contracts = storage.getStellarContracts()
          if (!contracts) {
            throw new Error('Contracts not found')
          }
          const details = await getProjectApplicant(project.registrant_id, contracts)
          if (details && isMounted) {
            setProjectDetails(details)
          }
        } catch (e) {
          if (isMounted) setError(true)
        } finally {
          if (isMounted) setIsLoading(false)
        }
      }
    }
    fetchProjectDetails()
    return () => { isMounted = false }
  }, [project.registrant_id, storage])

  const status = project.status.tag
  const badgeStyle = listRegistrationStatuses[status] || listRegistrationStatuses["Pending"];
  const badge = (
    <span
      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2"
      style={{
        color: badgeStyle.color,
        background: badgeStyle.background,
        border: `1px solid ${badgeStyle.color}`,
      }}
    >
      {status}
    </span>
  );

  if (isLoading) return <ProjectCardSkeleton />
  if (error) return <ProjectCardError />

  return (
    <div className="flex flex-col items-center bg-white rounded-xl border border-black/10 shadow p-6 min-h-[240px]">
      <Image
        src={`https://www.tapback.co/api/avatar/${project.registrant_id}`}
        alt=""
        className="rounded-full object-cover"
        width={64}
        height={64}
      />
      <div className="font-bold text-xl text-center mt-4 mb-2">
        {projectDetails?.name || 'Slim Project'}
      </div>
      {badge}
      {isOwner && (
        <div className="relative mt-4">
          <button
            className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[160px] flex items-center justify-between gap-2 bg-white"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            Update Status
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <Menu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            position="right-0 mt-2"
            className="min-w-[160px]"
          >
            <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-xl shadow-lg">
              {Object.keys(listRegistrationStatuses).map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2 text-left text-sm hover:bg-gray-100`}
                  onClick={() => {
                    handleUpdateProjectStatus(project.id, { tag: status as StatusTag, values: undefined })
                    setMenuOpen(false)
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </Menu>
        </div>
      )}
    </div>
  )
}

const ProjectCardSkeleton = () => (
  <div className="flex flex-col items-center bg-white rounded-xl border border-black/10 shadow p-6 min-h-[240px] animate-pulse">
    <div className="rounded-full bg-gray-200 w-16 h-16 mb-4" />
    <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-16 bg-gray-100 rounded" />
  </div>
)

const ProjectCardError = () => (
  <div className="flex flex-col items-center bg-white rounded-xl border border-red-200 shadow p-6 min-h-[240px]">
    <div className="rounded-full bg-red-100 w-16 h-16 mb-4 flex items-center justify-center text-red-400 text-2xl">!</div>
    <div className="font-bold text-xl text-center mt-4 mb-2 text-red-600">Error</div>
    <div className="text-sm text-red-400">Failed to load project</div>
  </div>
)

const listRegistrationStatuses = {
  Approved: {
    color: "#0B7A74",
    background: "#EFFEFA",
  },
  Rejected: {
    color: "#ED464F",
    background: "#FEF3F2",
  },
  Pending: {
    color: "#EA6A25",
    background: "#FEF6EE",
  },
  Graylisted: {
    color: "#fff",
    background: "#7b7b7bd8",
  },
  Blacklisted: {
    color: "#fff",
    background: "#292929",
  },
  Unregistered: {
    color: "#F6F5F3",
    background: "#DD3345",
  },
  Human: {
    color: "#0B7A74",
    background: "#EFFEFA",
  },
};
