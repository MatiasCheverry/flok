import {Button, Drawer, makeStyles} from "@material-ui/core"
import {Email} from "@material-ui/icons"
import {push} from "connected-react-router"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {RouteComponentProps, useRouteMatch, withRouter} from "react-router-dom"
import SiteGoLiveButton from "../../components/attendee-site/SiteGoLiveButton"
import AppHeaderWithSettings from "../../components/base/AppHeaderWithSettings"
import FormBuilder from "../../components/forms/FormBuilder"
import FormProvider from "../../components/forms/FormProvider"
import PageBody from "../../components/page/PageBody"
import {AppRoutes} from "../../Stack"
import {initializeRegForm} from "../../store/actions/form"
import {theme} from "../../theme"
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
  let retreatIdx = props.match.params.retreatIdx
  let [loadingCreateForm, setLoadingCreateForm] = useState(false)
  let [retreat] = useRetreat()
  let {path} = useRouteMatch()
  let config =
    path === AppRoutes.getPath("RetreatAttendeesRegFormBuilderConfig")

  return (
    <PageBody appBar>
      <div className={classes.body}>
        <Drawer
          anchor="right"
          open={config}
          onClose={() => {
            dispatch(
              push(
                AppRoutes.getPath("RetreatAttendeesRegFormBuilderPage", {
                  retreatIdx: retreatIdx.toString(),
                })
              )
            )
          }}>
          <div
            style={{
              padding: theme.spacing(2),
              display: "flex",
              flexDirection: "column",
            }}>
            <SiteGoLiveButton
              retreatId={retreat.id}
              isLive={retreat.registration_live}
            />
            <Button
              variant="outlined"
              color="primary"
              style={{marginTop: theme.spacing(2)}}
              href={AppRoutes.getPath("EmailTemplatePage", {
                retreatIdx: retreatIdx.toString(),
                templateName: "Registration",
              })}>
              <Email fontSize="small" /> Edit Email Template
            </Button>
          </div>
        </Drawer>
        <div className={classes.header}>
          <AppHeaderWithSettings
            primaryHeader="Attendees"
            secondaryHeader="Registration Form"
            terciaryHeader="Create a registration form for your team"
            onClickSettings={() => {
              dispatch(
                push(
                  AppRoutes.getPath("RetreatAttendeesRegFormBuilderConfig", {
                    retreatIdx: retreatIdx.toString(),
                  })
                )
              )
            }}
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
