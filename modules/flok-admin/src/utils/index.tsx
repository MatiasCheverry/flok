import {TextFieldProps} from "@material-ui/core"
import {push} from "connected-react-router"
import _ from "lodash"
import {useCallback, useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {useLocation} from "react-router-dom"
import {RootState} from "../store"
import {
  getDestinations,
  getHotelDetails,
  getHotelsSearch,
  getPastItineraries,
  getPastItineraryLocations,
  getRetreatAttendees,
  getRetreatDetails,
  getRetreatsList,
  getUsers,
} from "../store/actions/admin"

/**
 * returns datestring like:
 *  mm/dd/yy, hh:mm [AM/PM]
 */
export function getDateTimeString(datetime: Date): string {
  let formatter = Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
    second: undefined,
  })
  return formatter.format(datetime)
}

/**
 *
 * @param isoDatetime, ISO formatted datetime string
 * @returns Date object
 */
export function getDateFromString(isoDatetime: string): Date {
  return new Date(isoDatetime)
}

export function useQuery(param: string) {
  let dispatch = useDispatch()
  let searchString = useLocation().search.substring(1)
  let [paramVal, setParamVal] = useState<string | null>(
    new URLSearchParams(searchString).get(param)
  )
  useEffect(() => {
    setParamVal(new URLSearchParams(searchString).get(param))
  }, [searchString, setParamVal, param])

  /* If null is given for newParamVal, delete the param */
  let setParam = useCallback(
    (newParamVal: string | null) => {
      let allParams = new URLSearchParams(searchString)
      if (newParamVal == null) {
        allParams.delete(param)
      } else {
        allParams.set(param, newParamVal)
      }
      dispatch(
        push({
          search: `${allParams.toString() ? "?" + allParams.toString() : ""}`,
        })
      )
    },
    [param, dispatch, searchString]
  )
  return [paramVal, setParam] as const
}

/**Takes object and maps all empty string values ("") to null. Used in forms because TextField can't take null or undefined as a value */
export function nullifyEmptyString<T extends {[key: string]: any}>(
  obj: T
): Partial<T> {
  return _.mapValues(obj, (val) =>
    val === "" || val == null ? null : val
  ) as Partial<T>
}

/**
 * Get destinations database
 *
 * @returns destinations, isLoading
 */
export function useDestinations() {
  let dispatch = useDispatch()
  let allDestinations = useSelector(
    (state: RootState) => state.admin.allDestinations
  )
  let destinations = useSelector((state: RootState) => state.admin.destinations)
  let [loading, setLoading] = useState(false)
  useEffect(() => {
    async function loadDestinations() {
      setLoading(true)
      await dispatch(getDestinations())
      setLoading(false)
    }
    if (!allDestinations) {
      loadDestinations()
    }
  }, [allDestinations, dispatch])

  return [destinations, loading] as const
}

/**
 * Get retreat details
 */
export function useRetreat(retreatId: number) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let retreat = useSelector((state: RootState) => {
    return state.admin.retreatsDetails[retreatId]
  })
  useEffect(() => {
    async function loadRetreatDetails() {
      setLoading(true)
      await dispatch(getRetreatDetails(retreatId))
      setLoading(false)
    }
    if (retreat === undefined) {
      loadRetreatDetails()
    }
  }, [retreatId, dispatch, setLoading, retreat])
  return [retreat, loading] as const
}

export function useRetreatAttendees(retreatId: number) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let retreatAttendees = useSelector((state: RootState) => {
    return state.admin.attendeesByRetreat[retreatId]
  })
  useEffect(() => {
    async function loadRetreatAttendees() {
      setLoading(true)
      await dispatch(getRetreatAttendees(retreatId))
      setLoading(false)
    }
    if (retreatAttendees === undefined) {
      loadRetreatAttendees()
    }
  }, [retreatId, dispatch, setLoading, retreatAttendees])
  return [retreatAttendees, loading] as const
}

export function getTextFieldErrorProps(
  formik: any,
  field: string,
  requiredTouched?: boolean
): Pick<TextFieldProps, "error" | "helperText"> {
  let isError =
    formik.errors &&
    !!formik.errors[field] &&
    (!requiredTouched || formik.touched[field])
  return {
    error: isError,
    helperText: isError && formik.errors && formik.errors[field],
  }
}

export function useHotelsBySearch(search: string) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let results = useSelector(
    (state: RootState) => state.admin.hotelsBySearch[search]
  )
  useEffect(() => {
    async function loadHotelsBySearch() {
      setLoading(true)
      await dispatch(getHotelsSearch(search))
      setLoading(false)
    }
    if (search.length >= 3 && !results) {
      loadHotelsBySearch()
    }
  }, [search, dispatch, results])
  return [results ? results : [], loading] as const
}

export function useRetreatUsers(retreatId?: number | undefined) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let users = useSelector((state: RootState) =>
    retreatId ? state.admin.usersByRetreat[retreatId] : state.admin.allUsers
  )
  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      await dispatch(getUsers(retreatId))
      setLoading(false)
    }
    if (users === undefined) {
      loadUsers()
    }
  }, [retreatId, users, setLoading, dispatch])

  return [users, loading] as const
}

/**
 * This has a bug in it. Use at your own risk, not guranteed to include all retreats.
 */
