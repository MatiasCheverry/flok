import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core"
import {useFormik} from "formik"
import {useDispatch} from "react-redux"
import {postLocation} from "../../store/actions/admin"

let useStyles = makeStyles((theme) => ({
  textField: {
    marginTop: theme.spacing(2),
  },
}))

type AddPastItineraryLocationFormProps = {
  open: boolean
  onClose: () => void
}

function AddPastItineraryLocationForm(
  props: AddPastItineraryLocationFormProps
) {
  let dispatch = useDispatch()
  let classes = useStyles()
  let formik = useFormik({
    initialValues: {
      name: "",
    },
    onSubmit: (values) => {
      let submissionValues: {
        name: string
      } = values
      dispatch(postLocation(submissionValues))
      formik.resetForm()
      props.onClose()
    },
  })

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Typography variant="h2" paragraph>
            Add new location
          </Typography>
          <TextField
            fullWidth
            id={`name`}
            value={formik.values.name}
            label="Location"
            onChange={formik.handleChange}
            className={classes.textField}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              props.onClose()
              formik.resetForm()
            }}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
export default AddPastItineraryLocationForm
