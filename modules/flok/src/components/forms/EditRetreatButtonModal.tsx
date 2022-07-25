import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@material-ui/core"
import {Edit} from "@material-ui/icons"
import {useFormik} from "formik"
import _ from "lodash"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {RetreatModel} from "../../models/retreat"
import {ApiAction} from "../../store/actions/api"
import {patchRetreat} from "../../store/actions/retreat"
import {getRetreatName} from "../../utils/retreatUtils"
import AppLoadingScreen from "../base/AppLoadingScreen"

type EditRetreatButtonModalProps = {
  retreat: RetreatModel
}
function EditRetreatButtonModal(props: EditRetreatButtonModalProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  let dispatch = useDispatch()
  let formik = useFormik({
    initialValues: {
      retreat_name: getRetreatName(props.retreat),
    },
    onSubmit: async (values) => {
      setLoading(true)
      let submissionValues: {retreat_name: string | undefined} = values
      if (submissionValues.retreat_name === "") {
        submissionValues.retreat_name = undefined
      }
      let response = (await dispatch(
        patchRetreat(props.retreat.id, submissionValues)
      )) as unknown as ApiAction
      setLoading(false)
      if (!response.error) {
        setEditModalOpen(false)
        if (!response.payload.retreat.retreat_name) {
          formik.resetForm()
        }
      }
    },
    enableReinitialize: true,
  })
  return (
    <div>
      <IconButton onClick={() => setEditModalOpen(true)} size="small">
        <Edit fontSize="small" />
      </IconButton>
      <Dialog
        open={editModalOpen}
        fullWidth
        maxWidth="sm"
        onClose={() => {
          setEditModalOpen(false)
        }}>
        <DialogTitle>Edit Retreat Details</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              onChange={formik.handleChange}
              fullWidth
              id={"retreat_name"}
              value={formik.values.retreat_name}
              label="Retreat Name"
            />
            {loading && <AppLoadingScreen />}
          </DialogContent>
          <DialogActions>
            <Button
              type="submit"
              disabled={
                _.isEqual(formik.values, formik.initialValues) || loading
              }>
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}
export default EditRetreatButtonModal
