'use client'

import Footer from "@/app/components/commons/Footer"
import ApplicationLayout from "@/app/components/pages/application/Layout"
import { SingleListPage } from "@/app/components/pages/application/lists/SingleList"


const ListPage = () => {
  return (
    <ApplicationLayout>
      <SingleListPage />
      <Footer />
    </ApplicationLayout>
  )
}

export default ListPage