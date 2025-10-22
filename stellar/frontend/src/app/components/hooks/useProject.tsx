import { usePotlockService } from "@/services/potlock"
import useSWR from "swr"


export const useProject = ({ projectId }: { projectId: string }) => {
  const potlockService = usePotlockService()

  const { data, isLoading, error } = useSWR(`/api/${projectId}/projects`, async () => {
    return potlockService.getProjectById(projectId)
  })

  return { data: data?.results[0], isLoading, error }
}