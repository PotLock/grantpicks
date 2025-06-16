import Button from "@/app/components/commons/Button"
import { useEffect, useState } from "react"
import { useSingleList } from "./hooks/useSingleList"
import { RegistrationStatus } from "lists-client"
import AddAdminsModal from "../../create-round/AddAdminsModal"
import { useFieldArray, useForm } from "react-hook-form"
import AddProjectsModal from "../../create-round/AddProjectsModal"
import { IGetProjectsResponse } from "@/services/stellar/project-registry"
import Image from "next/image"
import { prettyTruncate } from "@/utils/helper"
import IconTrash from "@/app/components/svgs/IconTrash"

type RegisterUsersModalProps = {
  type: 'SINGLE' | 'BATCH'
  listId: string
  onClose: () => void
}

export const RegisterUsersModal = ({ type, listId, onClose }: RegisterUsersModalProps) => {
  const [note, setNote] = useState<string | null>(null)
  const [openAddProjectsModal, setOpenAddProjectsModal] = useState(false)
  const { handleApplyToList, handleBatchRegisterToList, data } = useSingleList({ listId })
  const [selectedProjects, setSelectedProjects] = useState<IGetProjectsResponse[]>([])
  const { control } = useForm()

  const { append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects',
  })

  return (
    <>
      <div className="p-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 md:w-[35vw] lg:w-[35vw] bg-white rounded-lg flex flex-col gap-4 justify-center items-center">
        <h1 className="text-2xl font-bold">{type === 'SINGLE' ? 'Apply to List' : 'Register Project(s)'}</h1>
        <div className="flex p-4 w-full flex-col gap-4">
          {
            type === 'SINGLE' ? (
              <div className="flex w-full justify-center  items-center flex-col gap-2">
                <label htmlFor="note">Note</label>
                <textarea id="note" rows={4} placeholder="Write something..."
                  className="w-2/3 p-2 rounded-md border border-gray-300"
                  value={note || ''}
                  onChange={(e) => setNote(e.target.value)} />
                <Button onClick={() => {
                  handleApplyToList({ defaultRegistrationStatus: data?.default_registration_status as RegistrationStatus, note, onClose })
                }}>Apply</Button>
              </div>
            ) :
              (
                <div className="flex flex-col gap-2 w-full">
                  <div className="overflow-y-auto max-h-[20vh]">
                    {selectedProjects.map((selected, index) => (
                      <div
                        className="flex items-center justify-between p-2 hover:bg-grantpicks-black-200 transition"
                        key={index}
                      >
                        <div className="flex items-center space-x-2">
                          <Image
                            src={`https://www.tapback.co/api/avatar/${selected.owner}`}
                            alt=""
                            className="rounded-full object-fill"
                            width={24}
                            height={24}
                          />
                          {prettyTruncate(selected.name, 20, 'address')}
                        </div>
                        <IconTrash
                          size={24}
                          className="fill-grantpicks-black-400 cursor-pointer transition hover:opacity-80"
                          onClick={() => {
                            let temp = [...selectedProjects]
                            temp.splice(index, 1)
                            setSelectedProjects(temp)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <h2 role="button" onClick={() => setOpenAddProjectsModal(true)} className="text-sm hover:underline text-center">Add / remove Projects</h2>
                  <Button onClick={() => {
                    handleBatchRegisterToList(selectedProjects.map(project => ({
                      registrant: project?.id as unknown as string,
                      status: data?.default_registration_status as RegistrationStatus,
                      submitted_ms: BigInt(Date.now()),
                      updated_ms: BigInt(Date.now()),
                      notes: note || ''
                    })), onClose)
                  }}>Save Changes</Button>
                </div>
              )
          }
        </div>
      </div >
      <AddProjectsModal
        selectedProjects={selectedProjects}
        setSelectedProjects={setSelectedProjects}
        isOpen={openAddProjectsModal}
        onClose={() => setOpenAddProjectsModal(false)}
      />
    </>

  )
}