'use client'

import React, { useEffect, useState, useRef } from 'react'
import { usePotlockService } from '@/services/potlock'
import { useParams } from 'next/navigation'
import clsx from 'clsx'
import Image from 'next/image'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPVotingResult } from '@/models/voting'
import { GPProject } from '@/models/project'
import { projectToGPProject } from '@/services/stellar/type'
import { scValToNative } from '@stellar/stellar-sdk'
import { ProjectVotingResult } from 'round-client'
import { Project } from 'project-registry-client'
import IconStarGold from '@/app/components/svgs/IconStarGold'
import IconStarSilver from '@/app/components/svgs/IconStarSilver'
import IconStarBronze from '@/app/components/svgs/IconStarBronze'

const VoteResultRow = ({
  index,
  data,
  totalVoting,
  projects,
}: {
  index: number
  data: GPVotingResult
  totalVoting: number
  projects: Map<string, GPProject>
}) => {
  const projectData = projects.get(data.project)
  const myVote = data.votes > 0 && totalVoting > 0 ? (data.votes / totalVoting) * 100 : 0

  return (
    <div
      className={clsx(
        'flex items-center w-full px-4 py-4 transition rounded-2xl',
        data.flag && 'bg-red-100 border-none',
        !data.flag && (index % 2 === 0 ? 'bg-white' : 'bg-grantpicks-black-50/30')
      )}
    >
      {/* Rank Column */}
      <div className="flex items-center justify-center w-[10%]">
        {index === 0 && <IconStarGold size={24} />}
        {index === 1 && <IconStarSilver size={24} />}
        {index === 2 && <IconStarBronze size={24} />}
        {index > 2 && (
          <p className="text-xs md:text-sm font-semibold text-grantpicks-black-600 text-center">
            #{index + 1}
          </p>
        )}
      </div>

      {/* Project Column */}
      <div className="flex items-center w-[50%] min-w-0">
        <Image
          src={`https://www.tapback.co/api/avatar/${projectData?.owner?.id}`}
          alt=""
          width={40}
          height={40}
          className="rounded-full w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
        />
        <div className="ml-3 min-w-0 flex-1 flex items-center">
          <p className="text-xs md:text-sm font-semibold text-grantpicks-black-950 truncate">
            {projectData?.name || 'Loading...'}
          </p>
          {data.flag && (
            <span className="ml-2 bg-red-50 border rounded-full px-2 py-1 text-xs text-red-500 border-red-500 flex-shrink-0">
              flagged
            </span>
          )}
        </div>
      </div>

      {/* Score Column */}
      <div className="flex items-center justify-end w-[20%]">
        <p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
          {myVote.toFixed(3)} %
        </p>
      </div>

      {/* Votes Column */}
      <div className="flex items-center justify-end w-[20%]">
        <p className="text-xs md:text-sm font-semibold text-grantpicks-black-950 text-right">
          {data.votes}
        </p>
      </div>
    </div>
  )
}

