import {makeStyles} from "@material-ui/core"
import AppTypography from "./AppTypography"

let useStyles = makeStyles((theme) => ({
  subtext: {
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(1),
  },
}))

type AppListItemStepProps = {
  title: string
  subtext?: string
  children?: React.ReactNode
}
function AppListItemStep(props: AppListItemStepProps) {
  let classes = useStyles()
  return (
    <div>
      <AppTypography variant="h4" fontWeight="bold" className={classes.title}>
        {props.title}
      </AppTypography>
      {props.subtext && (
        <AppTypography className={classes.subtext}>
          {props.subtext}
        </AppTypography>
      )}
      {props.children}
    </div>
  )
}
export default AppListItemStep
