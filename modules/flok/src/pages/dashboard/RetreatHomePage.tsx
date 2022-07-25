import {Box, makeStyles, Typography} from "@material-ui/core"
import {
  Apartment,
  CheckCircle,
  Error,
  Flight,
  People,
  Room,
} from "@material-ui/icons"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import AppTypography from "../../components/base/AppTypography"
import EditRetreatButtonModal from "../../components/forms/EditRetreatButtonModal"
import AppOverviewCard, {
  AppOverviewCardList,
} from "../../components/overview/AppOverviewCard"
import AppTodoList from "../../components/overview/AppTaskList"
import PageBody from "../../components/page/PageBody"
import config, {MAX_TASKS} from "../../config"
import {
  OrderedRetreatAttendeesState,
  OrderedRetreatFlightsState,
  RetreatAttendeeModel,
  RetreatToTask,
} from "../../models/retreat"
import {RootState} from "../../store"
import {getHotels} from "../../store/actions/lodging"
import {putRetreatTask} from "../../store/actions/retreat"
import {getRetreatName, useRetreatAttendees} from "../../utils/retreatUtils"
import {useRetreat} from "../misc/RetreatProvider"

let useStyles = makeStyles((theme) => ({
  section: {
    margin: theme.spacing(2),
    "& > *:not(:first-child)": {
      paddingLeft: theme.spacing(1),
    },
  },
  overviewHeader: {
    marginBottom: theme.spacing(1),
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
  todoIcon: {},
  iconExpanded: {
    transform: "rotateZ(180deg)",
  },
  expandButtons: {
    textDecoration: "underline",
    cursor: "pointer",
  },
  retreatNameLine: {display: "flex", alignItems: "center"},
}))

export default function RetreatHomePage() {
  let classes = useStyles()
  // Path and query params
  let dispatch = useDispatch()
  let [retreat, retreatIdx] = useRetreat()
  let [attendees] = useRetreatAttendees(retreat.id)
  let retreatBaseUrl = `/r/${retreatIdx}`

  let [datesOverview, setDatesOverview] = useState<string | undefined>(
    undefined
  )

  function getRegisteredAttendees(attendees: RetreatAttendeeModel[]) {
    return attendees.filter(
      (attendee) => attendee.info_status === "INFO_ENTERED"
    )
  }

  useEffect(() => {
    if (
      Date.parse(retreat.lodging_final_start_date ?? "") &&
      Date.parse(retreat.lodging_final_end_date ?? "")
    ) {
      const formatter = Intl.DateTimeFormat("en-us", {
        dateStyle: "medium",
        timeStyle: undefined,
        timeZone: "UTC",
      })
      let startDateParts = formatter.format(
        new Date(retreat.lodging_final_start_date!)
      )
      let endDateParts = formatter.format(
        new Date(retreat.lodging_final_end_date!)
      )
      setDatesOverview(`${startDateParts} - ${endDateParts}`)
    } else {
      const DEFAULT_DATES = "Dates: TBD"
      setDatesOverview(DEFAULT_DATES)
    }
  }, [
    setDatesOverview,
    retreat.lodging_final_end_date,
    retreat.lodging_final_start_date,
  ])

  let [destinationOverview, setDestinationOverview] = useState<
    string | undefined
  >(retreat.lodging_final_destination)
  useEffect(() => {
    setDestinationOverview(retreat.lodging_final_destination)
  }, [retreat.lodging_final_destination])

  let [attendeesOverview, setAttendeesOverview] = useState<string | undefined>(
    undefined
  )
  useEffect(() => {
    if (
      attendees &&
      retreat.attendees_state &&
      OrderedRetreatAttendeesState.indexOf(retreat.attendees_state) >=
        OrderedRetreatAttendeesState.indexOf("REGISTRATION_OPEN")
    ) {
      setAttendeesOverview(getRegisteredAttendees(attendees).length.toString())
    } else {
      setAttendeesOverview(undefined)
    }
  }, [attendees, retreat.attendees_state])

  let [flightsOverview, setFlightsOverview] = useState<string | undefined>(
    undefined
  )
  useEffect(() => {
    if (
      attendees &&
      retreat.flights_state &&
      OrderedRetreatFlightsState.indexOf(retreat.flights_state) >=
        OrderedRetreatFlightsState.indexOf("POLICY_REVIEW")
    ) {
      let numBookedFlights = attendees
        .filter((attendee) =>
          ["INFO_ENTERED", "CREATED"].includes(attendee.info_status)
        )
        .filter(
          (attendee) =>
            attendee.flight_status &&
            ["OPT_OUT", "BOOKED"].includes(attendee.flight_status)
        ).length
      setFlightsOverview(
        `${numBookedFlights} / ${getRegisteredAttendees(attendees).length}`
      )
    } else {
      setFlightsOverview(undefined)
    }
  }, [setFlightsOverview, attendees, retreat.flights_state])

  let [lodgingOverview, setLodgingOverview] = useState<string | undefined>(
    undefined
  )
  let selectedHotel = useSelector((state: RootState) => {
    if (retreat.lodging_final_hotel_id != null) {
      return state.lodging.hotels[retreat.lodging_final_hotel_id]
    }
  })
  useEffect(() => {
    if (
      retreat.lodging_final_hotel_id != null &&
      (!selectedHotel || selectedHotel.id !== retreat.lodging_final_hotel_id)
    ) {
      dispatch(getHotels([retreat.lodging_final_hotel_id]))
    }
  }, [retreat.lodging_final_hotel_id, dispatch, selectedHotel])
  useEffect(() => {
    if (selectedHotel) {
      setLodgingOverview(selectedHotel.name)
    } else {
      setLodgingOverview(undefined)
    }
  }, [setLodgingOverview, selectedHotel])

  const handleTaskClick = (task: RetreatToTask) => {
    dispatch(
      putRetreatTask(
        task.task_id,
        retreat.id,
        task.state === "COMPLETED" ? "TODO" : "COMPLETED"
      )
    )
  }

  let [todoTasksCollapsed, setTodoTasksCollapsed] = useState(true)
  let [completedTasksCollapsed, setCompletedTasksCollapsed] = useState(true)
  const MAX_TASKS_SHOWN =
    parseInt(config.get(MAX_TASKS)) > 0
      ? parseInt(config.get(MAX_TASKS))
      : undefined
  let [todoTasks, setTodoTasks] = useState<RetreatToTask[]>([])
  let [todoTasksExtra, setTodoTasksExtra] = useState<RetreatToTask[]>([])

  useEffect(() => {
    if (MAX_TASKS_SHOWN === undefined) {
      setTodoTasksExtra([])
      setTodoTasks(retreat.tasks_todo)
    } else {
      setTodoTasksExtra(
        retreat.tasks_todo
          .slice(MAX_TASKS_SHOWN)
          .sort((a, b) => a.order - b.order)
      )
      setTodoTasks(
        retreat.tasks_todo
          .slice(0, MAX_TASKS_SHOWN)
          .sort((a, b) => a.order - b.order)
      )
    }
  }, [MAX_TASKS_SHOWN, setTodoTasksExtra, setTodoTasks, retreat])

  return (
    <PageBody appBar>
      <div className={classes.section}>
        <div className={classes.overviewHeader}>
          <Typography variant="h1">Overview</Typography>
          <div className={classes.retreatNameLine}>
            <Typography variant="body1">{getRetreatName(retreat)}</Typography>
            &nbsp;
            <EditRetreatButtonModal retreat={retreat} />
          </div>
          <Typography variant="body1">{datesOverview}</Typography>
        </div>
        <AppOverviewCardList>
          <AppOverviewCard
            label="Destination"
            Icon={Room}
            value={destinationOverview}
          />
          <AppOverviewCard
            label="Lodging"
            Icon={Apartment}
            value={lodgingOverview}
          />
          <AppOverviewCard
            label="Attendees"
            Icon={People}
            value={attendeesOverview}
            moreInfo={"# of attendees successfully registered for your retreat"}
          />
          <AppOverviewCard
            label="Flights"
            Icon={Flight}
            value={flightsOverview ?? "-- / --"}
            moreInfo={
              "# of attendees who've confirmed their flights for your retreat"
            }
          />
        </AppOverviewCardList>
      </div>
      <div className={classes.section}>
        <AppTypography variant="h4" paragraph>
          To Do List{" "}
          <Error
            color="inherit"
            className={`${classes.headerIcon} todo`}
            fontSize="small"
          />
        </AppTypography>
        <AppTodoList
          retreatToTasks={todoTasks}
          retreatBaseUrl={retreatBaseUrl}
          handleCheckboxClick={handleTaskClick}
          orderBadge={true}
        />
        {todoTasksExtra.length > 0 ? (
          <>
            <AppTodoList
              retreatToTasks={todoTasksExtra}
              retreatBaseUrl={retreatBaseUrl}
              handleCheckboxClick={handleTaskClick}
              orderBadge={true}
              collapsed={todoTasksCollapsed}
              noComplete
            />
            <Box marginTop={2}>
              <Typography
                className={classes.expandButtons}
                component="span"
                color="textSecondary"
                variant="body2"
                onClick={() => setTodoTasksCollapsed(!todoTasksCollapsed)}>
                {todoTasksCollapsed ? "show more" : "show less"}
              </Typography>
            </Box>
          </>
        ) : undefined}
      </div>
      <div className={classes.section}>
        <AppTypography variant="h4" paragraph>
          Completed{" "}
          <CheckCircle
            color="inherit"
            className={`${classes.headerIcon} completed`}
            fontSize="small"
          />
          {retreat.tasks_completed.length > 0 && (
            <Typography
              component="span"
              className={classes.expandButtons}
              variant="body2"
              onClick={() =>
                setCompletedTasksCollapsed(!completedTasksCollapsed)
              }>
              {completedTasksCollapsed ? "show completed" : "hide"}
            </Typography>
          )}
        </AppTypography>
        <AppTodoList
          retreatToTasks={retreat.tasks_completed.sort(
            (a, b) => b.order - a.order
          )}
          retreatBaseUrl={retreatBaseUrl}
          handleCheckboxClick={handleTaskClick}
          orderBadge={false}
          collapsed={completedTasksCollapsed}
        />
      </div>
    </PageBody>
  )
}
