import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  makeStyles,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@material-ui/core"
import {
  DataGrid,
  GridCellParams,
  GridColumns,
  GridToolbarContainer,
  GridToolbarExport,
  GridValueFormatterParams,
  GridValueGetterParams,
} from "@material-ui/data-grid"
import {
  Add,
  CloudUpload,
  Dns,
  DoneAll,
  Flight,
  GetApp,
  Person,
  Search,
} from "@material-ui/icons"
import CloseIcon from "@material-ui/icons/Close"
import {Alert} from "@material-ui/lab"
import clsx from "clsx"
import {push} from "connected-react-router"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {withRouter} from "react-router-dom"
import AppCsvXlsxUpload from "../../components/base/AppCsvXlsxUpload"
import AttendeeFlightReceiptViewer from "../../components/lodging/AttendeeFlightReceiptViewer"
import DataGridDeleteDropDown from "../../components/lodging/DataGridDeleteDropdown"
import PageBody from "../../components/page/PageBody"
import {AttendeeBatchUploadApiResponse} from "../../models/api"
import {FormResponseModel} from "../../models/form"
import {FileModel, RetreatAttendeeModel} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {ApiAction} from "../../store/actions/api"
import {getFormQuestion, getFormResponses} from "../../store/actions/form"
import {
  deleteRetreatAttendees,
  getTrips,
  postRetreatAttendees,
  postRetreatAttendeesBatch,
} from "../../store/actions/retreat"
import {FlokTheme} from "../../theme"
import {useQuery} from "../../utils"
import {useRetreatAttendees} from "../../utils/retreatUtils"
import {useRetreat} from "../misc/RetreatProvider"

function datetimeFormat(date: Date | undefined) {
  if (date === undefined) {
    return ""
  }
  let dateFormatter = Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  })
  return dateFormatter.format(date)
}
function dateFormat(date: Date | undefined) {
  if (date === undefined) {
    return ""
  }
  let dateFormatter = Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeZone: "UTC",
  })
  return dateFormatter.format(date)
}

function currencyFormat(num: Number) {
  return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

let useStyles = makeStyles((theme) => ({
  section: {
    margin: theme.spacing(2),
    "& > *:not(:first-child)": {
      paddingLeft: theme.spacing(1),
    },
    flex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pageTitle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    "& > *:nth-child(2)": {
      marginTop: theme.spacing(1),
    },
  },
  notAttendingButton: {
    cursor: "pointer",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  notAttendingDialogBody: {
    padding: "0 !important",
    maxHeight: "30vh",
  },
  allAttendingP: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  errorText: {
    color: theme.palette.error.main,
  },
  errorTableContainer: {
    marginTop: 8,
    maxHeight: 200,
  },
  errorTable: {
    height: "max-content",
  },
  successfulUploadDiv: {
    display: "flex",
  },
  uploadPreviewFooter: {
    marginLeft: theme.spacing(1),
  },
  actionButtons: {
    marginLeft: "auto",
  },
  actionButtonsContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "right",
  },
  attendeesAddedText: {
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "8px",
    textAlign: "center",
  },
  warningChip: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
    height: "25px",
  },
  successChip: {
    borderColor: theme.palette.success.main,
    color: theme.palette.success.main,
    height: "25px",
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
    width: "100%",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    minHeight: 300,
  },
  infoChip: {
    borderColor: theme.palette.text.secondary,
    color: theme.palette.text.secondary,
  },
  linkStyle: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    display: "inline",
    margin: 0,
    padding: 0,
    color: "#0000EE", //To match default color of a link
  },
  cell: {
    "&:hover": {
      textOverflow: "clip",
      overflow: "visible",
      whiteSpace: "nowrap",
      maxWidth: "unset !important",
      wordBreak: "break-all",
    },
  },
}))

