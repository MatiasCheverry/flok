import {makeStyles, Paper, Typography} from "@material-ui/core"
import {useRouteMatch} from "react-router-dom"
import AppEmailTemplateForm from "../../components/base/AppEmailTemplateForm"
import AppTypography from "../../components/base/AppTypography"
import PageBody from "../../components/page/PageBody"
import {theme} from "../../theme"

let useStyles = makeStyles((theme) => ({
  section: {
    margin: theme.spacing(2),
    "& > *:not(:first-child)": {
      paddingLeft: theme.spacing(1),
    },
    flex: 1,
  },
}))
export default function EditEmailTemplate() {
  let classes = useStyles()
  let {params} = useRouteMatch<{templateName: string}>()
  return (
    <PageBody appBar>
      <div className={classes.section}>
        <div>
          <Typography variant="h1">
            Email Template
            <AppTypography variant="inherit" fontWeight="light">
              {" "}
              - {params.templateName}
            </AppTypography>
          </Typography>

          <Typography variant="body1">
            This template will update the email sent to attendees when flights
            registration goes live
          </Typography>
        </div>
        <Paper
          style={{
            padding: theme.spacing(2),
            maxWidth: "800px",
            marginTop: theme.spacing(2),
          }}>
          <AppEmailTemplateForm />
        </Paper>
      </div>
    </PageBody>
  )
}
