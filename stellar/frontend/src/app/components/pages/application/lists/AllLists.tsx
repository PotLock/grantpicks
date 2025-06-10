import Button from "@/app/components/commons/Button"
import IconPlus from "@/app/components/svgs/IconPlus"
import IconSearch from "@/app/components/svgs/IconSearch"
import { useRouter } from "next/navigation"

export const AllLists = () => {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col justify-between items-center md:flex-row mt-10 gap-y-4">
        <div className="flex items-center gap-x-2  rounded-full p-2 border border-grantpicks-black-950 w-full md:w-[40%]">
          <IconSearch size={24} color="#292929" />
          <input type="text" placeholder="Search Lists by name or description" className="w-full text-grantpicks-black-950 outline-none" />
        </div>
        <div>
          <Button
            icon={<IconPlus size={24} color="" />}
            className="!text-sm !font-semibold" onClick={() => router.push('/lists/create')}>
            Create List
          </Button>
        </div>
      </div>

    </div>
  )
}