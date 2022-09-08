import querystring from "querystring"
import {createApiAction} from "./api"

// destinations
export const GET_DESTINATIONS_REQUEST = "GET_DESTINATIONS_REQUEST"
export const GET_DESTINATIONS_SUCCESS = "GET_DESTINATIONS_SUCCESS"
export const GET_DESTINATIONS_FAILURE = "GET_DESTINATIONS_FAILURE"

export function getDestinations() {
  let endpoint = `/v1.0/destinations`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_DESTINATIONS_REQUEST,
      GET_DESTINATIONS_SUCCESS,
      GET_DESTINATIONS_FAILURE,
    ],
  })
}

// destinations
export const GET_HOTELS_REQUEST = "GET_HOTELS_REQUEST"
export const GET_HOTELS_SUCCESS = "GET_HOTELS_SUCCESS"
export const GET_HOTELS_FAILURE = "GET_HOTELS_FAILURE"

export function getHotels(ids: number[]) {
  let endpoint = `/v1.0/hotels?${querystring.stringify({id: ids})}`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [GET_HOTELS_REQUEST, GET_HOTELS_SUCCESS, GET_HOTELS_FAILURE],
  })
}

export const GET_HOTEL_BY_GUID_REQUEST = "GET_HOTEL_BY_GUID_REQUEST"
export const GET_HOTEL_BY_GUID_SUCCESS = "GET_HOTEL_BY_GUID_SUCCESS"
export const GET_HOTEL_BY_GUID_FAILURE = "GET_HOTEL_BY_GUID_FAILURE"

export function getHotelByGuid(guid: string) {
  let endpoint = `/v1.0/hotels/${guid}`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_HOTEL_BY_GUID_REQUEST,
      GET_HOTEL_BY_GUID_SUCCESS,
      {type: GET_HOTEL_BY_GUID_FAILURE, meta: {hotelGuid: guid}},
    ],
  })
}

export const GET_FILTERED_HOTELS_REQUEST = "GET_FILTERED_HOTELS_REQUEST"
export const GET_FILTERED_HOTELS_SUCCESS = "GET_FILTERED_HOTELS_SUCCESS"
export const GET_FILTERED_HOTELS_FAILURE = "GET_FILTERED_HOTELS_FAILURE"

export function getFilteredHotels(filterRequest: {
  price_range?: string[]
  max_rooms?: number
  tags?: number[]
  min_rooms?: number
  max_distance_from_airport?: number
}) {
  let endpoint = `/v1.0/hotels/venue-sourcing`
  return createApiAction({
    endpoint,
    method: "POST",
    body: JSON.stringify(filterRequest),
    types: [
      GET_FILTERED_HOTELS_REQUEST,
      GET_FILTERED_HOTELS_SUCCESS,
      GET_FILTERED_HOTELS_FAILURE,
    ],
  })
}

export const GET_LODGING_TAGS_REQUEST = "GET_LODGING_TAGS_REQUEST"
export const GET_LODGING_TAGS_SUCCESS = "GET_LODGING_TAGS_SUCCESS"
export const GET_LODGING_TAGS_FAILURE = "GET_LODGING_TAGS_FAILURE"

export function getLodgingTags() {
  let endpoint = `/v1.0/lodging-tags`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_LODGING_TAGS_REQUEST,
      GET_LODGING_TAGS_SUCCESS,
      GET_LODGING_TAGS_FAILURE,
    ],
  })
}

export const ADD_GOOGLE_PLACE = "ADD_GOOGLE_PLACE"

export function addGooglePlace(place: {
  name: string
  place_id: string
  lat?: number
  lng?: number
}) {
  let action = {...place, type: ADD_GOOGLE_PLACE}
  return action
}

export const DELETE_SELECTED_HOTEL_REQUEST = "DELETE_SELECTED_HOTEL_REQUEST"
export const DELETE_SELECTED_HOTEL_SUCCESS = "DELETE_SELECTED_HOTEL_SUCCESS"
export const DELETE_SELECTED_HOTEL_FAILURE = "DELETE_SELECTED_HOTEL_FAILURE"

export function deleteSelectedHotel(retreatId: number, hotelId: number) {
  let endpoint = `/v1.0/retreats/${retreatId}/hotels/${hotelId}`
  return createApiAction({
    endpoint,
    method: "DELETE",
    types: [
      DELETE_SELECTED_HOTEL_REQUEST,
      DELETE_SELECTED_HOTEL_SUCCESS,
      {type: DELETE_SELECTED_HOTEL_FAILURE},
    ],
  })
}
