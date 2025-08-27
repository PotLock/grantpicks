'use client'

import ApplicationLayout from "@/app/components/pages/application/Layout"
import Footer from "@/app/components/commons/Footer"
import { ListForm } from "@/app/components/pages/application/lists"

const CreateListPage = () => {
  return (
    <ApplicationLayout>
      <ListForm />
      <Footer />
    </ApplicationLayout>
  )
}

export default CreateListPage