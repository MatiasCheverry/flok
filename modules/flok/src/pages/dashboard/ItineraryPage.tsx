import {Button, List, makeStyles, TextField} from "@material-ui/core"
import {push} from "connected-react-router"
import {useFormik} from "formik"
import _ from "lodash"
import {useState} from "react"
import {useDispatch} from "react-redux"
import * as yup from "yup"
import AppListItemStep from "../../components/base/AppListItemStep"
import AppLoadingScreen from "../../components/base/AppLoadingScreen"
import AppTypography from "../../components/base/AppTypography"
import AppConfirmationModal from "../../components/base/ConfirmationModal"
import PageBody from "../../components/page/PageBody"
import {AppRoutes} from "../../Stack"
import {ApiAction} from "../../store/actions/api"
import {patchRetreat} from "../../store/actions/retreat"
import {getTextFieldErrorProps} from "../../utils"
import {useRetreat} from "../misc/RetreatProvider"

let useStyles = makeStyles((theme) => ({
  section: {
    margin: theme.spacing(2),
    "& > *:not(:first-child)": {
      paddingLeft: theme.spacing(1),
    },
    "& > *": {
      marginBottom: theme.spacing(2),
    },
  },
  overviewHeader: {},
  list: {
    width: "85%",
    marginLeft: theme.spacing(2),
  },
  form: {
    display: "flex",
    alignItems: "center",
  },
  textField: {
    width: "60%",
    marginBottom: "auto",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  submissionButton: {
    marginLeft: theme.spacing(1),
  },
}))

function ItineraryPage() {
  let [retreat, retreatIdx] = useRetreat()
  let dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  let classes = useStyles()
  let formik = useFormik({
    initialValues: {
      itinerary_final_draft_link: retreat.itinerary_final_draft_link ?? "",
    },
    onSubmit: async (values) => {
      setLoading(true)
      let response = (await dispatch(
        patchRetreat(retreat.id, values)
      )) as unknown as ApiAction
      setLoading(false)
      if (!response.error) {
        window.open(
          response.payload.retreat.itinerary_final_draft_link,
          "_blank"
        )
        dispatch(
          push(
            AppRoutes.getPath("RetreatHomePage", {
              retreatIdx: retreatIdx.toString(),
            })
          )
        )
      }
    },
    validationSchema: yup.object().shape({
      itinerary_final_draft_link: yup.string().url("Enter a valid url"),
    }),
  })
  let [confirmationModalOpen, setConfirmationModalOpen] = useState(false)

  return (
    <PageBody appBar>
      <div className={classes.section}>
        <div className={classes.overviewHeader}>
          <AppTypography variant="h1">Itinerary</AppTypography>
        </div>
        <List className={classes.list}>
          <AppListItemStep
            title="Create Google Document"
            subtext="Please create your own Google Document and add the link below. Make sure that your Flok event planners have edit access. This itinerary will become available to your retreat attendees on the Attendee Landing Page once it is finalized."
          />
          <AppListItemStep
            title=""
            subtext="This itinerary will become available to your retreat attendees on the Retreat Landing Page once it is finalized."
          />
          <AppListItemStep title="Upload Itinerary Link" subtext="">
            <form
              className={classes.form}
              onSubmit={(e) => {
                e.preventDefault()
                setConfirmationModalOpen(true)
              }}>
              <TextField
                variant="outlined"
                label="Itinerary Final Draft Link"
                fullWidth
                className={classes.textField}
                value={formik.values.itinerary_final_draft_link}
                onChange={formik.handleChange}
                id="itinerary_final_draft_link"
                {...getTextFieldErrorProps(
                  formik,
                  "itinerary_final_draft_link"
                )}
              />
              {loading && <AppLoadingScreen />}
              <Button
                className={classes.submissionButton}
                disabled={_.isEqual(formik.values, formik.initialValues)}
                variant="outlined"
                color="primary"
                type="submit">
                Submit
              </Button>
            </form>
          </AppListItemStep>
        </List>

        <AppConfirmationModal
          title="Confirm Submission"
          text={`Are you sure you wish to submit ${formik.values.itinerary_final_draft_link} as your itinerary final draft link?  This cannot be changed without Flok support.`}
          onClose={() => setConfirmationModalOpen(false)}
          onSubmit={() => {
            formik.handleSubmit()
            setConfirmationModalOpen(false)
          }}
          open={confirmationModalOpen}
        />
      </div>
    </PageBody>
  )
}
export default ItineraryPage
