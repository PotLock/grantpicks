'use client'

import ApplicationLayout from "@/app/components/pages/application/Layout"
import { ListForm } from "@/app/components/pages/application/lists"
import Footer from "@/app/components/commons/Footer"
import { useParams } from "next/navigation"
import { useSingleList } from "@/app/components/pages/application/lists/hooks/useSingleList"


const UpdateListPage = () => {
  const { listId } = useParams()
  const { data: list, isLoading, isError } = useSingleList({ listId: listId as string })

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Failed to load list</div>
      </div>
    )
  }

  return (
    <ApplicationLayout>
      {isLoading && !list ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grantpicks-black-950"></div>
        </div>
      ) : (
        <ListForm listId={listId as string} existingList={list} />
      )}
      <Footer />
    </ApplicationLayout>
  )
}

export default UpdateListPage