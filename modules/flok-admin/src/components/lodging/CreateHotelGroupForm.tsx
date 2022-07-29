import {Button, makeStyles, TextField} from "@material-ui/core"
import {useFormik} from "formik"
import {useDispatch} from "react-redux"
import {postHotelGroup} from "../../store/actions/admin"
import {ApiAction} from "../../store/actions/api"

let useStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    marginBottom: theme.spacing(2),
    alignItems: "center",
  },
  textField: {
    marginRight: theme.spacing(2),
  },
}))
type CreateHotelGroupFormProps = {
  retreatId: number
  onSubmit?: () => void
}
function CreateHotelGroupForm(props: CreateHotelGroupFormProps) {
  let classes = useStyles()
  let dispatch = useDispatch()
  let formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: "",
    },
    onSubmit: async (values) => {
      let response = (await dispatch(
        postHotelGroup({...values, retreat_id: props.retreatId})
      )) as unknown as ApiAction
      if (!response.error && props.onSubmit) {
        props.onSubmit()
      }
    },
  })
  return (
    <form onSubmit={formik.handleSubmit} className={classes.form}>
      <TextField
        onChange={formik.handleChange}
        id="title"
        label="Group Title"
        fullWidth
        className={classes.textField}
      />
      <Button type="submit" variant="outlined" color="primary">
        Submit
      </Button>
    </form>
  )
}
export default CreateHotelGroupForm
