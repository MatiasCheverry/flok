import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {RootState} from "../store"
import {
  getPastItineraries,
  getPastItineraryLocations,
} from "../store/actions/itinerary"

export function usePastItineraries() {
  let dispatch = useDispatch()
  let itineraries = useSelector((state: RootState) => {
    return state.itinerary.past_itineraries
  })

  let [loadingItineraries, setLoadingItineraries] = useState(false)
  useEffect(() => {
    async function loadItineraries() {
      setLoadingItineraries(true)
      await dispatch(getPastItineraries())
      setLoadingItineraries(false)
    }

    loadItineraries()
  }, [dispatch])

  return [itineraries, loadingItineraries] as const
}

export function usePastItineraryLocations() {
  let dispatch = useDispatch()
  let locations = useSelector((state: RootState) => state.itinerary.locations)
  let [loadingLocations, setLoadingLocations] = useState(false)
  useEffect(() => {
    async function loadLocations() {
      setLoadingLocations(true)
      await dispatch(getPastItineraryLocations())
      setLoadingLocations(false)
    }
    if (!Object.keys(locations).length) {
      loadLocations()
    }
  }, [dispatch, locations])

  return [locations, loadingLocations] as const
}
