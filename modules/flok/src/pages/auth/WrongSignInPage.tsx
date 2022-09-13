import {
  Dialog,
  DialogContent,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core"
import {Alert} from "@material-ui/lab"
import {useEffect} from "react"
import {useDispatch, useSelector} from "react-redux"
import {Link as ReactRouterLink} from "react-router-dom"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getWebsiteByAttendee} from "../../store/actions/retreat"

let useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100%",
    minWidth: "100%",
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(2),
    flexDirection: "column",
  },
  warning: {
    marginLeft: "auto",
    marginRight: "auto",
  },
  listItem: {},
}))

type WrongSignInPageProps = {
  attendeeIds: number[]
}
function WrongSignInPage(props: WrongSignInPageProps) {
  let classes = useStyles()
  let dispatch = useDispatch()
  useEffect(() => {
    props.attendeeIds.forEach((attendeeId) => {
      dispatch(getWebsiteByAttendee(attendeeId))
    })
  }, [dispatch, props.attendeeIds])
  let websites = useSelector((state: RootState) => {
    return Object.values(state.retreat.websites)
  })
  return (
    <div className={classes.root}>
      <Dialog open={true} fullWidth maxWidth="sm">
        <DialogContent>
          <Alert severity="warning" className={classes.warning}>
            Oops, looks like you have tried to sign in to the RMC dashboard, did
            you mean to go to one of your retreat websites?
          </Alert>
          <ul>
            {websites
              .filter((website) => website !== undefined)
              .map((website) => {
                return (
                  <li className={classes.listItem}>
                    <Link
                      component={ReactRouterLink}
                      to={AppRoutes.getPath("AttendeeSiteHome", {
                        retreatName: website!.name,
                      })}>
                      <Typography>{website!.name}</Typography>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default WrongSignInPage
