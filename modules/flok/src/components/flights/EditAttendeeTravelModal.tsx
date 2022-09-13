import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core"
import {HighlightOffRounded} from "@material-ui/icons"
import {useFormik} from "formik"
import NumberFormat from "react-number-format"
import {useDispatch} from "react-redux"
import {RetreatAttendeeModel} from "../../models/retreat"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {ApiAction} from "../../store/actions/api"
import {
  deleteReceiptToAttendee,
  patchAttendee,
  patchAttendeeTravel,
  postReceiptToAttendee,
} from "../../store/actions/retreat"
import {splitFileName} from "../attendee-site/EditWebsiteForm"
import AppUploadFile from "../base/AppUploadFile"

let useStyles = makeStyles((theme) => ({
  textField: {
    width: 300,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      width: 200,
    },
  },
  form: {
    display: "flex",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  receiptContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    maxWidth: 300,
  },
  receiptWrapper: {
    display: "flex",
    marginLeft: theme.spacing(2),
    justifyContent: "space-between",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    alignItems: "center",
  },
  receiptLink: {
    whiteSpace: "nowrap",
    maxWidth: 300,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}))

type EditAttendeeTravelModalProps = {
  open: boolean
  flightStatus: "PENDING" | "OPT_OUT" | "BOOKED"
  flightCost: number
  handleClose: () => void
  receiptRestricted?: boolean
  attendee: RetreatAttendeeModel
  demo?: boolean
}

function EditAttendeeTravelModal(props: EditAttendeeTravelModalProps) {
  let attendeeFlightStateOptions = [
    {value: "PENDING", text: "Not Booked"},
    {value: "OPT_OUT", text: "Opted Out"},
  ]
  if (!props.receiptRestricted || props.attendee.receipts.length > 0) {
    attendeeFlightStateOptions.push({value: "BOOKED", text: "Booked"})
  }
  let dispatch = useDispatch()
  let classes = useStyles()
  let formikAttendee = useFormik({
    initialValues: {
      flight_status: props.flightStatus ?? "PENDING",
    },
    onSubmit: (values) => {
      if (!props.demo) {
        dispatch(patchAttendee(props.attendee.id, values))
      } else {
        dispatch(
          enqueueSnackbar({
            message: "cannot update demo",
            options: {
              variant: "warning",
            },
          })
        )
      }
    },
    enableReinitialize: true,
  })
  let formikTravel = useFormik({
    initialValues: {
      cost: props.flightCost,
    },
    onSubmit: (values) => {
      // @ts-ignore
      if (values.cost === "") {
        // @ts-ignore
        values.cost = null
      }
      dispatch(patchAttendeeTravel(props.attendee.id, values))
    },
    enableReinitialize: true,
  })
  return (
    <Dialog open={props.open} onClose={props.handleClose}>
      <DialogTitle>Edit Trip Details</DialogTitle>
      <DialogContent>
        <form className={classes.form}>
          <TextField
            helperText={
              props.receiptRestricted && props.attendee.receipts.length === 0
                ? "You must submit your receipts before you can change your status to Booked"
                : ""
            }
            select
            variant="outlined"
            value={formikAttendee.values.flight_status}
            id="flight_status"
            onChange={formikAttendee.handleChange}
            className={classes.textField}
            label="Flights Status"
            size="small">
            {attendeeFlightStateOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.text}
              </option>
            ))}
          </TextField>
        </form>
        <form onSubmit={formikTravel.handleSubmit} className={classes.form}>
          <TextField
            variant="outlined"
            value={formikTravel.values.cost}
            id="cost"
            onChange={(e) =>
              formikTravel.setFieldValue(
                "cost",
                isNaN(parseInt(e.target.value)) ? "" : parseInt(e.target.value)
              )
            }
            InputLabelProps={{shrink: true}}
            className={classes.textField}
            label="Flights Cost"
            InputProps={{
              inputComponent: CurrencyNumberFormat as any,
            }}
            size="small"></TextField>
          <div>
            <Typography>Flight Receipts</Typography>
            <div className={classes.receiptContainer}>
              {props.attendee.receipts.map((receipt) => {
                return (
                  <div className={classes.receiptWrapper}>
                    <a
                      href={receipt.file_url}
                      className={classes.receiptLink}
                      rel="noreferrer"
                      target="_blank">
                      {splitFileName(receipt.file_url)}
                    </a>
                    <IconButton
                      onClick={() => {
                        if (!props.demo) {
                          dispatch(
                            deleteReceiptToAttendee(
                              receipt.id,
                              props.attendee.id
                            )
                          )
                        } else {
                          dispatch(
                            enqueueSnackbar({
                              message: "cannot update demo",
                              options: {
                                variant: "warning",
                              },
                            })
                          )
                        }
                      }}
                      size="small">
                      <HighlightOffRounded />
                    </IconButton>
                  </div>
                )
              })}
            </div>
            <AppUploadFile
              type="RECEIPT"
              accepts="image/png, image/jpg, application/pdf, image/jpeg"
              rightText={
                props.attendee.receipts.length === 0 ? "No receipts added" : ""
              }
              id="receipt"
              handleChange={async (file) => {
                if (!props.demo) {
                  let response = (await dispatch(
                    postReceiptToAttendee({
                      attendee_id: props.attendee.id,
                      file_id: file.id,
                    })
                  )) as unknown as ApiAction
                  if (!response.error) {
                    dispatch({
                      type: "ADD_RECEIPT_TO_ATTENDEE",
                      receipt: file,
                      attendee_id: props.attendee.id,
                    })
                  }
                } else {
                  dispatch(
                    enqueueSnackbar({
                      message: "cannot update demo",
                      options: {
                        variant: "warning",
                      },
                    })
                  )
                }
              }}
            />
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <div>
          <Button
            color="primary"
            onClick={() => {
              formikAttendee.resetForm()
              formikTravel.resetForm()
              props.handleClose()
            }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              formikAttendee.handleSubmit()
              formikTravel.handleSubmit()
              props.handleClose()
            }}
            color="primary">
            Save
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  )
}
export default EditAttendeeTravelModal

type CurrencyNumberFormatProps = {
  onChange: (e: {target: {name: string; value: string}}) => void
}

function CurrencyNumberFormat(props: CurrencyNumberFormatProps) {
  const {onChange, ...other} = props
  return (
    <NumberFormat
      {...other}
      onValueChange={(values) => {
        props.onChange({
          target: {name: (other as any).id, value: values.value},
        })
      }}
      thousandSeparator
      isNumericString
      prefix="$"
    />
  )
}
