import {Button, IconButton, Link, Typography} from "@material-ui/core"
import {Settings} from "@material-ui/icons"
import AppTypography from "./AppTypography"

type AppHeaderWithSettingsProps = {
  primaryHeader: string
  secondaryHeader?: string
  terciaryHeader?: string
  onClickSettings: () => void
  viewPageLink?: string
}

export default function AppHeaderWithSettings(
  props: AppHeaderWithSettingsProps
) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}>
      <div>
        <Typography variant="h1">
          {props.primaryHeader}
          {props.secondaryHeader && (
            <AppTypography variant="inherit" fontWeight="light">
              {" "}
              - {props.secondaryHeader}
            </AppTypography>
          )}
        </Typography>
        {props.terciaryHeader && (
          <Typography variant="body1">{props.terciaryHeader}</Typography>
        )}
      </div>
      <div>
        {props.viewPageLink && (
          <Link href={props.viewPageLink} target="landing-page">
            <Button variant="outlined" color="primary" size="small">
              View Page
            </Button>
          </Link>
        )}
        <IconButton onClick={props.onClickSettings}>
          <Settings fontSize="large" />
        </IconButton>
      </div>
    </div>
  )
}
