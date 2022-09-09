import {
  Avatar,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Link,
  makeStyles,
  Slider,
  TextField,
  Typography,
  useMediaQuery,
} from "@material-ui/core"
import {
  ArrowBackIos,
  ArrowForwardIos,
  Cancel,
  Close,
  ExpandLess,
  ExpandMore,
  Search,
  Tune,
} from "@material-ui/icons"
import querystring from "querystring"
import {useEffect, useRef, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {
  Link as ReactRouterLink,
  useHistory,
  useLocation,
} from "react-router-dom"
import config, {GOOGLE_API_KEY} from "../../config"
import {GooglePlace, HotelModel} from "../../models/lodging"
import {RetreatSelectedHotelProposal} from "../../models/retreat"
import LoadingPage from "../../pages/misc/LoadingPage"
import {useRetreat} from "../../pages/misc/RetreatProvider"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {ApiAction} from "../../store/actions/api"
import {
  addGooglePlace,
  getFilteredHotels,
  getLodgingTags,
} from "../../store/actions/lodging"
import {FlokTheme} from "../../theme"
import {useQuery, useQueryAsList, useScript} from "../../utils"
import {
  fetchGooglePlace,
  useDestinations,
  useGooglePlaceId,
} from "../../utils/lodgingUtils"
import AppTypography from "../base/AppTypography"
import PageBody from "../page/PageBody"
import PageHeader from "../page/PageHeader"
import GooglePlacesAutoComplete from "./GoogleLocationsAutoComplete"
import HotelForRFPRow from "./HotelForRFPRow"

let useStyles = makeStyles((theme) => ({
  pageBody: {
    margin: theme.spacing(2),
  },
  RFPModal: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(3),
  },
  RFPModalText: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  RFPModalButton: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: theme.spacing(2),
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
  },
  filterOverviewText: {
    marginLeft: theme.spacing(2),
  },
  filterBody: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  filterBodyWrapper: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    overflow: "scroll",
  },
  filterLocations: {
    minWidth: 300,
    marginBottom: theme.spacing(4),
  },
  filterLocationsFilter: {
    marginLeft: theme.spacing(2),
  },
  sliderFiltersDiv: {
    display: "flex",
    gap: theme.spacing(12),
  },
  slider: {
    marginTop: theme.spacing(5),
    marginLeft: "auto",
    marginRight: "auto",
    width: "80%",
  },
  hotelTagsWrapper: {
    maxWidth: 300,
    overflow: "scroll",
    display: "flex",
    flexDirection: "column",
  },
  RFPRowWrapper: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
  filterDivider: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  filterTitle: {
    marginBottom: theme.spacing(3),
    fontSize: theme.spacing(2.2),
  },
  loadingWheel: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: theme.spacing(5),
  },
  loadingWheelContainer: {
    display: "flex",
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    height: 30,
    width: 30,
    marginLeft: theme.spacing(1),
  },
  filterChip: {
    cursor: "pointer",
    backgroundColor: theme.palette.common.white,
  },
  chipContainer: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    marginLeft: theme.spacing(2),
    marginRight: "auto",
    width: "100%",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
  },
  filterHeader: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
  },
  filterHeaderText: {
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
  filterSegment: {
    display: "flex",
    flexDirection: "column",
  },
  navContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
    marginRight: theme.spacing(3),
    gap: theme.spacing(0.5),
  },
  iconButton: {
    display: "flex",
  },
  tagsFilter: {
    width: "50%",
  },
  searchFilterContainer: {
    display: "flex",
    alignItems: "center",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
  },
  searchField: {
    marginLeft: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    minWidth: "300px",
    [theme.breakpoints.down("sm")]: {
      minWidth: "200px",
    },

    borderRadius: theme.shape.borderRadius,
  },
  searchButton: {
    marginLeft: theme.spacing(1),
  },
}))

