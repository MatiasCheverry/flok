import {
  Avatar,
  Button,
  Icon,
  Link,
  makeStyles,
  Tab,
  Tabs,
  TextField,
  TextFieldProps,
  useMediaQuery,
} from "@material-ui/core"
import {
  AccountBox,
  ArrowBackIos,
  FlightTakeoff,
  FormatListBulleted,
} from "@material-ui/icons"
import {Autocomplete} from "@material-ui/lab"
import {push} from "connected-react-router"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {
  Link as ReactRouterLink,
  Route,
  Switch,
  useRouteMatch,
} from "react-router-dom"
import * as yup from "yup"
import AttendeeRegResponseTab from "../../components/attendee/AttendeeRegResponseTab"
import BeforeUnload from "../../components/base/BeforeUnload"
import AttendeeFlightTab from "../../components/flights/AttendeeFlightTab"
import PageBody from "../../components/page/PageBody"
import {AttendeeInfoStatus} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getAttendee, patchAttendee} from "../../store/actions/retreat"
import {FlokTheme} from "../../theme"
import {getTextFieldErrorProps} from "../../utils"
import {useRetreat} from "../misc/RetreatProvider"

let useStyles = makeStyles((theme) => ({
  section: {
    margin: theme.spacing(2),
    "& > *:not(:first-child)": {
      paddingLeft: theme.spacing(1),
    },
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  avatar: {
    backgroundColor: "orange",
    height: "95px",
    width: "95px",
    textAlign: "center",
  },
  avatarDiv: {
    display: "flex",
    justifyContent: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(2),
    },
    alignItems: "center",
    backgroundColor: "white",
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(2),
    },
  },
  textField: {
    maxWidth: "320px",
    minWidth: "300px",
  },
  submitButton: {
    maxWidth: "320pxp",
  },
  body: {
    width: "100%",
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  },
  tabs: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    minWidth: "175px",
  },
  tab: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginRight: theme.spacing(1.5),
    cursor: "pointer",
  },
  fullPageTab: {
    flex: "1 1 auto",
    height: 0,
  },
  flightsWrapper: {
    width: "75%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
}))

