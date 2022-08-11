import {makeStyles, TextField, useMediaQuery} from "@material-ui/core"
import {DataGrid, GridToolbarContainer} from "@material-ui/data-grid"
import {ToggleButton, ToggleButtonGroup} from "@material-ui/lab"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {dateFormat} from "../../pages/dashboard/FlightsPage"
import {RootState} from "../../store"
import {getTrips} from "../../store/actions/retreat"
import {FlokTheme, theme} from "../../theme"
import {useRetreatAttendees} from "../../utils/retreatUtils"

let useStyles = makeStyles((theme) => ({
  addBtn: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },
  section: {
    margin: theme.spacing(2),
    "& > *:not(:first-child)": {
      paddingLeft: theme.spacing(1),
    },
    flex: 1,
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    verticalAlign: "top",
    "&.todo": {
      color: theme.palette.error.main,
    },
    "&.next": {
      color: theme.palette.warning.main,
    },
    "&.completed": {
      color: theme.palette.success.main,
    },
  },
  infoChip: {
    borderColor: theme.palette.text.secondary,
    color: theme.palette.text.secondary,
  },
  successChip: {
    borderColor: theme.palette.success.main,
    color: theme.palette.success.main,
  },
  warningChip: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
  },
  dataGrid: {
    backgroundColor: theme.palette.common.white,
    "&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
      outline: "none",
    },
  },
  dataGridRow: {
    cursor: "pointer",
  },
  dataGridWrapper: {
    height: "90%",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    minHeight: 300,
    width: "100%",
  },
}))
type AttendeeFlightsDataGridProps = {
  retreatId: number
}

