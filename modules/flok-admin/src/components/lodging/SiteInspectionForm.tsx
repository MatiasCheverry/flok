import {Button, makeStyles, TextField} from "@material-ui/core"
import {useFormik} from "formik"
import _ from "lodash"
import {useDispatch} from "react-redux"
import * as yup from "yup"
import {AdminRetreatModel} from "../../models"
import {patchRetreatDetails} from "../../store/actions/admin"
import {getTextFieldErrorProps} from "../../utils"

let useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(2),
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
    borderRadius: theme.shape.borderRadius,
  },
}))

type SiteInspectionFormProps = {
  retreat: AdminRetreatModel
}
function SiteInspectionForm(props: SiteInspectionFormProps) {
  let dispatch = useDispatch()
  let classes = useStyles()
  let formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      lodging_site_inspection_url:
        props.retreat.lodging_site_inspection_url ?? "",
    },
    validationSchema: yup.object({
      lodging_site_inspection_url: yup
        .string()
        .url("Valid URL is required.")
        .nullable(),
    }),
    onSubmit: async (vals, formikHelpers) => {
      formikHelpers.setSubmitting(true)
      let newVals: {lodging_site_inspection_url: string | undefined} = vals
      if (vals.lodging_site_inspection_url === "") {
        newVals.lodging_site_inspection_url = undefined
      } else {
        newVals.lodging_site_inspection_url = vals.lodging_site_inspection_url
      }
      await dispatch(patchRetreatDetails(props.retreat.id, newVals))
      formikHelpers.setSubmitting(false)
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className={classes.root}>
      <TextField
        InputLabelProps={{shrink: true}}
        onChange={formik.handleChange}
        fullWidth
        id="lodging_site_inspection_url"
        label="Site Inspection Link"
        value={formik.values.lodging_site_inspection_url}
        {...getTextFieldErrorProps(formik, "lodging_site_inspection_url")}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={
          _.isEqual(formik.initialValues, formik.values) || !formik.isValid
        }>
        Save Changes
      </Button>
    </form>
  )
}
export default SiteInspectionForm