function AttendeePage() {
  let classes = useStyles()
  let dispatch = useDispatch()
  let route = useRouteMatch<{
    retreatIdx: string
    attendeeId: string
  }>()
  let [newOption, setNewOption] = useState("")
  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )
  let [retreat] = useRetreat()

  const isFlights =
    route.path === AppRoutes.getPath("RetreatAttendeeFlightsPage")
  let retreatIdx = parseInt(route.params.retreatIdx)
  let attendeeId = parseInt(route.params.attendeeId)
  let attendee = useSelector((state: RootState) => {
    if (attendeeId != null) {
      return state.retreat.attendees[attendeeId]
    }
  })
  useEffect(() => {
    !attendee && dispatch(getAttendee(attendeeId))
  }, [attendeeId, attendee, dispatch])

  let formik = useFormik({
    initialValues: {
      email_address:
        attendee && attendee.email_address ? attendee.email_address : "",
      first_name: attendee && attendee.first_name ? attendee.first_name : "",
      last_name: attendee && attendee.last_name ? attendee.last_name : "",
      notes: attendee && attendee.notes ? attendee.notes : "",
      dietary_prefs:
        attendee && attendee.dietary_prefs ? attendee.dietary_prefs : "",
      info_status:
        attendee && attendee.info_status ? attendee.info_status : "CREATED",
      hotel_check_in:
        attendee && attendee.hotel_check_in ? attendee.hotel_check_in : "",
      hotel_check_out:
        attendee && attendee.hotel_check_out ? attendee.hotel_check_out : "",
    },
    onSubmit: (values) => {
      dispatch(patchAttendee(attendeeId, values))
    },
    validate: (values) => {
      try {
        // If the attendee was created without an email, allow saving still
        if (attendee?.email_address || values.email_address) {
          yup.string().required().email().validateSync(values.email_address)
        }
      } catch (err) {
        return {email_address: "Please enter a valid email."}
      }
      return {}
    },
    enableReinitialize: true,
  })

  const textFieldProps: TextFieldProps = {
    fullWidth: true,
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
  }
  return (
    <PageBody appBar>
      <div className={classes.section}>
        <Tabs
          orientation={isSmallScreen ? "horizontal" : "vertical"}
          className={classes.tabs}
          value={route.url}
          variant="fullWidth"
          indicatorColor="primary"
          onChange={(e, value) => dispatch(push(value))}>
          <Link
            component={ReactRouterLink}
            variant="inherit"
            underline="none"
            color="inherit"
            className={classes.tab}
            to={
              isFlights && !retreat.attendees_v2_released
                ? AppRoutes.getPath("RetreatFlightsPage", {
                    retreatIdx: retreatIdx.toString(),
                  })
                : AppRoutes.getPath("RetreatAttendeesPage", {
                    retreatIdx: retreatIdx.toString(),
                  })
            }>
            <Icon>
              <ArrowBackIos />
            </Icon>
            {isFlights && !retreat.attendees_v2_released
              ? "All Flights"
              : "All Attendees"}
          </Link>
          <Tab
            className={classes.tab}
            value={AppRoutes.getPath("RetreatAttendeePage", {
              retreatIdx: retreatIdx.toString(),
              attendeeId: attendeeId.toString(),
            })}
            icon={<AccountBox />}
            label={isSmallScreen ? "" : "Attendee Profile"}
          />
          <Tab
            className={classes.tab}
            icon={<FlightTakeoff />}
            label={isSmallScreen ? "" : "Attendee Flights"}
            value={AppRoutes.getPath("RetreatAttendeeFlightsPage", {
              retreatIdx: retreatIdx.toString(),
              attendeeId: attendeeId.toString(),
            })}
          />
          {attendee?.registration_form_response_id && (
            <Tab
              className={classes.tab}
              icon={<FormatListBulleted />}
              label={isSmallScreen ? "" : "Registration Response"}
              value={AppRoutes.getPath("RetreatAttendeeRegResponsePage", {
                retreatIdx: retreatIdx.toString(),
                attendeeId: attendeeId.toString(),
              })}
            />
          )}
        </Tabs>
        <Switch>
          <Route
            path={AppRoutes.getPath("RetreatAttendeePage")}
            exact
            render={() => (
              <div className={classes.fullPageTab}>
                <BeforeUnload
                  when={!_.isEqual(formik.values, formik.initialValues)}
                  message="Are you sure you want to leave without saving your changes?"
                />
                <div className={classes.body}>
                  <form className={classes.form} onSubmit={formik.handleSubmit}>
                    <Avatar className={classes.avatar}>
                      <div className={classes.avatarDiv}>
                        {attendee?.first_name
                          ? `${attendee.first_name[0]}${
                              attendee.last_name ? attendee.last_name[0] : ""
                            }`
                          : null}
                      </div>
                    </Avatar>
                    <TextField
                      {...textFieldProps}
                      id="info_status"
                      variant="outlined"
                      value={formik.values.info_status}
                      select
                      SelectProps={{native: true}}
                      label="Attendee Registration Status">
                      {RetreatAttendeeInfoStatusOptions.map((o, i) => (
                        <option key={i} value={o.value}>
                          {o.text}
                        </option>
                      ))}
                    </TextField>
                    <TextField
                      {...textFieldProps}
                      className={classes.textField}
                      variant="outlined"
                      label="First Name"
                      value={formik.values.first_name ?? ""}
                      id="first_name"
                    />
                    <TextField
                      {...textFieldProps}
                      className={classes.textField}
                      variant="outlined"
                      label="Last Name"
                      value={formik.values.last_name ?? ""}
                      id="last_name"
                    />
                    <TextField
                      {...textFieldProps}
                      className={classes.textField}
                      variant="outlined"
                      label="Email"
                      value={formik.values.email_address ?? ""}
                      id="email_address"
                      {...getTextFieldErrorProps(formik, "email_address")}
                    />
                    <TextField
                      {...textFieldProps}
                      type="date"
                      className={classes.textField}
                      variant="outlined"
                      label="Hotel check in"
                      id="hotel_check_in"
                      value={formik.values.hotel_check_in ?? ""}
                    />
                    <TextField
                      {...textFieldProps}
                      type="date"
                      className={classes.textField}
                      variant="outlined"
                      label="Hotel check out"
                      id="hotel_check_out"
                      value={formik.values.hotel_check_out ?? ""}
                    />
                    <Autocomplete
                      fullWidth
                      multiple
                      id="preferences_dates_flexible_months"
                      options={Array.from(
                        new Set(
                          [
                            ...Array.from(DIETARY_OPTIONS).map((a) =>
                              a.toLocaleLowerCase()
                            ),
                            ...(formik.values.dietary_prefs
                              ? formik.values.dietary_prefs.split(",")
                              : []
                            ).map((a) => a.toLocaleLowerCase()),
                            ...(newOption && newOption.length > 1
                              ? [`Add \`${newOption.toLocaleLowerCase()}\``]
                              : []),
                          ].filter((value) => value)
                        )
                      )}
                      getOptionLabel={(option) => {
                        return (
                          option &&
                          option[0].toLocaleUpperCase() + option.slice(1)
                        )
                      }}
                      filterSelectedOptions
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      onInputChange={(e, value, reason) => {
                        if (reason !== "reset" || e != null) setNewOption(value)
                      }}
                      inputValue={newOption}
                      value={
                        formik.values.dietary_prefs
                          ?.split(",")
                          .filter((a) => !!a)
                          .map((a) => a.toLocaleLowerCase()) || []
                      }
                      onChange={(e, newVals) => {
                        newVals = newVals.map((val) => {
                          val = val.toLocaleLowerCase()
                          if (val.startsWith("add `")) {
                            val = val.slice(5, -1)
                          }
                          return val
                        })
                        formik.setFieldValue(
                          "dietary_prefs",
                          Array.from(
                            new Set(
                              newVals.sort().map((a) => a.toLocaleLowerCase())
                            )
                          ).join(",")
                        )
                      }}
                      renderInput={(params) => {
                        return (
                          <TextField
                            variant="outlined"
                            className={classes.textField}
                            {...params}
                            {...textFieldProps}
                            inputProps={{
                              ...params.inputProps,
                              onKeyPress: (e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  return false
                                }
                              },
                            }}
                            onChange={undefined}
                            label="Dietary Preferences"
                            placeholder="Select a dietary restriction"
                          />
                        )
                      }}
                    />
                    <TextField
                      multiline
                      {...textFieldProps}
                      id="notes"
                      value={formik.values.notes ?? ""}
                      label="Other Notes"
                      placeholder="Enter other notes on the attendee"
                      className={classes.textField}
                      variant="outlined"
                      rows={2}
                      rowsMax={4}
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      className={classes.submitButton}
                      disabled={_.isEqual(formik.values, formik.initialValues)}>
                      Save
                    </Button>
                  </form>
                </div>
              </div>
            )}
          />
          <Route
            path={AppRoutes.getPath("RetreatAttendeeFlightsPage")}
            render={() => (
              <div className={classes.fullPageTab}>
                {attendee && (
                  <div className={classes.flightsWrapper}>
                    <AttendeeFlightTab attendee={attendee} />
                  </div>
                )}
              </div>
            )}
            exact
          />
          <Route
            path={AppRoutes.getPath("RetreatAttendeeRegResponsePage")}
            render={() => (
              <div className={classes.fullPageTab}>
                {attendee && <AttendeeRegResponseTab attendee={attendee} />}
              </div>
            )}
            exact
          />
        </Switch>
      </div>
    </PageBody>
  )
}
export default AttendeePage

const DIETARY_OPTIONS = new Set([
  "Vegetarian",
  "Vegan",
  "Kosher style",
  "Kosher certified",
  "Nut allergy",
  "Fish/shellfish allergy",
  "Gluten free",
  "Keto",
  "Dairy free",
  "Halal",
  "Pescatarian",
  "Diabetic",
  "Mediterranean",
])
const RetreatAttendeeInfoStatusOptions: {
  value: AttendeeInfoStatus
  text: string
}[] = [
  {value: "CREATED", text: "Pending"},
  {value: "INFO_ENTERED", text: "Registered"},
  {value: "NOT_ATTENDING", text: "Not Attending"},
  {value: "CANCELLED", text: "Cancelled"},
]
