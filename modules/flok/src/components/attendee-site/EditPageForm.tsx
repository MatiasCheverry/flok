import {Button, makeStyles, TextField} from "@material-ui/core"
import {push} from "connected-react-router"
import {useFormik} from "formik"
import _ from "lodash"
import {useDispatch} from "react-redux"
import * as yup from "yup"
import {AppRoutes} from "../../Stack"
import {patchPage} from "../../store/actions/retreat"
import {getTextFieldErrorProps} from "../../utils"
import {useAttendeeLandingPage} from "../../utils/retreatUtils"

let useStyles = makeStyles((theme) => ({
  body: {
    display: "flex",
    flexDirection: "column",
  },
  textField: {
    minWidth: "200px",
    "&:not(:first-child)": {
      marginTop: theme.spacing(2),
    },
  },
  saveButton: {
    marginTop: theme.spacing(2),
  },
}))

type EditPageFormProps = {
  pageId: number
  retreatIdx: string
  currentPageId: string
}

function EditPageForm(props: EditPageFormProps) {
  let dispatch = useDispatch()
  let classes = useStyles()
  let [page, pageLoading] = useAttendeeLandingPage(props.pageId)
  let disabledChange: boolean =
    page?.title !== undefined && page.title.toLowerCase() === "home"
  let formik = useFormik({
    initialValues: {
      title: page?.title ?? "",
    },
    onSubmit: (values) => {
      dispatch(patchPage(props.pageId, values))
      dispatch(
        push(
          AppRoutes.getPath("LandingPageGeneratorConfig", {
            retreatIdx: props.retreatIdx.toString(),
            currentPageId: props.currentPageId,
          })
        )
      )
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
    <form onSubmit={formik.handleSubmit}>
      <div className={classes.body}>
        <TextField
          required
          value={formik.values.title}
          id={`title`}
          onChange={formik.handleChange}
          variant="outlined"
          label="Page Name"
          className={classes.textField}
          disabled={disabledChange}
          {...getTextFieldErrorProps(formik, "title")}
        />
        {!disabledChange && (
          <Button
            type="submit"
            color="primary"
            variant="contained"
            className={classes.saveButton}
            disabled={_.isEqual(formik.values, formik.initialValues)}>
            Save
          </Button>
        )}
      </div>
    </form>
  )
}
export default EditPageForm