export function useRetreatList() {
  let dispatch = useDispatch()
  let retreatList = useSelector((state: RootState) => {
    return state.admin.retreatsList.active
      .concat(state.admin.retreatsList.inactive)
      .concat(state.admin.retreatsList.complete)
  })

  // This is inherently buggy. If active retreats are loaded, then this won't load inactive retreats and vice-versa.
  useEffect(() => {
    if (retreatList.length === 0) {
      dispatch(getRetreatsList("active"))
      dispatch(getRetreatsList("inactive"))
      dispatch(getRetreatsList("complete"))
    }
  }, [dispatch, retreatList.length])

  return retreatList
}

export function useLocations() {
  let dispatch = useDispatch()
  let all_locations = useSelector(
    (state: RootState) => state.admin.past_itinerary_locations
  )
  let [loadingLocations, setLoadingLocations] = useState(false)

  useEffect(() => {
    async function loadLocations() {
      setLoadingLocations(true)
      await dispatch(getPastItineraryLocations())
      setLoadingLocations(false)
    }
    if (!Object.keys(all_locations).length) {
      loadLocations()
    }
  }, [dispatch, all_locations])

  return [all_locations, loadingLocations] as const
}

export function useItineraries() {
  let dispatch = useDispatch()
  let pastItineraries = useSelector(
    (state: RootState) => state.admin.past_itineraries
  )
  let [loadingPastItineraries, setLoadingPastItineraries] = useState(false)
  let [loaded, setLoaded] = useState(false)
  useEffect(() => {
    async function loadItineraries() {
      setLoaded(true)
      setLoadingPastItineraries(true)
      await dispatch(getPastItineraries())
      setLoadingPastItineraries(false)
    }
    if (!Object.keys(pastItineraries).length && !loaded) {
      loadItineraries()
    }
  }, [dispatch, pastItineraries, loaded, setLoaded])

  return [pastItineraries, loadingPastItineraries] as const
}

export function useHotelById(hotelId: number) {
  let dispatch = useDispatch()
  let selectedHotel = useSelector((state: RootState) => {
    if (hotelId) {
      return state.admin.hotelsDetails[hotelId]
    }
  })
  let [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadHotel(id: number) {
      setLoading(true)
      await dispatch(getHotelDetails(id))
      setLoading(false)
    }
    if (!selectedHotel && hotelId) {
      loadHotel(hotelId)
    }
  }, [dispatch, selectedHotel, hotelId])

  return [selectedHotel, loading] as const
}
// Hook
export type ScriptLoadingState = "loading" | "idle" | "ready" | "error"
export function useScript(src: string): [boolean, ScriptLoadingState] {
  // Keep track of script status ("idle", "loading", "ready", "error")
  const [status, setStatus] = useState<ScriptLoadingState>(
    src ? "loading" : "idle"
  )
  const [ready, setReady] = useState(false)

  useEffect(
    () => {
      // Allow falsy src value if waiting on other data needed for
      // constructing the script URL passed to this hook.
      if (!src) {
        setStatus("idle")
        return
      }

      // Fetch existing script element by src
      // It may have been added by another intance of this hook
      let script = document.querySelector<HTMLScriptElement>(
        `script[src="${src}"]`
      )

      if (!script) {
        // Create script
        script = document.createElement("script")
        script.src = src
        script.async = true
        script.setAttribute("data-status", "loading")
        // Add script to document body
        document.body.appendChild(script)

        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = (event: Event) => {
          if (script) {
            script.setAttribute(
              "data-status",
              event.type === "load" ? "ready" : "error"
            )
          }
        }

        script.addEventListener("load", setAttributeFromEvent)
        script.addEventListener("error", setAttributeFromEvent)
      } else {
        // Grab existing script status from attribute and set to state.
        let _status = script.getAttribute("data-status") as ScriptLoadingState
        if (_status) {
          setStatus(_status)
        }
      }

      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = (event: Event) => {
        setStatus(event.type === "load" ? "ready" : "error")
      }

      // Add event listeners
      script.addEventListener("load", setStateFromEvent)
      script.addEventListener("error", setStateFromEvent)

      // Remove event listeners on cleanup
      return () => {
        if (script) {
          script.removeEventListener("load", setStateFromEvent)
          script.removeEventListener("error", setStateFromEvent)
        }
      }
    },
    [src] // Only re-run effect if script src changes
  )

  useEffect(() => {
    if (status === "ready") {
      setReady(true)
    } else {
      setReady(false)
    }
  }, [status, setReady])

  return [ready, status]
}

export type GooglePlace = {
  name: string
  place_id: string
  lat?: number
  lng?: number
  type: "ADD_GOOGLE_PLACE"
  address?: string
  city?: string
  state?: string
  country?: string
}

export function fetchGooglePlace(
  placeId: string,
  onFetch: (place: GooglePlace) => void
) {
  // can only call this if google script has been loaded
  let map = new google.maps.Map(document.createElement("div"))
  let service = new google.maps.places.PlacesService(map)
  service.getDetails(
    {
      placeId: placeId,
      fields: ["name", "geometry", "formatted_address", "address_components"],
    },
    (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        if (place && place.name && place.geometry?.location) {
          let city = ""
          let country = ""
          let state = ""
          if (place.address_components) {
            city =
              place.address_components.find((component) =>
                component.types.includes("locality")
              )?.long_name ?? ""
            state =
              place.address_components.find((component) =>
                component.types.includes("administrative_area_level_1")
              )?.long_name ?? ""
            country =
              place.address_components.find((component) =>
                component.types.includes("country")
              )?.long_name ?? ""
          }
          onFetch({
            name: place.name,
            place_id: placeId,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            type: "ADD_GOOGLE_PLACE",
            address: place.formatted_address,
            city: city,
            state: state,
            country: country,
          })
        }
      }
    }
  )
}
