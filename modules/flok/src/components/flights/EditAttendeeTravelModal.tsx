import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  TextField,
} from "@material-ui/core"
import {useFormik} from "formik"
import NumberFormat from "react-number-format"
import {useDispatch} from "react-redux"
import {ApiAction} from "../../store/actions/api"
import {
  patchAttendee,
  patchAttendeeTravel,
  postReceiptToAttendee,
} from "../../store/actions/retreat"
import {UploadImage} from "../attendee-site/EditWebsiteForm"

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
}))

type EditAttendeeTravelModalProps = {
  open: boolean
  flightStatus: "PENDING" | "OPT_OUT" | "BOOKED"
  flightCost: number
  attendeeId: number
  handleClose: () => void
  numberOfReceipts: number
  receiptRestricted?: boolean
}
const attendeeFlightStateOptions = [
  {value: "PENDING", text: "Not Booked"},
  {value: "OPT_OUT", text: "Opted Out"},
  {value: "BOOKED", text: "Booked"},
]
function EditAttendeeTravelModal(props: EditAttendeeTravelModalProps) {
  let dispatch = useDispatch()
  let classes = useStyles()
  let formikAttendee = useFormik({
    initialValues: {
      flight_status: props.flightStatus ?? "PENDING",
    },
    onSubmit: (values) => {
      dispatch(patchAttendee(props.attendeeId, values))
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
      dispatch(patchAttendeeTravel(props.attendeeId, values))
    },
    enableReinitialize: true,
  })
  return (
    <Dialog open={props.open} onClose={props.handleClose}>
      <DialogTitle>Edit Trip Details</DialogTitle>
      <DialogContent>
        <form className={classes.form}>
          <TextField
            disabled={props.receiptRestricted && props.numberOfReceipts === 1}
            helperText={
              props.receiptRestricted && props.numberOfReceipts === 1
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
          <UploadImage
            multiple
            multipleNumber={props.numberOfReceipts}
            file
            id="receipt"
            value={undefined}
            handleChange={async (file) => {
              let response = (await dispatch(
                postReceiptToAttendee({
                  attendee_id: props.attendeeId,
                  file_id: file.id,
                })
              )) as unknown as ApiAction
              if (!response.error) {
                dispatch({
                  type: "ADD_RECEIPT_TO_ATTENDEE",
                  receipt: file,
                  attendee_id: props.attendeeId,
                })
              }
            }}
            headerText="Upload Receipt"
          />
        </form>
        {/* <div>
          <Document
            file={{
              url: "https://flok-b32d43c.s3.amazonaws.com/andrew-busel-standard-resume_2-6100ae1c.pdf",
            }}
            onLoadError={(error) =>
              alert("Error while loading page! " + error.message)
            }
            onLoadSuccess={() => {}}>
            <Page pageNumber={1} />
          </Document>
          <p>
            Page {1} of {2}
          </p>
        </div> */}
        {/* <object
          data="https://flok-b32d43c.s3.amazonaws.com/andrew-busel-standard-resume_2-6100ae1c.pdf"
          type="application/pdf"
          width="100%"
          height="100%">
          <p>
            Alternative text - include a link{" "}
            <a href="https://flok-b32d43c.s3.amazonaws.com/andrew-busel-standard-resume_2-6100ae1c.pdf">
              to the PDF!
            </a>
          </p>
        </object> */}
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
