'use client'

import Footer from "../components/commons/Footer"
import ApplicationLayout from "../components/pages/application/Layout"
import { ListHeader, AllLists } from "../components/pages/application/lists"


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