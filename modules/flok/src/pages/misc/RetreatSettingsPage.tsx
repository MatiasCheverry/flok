import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core"
import {
  DataGrid,
  GridRowData,
  GridToolbarContainer,
} from "@material-ui/data-grid"
import {Add} from "@material-ui/icons"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import * as yup from "yup"
import AppConfirmationModal from "../../components/base/ConfirmationModal"
import DataGridDeleteDropDown from "../../components/lodging/DataGridDeleteDropdown"
import PageBody from "../../components/page/PageBody"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {RootState} from "../../store"
import {ApiAction} from "../../store/actions/api"
import {
  deleteUser,
  getUser,
  patchRetreat,
  postUser,
} from "../../store/actions/retreat"
import {getRetreatName} from "../../utils/retreatUtils"
import {useRetreat} from "./RetreatProvider"

let useStyles = makeStyles((theme) => ({
  section: {
    margin: theme.spacing(2),
    flex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dataGrid: {
    backgroundColor: theme.palette.common.white,
    "&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
      outline: "none",
    },
    margin: theme.spacing(2),
    height: "60%",
    maxWidth: "900px",
    [theme.breakpoints.down("sm")]: {
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  settingsHeader: {
    marginTop: theme.spacing(2),
  },
  settingsPaper: {
    paddingLeft: theme.spacing(1),
    maxWidth: "900px",
    margin: theme.spacing(2),
    paddingRight: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      marginLeft: "auto",
      marginRight: "auto",
      width: "100%",
    },
  },
  settingsForm: {
    display: "flex",
    alignItems: "center",
  },
  settingsField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  subheader: {
    color: theme.palette.grey[700],
  },
}))
export default function RetreatSettingsPage() {
  let classes = useStyles()
  let dispatch = useDispatch()
  let [retreat] = useRetreat()
  let [confirmDeleteUserOpen, setConfirmDeleteUserOpen] = useState<
    [boolean, number | undefined]
  >([false, undefined])
  let [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  let formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
    },
    onSubmit: async (values, helpers) => {
      let postValues = {...values, retreat_id: retreat.id}
      let response = (await dispatch(
        postUser(postValues, retreat.id)
      )) as unknown as ApiAction
      if (!response.error) {
        helpers.resetForm()
        setAddUserDialogOpen(false)
      } else {
        dispatch(
          enqueueSnackbar({
            message: "Oops, something went wrong",
            options: {
              variant: "error",
            },
          })
        )
      }
    },
    validationSchema: yup.object({
      email: yup.string().required().email(),
      first_name: yup.string().required(),
      last_name: yup.string().required(),
    }),
  })

  let formikRetreatDetails = useFormik({
    enableReinitialize: true,
    initialValues: {
      retreat_name: getRetreatName(retreat),
    },
    onSubmit: async (values, helpers) => {
      dispatch(patchRetreat(retreat.id, values))
    },
    validationSchema: yup.object({
      retreat_name: yup.string().required(),
    }),
  })

  let users = useSelector((state: RootState) => {
    return state.retreat.users
  })
  let name = getRetreatName(retreat)

  useEffect(() => {
    if (retreat.users) {
      retreat.users.forEach((userId) => {
        if (!users[userId]) {
          dispatch(getUser(userId))
        }
      })
    }
  }, [dispatch, retreat.users, users])

  let currentUserId = useSelector((state: RootState) => {
    return state.user.user?.id
  })

  return (
    <PageBody appBar>
      <div className={classes.section}>
        <div className={classes.header}>
          <Typography variant="h1">Settings</Typography>
        </div>
        <AppConfirmationModal
          open={confirmDeleteUserOpen[0]}
          onClose={() => {
            setConfirmDeleteUserOpen([false, undefined])
          }}
          onSubmit={async () => {
            if (confirmDeleteUserOpen[1]) {
              let response = (await dispatch(
                deleteUser(confirmDeleteUserOpen[1], retreat.id)
              )) as unknown as ApiAction
              if (!response.error) {
                setConfirmDeleteUserOpen([false, undefined])
              } else {
                dispatch(
                  enqueueSnackbar({
                    message: "Oops, something went wrong",
                    options: {
                      variant: "error",
                    },
                  })
                )
              }
            }
          }}
          title={`Are you sure you wish to remove this user?`}
          text="This action cannot be undone."
        />
        <Typography variant="h3" className={classes.settingsHeader}>
          Retreat Settings
        </Typography>
        <Paper className={classes.settingsPaper}>
          <form
            onSubmit={formikRetreatDetails.handleSubmit}
            className={classes.settingsForm}>
            <TextField
              className={classes.settingsField}
              InputLabelProps={{shrink: true}}
              defaultValue={name}
              id="retreat_name"
              onChange={formikRetreatDetails.handleChange}
              label="Retreat Name"
              fullWidth
              variant="outlined"></TextField>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              disabled={_.isEqual(
                formikRetreatDetails.values,
                formikRetreatDetails.initialValues
              )}>
              Save
            </Button>
          </form>
        </Paper>
        <Typography variant="h3">Users</Typography>
        <Typography variant="body2" className={classes.subheader}>
          Manage who can access {retreat.company_name}'s dashboard
        </Typography>
        <Dialog
          open={addUserDialogOpen}
          onClose={() => {
            setAddUserDialogOpen(false)
          }}>
          <DialogTitle>Add New User</DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <DialogContentText>
                To add a new user to your retreat please enter their full name
                and email address below. They will be automatically emailed to
                access the retreat dashboard.
              </DialogContentText>

              <TextField
                autoFocus
                margin="dense"
                id="first_name"
                label="First Name"
                value={formik.values.first_name}
                error={!!formik.errors.first_name}
                onChange={formik.handleChange}
                fullWidth
                variant="standard"
                required
              />
              <TextField
                margin="dense"
                id="last_name"
                label="Last Name"
                value={formik.values.last_name}
                error={!!formik.errors.last_name}
                onChange={formik.handleChange}
                fullWidth
                variant="standard"
                required
              />
              <TextField
                margin="dense"
                id="email"
                label="Email Address"
                value={formik.values.email}
                error={!!formik.errors.email}
                onChange={formik.handleChange}
                type="email"
                fullWidth
                variant="standard"
                required
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <DataGrid
          pageSize={50}
          rowsPerPageOptions={[]}
          isRowSelectable={() => false}
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          className={classes.dataGrid}
          components={{Toolbar: CustomToolbarSettingsPage}}
          componentsProps={{
            toolbar: {
              onAddUser: () => {
                setAddUserDialogOpen(true)
              },
            },
          }}
          rows={
            retreat.users
              .map((user) => {
                if (users) {
                  return users[user]
                }
              })
              .filter((user) => user) as GridRowData[]
          }
          columns={[
            {
              field: "first_name",
              headerName: "First name",
              width: 150,
              flex: 1,
            },
            {
              field: "last_name",
              headerName: "First name",
              width: 150,
              flex: 1,
            },
            {
              field: "email",
              headerName: "Email",
              width: 200,
              flex: 1,
            },
            {
              field: "actions",
              headerName: "",
              width: 50,
              flex: 0.25,
              sortable: false,
              renderCell: (params) => {
                if (params.id !== currentUserId) {
                  return (
                    <DataGridDeleteDropDown
                      onDelete={() => {
                        setConfirmDeleteUserOpen([true, params.id as number])
                      }}
                      text={"Delete User"}
                    />
                  )
                } else {
                  return <></>
                }
              },
              renderHeader: () => <></>,
            },
          ]}
        />
      </div>
    </PageBody>
  )
}

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
  onAddUser: () => void
}
function CustomToolbarSettingsPage(props: CustomToolbarAttendeePageProps) {
  let classes = useToolbarStyles()
  return (
    <GridToolbarContainer className={classes.toolbarContainer}>
      <Button onClick={props.onAddUser} className={classes.toolbarButton}>
        <Add fontSize="small" />
        &nbsp; Add User
      </Button>
    </GridToolbarContainer>
  )
}
