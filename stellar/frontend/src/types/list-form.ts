export type CreateListData = {  
  name: string
  description: string
  allow_applications: boolean
  approve_applications: boolean
  admins: {
    admin_id: string
  }[]
  cover_img_url: string
}