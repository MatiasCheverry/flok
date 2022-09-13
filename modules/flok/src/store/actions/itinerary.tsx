import {createApiAction} from "./api"

export const GET_PAST_ITINERARIES_REQUEST = "GET_PAST_ITINERARIES_REQUEST"
export const GET_PAST_ITINERARIES_SUCCESS = "GET_PAST_ITINERARIES_SUCCESS"
export const GET_PAST_ITINERARIES_FAILURE = "GET_PAST_ITINERARIES_FAILURE"

export function getPastItineraries() {
  let endpoint = "/v1.0/past-itineraries"
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_PAST_ITINERARIES_REQUEST,
      GET_PAST_ITINERARIES_SUCCESS,
      GET_PAST_ITINERARIES_FAILURE,
    ],
  })
}

export const GET_PAST_ITINERARY_REQUEST = "GET_PAST_ITINERARY_REQUEST"
export const GET_PAST_ITINERARY_SUCCESS = "GET_PAST_ITINERARY_SUCCESS"
export const GET_PAST_ITINERARY_FAILURE = "GET_PAST_ITINERARY_FAILURE"

export function getPastItinerary(id: number) {
  let endpoint = `/v1.0/past-itineraries/${id}`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_PAST_ITINERARY_REQUEST,
      GET_PAST_ITINERARY_SUCCESS,
      {type: GET_PAST_ITINERARY_FAILURE, meta: {itineraryId: id}},
    ],
  })
}

export const GET_PAST_ITINERARY_LOCATIONS_REQUEST =
  "GET_PAST_ITINERARY_LOCATIONS_REQUEST"
export const GET_PAST_ITINERARY_LOCATIONS_SUCCESS =
  "GET_PAST_ITINERARY_LOCATIONS_SUCCESS"
export const GET_PAST_ITINERARY_LOCATIONS_FAILURE =
  "GET_PAST_ITINERARY_LOCATIONS_FAILURE"

export function getPastItineraryLocations() {
  let endpoint = `/v1.0/past-itinerary-locations`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_PAST_ITINERARY_LOCATIONS_REQUEST,
      GET_PAST_ITINERARY_LOCATIONS_SUCCESS,
      GET_PAST_ITINERARY_LOCATIONS_FAILURE,
    ],
  })
}
