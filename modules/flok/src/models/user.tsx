import {ImageModel} from "."

export type UserModel = {
  id: number
  email: string
  first_name?: string
  last_name?: string
  retreat_ids: number[]
  retreats: {company_name: string; id: number}[]
  attendee_ids: number[]
}

export type FlokInternalAdminModel = {
  id: number
  email: string
  first_name: string
  last_name?: string
  gender?: "M" | "F"
  avatar_img?: ImageModel
}
