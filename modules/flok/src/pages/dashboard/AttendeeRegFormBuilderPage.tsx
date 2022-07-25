import {Button, makeStyles, Typography} from "@material-ui/core"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {RouteComponentProps, withRouter} from "react-router-dom"
import SiteGoLiveButton from "../../components/attendee-site/SiteGoLiveButton"
import FormBuilder from "../../components/forms/FormBuilder"
import FormProvider from "../../components/forms/FormProvider"
import PageBody from "../../components/page/PageBody"
import {initializeRegForm} from "../../store/actions/form"
import {useRetreat} from "../misc/RetreatProvider"

let useStyles = makeStyles((theme) => ({
  body: {
    margin: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(0.5),
    },
  },
  createFormButton: {
    marginTop: theme.spacing(2),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
  },
}))

type AttendeesRegFormBuilderProps = RouteComponentProps<{retreatIdx: string}>
function AttendeesRegFormBuilderPage(props: AttendeesRegFormBuilderProps) {
  let dispatch = useDispatch()
  let classes = useStyles()
  let [loadingCreateForm, setLoadingCreateForm] = useState(false)
  let [retreat] = useRetreat()

  return (
    <PageBody appBar>
      <div className={classes.body}>
        <div className={classes.header}>
          <Typography variant="h1">Attendee Registration Form</Typography>
          <SiteGoLiveButton
            retreatId={retreat.id}
            isLive={retreat.registration_live}
          />
        </div>
        {retreat.attendees_registration_form_id != null ? (
          <FormProvider formId={retreat.attendees_registration_form_id}>
            <FormBuilder />
          </FormProvider>
        ) : (
          <Button
            className={classes.createFormButton}
            variant="contained"
            color="primary"
            onClick={() => {
              async function postNewForm() {
                setLoadingCreateForm(true)
                await dispatch(initializeRegForm(retreat.id))
                setLoadingCreateForm(false)
              }
              postNewForm()
            }}
            disabled={loadingCreateForm}>
            Create Registration Form
          </Button>
        )}
      </div>
    </PageBody>
  )
}

export default withRouter(AttendeesRegFormBuilderPage)