function RetreatHotelSearchPage() {
  let [googleMapScriptLoaded] = useScript(
    `https://maps.googleapis.com/maps/api/js?libraries=places&key=${config.get(
      GOOGLE_API_KEY
    )}`
  )
  let classes = useStyles()
  const [hotels, setHotels] = useState<HotelModel[]>([])
  let [retreat, retreatIdx] = useRetreat()

  let [roomsMinQuery, setRoomsMinQuery] = useQuery("rooms-min")
  let [roomsMaxQuery, setRoomsMaxQuery] = useQuery("rooms-max")
  let [hotelTagsQuery, setHotelTagsQuery] = useQueryAsList("tags")
  let [maxDistanceFromAirportQuery, setMaxDistanceFromAirportQuery] = useQuery(
    "distance-from-airport"
  )
  let [locationListQuery, setLocationListQuery] = useQueryAsList("location")
  let [pageQuery, setPageQuery] = useQuery("page")
  let [searchTermQuery, setSearchTermQuery] = useQuery("search-term")
  let [total, setTotal] = useState(0)

  // to pass as a next parameter
  let queryParams: {[param: string]: string | string[]} = {}
  if (roomsMaxQuery) {
    queryParams["rooms-max"] = roomsMaxQuery
  }
  if (roomsMinQuery) {
    queryParams["rooms-min"] = roomsMinQuery
  }
  if (hotelTagsQuery[0]) {
    queryParams["tags"] = hotelTagsQuery
  }
  if (maxDistanceFromAirportQuery) {
    queryParams["distance-from-airport"] = maxDistanceFromAirportQuery
  }
  if (locationListQuery[0]) {
    queryParams["location"] = locationListQuery
  }
  if (pageQuery) {
    queryParams["page"] = pageQuery
  }
  if (searchTermQuery) {
    queryParams["search-term"] = searchTermQuery
  }

  let dispatch = useDispatch()
  let [destinations, loadingDestinations] = useDestinations()
  let [loadingHotels, setLoadingHotels] = useState(false)
  let [showFilters, setShowFilters] = useState(false)

  let [minNumberOfRooms, setMinNumberOfRooms] = useState(
    roomsMinQuery ? parseInt(roomsMinQuery) : 0
  )
  let [maxNumberOfRooms, setMaxNumberOfRooms] = useState(
    roomsMaxQuery ? parseInt(roomsMaxQuery) : 1000
  )
  let [maxDistanceFromAirport, setMaxDistanceFromAirport] = useState(
    maxDistanceFromAirportQuery ? parseInt(maxDistanceFromAirportQuery) : 180
  )
  let lodgingTags = useSelector((state: RootState) => {
    return state.lodging.lodgingTags
  })
  let [selectedTags, setSelectedTags] = useState<{[id: number]: boolean}>({})

  let [fillRFPModalOpen, setFillRFPModalOpen] = useState(false)

  let [searchTerm, setSearchTerm] = useState(searchTermQuery ?? "")

  let selectedHotelsMap: {[hotelId: number]: RetreatSelectedHotelProposal} = {}
  retreat.selected_hotels.forEach((selectedHotel) => {
    selectedHotelsMap[selectedHotel.hotel_id] = selectedHotel
  })
  let [locationList, setLocationList] = useState<string[]>([])
  let numberHotelsRequested = Object.values(selectedHotelsMap).filter(
    (hotel) => hotel.created_by === "USER"
  ).length

  let maxNumberOfRequests = 10

  useEffect(() => {
    if (maxDistanceFromAirportQuery) {
      setMaxDistanceFromAirport(parseInt(maxDistanceFromAirportQuery))
    } else {
      setMaxDistanceFromAirport(180)
    }
  }, [maxDistanceFromAirportQuery])
  useEffect(() => {
    if (roomsMaxQuery) {
      setMaxNumberOfRooms(parseInt(roomsMaxQuery))
    } else {
      setMaxNumberOfRooms(1000)
    }
  }, [roomsMaxQuery])
  useEffect(() => {
    if (roomsMinQuery) {
      setMinNumberOfRooms(parseInt(roomsMinQuery))
    } else {
      setMinNumberOfRooms(0)
    }
  }, [roomsMinQuery])

  useEffect(() => {
    if (locationListQuery) {
      setLocationList(locationListQuery)
    } else {
      setLocationList([])
    }
  }, [locationListQuery])

  useEffect(() => {
    if (hotelTagsQuery) {
      let selectedTagsMap: {[id: string]: boolean} = {}
      hotelTagsQuery.forEach((hotelId) => {
        selectedTagsMap[hotelId] = true
      })
      setSelectedTags(selectedTagsMap)
    } else {
      setSelectedTags({})
    }
  }, [hotelTagsQuery])

  let [testValue, setTestValue] = useState("")
  let [seeMoreHotelTags, setSeeMoreHotelTags] = useState(false)
  let googlePlaces = useSelector((state: RootState) => {
    return state.lodging.googlePlaces
  })

  useEffect(() => {
    !Object.values(lodgingTags)[0] && dispatch(getLodgingTags())
  }, [dispatch, lodgingTags])

  let [searchExpanded, setSearchExpanded] = useState(
    searchTermQuery ? true : false
  )
  let [typing, setTyping] = useState(false)

  let wait = useRef<any>()

  useEffect(() => {
    async function getHotels(filterRequest: {
      max_rooms?: number
      tags?: number[]
      min_rooms?: number
      max_distance_from_airport?: number
      locations?: {lat: number; lng: number; distance: number}[]
      offset?: number
      search_term?: string
    }) {
      setLoadingHotels(true)
      let response = (await dispatch(
        getFilteredHotels(filterRequest)
      )) as unknown as ApiAction
      if (!response.error) {
        setHotels(response.payload.hotels)
        setTotal(response.payload.total)
      }

      setLoadingHotels(false)
    }
    if (!showFilters && !typing) {
      let filters: {
        tags?: number[]
        max_rooms?: number
        min_rooms?: number
        max_distance_from_airport?: number
        locations?: {lat: number; lng: number; distance: number}[]
        offset?: number
        search_term?: string
      } = {}
      if (hotelTagsQuery[0]) {
        filters.tags = hotelTagsQuery.map((tag) => parseInt(tag))
      }
      if (pageQuery) {
        filters.offset = (parseInt(pageQuery) - 1) * 30
      }
      if (maxDistanceFromAirportQuery) {
        filters.max_distance_from_airport = parseInt(
          maxDistanceFromAirportQuery
        )
      }
      if (roomsMaxQuery) {
        filters.max_rooms = parseInt(roomsMaxQuery)
      }
      if (roomsMinQuery) {
        filters.min_rooms = parseInt(roomsMinQuery)
      }
      if (searchTerm) {
        filters.search_term = searchTerm
      }

      if (isValidLocations(locationListQuery, googlePlaces)) {
        if (locationListQuery) {
          locationListQuery.forEach((locationString) => {
            let placeId = locationString.split(":")[0]
            let distance = locationString.split(":")[1]

            let lat = googlePlaces[placeId].lat
            let lng = googlePlaces[placeId].lng
            if (lat && lng) {
              let location = {
                lat: lat,
                lng: lng,
                distance: parseInt(distance),
              }
              filters = {
                ...filters,
                locations: filters.locations
                  ? [...filters.locations, location]
                  : [location],
              }
            }
          })
        }
        if (searchTerm) {
          setSearchTermQuery(searchTerm)
        } else {
          setSearchTermQuery(null)
        }
        getHotels(filters)
      }
    }
  }, [
    hotelTagsQuery,
    maxDistanceFromAirportQuery,
    roomsMaxQuery,
    roomsMinQuery,
    locationListQuery,
    searchTermQuery,
    googlePlaces,
    showFilters,
    dispatch,
    pageQuery,
    typing,
    searchTerm,
    setSearchTermQuery,
  ])

  let location = useLocation()
  let history = useHistory()

  function isValidLocations(
    locationListQuery: string[],
    googlePlaces: {[place_id: string]: GooglePlace}
  ) {
    let isValid = true
    for (let i = 0; i < locationListQuery.length; i++) {
      let placeId = locationListQuery[i].split(":")[0]
      if (
        !googlePlaces[placeId] ||
        !googlePlaces[placeId].lat ||
        !googlePlaces[placeId].lng
      ) {
        isValid = false
      }
    }
    return isValid
  }
  useEffect(() => {
    if (googleMapScriptLoaded) {
      locationListQuery.forEach((locationString) => {
        let placeId = locationString.split(":")[0]
        fetchGooglePlace(placeId, (place) => {
          dispatch(addGooglePlace(place))
        })
      })
    }
  }, [locationListQuery, googleMapScriptLoaded, dispatch])

  const distanceFromAirportMarks = [
    {
      value: 15,
      label: "15 minutes",
    },
    {
      value: 60,
      label: "1 Hour",
    },
    {
      value: 120,
      label: "2 Hours",
    },
    {
      value: 180,
      label: "3 Hours+",
    },
  ]
  const roomNumberMarks = [
    {
      value: 0,
      label: "0",
    },
    {
      value: 1000,
      label: "1000 +",
    },
  ]
  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("xs")
  )

  if (loadingDestinations || (!hotels[0] && loadingHotels)) {
    return <LoadingPage />
  }
  return (
    <PageBody appBar>
      <div className={classes.pageBody}>
        <PageHeader
          header={
            <AppTypography variant="h1" fontWeight="bold">
              Venue Sourcing
            </AppTypography>
          }
          subheader="Find the best venues for your company retreat"
          postHeader={
            <AppTypography>
              {maxNumberOfRequests - numberHotelsRequested > 0
                ? `${
                    maxNumberOfRequests - numberHotelsRequested
                  } requests remaining`
                : "No requests remaining.  Please contact Flok if you would like to add more."}
            </AppTypography>
          }
        />
        <Dialog
          open={fillRFPModalOpen}
          onClose={() => {
            setFillRFPModalOpen(false)
          }}>
          <DialogContent className={classes.RFPModal}>
            <AppTypography fontWeight="bold" className={classes.RFPModalText}>
              You need to fill out an RFP so the hotel has all the information
              they need in order to create their proposal for you.
            </AppTypography>
            <Link
              className={classes.RFPModalButton}
              component={ReactRouterLink}
              variant="inherit"
              underline="none"
              color="inherit"
              to={
                AppRoutes.getPath("RetreatRfpPage", {
                  retreatIdx: retreatIdx.toString(),
                }) +
                "?next=" +
                encodeURIComponent(
                  AppRoutes.getPath("RetreatHotelSearchPage", {
                    retreatIdx: retreatIdx.toString(),
                  }) +
                    (Object.keys(queryParams).length > 0
                      ? "?" + querystring.stringify(queryParams, "&")
                      : "")
                )
              }>
              <Button variant="contained" color="primary">
                Fill out RFP
              </Button>
            </Link>
          </DialogContent>
        </Dialog>
        <div>
          <div className={classes.searchFilterContainer}>
            <div
              className={classes.filterBar}
              onClick={() => {
                setShowFilters((filters) => !filters)
              }}>
              <div className={classes.chipContainer}>
                {!searchExpanded && (
                  <>
                    {locationList[0] ? (
                      locationList.length === 1 ? (
                        <Chip
                          className={classes.filterChip}
                          label={
                            googlePlaces[locationList[0].split(":")[0]]
                              ? `${
                                  googlePlaces[locationList[0].split(":")[0]]
                                    .name
                                }`
                              : `${locationList.length} location`
                          }
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          className={classes.filterChip}
                          label={`${locationList.length} locations`}
                          variant="outlined"
                        />
                      )
                    ) : (
                      <Chip
                        className={classes.filterChip}
                        label={"Anywhere"}
                        variant="outlined"
                      />
                    )}

                    {(!isSmallScreen || roomsMaxQuery || roomsMinQuery) && (
                      <Chip
                        className={classes.filterChip}
                        label={`Rooms: ${minNumberOfRooms} - ${maxNumberOfRooms}`}
                        variant="outlined"
                      />
                    )}

                    {(!isSmallScreen || maxDistanceFromAirportQuery) && (
                      <Chip
                        className={classes.filterChip}
                        label={`Max Distance from Airport: ${maxDistanceFromAirport} min`}
                        variant="outlined"
                      />
                    )}
                    {(!isSmallScreen || hotelTagsQuery[0]) && (
                      <Chip
                        className={classes.filterChip}
                        variant="outlined"
                        label={`${
                          Object.values(selectedTags).filter((tag) => {
                            return tag === true
                          }).length
                        }
              Tag${
                Object.values(selectedTags).filter((tag) => {
                  return tag === true
                }).length === 1
                  ? ""
                  : "s"
              }
              Selected`}
                      />
                    )}
                  </>
                )}

                <Avatar className={classes.avatar}>
                  <Tune fontSize="small" />
                </Avatar>
              </div>
            </div>
            {searchExpanded ? (
              <div style={{display: "flex", alignItems: "center"}}>
                <TextField
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => {
                    setTyping(true)
                    if (wait.current) {
                      clearTimeout(wait.current)
                    }
                    wait.current = setTimeout(() => {
                      setTyping(false)
                    }, 1000)
                    setSearchTerm(e.target.value)
                  }}
                  onBlur={() => {
                    if (!searchTerm) {
                      setTyping(false)
                      setSearchExpanded(false)
                    }
                  }}
                  placeholder="Search Hotel Name"
                  variant="outlined"
                  size="small"
                  className={classes.searchField}
                />
                <IconButton
                  onClick={() => {
                    setSearchTerm("")
                    setSearchExpanded(false)
                    setTyping(false)
                  }}>
                  <Close />
                </IconButton>
              </div>
            ) : (
              <Avatar
                className={classes.avatar}
                onClick={() => {
                  setSearchExpanded(true)
                }}>
                <Search fontSize="small" />
              </Avatar>
            )}
          </div>

          {showFilters && (
            <Dialog
              open={showFilters}
              fullWidth
              onClose={() => {
                setShowFilters(false)
                setPageQuery(null)
              }}>
              <div className={classes.filterHeader}>
                <IconButton
                  onClick={() => {
                    setShowFilters(false)
                    setPageQuery(null)
                  }}>
                  <Close />
                </IconButton>
                <Typography className={classes.filterHeaderText}>
                  Filters
                </Typography>
              </div>
              <DialogContent>
                <div className={classes.filterBody}>
                  <div className={classes.filterLocations}>
                    <Typography variant="h5" className={classes.filterTitle}>
                      Locations
                    </Typography>
                    <div className={classes.filterLocationsFilter}>
                      <GooglePlacesAutoComplete
                        clearOnSelect
                        selectedOptions={locationList.map((location, index) => {
                          return location.split(":")[0]
                        })}
                        types={["(cities)"]}
                        clearOnBlur
                        disableClearable
                        selectOnFocus
                        onInputChange={(e, value, reason) => {
                          if (reason === "reset") {
                            setTestValue("")
                          } else {
                            setTestValue(value)
                          }
                        }}
                        inputValue={testValue}
                        onChange={(e, value, reason) => {
                          if (reason === "select-option" && value) {
                            dispatch(
                              addGooglePlace({
                                place_id: value.place_id,
                                name: value.structured_formatting.main_text,
                              })
                            )
                            setLocationListQuery([
                              ...locationListQuery,
                              value.place_id + ":100",
                            ])
                          }
                        }}
                      />
                      {locationList.map((location, index) => {
                        let id = location.split(":")[0]
                        let distance = location.split(":")[1]
                        return (
                          <LocationItem
                            key={id}
                            distance={parseInt(distance)}
                            onChangeDistance={(newDistance) => {
                              let locationListCopy = [...locationListQuery]
                              locationListCopy[index] = `${id}:${newDistance}`
                              setLocationListQuery([...locationListCopy])
                            }}
                            placeId={id}
                            onDelete={() => {
                              let locationsCopy = [...locationListQuery]
                              let locationsToIds = locationsCopy.map(
                                (location) => location.split(":")[0]
                              )
                              var index = locationsToIds.indexOf(id.toString())
                              if (index !== -1) {
                                locationsCopy.splice(index, 1)
                              }
                              setLocationListQuery([...locationsCopy])
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                  <Divider className={classes.filterDivider} />

                  <div className={classes.filterSegment}>
                    <Typography variant="h5" className={classes.filterTitle}>
                      Number of Rooms
                    </Typography>
                    <Slider
                      className={classes.slider}
                      step={100}
                      marks={roomNumberMarks}
                      min={0}
                      max={1000}
                      valueLabelDisplay="on"
                      value={[minNumberOfRooms, maxNumberOfRooms]}
                      onChange={(event, newValue: number | number[]) => {
                        let newValueArray = newValue as number[]
                        if (roomsMaxQuery !== newValueArray[1].toString()) {
                          setRoomsMaxQuery(newValueArray[1].toString())
                        }
                        if (roomsMinQuery !== newValueArray[0].toString()) {
                          setRoomsMinQuery(newValueArray[0].toString())
                        }
                      }}></Slider>
                  </div>
                  <Divider className={classes.filterDivider} />
                  <div className={classes.filterSegment}>
                    <Typography variant="h5" className={classes.filterTitle}>
                      Maximum Distance From the Airport
                    </Typography>
                    <Slider
                      className={classes.slider}
                      step={15}
                      marks={distanceFromAirportMarks}
                      min={15}
                      max={180}
                      valueLabelDisplay="on"
                      value={maxDistanceFromAirport}
                      onChange={(event, newValue: number | number[]) => {
                        setMaxDistanceFromAirportQuery(newValue.toString())
                      }}></Slider>
                  </div>
                  <Divider className={classes.filterDivider} />
                  <Divider className={classes.filterDivider} />
                  <div className={classes.hotelTagsWrapper}>
                    <Typography variant="h5" className={classes.filterTitle}>
                      Hotel Tags
                    </Typography>
                    {Object.values(lodgingTags)
                      .slice(
                        0,
                        seeMoreHotelTags
                          ? Object.values(lodgingTags).length
                          : Math.min(4, Object.values(lodgingTags).length)
                      )
                      .map((tag) => {
                        return (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={!!selectedTags[tag.id]}
                                onChange={(e) => {
                                  if (!selectedTags[tag.id]) {
                                    setHotelTagsQuery([
                                      ...hotelTagsQuery,
                                      tag.id.toString(),
                                    ])
                                  } else {
                                    let hotelTagsCopy = [...hotelTagsQuery]
                                    var index = hotelTagsCopy.indexOf(
                                      tag.id.toString()
                                    )
                                    if (index !== -1) {
                                      hotelTagsCopy.splice(index, 1)
                                    }
                                    setHotelTagsQuery([...hotelTagsCopy])
                                  }
                                }}
                                name={tag.name}
                                color="primary"
                              />
                            }
                            label={tag.name}
                          />
                        )
                      })}
                    <Button
                      className={classes.tagsFilter}
                      onClick={() => {
                        setSeeMoreHotelTags(
                          (seeMoreHotelTags) => !seeMoreHotelTags
                        )
                      }}>
                      {seeMoreHotelTags ? <ExpandLess /> : <ExpandMore />}
                      {seeMoreHotelTags ? "Show Less" : "Show More"}
                    </Button>
                  </div>
                </div>
              </DialogContent>

              <Divider />

              <DialogActions
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    history.replace("hotels")
                  }}>
                  Clear Filters
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setShowFilters(false)
                    setPageQuery(null)
                  }}>
                  Filter
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </div>
        {loadingHotels || typing ? (
          <div className={classes.loadingWheelContainer}>
            <CircularProgress size="3rem" className={classes.loadingWheel} />
          </div>
        ) : (
          hotels.map((hotel) => {
            let destination = destinations[hotel.destination_id]
            if (destination) {
              return (
                <div className={classes.RFPRowWrapper}>
                  <HotelForRFPRow
                    outOfRequests={
                      maxNumberOfRequests - numberHotelsRequested === 0
                    }
                    hotelLinkTo={
                      AppRoutes.getPath("RetreatHotelProfilePage", {
                        retreatIdx: retreatIdx.toString(),
                        hotelGuid: hotel.guid,
                      }) +
                      "?last=" +
                      encodeURIComponent(
                        AppRoutes.getPath("RetreatHotelSearchPage", {
                          retreatIdx: retreatIdx.toString(),
                        }) +
                          (Object.values(queryParams).length > 0
                            ? "?" + querystring.stringify(queryParams, "&")
                            : "")
                      )
                    }
                    setModalOpen={() => {
                      setFillRFPModalOpen(true)
                    }}
                    hotel={hotel}
                    destination={destination}
                    selected={!!selectedHotelsMap[hotel.id]}
                  />
                </div>
              )
            } else return undefined
          })
        )}
      </div>
      {!loadingHotels && (
        <div className={classes.navContainer}>
          <AppTypography>
            {(pageQuery ? parseInt(pageQuery) - 1 : 0) * 30 + 1} -{" "}
            {Math.min(
              (pageQuery ? parseInt(pageQuery) - 1 : 0) * 30 + 1 + 29,
              total
            )}{" "}
            of {total}
          </AppTypography>
          <IconButton
            onClick={() => {
              setPageQuery((pageQuery ? parseInt(pageQuery) - 1 : 0).toString())
            }}
            size="small"
            disabled={!pageQuery || pageQuery === "1"}
            className={classes.iconButton}>
            <ArrowBackIos />
          </IconButton>
          <IconButton
            onClick={() => {
              setPageQuery((pageQuery ? parseInt(pageQuery) + 1 : 2).toString())
            }}
            size="small"
            disabled={
              (pageQuery ? parseInt(pageQuery) - 1 : 0) * 30 + 1 + 29 >= total
            }
            className={classes.iconButton}>
            <ArrowForwardIos />
          </IconButton>
        </div>
      )}
    </PageBody>
  )
}
export default RetreatHotelSearchPage

let useLocationItemStyles = makeStyles((theme) => ({
  locationItem: {
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
    gap: "8px",
  },
  locationText: {
    display: "flex",
  },
}))
type LocationItemProps = {
  placeId: string
  onDelete: () => void
  onChangeDistance: (newDistance: string) => void
  distance: number
}

function LocationItem(props: LocationItemProps) {
  let classes = useLocationItemStyles()
  let location = useGooglePlaceId(props.placeId)
  return (
    <div className={classes.locationItem}>
      <AppTypography>Within</AppTypography>
      <FormControl>
        <TextField
          select
          SelectProps={{
            native: true,
            onChange: (e) => {
              props.onChangeDistance(e.target.value as unknown as string)
            },
          }}
          value={props.distance}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={100}>100</option>
        </TextField>
      </FormControl>
      <Typography className={classes.locationText}>
        miles of &nbsp;
        <AppTypography fontWeight="bold">{location}</AppTypography>
      </Typography>

      <IconButton onClick={props.onDelete} size="small">
        <Cancel fontSize="small" />
      </IconButton>
    </div>
  )
}
