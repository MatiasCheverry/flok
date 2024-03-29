import {
  Box,
  Chip,
  Link,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core"
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@material-ui/data-grid"
import {push} from "connected-react-router"
import {sortBy} from "lodash"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {Link as RouterLink} from "react-router-dom"
import PageBody from "../../components/page/PageBody"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getTrips} from "../../store/actions/retreat"
import {useRetreatAttendees} from "../../utils/retreatUtils"
import {useRetreat} from "../misc/RetreatProvider"

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

export function currencyFormat(num: Number) {
  return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

export function dateFormat(date: Date | undefined) {
  if (date === undefined) {
    return ""
  }
  let dateFormatter = Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  })
  return dateFormatter.format(date)
}

export default function FlightsPage() {
  let classes = useStyles()

  let [retreat, retreatIdx] = useRetreat()

  let [attendeeTravelInfo] = useRetreatAttendees(retreat.id)

  let [attendeeSearchTerm, setAttendeeSearchTerm] = useState("")

  attendeeTravelInfo = attendeeTravelInfo.filter((attendee) =>
    ["CREATED", "INFO_ENTERED"].includes(attendee.info_status)
  )

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

  let [loadingTrips, setLoadingTrips] = useState(false)

  useEffect(() => {
    async function loadTrips() {
      setLoadingTrips(true)
      await dispatch(
        getTrips(Object.keys(missingTrips).map((id) => parseInt(id)))
      )
      setLoadingTrips(false)
    }
    if (Object.keys(missingTrips).length && !loadingTrips) {
      loadTrips()
    }
  }, [dispatch, missingTrips, loadingTrips])

  return (
    <PageBody appBar>
      <div className={classes.section}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end">
          <Typography variant="h1">Flights</Typography>
          <Link
            variant="body1"
            underline="always"
            component={RouterLink}
            to={AppRoutes.getPath(
              "RetreatAttendeesPage",
              {
                retreatIdx: retreatIdx.toString(),
              },
              {add: "single"}
            )}>
            Need to add an attendee?
          </Link>
        </Box>
        <div className={classes.dataGridWrapper}>
          <DataGrid
            disableColumnSelector
            disableColumnFilter
            disableColumnMenu
            pageSize={50}
            rowsPerPageOptions={[]}
            onRowClick={(params) => {
              dispatch(
                push(
                  AppRoutes.getPath("RetreatAttendeeFlightsPage", {
                    retreatIdx: retreatIdx.toString(),
                    attendeeId: params.row.id.toString(),
                  })
                )
              )
            }}
            components={{Toolbar: CustomToolbarFlightsPage}}
            componentsProps={{
              toolbar: {
                searchTerm: attendeeSearchTerm,
                setSearchTerm: setAttendeeSearchTerm,
              },
            }}
            className={classes.dataGrid}
            classes={{row: classes.dataGridRow}}
            rows={sortBy(attendeeTravelInfo, (attendee) => {
              if (attendee.flight_status === "BOOKED") {
                return 0
              } else if (attendee.flight_status === "OPT_OUT") {
                return 1
              } else {
                return 2
              }
            }).filter((attendee) => {
              let attendeeName = `${attendee.first_name.toLowerCase()} ${attendee.last_name.toLowerCase()}`
              return attendeeName.includes(attendeeSearchTerm)
            })}
            columns={[
              {
                field: "first_name",
                headerName: "First name",
                width: 130,
                minWidth: 130,
                flex: 1,
              },
              {
                field: "last_name",
                headerName: "Last name",
                width: 130,
                minWidth: 130,
                flex: 1,
              },
              {
                field: "arrival",
                headerName: "Flight Arrival",
                width: 160,
                valueGetter: (params) => {
                  let attendee = params.row
                  return attendee.travel &&
                    attendee.travel.arr_trip &&
                    attendee.travel.arr_trip.trip_legs.length &&
                    trips[attendee.travel.arr_trip.id] &&
                    trips[attendee.travel.arr_trip.id].trip_legs[
                      trips[attendee.travel.arr_trip.id].trip_legs.length - 1
                    ]
                    ? trips[attendee.travel.arr_trip.id].trip_legs[
                        trips[attendee.travel.arr_trip.id].trip_legs.length - 1
                      ].arr_datetime
                    : undefined
                },
                minWidth: 160,
                flex: 1.23,
                valueFormatter: (params) => {
                  return !isNaN(new Date(params.value as string).getTime())
                    ? dateFormat(new Date(params.value as string))
                    : undefined
                },
              },
              {
                field: "departure",
                headerName: "Flight Departure",
                width: 160,
                minWidth: 160,
                flex: 1.23,
                valueGetter: (params) => {
                  let attendee = params.row
                  return attendee.travel &&
                    attendee.travel.dep_trip &&
                    trips[attendee.travel.dep_trip.id] &&
                    trips[attendee.travel.dep_trip.id].trip_legs.length
                    ? trips[attendee.travel.dep_trip.id].trip_legs[0]
                        .dep_datetime
                    : undefined
                },
                valueFormatter: (params) => {
                  return !isNaN(new Date(params.value as string).getTime())
                    ? dateFormat(new Date(params.value as string))
                    : undefined
                },
              },
              {
                field: "cost",
                headerName: "Cost",
                width: 130,
                minWidth: 130,
                flex: 1,
                valueGetter: (params) => params.row.travel?.cost,
                valueFormatter: (params) => {
                  if (params.value) {
                    return currencyFormat(params.value as number)
                  }
                },
              },
              {
                field: "flight_status",
                headerName: "Status",
                width: 130,
                minWidth: 130,
                flex: 1,
                renderCell: (params) => {
                  if (params.value === "BOOKED") {
                    return (
                      <Chip
                        variant="outlined"
                        label="Booked"
                        className={classes.successChip}
                      />
                    )
                  } else if (params.value === "PENDING") {
                    return (
                      <Chip
                        variant="outlined"
                        label="To Book"
                        className={classes.warningChip}
                      />
                    )
                  } else if (params.value === "OPT_OUT") {
                    return (
                      <Chip
                        variant="outlined"
                        label="Opted Out"
                        className={classes.infoChip}
                      />
                    )
                  }
                },
              },
            ]}></DataGrid>
        </div>
      </div>
    </PageBody>
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
}

function CustomToolbarFlightsPage(props: CustomToolbarFlightsPageProps) {
  let classes = useToolbarStyles()
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
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
            height: "28px",
          },
        }}
      />
    </GridToolbarContainer>
  )
}
