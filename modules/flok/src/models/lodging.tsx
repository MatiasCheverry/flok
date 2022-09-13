import {ImageModel} from "."

// Destinations
export type DestinationModel = {
  id: number
  guid: string
  objectID: string
  location: string // usually a city, can be more generic like "Lake Tahoe"/"Bay Area" etc.
  state?: string
  state_abbreviation?: string
  country: string
  country_abbreviation?: string

  description_short: string

  spotlight_img: ImageModel
  imgs: ImageModel[]
}

// Hotels
export type HotelModel = {
  id: number
  guid: string
  objectID: string
  name: string
  destination_id: number
  sub_location?: string
  street_address?: string
  address_coordinates?: [number, number]

  website_url: string
  description_short: string
  airport_travel_time?: number
  airport?: string

  spotlight_img: ImageModel
  imgs: ImageModel[]
  num_rooms?: number
  is_flok_recommended?: boolean
  lodging_tags: LodgingTagModel[]
  price: "$" | "$$" | "$$$" | "$$$$"
  lodging_tags_filter_dict: {[id: number]: boolean}
}

export type LodgingTagModel = {
  id: number
  name: string
}

export type GooglePlace = {
  name: string
  place_id: string
  lat?: number
  lng?: number
  type: "ADD_GOOGLE_PLACE"
}