function AttendeesPage() {
  let classes = useStyles()
  let dispatch = useDispatch()

  let [showExportText, setShowExportText] = useState(true)

  let [retreat, retreatIdx] = useRetreat()
  let [addQueryParam, setAddQueryParam] = useQuery("add")
  let trips = useSelector((state: RootState) => {
    return state.retreat.trips
  })
  let [attendeeTravelInfo] = useRetreatAttendees(retreat.id)
  let [loadingTrips, setLoadingTrips] = useState(false)
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

  let [showFlights, setShowFlights] = useState(false)
  let [showResponses, setShowResponses] = useState(false)

  // For form response view
  let responseIds = attendeeTravelInfo.map(
    (attendee) => attendee.registration_form_response_id
  )
  let formResponses: {[id: number]: FormResponseModel} = useSelector(
    (state: RootState) => {
      return Object.assign(
        {},
        ...Object.entries(state.form.formResponses)
          .filter((entry) => {
            if (responseIds.indexOf(parseInt(entry[0])) !== -1) {
              return entry
            } else return false
          })
          .map((entry) => ({[entry[0]]: entry[1]}))
      )
    }
  )

  let questions = useSelector((state: RootState) => {
    return state.form.formQuestions
  })

  let [loadingResponses, setLoadingResponses] = useState(false)
  let missingResponses = attendeeTravelInfo.reduce((prev, attendee) => {
    let ret: {[key: number]: undefined} = {}
    if (
      attendee.registration_form_response_id &&
      !formResponses[attendee.registration_form_response_id]
    ) {
      ret[attendee.registration_form_response_id] = undefined
    }
    return {...prev, ...ret}
  }, {})
  useEffect(() => {
    async function loadResponses() {
      setLoadingResponses(true)
      await dispatch(
        getFormResponses(
          Object.keys(missingResponses).map((id) => parseInt(id))
        )
      )
      setLoadingResponses(false)
    }
    if (Object.keys(missingResponses).length && !loadingResponses) {
      loadResponses()
    }
  }, [dispatch, loadingResponses, missingResponses])

  let questionIds = Object.values(formResponses)
    .map((response) => response.answers)
    .flat()
    .reduce((prev, answer) => {
      let ret: {[key: number]: undefined} = {}
      ret[answer.form_question_id] = undefined
      return {...prev, ...ret}
    }, {})

  let [loadingQuestions, setLoadingQuestions] = useState(false)
  let missingQuestions = Object.keys(questionIds).filter(
    (id) => !questions[parseInt(id)]
  )
  useEffect(() => {
    async function loadQuestions() {
      setLoadingQuestions(true)
      await Promise.all(
        missingQuestions.slice(0, 10).map((id) => {
          return dispatch(getFormQuestion(parseInt(id)))
        })
      )
      setLoadingQuestions(false)
    }
    if (missingQuestions.length && !loadingQuestions) {
      loadQuestions()
    }
  }, [dispatch, loadingQuestions, missingQuestions])

  function allowNewLines(str: string | undefined) {
    let start = str
    if (str && str.replace(/[\r\n]/gm, " | ") !== str) {
      start += ","
    }
    return start
  }

  let formQuestionColumns = Object.keys(questionIds).map((id) => {
    return {
      field: questions[parseInt(id)]?.title ?? id,
      width: 275,
      valueGetter: (params: GridValueGetterParams) => {
        let attendee = params.row as RetreatAttendeeModel
        if (attendee.registration_form_response_id) {
          let formResponse =
            formResponses[attendee.registration_form_response_id]
          if (formResponse) {
            let answer = formResponse.answers.find(
              (answer) => answer.form_question_id === parseInt(id)
            )
            return allowNewLines(answer?.answer)
          }
        }
      },
    }
  })

  // For adding attendees
  let [addDialogOpen, setAddDialogOpen] = useState(
    addQueryParam?.toLowerCase() === "single" ||
      addQueryParam?.toLowerCase() === "batch"
  )
  let [newAttendeeFirstName, setNewAttendeeFirstName] = useState("")
  let [newAttendeeLastName, setNewAttendeeLastName] = useState("")
  let [newAttendeeEmail, setNewAttendeeEmail] = useState("")
  let [newAttendeeErrorState, setNewAttendeeErrorState] = useState({
    firstName: false,
    lastName: false,
    email: false,
  })

  const [openNotAttendingModal, setOpenNotAttendingModal] = useState(false)
  const [batchUploadingPage, setBatchUploadingPage] = useState(
    addQueryParam?.toLowerCase() === "batch"
  )
  const [batchUploadData, setBatchUploadData] = useState<
    (Pick<
      RetreatAttendeeModel,
      "email_address" | "first_name" | "last_name"
    > & {retreat_id: number})[]
  >([])
  const [batchUploadResponse, setBatchUploadResponse] = useState<
    AttendeeBatchUploadApiResponse | undefined
  >(undefined)

  const handleClose = () => {
    setOpenNotAttendingModal(false)
  }
  const handleFileUploaded = (data: string[][]) => {
    setBatchUploadData(
      data
        .map((row) => {
          return [
            row[0] ? row[0].toString() : "",
            row[1] ? row[1].toString() : "",
            row[2] ? row[2].toString() : "",
          ]
        })
        .map((row) => {
          return {
            email_address: row[0],
            first_name: row[1],
            last_name: row[2],
            retreat_id: retreat.id,
          }
        })
    )
  }
  let [attendeeSearchTerm, setAttendeeSearchTerm] = useState("")

  useEffect(() => {
    if (
      !(
        (addQueryParam?.toLowerCase() === "single" ||
          addQueryParam?.toLowerCase() === "batch") === addDialogOpen
      )
    ) {
      setAddDialogOpen(
        addQueryParam?.toLowerCase() === "single" ||
          addQueryParam?.toLowerCase() === "batch"
      )
    }
    if (!((addQueryParam?.toLowerCase() === "batch") === addDialogOpen)) {
      setBatchUploadingPage(addQueryParam?.toLowerCase() === "batch")
    }
  }, [addDialogOpen, addQueryParam])

  function batchAttendeeResponsetoJSX(
    response: AttendeeBatchUploadApiResponse
  ) {
    if (response.errors.length === 0) {
      return (
        <div className={classes.successfulUploadDiv}>
          <DoneAll />
          &nbsp;
          <Typography>All Attendees successfully added</Typography>
        </div>
      )
    } else {
      response = response as unknown as AttendeeBatchUploadApiResponse
      return (
        <>
          {response.attendees.length > 0 && (
            <Typography className={classes.attendeesAddedText}>
              {response.attendees.length} attendee
              {response.attendees.length > 1 ? "s" : ""} successfully added
            </Typography>
          )}
          <Alert severity="error">
            The following attendees could not be added
          </Alert>
          <TableContainer
            component={Paper}
            className={classes.errorTableContainer}>
            <Table size="small" className={classes.errorTable}>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {response.errors &&
                  response.errors.map((user) => {
                    return (
                      <TableRow>
                        <TableCell>{user.email_address}</TableCell>
                        <TableCell>
                          {user.error === "email"
                            ? "Invalid Email"
                            : "Duplicate Entry"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )
    }
  }

  async function handleBatchAttendeeSubmit() {
    let response = (await dispatch(
      postRetreatAttendeesBatch({attendees: batchUploadData}, retreat.id)
    )) as unknown as ApiAction
    if (!response.error) {
      setBatchUploadData([])
      setBatchUploadResponse(response.payload)
    }
  }
  const handleNewAttendeeSubmit = () => {
    const errorState = {firstName: false, lastName: false, email: false}
    if (newAttendeeFirstName === "") {
      errorState.firstName = true
      setNewAttendeeFirstName("")
    }
    if (newAttendeeLastName === "") {
      errorState.lastName = true
      setNewAttendeeLastName("")
    }
    if (
      newAttendeeEmail === "" ||
      !newAttendeeEmail.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      errorState.email = true
      setNewAttendeeEmail("")
    }

    if (!errorState.firstName && !errorState.lastName && !errorState.email) {
      dispatch(
        postRetreatAttendees(
          retreat.id,
          newAttendeeFirstName,
          newAttendeeLastName,
          newAttendeeEmail
        )
      )
      setNewAttendeeEmail("")
      setNewAttendeeFirstName("")
      setNewAttendeeLastName("")
      setAddQueryParam(null)
    }

    setNewAttendeeErrorState(errorState)
  }

  let flightsColumns = [
    {
      field: "arrival",
      headerName: "Flight Arrival",
      width: 160,
      valueGetter: (params: GridValueGetterParams) => {
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
      valueFormatter: (params: GridValueFormatterParams) => {
        return !isNaN(new Date(params.value as string).getTime())
          ? datetimeFormat(new Date(params.value as string))
          : undefined
      },
    },
    {
      field: "departure",
      headerName: "Flight Departure",
      width: 160,
      valueGetter: (params: GridValueGetterParams) => {
        let attendee = params.row
        return attendee.travel &&
          attendee.travel.dep_trip &&
          trips[attendee.travel.dep_trip.id] &&
          trips[attendee.travel.dep_trip.id].trip_legs.length
          ? trips[attendee.travel.dep_trip.id].trip_legs[0].dep_datetime
          : undefined
      },
      valueFormatter: (params: GridValueFormatterParams) => {
        return !isNaN(new Date(params.value as string).getTime())
          ? datetimeFormat(new Date(params.value as string))
          : undefined
      },
    },
    {
      field: "cost",
      headerName: "Flights Cost",
      width: 150,
      valueGetter: (params: GridValueGetterParams) => params.row.travel?.cost,
      valueFormatter: (params: GridValueFormatterParams) => {
        if (params.value) {
          return currencyFormat(params.value as number)
        }
      },
    },
    {
      field: "flight_status",
      headerName: "Flight Status",
      width: 180,
      valueFormatter: (params: GridValueFormatterParams) => {
        if (params.value === "BOOKED") {
          return "Booked"
        } else if (params.value === "PENDING") {
          return "To Book"
        } else if (params.value === "OPT_OUT") {
          return "Opted Out"
        }
      },
      renderCell: (params: GridCellParams) => {
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
    {
      field: "receipts",
      valueFormatter: (params: GridValueFormatterParams) => {
        let value = params.value as FileModel[]
        return value.map((value) => value.file_url).join(" ")
      },
      headerName: "Flight Receipts",
      align: "center",
      width: 180,
      renderCell: (params: GridCellParams) => {
        let attendee = params.row as RetreatAttendeeModel
        return <AttendeeFlightReceiptViewer attendee={attendee} />
      },
    },
  ]

  return (
    <PageBody appBar>
      <div className={classes.section}>
        <div className={classes.header}>
          <Typography variant="h1">Attendees</Typography>
          <div className={classes.pageTitle}>
            <Link
              variant="body1"
              underline="always"
              className={classes.notAttendingButton}
              onClick={() => {
                setOpenNotAttendingModal(true)
              }}>
              View invitees not coming (
              {attendeeTravelInfo &&
                attendeeTravelInfo.filter((attendee) => {
                  return (
                    attendee.info_status === "NOT_ATTENDING" ||
                    attendee.info_status === "CANCELLED"
                  )
                }).length}
              )
            </Link>
          </div>
        </div>
        <div className={classes.dataGridWrapper}>
          <DataGrid
            localeText={{toolbarExport: showExportText ? "Export" : ""}}
            pageSize={50}
            rowsPerPageOptions={[]}
            isRowSelectable={() => false}
            disableColumnSelector
            disableColumnFilter
            disableColumnMenu
            classes={{row: classes.dataGridRow, cell: classes.cell}}
            className={classes.dataGrid}
            components={{Toolbar: CustomToolbarAttendeePage}}
            componentsProps={{
              toolbar: {
                onAddAttendee: () => {
                  setAddQueryParam("single")
                },
                onBatchUploadAttendee: () => {
                  setAddQueryParam("batch")
                },
                searchTerm: attendeeSearchTerm,
                setSearchTerm: setAttendeeSearchTerm,
                showFlights: showFlights,
                setShowFlights: setShowFlights,
                setShowExportText: setShowExportText,
                showResponses: showResponses,
                setShowResponses: setShowResponses,
                isV1: !retreat.attendees_v2_released,
              },
            }}
            onCellClick={(params) => {
              if (params.field !== "actions") {
                dispatch(
                  push(
                    AppRoutes.getPath("RetreatAttendeePage", {
                      retreatIdx: retreatIdx.toString(),
                      attendeeId: params.row.id.toString(),
                    })
                  )
                )
              }
            }}
            rows={attendeeTravelInfo
              .filter((attendee) => {
                let attendeeName = `${
                  attendee.first_name ? attendee.first_name.toLowerCase() : ""
                } ${attendee.last_name ? attendee.last_name.toLowerCase() : ""}`
                return (
                  attendee.info_status !== "NOT_ATTENDING" &&
                  attendee.info_status !== "CANCELLED" &&
                  (attendee.email_address
                    .toLowerCase()
                    .includes(attendeeSearchTerm.toLowerCase()) ||
                    attendeeName
                      .toLowerCase()
                      .includes(attendeeSearchTerm.toLowerCase()))
                )
              })
              .sort((a, b) => {
                let getVal = (val: RetreatAttendeeModel) => {
                  switch (val.info_status) {
                    case "INFO_ENTERED":
                      return 1
                    default:
                      return 0
                  }
                }
                return getVal(b) - getVal(a)
              })}
            columns={[
              {
                field: "first_name",
                headerName: "First name",
                width: 130,
                minWidth: 130,
                flex: 0.86,
              },
              {
                field: "last_name",
                headerName: "Last name",
                width: 130,
                minWidth: 130,
                flex: 0.86,
              },
              {
                field: "email_address",
                headerName: "Email",
                width: 150,
                minWidth: 150,
                flex: 1,
              },
              {
                field: "hotel_check_in",
                headerName: "Hotel Check In",
                width: 170,
                valueGetter: (params) => {
                  if (params.value) {
                    return dateFormat(new Date(params.value as string))
                  }
                },
                minWidth: 165,
                flex: 1.13,
              },
              {
                field: "hotel_check_out",
                headerName: "Hotel Check Out",
                width: 170,
                valueGetter: (params) => {
                  if (params.value) {
                    return dateFormat(new Date(params.value as string))
                  }
                },
                minWidth: 165,
                flex: 1.13,
              },
              {
                field: "info_status",
                headerName: "Registration Status",
                width: 150,
                minWidth: 150,
                flex: 1,
                valueFormatter: (params) => {
                  if (params.value === "INFO_ENTERED") {
                    return "Registered"
                  } else if (params.value === "CREATED") {
                    return "Not Registered"
                  }
                },
                renderCell: (params) => {
                  if (params.value === "INFO_ENTERED") {
                    return (
                      <Chip
                        variant="outlined"
                        label="Registered"
                        className={classes.successChip}
                      />
                    )
                  } else if (params.value === "CREATED") {
                    return (
                      <Chip
                        variant="outlined"
                        label="Not Registered"
                        className={classes.warningChip}
                      />
                    )
                  }
                },
              },
              {
                field: "notes",
                headerName: "Other Notes",
                width: 140,
                hide: true,
                valueGetter: (params) => {
                  let attendee = params.row
                  return allowNewLines(attendee.notes)
                },
              },
              {
                field: "dietary_prefs",
                headerName: "Dietary Restrictions",
                width: 140,
                hide: true,
              },
              ...(showFlights ? (flightsColumns as GridColumns) : []),
              ...(showResponses ? formQuestionColumns : []),
              {
                disableExport: true,
                field: "actions",
                headerName: "",
                width: 50,
                minWidth: 50,
                flex: 0.33,
                sortable: false,
                renderCell: (params) => {
                  return (
                    <DataGridDeleteDropDown
                      onDelete={() => {
                        dispatch(
                          deleteRetreatAttendees(retreat.id, params.row.id)
                        )
                      }}
                    />
                  )
                },
                renderHeader: () => <></>,
              },
            ]}
          />
        </div>
      </div>
      <Dialog open={addDialogOpen} onClose={() => setAddQueryParam(null)}>
        <DialogTitle>
          {batchUploadingPage ? "Batch Upload Attendees" : "Add New Attendee"}
        </DialogTitle>
        <DialogContent>
          {batchUploadingPage ? (
            batchUploadResponse !== undefined ? (
              batchAttendeeResponsetoJSX(batchUploadResponse)
            ) : (
              <>
                <DialogContentText>
                  To batch upload, please upload a CSV or XLSX file. The file
                  should be in the format Email, First Name, Last Name, with no
                  headers.
                </DialogContentText>
                {batchUploadData[0] && (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Email</TableCell>
                          <TableCell>First Name</TableCell>
                          <TableCell>Last Name</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {batchUploadData.slice(0, 3).map((user) => {
                          return (
                            <TableRow>
                              <TableCell>{user.email_address}</TableCell>
                              <TableCell>{user.first_name}</TableCell>
                              <TableCell>{user.last_name}</TableCell>
                            </TableRow>
                          )
                        })}

                        {batchUploadData.length > 3 && (
                          <TableFooter>
                            <div className={classes.uploadPreviewFooter}>
                              ... {batchUploadData.length - 3} more row
                              {batchUploadData.length - 3 > 1 && "s"}
                            </div>
                          </TableFooter>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )
          ) : (
            <>
              <DialogContentText>
                {!retreat.attendees_v2_released
                  ? "To add a new attendee to your retreat please enter their full name and email address below. We'll reach out to them to confirm and fill in some of their information and when they have confirmed their name will be added here."
                  : retreat.registration_live
                  ? "To add a new attendee to your retreat please enter their full name and email address below.  They will be automatically emailed to access their attendee registration form."
                  : "To add a new attendee to your retreat please enter their full name and email address below.  They will be emailed to access their attendee registration form once registration is live."}
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="first_name"
                label="First Name"
                value={newAttendeeFirstName}
                error={newAttendeeErrorState.firstName}
                onChange={(e) => setNewAttendeeFirstName(e.target.value)}
                fullWidth
                variant="standard"
                required
              />
              <TextField
                margin="dense"
                id="last_name"
                label="Last Name"
                value={newAttendeeLastName}
                error={newAttendeeErrorState.lastName}
                onChange={(e) => setNewAttendeeLastName(e.target.value)}
                fullWidth
                variant="standard"
                required
              />
              <TextField
                margin="dense"
                id="email"
                label="Email Address"
                value={newAttendeeEmail}
                error={newAttendeeErrorState.email}
                onChange={(e) => setNewAttendeeEmail(e.target.value)}
                type="email"
                fullWidth
                variant="standard"
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <div className={classes.actionButtonsContainer}>
            {batchUploadingPage && !batchUploadData[0] && !batchUploadResponse && (
              <Button
                href={
                  "https://flok-b32d43c.s3.us-east-1.amazonaws.com/misc/sample-batch-upload.csv"
                }>
                <GetApp />
                &nbsp; Download Sample CSV
              </Button>
            )}
            {batchUploadingPage && batchUploadData[0] && (
              <AppCsvXlsxUpload
                text="Upload New File"
                onUpload={handleFileUploaded}
              />
            )}
            <div className={classes.actionButtons}>
              {batchUploadResponse === undefined &&
                (batchUploadingPage && !batchUploadData[0] ? (
                  <AppCsvXlsxUpload onUpload={handleFileUploaded} />
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={
                      batchUploadingPage
                        ? handleBatchAttendeeSubmit
                        : handleNewAttendeeSubmit
                    }>
                    Submit
                  </Button>
                ))}
              {batchUploadResponse === undefined && (
                <Button
                  onClick={() => {
                    setAddQueryParam(null)
                    setBatchUploadingPage(false)
                    setBatchUploadData([])
                  }}>
                  Cancel
                </Button>
              )}
              {batchUploadResponse !== undefined && (
                <Button
                  onClick={() => {
                    setAddQueryParam(null)
                    setBatchUploadingPage(false)
                    setBatchUploadData([])
                    setBatchUploadResponse(undefined)
                  }}>
                  Done
                </Button>
              )}
            </div>
          </div>
        </DialogActions>
      </Dialog>
      {/* not attending modal below */}
      <div>
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={openNotAttendingModal}
          maxWidth="sm"
          fullWidth>
          <DialogTitle id="customized-dialog-title">
            Invitees not attending
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={() => {
                setOpenNotAttendingModal(false)
              }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers className={classes.notAttendingDialogBody}>
            {attendeeTravelInfo &&
            attendeeTravelInfo.filter((attendee) => {
              return (
                attendee.info_status === "NOT_ATTENDING" ||
                attendee.info_status === "CANCELLED"
              )
            }).length ? (
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableBody>
                    {attendeeTravelInfo &&
                      attendeeTravelInfo
                        .filter((attendee) => {
                          return (
                            attendee.info_status === "NOT_ATTENDING" ||
                            attendee.info_status === "CANCELLED"
                          )
                        })
                        .sort((attendeeA, attendeeB) =>
                          attendeeA.info_status.localeCompare(
                            attendeeB.info_status
                          )
                        )
                        .map((attendee) => (
                          <TableRow key={attendee.id}>
                            <TableCell
                              width={"100%"}
                              component="th"
                              scope="row">
                              {attendee.first_name + " " + attendee.last_name}
                            </TableCell>
                            <TableCell
                              width={"100%"}
                              component="th"
                              scope="row">
                              {attendee.email_address}
                            </TableCell>
                            <TableCell align="right">
                              {attendee.info_status === "CANCELLED" && (
                                <Chip
                                  variant="outlined"
                                  label={"Cancelled"}
                                  className={classes.warningChip}
                                />
                              )}
                            </TableCell>

                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  dispatch(
                                    push(
                                      AppRoutes.getPath("RetreatAttendeePage", {
                                        retreatIdx: retreatIdx.toString(),
                                        attendeeId: attendee.id.toString(),
                                      })
                                    )
                                  )
                                }>
                                Edit <Person />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <p className={classes.allAttendingP}>
                No invitees are registered as not attending
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageBody>
  )
}
export default withRouter(AttendeesPage)

let useToolbarStyles = makeStyles((theme) => ({
  toolbarButton: {
    // styles to match default toolbar buttons such as export
    "&:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.04)",
    },
    fontWeight: 500,
    fontSize: "0.8125rem",
    lineHeight: "1.75",
    textTransform: "uppercase",
    minWidth: "5px",
    borderRadius: "4px",
    color: "#1976d2",
  },
  searchBar: {
    marginLeft: "auto",
    marginRight: theme.spacing(3),
  },
  toolbarContainer: {
    gap: theme.spacing(1.5),
  },
  exportLabel: {
    display: "none",
  },
  startIcon: {
    display: "flex",
    marginLeft: 0,
    marginRight: 0,
  },
}))
type CustomToolbarAttendeePageProps = {
  onAddAttendee: () => void
  onBatchUploadAttendee: () => void
  searchTerm: string
  setSearchTerm: (newValue: string) => void
  setShowFlights: (newValue: boolean) => void
  showFlights: boolean
  setShowExportText: (newVal: boolean) => void
  setShowResponses: (newValue: boolean) => void
  showResponses: boolean
  isV1: boolean
  fields: string[]
}
function CustomToolbarAttendeePage(props: CustomToolbarAttendeePageProps) {
  let classes = useToolbarStyles()
  let [searchExpanded, setSearchExpanded] = useState(false)
  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )
  let {setShowExportText} = props
  useEffect(() => {
    if (!searchExpanded && !isSmallScreen) {
      setShowExportText(true)
    } else {
      setShowExportText(false)
    }
  }, [isSmallScreen, searchExpanded, setShowExportText])
  return (
    <GridToolbarContainer className={classes.toolbarContainer}>
      {!(searchExpanded && isSmallScreen) && (
        <Button onClick={props.onAddAttendee} className={classes.toolbarButton}>
          <Add fontSize="small" />

          {!searchExpanded && !isSmallScreen && <>&nbsp; Add Attendee</>}
        </Button>
      )}
      {!(searchExpanded && isSmallScreen) && (
        <Button
          onClick={props.onBatchUploadAttendee}
          className={classes.toolbarButton}>
          <CloudUpload fontSize="small" />
          {!searchExpanded && !isSmallScreen && (
            <>&nbsp; Batch Upload Attendees</>
          )}
        </Button>
      )}
      {!(searchExpanded && isSmallScreen) && (
        <GridToolbarExport
          csvOptions={{
            allColumns: true,
          }}
          size="medium"
          className={classes.toolbarButton}
          classes={{
            startIcon: clsx(
              searchExpanded || isSmallScreen ? classes.startIcon : undefined
            ),
          }}
          onFocus={() => {
            setSearchExpanded(false)
          }}
        />
      )}
      {!(searchExpanded && isSmallScreen) && !props.isV1 && (
        <div
          onClick={() => {
            props.setShowResponses(!props.showResponses)
          }}
          style={{display: "flex", alignItems: "center", gap: "3px"}}
          className={classes.toolbarButton}>
          <Switch color="primary" size="small" checked={props.showResponses} />
          {searchExpanded || isSmallScreen ? (
            <Dns fontSize="small" />
          ) : (
            "Show Form Response"
          )}
        </div>
      )}
      {!(searchExpanded && isSmallScreen) && !props.isV1 && (
        <div
          style={{display: "flex", alignItems: "center", gap: "3px"}}
          className={classes.toolbarButton}
          onClick={() => {
            props.setShowFlights(!props.showFlights)
          }}>
          <Switch color="primary" size="small" checked={props.showFlights} />
          {searchExpanded || isSmallScreen ? (
            <Flight fontSize="small" />
          ) : (
            "Show Flight Info"
          )}
        </div>
      )}
      {!searchExpanded ? (
        <IconButton
          className={classes.searchBar}
          onClick={() => {
            setSearchExpanded(true)
          }}>
          <Search />
        </IconButton>
      ) : (
        <TextField
          onBlur={() => {
            if (!props.searchTerm) {
              setSearchExpanded(false)
            }
          }}
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
              height: 28,
            },
          }}
        />
      )}
    </GridToolbarContainer>
  )
}
