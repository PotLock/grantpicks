import Checkbox from "@/app/components/commons/CheckBox"
import InputText from "@/app/components/commons/InputText"
import InputTextArea from "@/app/components/commons/InputTextArea"
import { ChangeEvent } from "react"
import Switch from "react-switch"
import AddAdminsModal from "../../create-round/AddAdminsModal"
import { useDropzone } from "react-dropzone"
import IconTrash from "@/app/components/svgs/IconTrash"
import Image from "next/image"
import { prettyTruncate } from "@/utils/helper"
import IconClose from "@/app/components/svgs/IconClose"
import clsx from "clsx"
import IconAdd from "@/app/components/svgs/IconAdd"
import IconLoading from "@/app/components/svgs/IconLoading"
import { useListForm } from "@/app/components/hooks/useListForm"
import Button from "@/app/components/commons/Button"

export const ListForm = () => {
  const {
    setValue,
    watch,
    register,
    errors,
    onSubmit,
    listFormState,
    setListFormState,
    isPending,
    onDrop,
    handleRemoveImage,
    handleRemoveAdmin,
    appendAdmin,
    removeAdmin
  } = useListForm()

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  })

  return (
    <div className="flex flex-col text-grantpicks-black-950 gap-y-4 w-full justify-center items-center">
      <h1 className="text-4xl font-extrabold text-grantpicks-black-950">CREATE LIST</h1>
      <div className="flex flex-col gap-y-4 md:p-12 box-shadow-2xl border border-[#b0b0b0] rounded-2xl p-4 w-full md:w-[60%] items-start justify-center">
        <h2 className="text-lg font-semibold text-center text-grantpicks-black-950">List Details</h2>
        <div className="flex flex-col gap-y-4 w-full">
          <InputText
            label="List Title"
            placeholder="Enter List Title"
            className="!text-sm w-full"
            required
            errorMessage={errors.name?.message ? <span>{errors.name.message}</span> : undefined}
            maxLength={60}
            {...register('name', { required: true })}
          />
          <InputTextArea
            label="List Description"
            placeholder="Enter List Description"
            className="!text-sm w-full"
            required
            errorMessage={errors.description?.message ? <span>{errors.description.message}</span> : undefined}
            rows={4}
            maxLength={300}
            {...register('description', { required: true })}
          />
        </div>
        <div className="flex flex-col items-start gap-y-2 justify-between w-full pb-4 border border-black/10 rounded-xl p-4">
          <div className="flex items-center justify-between w-full">
            <p className=" font-semibold">Allow Applications</p>
            <Switch
              checked={watch('allow_applications')}
              onChange={(checked: boolean) => {
                setValue('allow_applications', checked)
              }}
              height={22}
              width={42}
              checkedIcon={false}
              uncheckedIcon={false}
              offColor="#DCDCDC"
              onColor="#292929"
              handleDiameter={18}
              offHandleColor="#fff"
              onHandleColor="#fff"
            />
          </div>
          <div className="flex items-center gap-x-1">
            <Checkbox
              checked={watch('approve_applications')}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setValue('approve_applications', e.target.checked)
              }}
            />
            <p className="text-grantpicks-black-950">New Applications will be approved automatically.</p>
          </div>
        </div>

        <div className="p-5 w-full rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-base font-bold text-grantpicks-black-950">
                Add Admins{' '}
              </p>
              <p className="text-sm font-normal text-grantpicks-black-600">
                Add admins that can help manage this list{' '}
              </p>
            </div>
            <button
              onClick={() => setListFormState(prev => ({ ...prev, showAddAdminsModal: true }))}
              className="rounded-full w-10 lg:w-12 h-10 lg:h-12 flex items-center justify-center bg-grantpicks-alpha-50/5 cursor-pointer hover:opacity-70 transition"
            >
              <IconAdd size={24} className="fill-grantpicks-black-400" />
            </button>
          </div>
          <div
            className={clsx(
              `grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4`,
              listFormState.selectedAdmins.length > 0 ? `mt-6` : `mt-0`,
            )}
          >
            {listFormState.selectedAdmins.map((selected, index) => (
              <div
                key={index}
                className="bg-grantpicks-alpha-50/5 p-1 rounded-full flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Image
                    src={`https://www.tapback.co/api/avatar/${selected}`}
                    alt="admin"
                    width={24}
                    height={24}
                  />
                  <p className="text-sm font-semibold text-grantpicks-black-950">
                    {prettyTruncate(selected, 10, 'address')}
                  </p>
                </div>
                <IconClose
                  size={18}
                  className="fill-grantpicks-black-600 cursor-pointer transition hover:opacity-80"
                  onClick={() => handleRemoveAdmin(index)}
                />
              </div>
            ))}
          </div>
          <AddAdminsModal
            isOpen={listFormState.showAddAdminsModal}
            onClose={() => setListFormState(prev => ({ ...prev, showAddAdminsModal: false }))}
            selectedAdmins={listFormState.selectedAdmins}
            setSelectedAdmins={(admins) => setListFormState(prev => ({ ...prev, selectedAdmins: typeof admins === 'function' ? admins(prev.selectedAdmins) : admins }))}
            append={appendAdmin}
            remove={removeAdmin}
          />
        </div>
        <div className="flex flex-col gap-y-4 w-full">
          <p className="text-lg font-semibold text-grantpicks-black-950">Upload Cover Image</p>
          <div className="flex flex-col gap-y-2">
            <p className="text-sm font-normal text-grantpicks-black-600">
              Upload a cover image for your list.
            </p>
            {isPending ? (
              <div className="w-full aspect-video relative flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <IconLoading size={24} className="fill-grantpicks-black-900" />
                  <p className="text-sm font-normal text-grantpicks-black-950/80">
                    Uploading...
                  </p>
                </div>
              </div>
            ) : !listFormState.coverImage ? (
              <div
                {...getRootProps()}
                className="border border-dashed rounded-xl border-black/10 p-4 flex flex-col items-center cursor-pointer hover:opacity-80 transition"
              >
                <input {...getInputProps()} />
                <div className="border border-black/10 p-2 rounded-full mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-center text-sm font-normal text-grantpicks-black-950 mb-1">
                  Drag and drop or click to upload image
                </p>
                <p className="text-xs font-normal text-grantpicks-black-950">
                  Supported format: PNG, JPG, JPEG, GIF (max 5MB)
                </p>
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <Image
                  src={listFormState.coverImageUrl}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:opacity-80 transition"
                >
                  <IconTrash size={20} className="fill-white" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end w-full gap-x-2 mt-8">
          <Button
            onClick={onSubmit}
            className="w-full"
          >
            Create List
          </Button>
        </div>
      </div>
    </div>
  )
}