const VotesTableSkeleton = () => {
  return (
    <div className="animate-pulse space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center w-full px-4 py-4 bg-white rounded-2xl">
          <div className="w-[10%] flex justify-center">
            <div className="w-6 h-6 bg-grantpicks-black-100 rounded-full" />
          </div>
          <div className="w-[50%] flex items-center space-x-3">
            <div className="w-10 h-10 bg-grantpicks-black-100 rounded-full" />
            <div className="h-4 w-32 bg-grantpicks-black-100 rounded" />
          </div>
          <div className="w-[20%] flex justify-end">
            <div className="h-4 w-16 bg-grantpicks-black-100 rounded" />
          </div>
          <div className="w-[20%] flex justify-end">
            <div className="h-4 w-12 bg-grantpicks-black-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

const RoundVotesPage = () => {
  const potlockService = usePotlockService()
  const { roundId } = useParams()
  const storage = useAppStorage()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingResults, setVotingResults] = useState<GPVotingResult[]>([])
  const [projects, setProjects] = useState<Map<string, GPProject>>(new Map())

  // Use ref to track if we've already fetched
  const hasFetched = useRef(false)

  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchVotingResults = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get round info first
        const roundInfo = await potlockService.getRound(Number(roundId))
        if (!roundInfo) {
          setError('Round not found')
          setIsLoading(false)
          return
        }

        storage.setRound(roundInfo as any)
        storage.setChainId('stellar')

        const contracts = storage.getStellarContracts()
        if (!contracts) {
          setError('Unable to connect to contracts')
          setIsLoading(false)
          return
        }

        // Fetch voting results from contract
        const votingResultsScVal = (
          await contracts.round_contract.get_voting_results_for_round({
            round_id: BigInt(roundInfo.on_chain_id || 0),
          })
        ).simulationData.result.retval

        const rawResults = scValToNative(votingResultsScVal) as ProjectVotingResult[]

        if (rawResults && rawResults.length > 0) {
          // Convert to GPVotingResult and sort by votes
          const gpVotingResults: GPVotingResult[] = rawResults
            .map((v: ProjectVotingResult) => ({
              project: v.project_id.toString(),
              votes: Number(v.voting_count.toString()),
              flag: v.is_flagged,
            }))
            .sort((a, b) => b.votes - a.votes)

          setVotingResults(gpVotingResults)

          // Fetch project info for each result
          const projectsMap = new Map<string, GPProject>()

          for (const votingResult of gpVotingResults) {
            try {
              const projectInfoScVal = (
                await contracts.project_contract.get_project_by_id({
                  project_id: BigInt(votingResult.project),
                })
              ).simulationData.result.retval
              const projectInfo = scValToNative(projectInfoScVal) as Project

              if (projectInfo) {
                projectsMap.set(
                  votingResult.project.toString(),
                  projectToGPProject(projectInfo)
                )
              }
            } catch (e) {
              console.error(`Failed to fetch project ${votingResult.project}:`, e)
            }
          }

          setProjects(projectsMap)
        } else {
          setVotingResults([])
        }
      } catch (e) {
        console.error('Error fetching voting results:', e)
        setError('Failed to load voting data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVotingResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId])

  const totalVoting = votingResults.reduce((sum, r) => sum + r.votes, 0)

  if (error) {
    return (
      <div className="text-center text-grantpicks-black-950 py-8">
        <p className="text-base font-semibold mb-2">Error Loading Votes</p>
        <p className="text-sm text-grantpicks-black-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white pt-4 pb-3 border-b border-black/10 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-semibold text-grantpicks-black-600 uppercase">
              <span className="text-sm font-bold text-grantpicks-black-950 mr-1">
                {votingResults.length}
              </span>
              projects
              {totalVoting > 0 && (
                <span className="ml-2 text-grantpicks-black-400">
                  • {totalVoting} total votes
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-grantpicks-black-50 rounded-2xl p-4">
        {/* Table Header */}
        <div className="py-3 px-4 flex items-center w-full">
          <div className="flex items-center justify-center w-[10%]">
            <p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-center">
              Rank
            </p>
          </div>
          <div className="flex items-center w-[50%]">
            <p className="text-xs md:text-sm font-semibold text-grantpicks-black-500">
              Project
            </p>
          </div>
          <div className="flex items-center justify-end w-[20%]">
            <p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
              Score
            </p>
          </div>
          <div className="flex items-center justify-end w-[20%]">
            <p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
              Votes
            </p>
          </div>
        </div>

        {/* Table Body */}
        <div className="bg-white rounded-2xl flex flex-col divide-y divide-black/10 overflow-hidden">
          {isLoading ? (
            <VotesTableSkeleton />
          ) : votingResults.length > 0 ? (
            <>
              {votingResults.map((result, index) => (
                <VoteResultRow
                  key={result.project}
                  index={index}
                  data={result}
                  totalVoting={totalVoting}
                  projects={projects}
                />
              ))}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-base font-semibold text-grantpicks-black-950 mb-1">
                No votes yet
              </p>
              <p className="text-sm text-grantpicks-black-600">
                Votes will appear here once voting begins.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoundVotesPage
