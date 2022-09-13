import {makeStyles, Typography} from "@material-ui/core"
import {useRouteMatch} from "react-router-dom"
import EmailTemplateForm from "../../components/attendee-site/EmailTemplateForm"
import AppTypography from "../../components/base/AppTypography"
import PageBody from "../../components/page/PageBody"
import config, {
  DEFAULT_FLIGHTS_EMAIL_TEMPLATE,
  DEFAULT_REGISTRATION_EMAIL_TEMPLATE,
} from "../../config"
import NotFound404Page from "../misc/NotFound404Page"
import {useRetreat} from "../misc/RetreatProvider"

let useStyles = makeStyles((theme) => ({
  section: {
    margin: theme.spacing(2),
    "& > *:not(:first-child)": {
      paddingLeft: theme.spacing(1),
    },
    flex: 1,
  },
  templateWrapper: {
    padding: theme.spacing(2),
    maxWidth: "600px",
    marginTop: theme.spacing(2),
  },
}))

const EmailTemplateTypes: {
  [type: string]: {
    defaultId: number
    variable: string
    header: string
    subheader: string
    buttonText?: string
    buttonTooltip?: string
  }
} = {
  registration: {
    defaultId: config.get(DEFAULT_REGISTRATION_EMAIL_TEMPLATE),
    variable: "registration_email_template_id",
    header: "Registration",
    subheader:
      "This template email will be sent to attendees when you go live with registration",
    buttonText: "Register Now!",
    buttonTooltip:
      "Clicking this button will take attendees to the registration form",
  },
  flights: {
    defaultId: config.get(DEFAULT_FLIGHTS_EMAIL_TEMPLATE),
    variable: "flights_email_template_id",
    header: "Flights",
    subheader:
      "This template email will be sent to attendees when you go live with flights",
    buttonText: "Take me there!",
    buttonTooltip:
      "Clicking this button will take attendees to input their flights",
  },
}
export default function EditEmailTemplate() {
  let classes = useStyles()
  let {params} = useRouteMatch<{templateName: string}>()
  let [retreat] = useRetreat()
  if (!EmailTemplateTypes[params.templateName.toLowerCase()]) {
    return <NotFound404Page />
  }
  return (
    <PageBody appBar>
      <div className={classes.section}>
        <div>
          <Typography variant="h1">
            Email Template
            <AppTypography variant="inherit" fontWeight="light">
              {" "}
              - {EmailTemplateTypes[params.templateName.toLowerCase()].header}
            </AppTypography>
          </Typography>

          <Typography variant="body1">
            {EmailTemplateTypes[params.templateName.toLowerCase()].subheader}
          </Typography>
        </div>
        <div className={classes.templateWrapper}>
          <EmailTemplateForm
            type={params.templateName.toLowerCase()}
            typeInfo={EmailTemplateTypes[params.templateName.toLowerCase()]}
            retreatId={retreat.id}
            emailTemplateId={
              retreat[
                EmailTemplateTypes[params.templateName.toLowerCase()]
                  .variable as keyof typeof retreat
              ] as number
            }
          />
        </div>
      </div>
    </PageBody>
  )
}
