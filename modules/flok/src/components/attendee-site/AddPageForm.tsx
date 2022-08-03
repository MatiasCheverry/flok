import {Button, makeStyles, TextField} from "@material-ui/core"
import {push} from "connected-react-router"
import {useFormik} from "formik"
import {useDispatch} from "react-redux"
import * as yup from "yup"
import {AppRoutes} from "../../Stack"
import {ApiAction} from "../../store/actions/api"
import {postPage} from "../../store/actions/retreat"
import {getTextFieldErrorProps} from "../../utils"

let useStyles = makeStyles((theme) => ({
  addNew: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
  },
}))
type AddPageFormProps = {
  websiteId: number
  retreatIdx: number
  websitePageIds: number[]
}
function AddPageForm(props: AddPageFormProps) {
  let classes = useStyles()
  let dispatch = useDispatch()
  async function handleAddPage(values: {title: string}) {
    let result = (await dispatch(
      postPage({...values, website_id: props.websiteId})
    )) as unknown as ApiAction
    if (!result.error) {
      dispatch(
        push(
          AppRoutes.getPath("LandingPageGeneratorPage", {
            retreatIdx: props.retreatIdx.toString(),
            currentPageIdx: props.websitePageIds.length.toString(),
          })
        )
      )
    }
  }
  let formik = useFormik({
    initialValues: {
      title: "",
    },
    onSubmit: (values) => {
      handleAddPage(values)
    },
    validationSchema: yup.object({
      title: yup
        .string()
        .required()
        .matches(
          /^[aA-zZ\s0-9]+$/,
          "Can only contain letters, numbers, or spaces"
        ),
    }),
  })
  return (
    <form onSubmit={formik.handleSubmit} className={classes.addNew}>
      <TextField
        variant="outlined"
        value={formik.values.title}
        id="title"
        onChange={formik.handleChange}
        label="New Page Title"
        size="small"
        {...getTextFieldErrorProps(formik, "title")}
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={formik.values.title === ""}
        size="small">
        Add New Page
      </Button>
    </form>
  )
}
export default AddPageForm
