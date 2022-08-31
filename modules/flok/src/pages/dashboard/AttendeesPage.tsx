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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core"
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@material-ui/data-grid"
import {Add, CloudUpload, DoneAll, GetApp, Person} from "@material-ui/icons"
import CloseIcon from "@material-ui/icons/Close"
import {Alert} from "@material-ui/lab"
import {push} from "connected-react-router"
import {useEffect, useState} from "react"
import {useDispatch} from "react-redux"
import {withRouter} from "react-router-dom"
import SiteGoLiveButton from "../../components/attendee-site/SiteGoLiveButton"
import AppCsvXlsxUpload from "../../components/base/AppCsvXlsxUpload"
import AttendeeDeleteDropDown from "../../components/lodging/AttendeeDeleteDropdown"
import PageBody from "../../components/page/PageBody"
import {AttendeeBatchUploadApiResponse} from "../../models/api"
import {RetreatAttendeeModel} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {ApiAction} from "../../store/actions/api"
import {
  deleteRetreatAttendees,
  postRetreatAttendees,
  postRetreatAttendeesBatch,
} from "../../store/actions/retreat"
import {useQuery} from "../../utils"
import {useRetreatAttendees} from "../../utils/retreatUtils"
import {useRetreat} from "../misc/RetreatProvider"

function dateFormat(date?: string) {
  if (date === undefined) {
    return ""
  }
  let dateFormatter = Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeZone: "UTC",
  })
  return dateFormatter.format(new Date(date))
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
}))

function AttendeesPage() {
  let classes = useStyles()
  let dispatch = useDispatch()

  let [retreat, retreatIdx] = useRetreat()
  let [addQueryParam, setAddQueryParam] = useQuery("add")

  let [attendeeTravelInfo] = useRetreatAttendees(retreat.id)

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

  return (
    <PageBody appBar>
      <div className={classes.section}>
        <div className={classes.header}>
          <Typography variant="h1">Attendees</Typography>
          <div className={classes.pageTitle}>
            {retreat.attendees_v2_released ? (
              <SiteGoLiveButton
                isLive={retreat.registration_live}
                retreatId={retreat.id}
              />
            ) : undefined}
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
            pageSize={50}
            rowsPerPageOptions={[]}
            isRowSelectable={() => false}
            disableColumnSelector
            disableColumnFilter
            disableColumnMenu
            classes={{row: classes.dataGridRow}}
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
                let attendeeName = `${attendee.first_name.toLowerCase()} ${attendee.last_name.toLowerCase()}`
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
                    return dateFormat(params.value as string)
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
                    return dateFormat(params.value as string)
                  }
                },
                minWidth: 165,
                flex: 1.13,
              },
              {
                field: "info_status",
                headerName: "Status",
                width: 150,
                minWidth: 150,
                flex: 1,
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
                field: "actions",
                headerName: "",
                width: 50,
                minWidth: 50,
                flex: 0.33,
                sortable: false,
                renderCell: (params) => {
                  return (
                    <AttendeeDeleteDropDown
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
    minWidth: "64px",
    padding: "4px 5px",
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
}))
type CustomToolbarAttendeePageProps = {
  onAddAttendee: () => void
  onBatchUploadAttendee: () => void
  searchTerm: string
  setSearchTerm: (newValue: string) => void
}
function CustomToolbarAttendeePage(props: CustomToolbarAttendeePageProps) {
  let classes = useToolbarStyles()
  return (
    <GridToolbarContainer className={classes.toolbarContainer}>
      <Button onClick={props.onAddAttendee} className={classes.toolbarButton}>
        <Add fontSize="small" />
        &nbsp; Add Attendee
      </Button>
      <Button
        onClick={props.onBatchUploadAttendee}
        className={classes.toolbarButton}>
        <CloudUpload fontSize="small" />
        &nbsp; Batch Upload Attendees
      </Button>
      <GridToolbarExport className={classes.toolbarButton} />
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
            height: 28,
          },
        }}
      />
    </GridToolbarContainer>
  )
}