export default function AttendeeFlightsDataGrid(
  props: AttendeeFlightsDataGridProps
) {
  let classes = useStyles()
  let [attendeeTravelInfo] = useRetreatAttendees(props.retreatId)
  let [attendeeSearchTerm, setAttendeeSearchTerm] = useState("")
  let trips = useSelector((state: RootState) => {
    return state.retreat.trips
  })
  let missingTrips = attendeeTravelInfo.reduce((prev, attendee) => {
    let ret: {[key: number]: undefined} = {}
    let depId =
      attendee.travel && attendee.travel.dep_trip
        ? attendee.travel.dep_trip.id
        : undefined
    let arrId =
      attendee.travel && attendee.travel.arr_trip
        ? attendee.travel.arr_trip.id
        : undefined
    if (depId && !trips[depId]) {
      ret[depId] = undefined
    }
    if (arrId && !trips[arrId]) {
      ret[arrId] = undefined
    }
    return {...prev, ...ret}
  }, {})

  let dispatch = useDispatch()

  let [loading, setLoading] = useState(false)
  let [flightsState, setFlightsState] = useState<"arrival" | "departure">(
    "arrival"
  )

  useEffect(() => {
    async function loadTrips() {
      setLoading(true)
      await dispatch(
        getTrips(Object.keys(missingTrips).map((id) => parseInt(id)))
      )
      setLoading(false)
    }
    if (Object.keys(missingTrips).length && !loading) {
      loadTrips()
    }
  }, [dispatch, missingTrips, loading])
  return (
    <DataGrid
      disableColumnSelector
      disableColumnFilter
      disableColumnMenu
      pageSize={50}
      rowsPerPageOptions={[]}
      components={{Toolbar: CustomToolbarFlightsPage}}
      componentsProps={{
        toolbar: {
          searchTerm: attendeeSearchTerm,
          setSearchTerm: setAttendeeSearchTerm,
          flightsState: flightsState,
          setFlightsState: setFlightsState,
        },
      }}
      className={classes.dataGrid}
      classes={{row: classes.dataGridRow}}
      rows={attendeeTravelInfo.filter((attendee) => {
        let attendeeName = `${
          attendee.first_name ? attendee.first_name.toLowerCase() : ""
        } ${attendee.last_name ? attendee.last_name.toLowerCase() : ""}`
        return (
          attendeeName.includes(attendeeSearchTerm) &&
          attendee.flight_status === "BOOKED"
        )
      })}
      columns={[
        {
          field: "first_name",
          headerName: "First name",
          minWidth: 130,
          flex: 1,
        },
        {
          field: "last_name",
          headerName: "Last name",
          minWidth: 130,
          flex: 1,
        },
        {
          field: "arrival",
          headerName: "Flight Arrival",
          minWidth: 160,
          hide: flightsState === "departure",
          flex: 1.23,
          valueGetter: (params) => {
            let attendee = params.row
            return attendee.travel &&
              attendee.travel.arr_trip &&
              trips[attendee.travel.arr_trip.id] &&
              trips[attendee.travel.arr_trip.id].trip_legs[
                trips[attendee.travel.arr_trip.id].trip_legs.length - 1
              ]
              ? trips[attendee.travel.arr_trip.id].trip_legs[
                  trips[attendee.travel.arr_trip.id].trip_legs.length - 1
                ].arr_datetime
              : undefined
          },
          valueFormatter: (params) => {
            return !isNaN(new Date(params.value as string).getTime())
              ? dateFormat(new Date(params.value as string))
              : undefined
          },
        },
        {
          field: "departure",
          headerName: "Flight Departure",
          minWidth: 160,
          flex: 1.23,
          valueGetter: (params) => {
            let attendee = params.row
            return attendee.travel &&
              attendee.travel.dep_trip &&
              trips[attendee.travel.dep_trip.id] &&
              trips[attendee.travel.dep_trip.id].trip_legs.length
              ? trips[attendee.travel.dep_trip.id].trip_legs[0].dep_datetime
              : undefined
          },
          valueFormatter: (params) => {
            return !isNaN(new Date(params.value as string).getTime())
              ? dateFormat(new Date(params.value as string))
              : undefined
          },
          hide: flightsState === "arrival",
        },
        {
          field: "arrival_flight_number",
          headerName: "Flight Number",
          width: 160,
          flex: 1.23,
          valueGetter: (params) => {
            let attendee = params.row

            return attendee.travel?.arr_trip.id &&
              trips[attendee.travel.arr_trip.id] &&
              trips[attendee.travel.arr_trip.id].trip_legs[
                trips[attendee.travel.arr_trip.id].trip_legs.length - 1
              ]
              ? trips[attendee.travel.arr_trip.id].trip_legs[
                  trips[attendee.travel.arr_trip.id].trip_legs.length - 1
                ].flight_num
              : undefined
          },
          hide: flightsState === "departure",
        },
        {
          field: "departure_flight_number",
          headerName: "Flight Number",
          width: 160,
          flex: 1.23,
          hide: flightsState === "arrival",
          valueGetter: (params) => {
            let attendee = params.row
            return attendee.travel &&
              attendee.travel.dep_trip.id &&
              trips[attendee.travel.dep_trip.id] &&
              trips[attendee.travel.dep_trip.id].trip_legs[0]
              ? trips[attendee.travel.dep_trip.id].trip_legs[0].flight_num
              : undefined
          },
        },
      ]}></DataGrid>
  )
}
let useToolbarStyles = makeStyles((theme) => ({
  searchBar: {
    marginLeft: "auto",
    marginRight: theme.spacing(3),
  },
}))

type CustomToolbarFlightsPageProps = {
  searchTerm: string
  setSearchTerm: (newValue: string) => void
  flightsState: "arrival" | "departure"
  setFlightsState: (string: "arrival" | "departure") => void
}
function CustomToolbarFlightsPage(props: CustomToolbarFlightsPageProps) {
  let classes = useToolbarStyles()
  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )
  return (
    <GridToolbarContainer style={{display: "flex", alignItems: "center"}}>
      {/* <GridToolbarExport /> */}
      <ToggleButtonGroup
        size="small"
        style={{marginLeft: theme.spacing(3), height: "36px"}}
        value={props.flightsState}>
        <ToggleButton
          size="small"
          value="arrival"
          onClick={() => {
            props.setFlightsState("arrival")
          }}>
          Arrival
        </ToggleButton>
        <ToggleButton
          size="small"
          value="departure"
          onClick={() => {
            props.setFlightsState("departure")
          }}>
          Departure
        </ToggleButton>
      </ToggleButtonGroup>
      {!isSmallScreen && (
        <TextField
          value={props.searchTerm}
          onChange={(e) => {
            props.setSearchTerm(e.target.value)
          }}
          className={classes.searchBar}
          margin="dense"
          variant="outlined"
          size="small"
          placeholder="Search Attendees"
          inputProps={{
            style: {
              height: "33px",
            },
          }}
        />
      )}
    </GridToolbarContainer>
  )
}
