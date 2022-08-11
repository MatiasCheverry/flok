import {Button, Chip, makeStyles, Typography} from "@material-ui/core"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {RetreatAttendeeModel} from "../../models/retreat"
import {RootState} from "../../store"
import {getTrip, instantiateAttendeeTrips} from "../../store/actions/retreat"
import AppMoreInfoIcon from "../base/AppMoreInfoIcon"
import EditAttendeeTravelModal from "./EditAttendeeTravelModal"
import EditFlightModal from "./EditFlightModal"
import FlightCardContainer from "./FlightCardContainer"

type AttendeeFlightTabProps = {
  attendee: RetreatAttendeeModel
  hideHeader?: true
}
let useStyles = makeStyles((theme) => ({
  flightCardContainer: {
    marginLeft: theme.spacing(2),
    cursor: "auto",
  },
  tripHeader: {
    marginLeft: theme.spacing(1),
    padding: theme.spacing(2),
  },
  header: {
    padding: theme.spacing(1),
    fontWeight: 700,
  },
  headerLine: {
    display: "flex",
    // justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {},
  noFlightsWords: {
    paddingLeft: theme.spacing(3),
  },
  noFlightsButton: {
    marginLeft: theme.spacing(3),
  },
  instantiateButton: {
    margin: theme.spacing(2),
  },
  textField: {
    width: 150,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  flightInfoContainer: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),

    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  flightInfoDivWrapper: {
    marginLeft: theme.spacing(2),
  },
  flightInfoHeader: {
    fontSize: 12,
    marginBottom: theme.spacing(0.5),
    fontWeight: theme.typography.fontWeightBold,
  },
  flightInfoSection: {
    display: "flex",
    flexDirection: "column",
    marginRight: theme.spacing(3),
  },
  infoChip: {
    borderColor: theme.palette.text.secondary,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(2),
    height: "25px",
  },
  successChip: {
    borderColor: theme.palette.success.main,
    color: theme.palette.success.main,
    marginLeft: theme.spacing(2),
    height: "25px",
  },
  warningChip: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
    marginLeft: theme.spacing(2),
    height: "25px",
  },
  flightCost: {
    marginLeft: theme.spacing(2),
    lineHeight: "25px",
  },
}))

function AttendeeFlightTab(props: AttendeeFlightTabProps) {
  let {attendee} = props
  let travel = attendee.travel
  let dispatch = useDispatch()

  let arrivalFlights = useSelector((state: RootState) => {
    if (travel?.arr_trip && travel?.arr_trip.id) {
      return state.retreat.trips[travel?.arr_trip.id]
    }
  })
  let departureFlights = useSelector((state: RootState) => {
    if (travel?.dep_trip && travel?.dep_trip.id) {
      return state.retreat.trips[travel?.dep_trip.id]
    }
  })

  const renderFlightStatusChip = (val: "BOOKED" | "OPT_OUT" | "PENDING") => {
    if (val === "BOOKED") {
      return (
        <Chip
          variant="outlined"
          label={"Booked"}
          className={classes.successChip}
        />
      )
    } else if (val === "OPT_OUT") {
      return (
        <Chip
          variant="outlined"
          label={
            <>
              Opt'd Out
              <AppMoreInfoIcon tooltipText="This attendee does not require flights to the retreat." />
            </>
          }
          className={classes.infoChip}
        />
      )
    } else {
      return (
        <Chip
          variant="outlined"
          label={"To Book"}
          className={classes.warningChip}
        />
      )
    }
  }
  useEffect(() => {
    travel?.arr_trip &&
      travel?.arr_trip.id &&
      !arrivalFlights &&
      dispatch(getTrip(travel?.arr_trip.id))
    travel?.dep_trip &&
      travel?.dep_trip.id &&
      !departureFlights &&
      dispatch(getTrip(travel?.dep_trip.id))
  }, [
    dispatch,
    travel?.arr_trip,
    travel?.dep_trip,
    arrivalFlights,
    departureFlights,
  ])

  let classes = useStyles()
  const [openEditArrival, setOpenEditArrival] = useState(false)
  const [openEditDeparture, setOpenEditDeparture] = useState(false)
  const [openEditAttendeeTravelModal, setOpenEditAttendeeTravelModal] =
    useState(false)
  return (
    <>
      {attendee && (
        <div>
          {arrivalFlights && (
            <EditFlightModal
              open={openEditArrival}
              setOpen={setOpenEditArrival}
              type="Arrival"
              flights={arrivalFlights}
            />
          )}
          {departureFlights && (
            <EditFlightModal
              open={openEditDeparture}
              setOpen={setOpenEditDeparture}
              type="Departure"
              flights={departureFlights}
            />
          )}
          {attendee.travel && (
            <EditAttendeeTravelModal
              open={openEditAttendeeTravelModal}
              flightStatus={attendee.flight_status}
              flightCost={attendee.travel.cost}
              attendeeId={attendee.id}
              handleClose={() => {
                setOpenEditAttendeeTravelModal(false)
              }}
            />
          )}
          {!props.hideHeader && (
            <Typography variant="h3" className={classes.header}>
              {attendee.first_name + " " + attendee.last_name}'s Flights
            </Typography>
          )}
          {attendee.travel && (
            <>
              <div className={classes.headerLine}>
                <Typography variant="h4" className={classes.tripHeader}>
                  Trip Details
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  className={classes.editButton}
                  onClick={() => setOpenEditAttendeeTravelModal(true)}>
                  Edit
                </Button>
              </div>
              <div className={classes.flightInfoDivWrapper}>
                <div className={classes.flightInfoContainer}>
                  <div className={classes.flightInfoSection}>
                    <Typography className={classes.flightInfoHeader}>
                      Flights Status
                    </Typography>
                    {renderFlightStatusChip(attendee.flight_status)}
                  </div>
                  <div className={classes.flightInfoSection}>
                    <Typography className={classes.flightInfoHeader}>
                      Flights Cost
                    </Typography>
                    <Typography className={classes.flightCost}>
                      {attendee.travel?.cost !== undefined
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(attendee.travel?.cost)
                        : "N/A"}
                    </Typography>
                  </div>
                </div>
              </div>
            </>
          )}

          {arrivalFlights ? (
            <div>
              <div className={classes.headerLine}>
                {" "}
                <Typography variant="h4" className={classes.tripHeader}>
                  Arrival Trip
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  className={classes.editButton}
                  onClick={() => setOpenEditArrival(true)}>
                  Edit
                </Button>
              </div>

              {arrivalFlights?.trip_legs.length ? (
                <div className={classes.flightCardContainer}>
                  <FlightCardContainer flights={arrivalFlights} />
                </div>
              ) : (
                <div className={classes.noFlightsWords}>
                  No Scheduled Flights
                </div>
              )}
              <div className={classes.headerLine}>
                <Typography variant="h4" className={classes.tripHeader}>
                  Departure Trip
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  className={classes.editButton}
                  onClick={() => setOpenEditDeparture(true)}>
                  Edit
                </Button>
              </div>
              {departureFlights?.trip_legs.length ? (
                <div className={classes.flightCardContainer}>
                  <FlightCardContainer flights={departureFlights} />
                </div>
              ) : (
                <div className={classes.noFlightsWords}>
                  {" "}
                  No Scheduled flights
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="contained"
              color="primary"
              className={classes.instantiateButton}
              onClick={() => {
                dispatch(instantiateAttendeeTrips(attendee.id))
              }}>
              No Flights Yet, Create Flights?
            </Button>
          )}
        </div>
      )}
    </>
  )
}
export default AttendeeFlightTab
