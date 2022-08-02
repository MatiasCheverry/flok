import {Action} from "redux"
import {ResourceNotFound, ResourceNotFoundType} from "../../models"
import {
  DestinationModel,
  GooglePlace,
  HotelModel,
  LodgingTagModel,
} from "../../models/lodging"
import {ApiAction} from "../actions/api"
import {
  ADD_GOOGLE_PLACE,
  GET_DESTINATIONS_SUCCESS,
  GET_HOTELS_SUCCESS,
  GET_HOTEL_BY_GUID_FAILURE,
  GET_HOTEL_BY_GUID_SUCCESS,
  GET_LODGING_TAGS_SUCCESS,
} from "../actions/lodging"

export type LodgingState = {
  destinations: {
    [id: number]: DestinationModel
  }
  destinationsGuidMapping: {
    [guid: string]: number
  }
  hotels: {
    [id: number]: HotelModel
  }
  hotelsGuidMapping: {
    [guid: string]: number | ResourceNotFoundType
  }
  lodgingTags: {[id: string]: LodgingTagModel}
  googlePlaces: {[place_id: string]: GooglePlace}
}

const initialState: LodgingState = {
  destinations: {},
  destinationsGuidMapping: {},
  hotels: {},
  hotelsGuidMapping: {},
  lodgingTags: {},
  googlePlaces: {},
}

export default function lodgingReducer(
  state: LodgingState = initialState,
  action: Action
): LodgingState {
  switch (action.type) {
    case GET_DESTINATIONS_SUCCESS:
      let destinations = (
        (action as ApiAction).payload as {destinations: DestinationModel[]}
      ).destinations
      let newDestinations = {...state.destinations}
      let newDestinationsGuidMapping = {...state.destinationsGuidMapping}
      destinations.forEach((destination) => {
        newDestinations[destination.id] = destination
        newDestinationsGuidMapping[destination.guid] = destination.id
      })
      return {
        ...state,
        destinations: newDestinations,
        destinationsGuidMapping: newDestinationsGuidMapping,
      }
    case GET_HOTEL_BY_GUID_SUCCESS:
      let hotel = ((action as ApiAction).payload as {hotel: HotelModel}).hotel
      return {
        ...state,
        hotels: {...state.hotels, [hotel.id]: hotel},
        hotelsGuidMapping: {...state.hotelsGuidMapping, [hotel.guid]: hotel.id},
      }
    case GET_HOTEL_BY_GUID_FAILURE:
      let hotelGuid = (action as unknown as {meta: {hotelGuid: string}}).meta
        .hotelGuid
      return {
        ...state,
        hotelsGuidMapping: {
          ...state.hotelsGuidMapping,
          [hotelGuid]: ResourceNotFound,
        },
      }
    case GET_HOTELS_SUCCESS:
      let hotels = ((action as ApiAction).payload as {hotels: HotelModel[]})
        .hotels
      let newHotels = {...state.hotels}
      let newHotelsGuidMapping = {...state.hotelsGuidMapping}
      hotels.forEach((hotel) => {
        newHotels[hotel.id] = hotel
        newHotelsGuidMapping[hotel.guid] = hotel.id
      })
      return {
        ...state,
        hotels: newHotels,
        hotelsGuidMapping: newHotelsGuidMapping,
      }
    case GET_LODGING_TAGS_SUCCESS:
      let lodgingTags = (
        (action as ApiAction).payload as {lodging_tags: LodgingTagModel[]}
      ).lodging_tags
      let newTags = lodgingTags.reduce((last: any, curr: LodgingTagModel) => {
        return {...last, [curr.id]: curr}
      }, {})
      return {
        ...state,
        lodgingTags: {
          ...state.lodgingTags,
          ...newTags,
        },
      }
    case ADD_GOOGLE_PLACE:
      let newPlace = action as GooglePlace
      return {
        ...state,
        googlePlaces: {
          ...state.googlePlaces,
          [newPlace.place_id]: newPlace,
        },
      }
    default:
      return state
  }
}
