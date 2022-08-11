import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Typography,
} from "@material-ui/core"
import {useFormik} from "formik"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {RetreatTripLeg, RetreatTripModel} from "../../models/retreat"
import {patchTrip} from "../../store/actions/retreat"
import EditFlightForm from "./EditFlightForm"
import FlightCard from "./FlightCard"

type EditFlightModalProps = {
  open: boolean
  setOpen: (value: boolean) => void
  type: string
  flights: RetreatTripModel
}
let useStyles = makeStyles((theme) => ({
  line: {
    border: "2px solid black",
    margin: theme.spacing(1),
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
  },
  cardLine: {
    display: "flex",
    alignItems: "center",
  },
  editButton: {
    height: "35px",
    [theme.breakpoints.down("sm")]: {
      marginLeft: theme.spacing(1.5),
    },
  },
  tripLegRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    "& > *": {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(2),
    },
  },
  tripLeg: {
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: theme.palette.primary.light,
    paddingBottom: theme.spacing(2),
  },
  trashDiv: {
    textAlign: "right",
  },
}))
function EditFlightModal(props: EditFlightModalProps) {
  let {open, setOpen, type, flights} = props
  function handleClose() {
    setOpen(false)
  }

  let formik = useFormik({
    initialValues: {
      trip_legs: flights?.trip_legs ?? [],
    },
    onSubmit: (values) => {
      let updatedValues = values.trip_legs.map((leg: RetreatTripLeg) => {
        delete leg.duration
        return leg
      })
      setOpen(false)
      dispatch(patchTrip(flights.id, {trip_legs: updatedValues}))
      setSelectedFlight(undefined)
    },
    enableReinitialize: true,
  })

  function handleFlightDelete(index: number) {
    formik.setFieldValue("trip_legs", [
      ...formik.values.trip_legs.filter(
        (leg: RetreatTripLeg, i: number) => i !== index
      ),
    ])
  }

  let classes = useStyles()
  let dispatch = useDispatch()
  const [selectedFlight, setSelectedFlight] = useState<number | undefined>(
    undefined
  )

  function handleCancel(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setSelectedFlight(undefined)
    formik.handleReset(e)
    handleClose()
  }
  function handleAdd() {
    formik.setFieldValue(`trip_legs`, [
      ...formik.values.trip_legs,
      {
        airline: "",
        dep_airport: "",
        arr_airport: "",
        flight_num: "",
        dep_datetime: "",
        arr_datetime: "",
        duration: "",
      },
    ])
    setSelectedFlight(formik.values.trip_legs.length)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Edit {type} Flights </DialogTitle>
        <DialogContent>
          {formik.values.trip_legs?.map((leg: RetreatTripLeg, i: number) => {
            if (i === selectedFlight) {
              return (
                <div key={i}>
                  <hr className={classes.line}></hr>
                  <EditFlightForm
                    idPrefix={`trip_legs[${i}]`}
                    flightLegValues={leg}
                    onFlightDelete={handleFlightDelete}
                    index={i}
                    textFieldProps={{
                      fullWidth: true,
                      InputLabelProps: {shrink: true},
                      onChange: formik.handleChange,
                    }}
                  />
                  <hr className={classes.line}></hr>
                </div>
              )
            }
            return (
              <div className={classes.cardLine} key={i}>
                <FlightCard flight={leg} isEditing={true} />
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  className={classes.editButton}
                  onClick={() => setSelectedFlight(i)}>
                  Edit
                </Button>
              </div>
            )
          })}
          {!formik.values.trip_legs?.length && (
            <Typography>No Flights Currently</Typography>
          )}
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button color="primary" onClick={handleAdd}>
            Add Flight
          </Button>
          <div>
            <Button onClick={handleCancel} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Save
            </Button>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  )
}
export default EditFlightModal
