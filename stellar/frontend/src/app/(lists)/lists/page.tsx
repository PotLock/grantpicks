'use client'

import Footer from "@/app/components/commons/Footer"
import ApplicationLayout from "@/app/components/pages/application/Layout"
import { AllLists } from "@/app/components/pages/application/lists"
import { ListHeader } from "@/app/components/pages/application/lists/ListHeader"



const ListsPage = () => {
  return (
    <ApplicationLayout>
      <ListHeader />
      <AllLists />
      <Footer />
    </ApplicationLayout>
  )
}

export default ListsPage