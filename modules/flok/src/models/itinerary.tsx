import {ImageModel} from "."

export type PastItineraryModel = {
  id: number
  // guid: string
  start_date: Date
  end_date: Date
  hotel_id: number
  nights: number
  team_size: number
  itinerary_link: string
  spotlight_img_id: number
  spotlight_img: ImageModel
  location_ids: number[]
}

export type PastItineraryLocationModel = {
  id: number
  // guid: string
  name: string
}
