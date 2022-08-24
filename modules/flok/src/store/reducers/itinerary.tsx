import {Action} from "redux"
import {
  PastItineraryLocationModel,
  PastItineraryModel,
} from "../../models/itinerary"
import {ApiAction} from "../actions/api"
import {
  GET_PAST_ITINERARIES_SUCCESS,
  GET_PAST_ITINERARY_LOCATIONS_SUCCESS,
} from "../actions/itinerary"

export type ItineraryState = {
  past_itineraries: {
    [id: number]: PastItineraryModel
  }
  locations: {
    [id: number]: PastItineraryLocationModel
  }
  itineraryToLocation: {
    [id: number]: number[] | undefined
  }
}

const initialState: ItineraryState = {
  past_itineraries: {},
  locations: {},
  itineraryToLocation: {},
}

export default function itineraryReducer(
  state: ItineraryState = initialState,
  action: Action
): ItineraryState {
  var payload
  switch (action.type) {
    case GET_PAST_ITINERARIES_SUCCESS:
      payload = (action as unknown as ApiAction).payload as {
        past_itineraries: PastItineraryModel[]
      }
      let itineraryToLocation: {[key: number]: number[]} = {}
      payload.past_itineraries.forEach((row) =>
        row.location_ids.forEach((location_id) => {
          if (itineraryToLocation[location_id] == null) {
            itineraryToLocation[location_id] = [row.id]
          } else {
            itineraryToLocation[location_id].push(row.id)
          }
        })
      )
      return {
        ...state,
        past_itineraries: {
          ...state.past_itineraries,
          ...payload.past_itineraries.reduce(
            (last, curr) => ({...last, [curr.id]: curr}),
            {}
          ),
        },
        itineraryToLocation: {
          ...state.itineraryToLocation,
          ...itineraryToLocation,
        },
      }
    case GET_PAST_ITINERARY_LOCATIONS_SUCCESS:
      let locations = (
        (action as ApiAction).payload as {
          past_itineraries_location: PastItineraryLocationModel[]
        }
      ).past_itineraries_location
      let newLocations = {...state.locations}
      locations.forEach((location) => {
        newLocations[location.id] = location
      })
      return {
        ...state,
        locations: newLocations,
      }
    default:
      return state
  }
}
