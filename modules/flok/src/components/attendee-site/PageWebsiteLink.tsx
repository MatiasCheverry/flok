import {IconButton, Link, makeStyles, Typography} from "@material-ui/core"
import {Settings} from "@material-ui/icons"
import {push} from "connected-react-router"
import {useDispatch} from "react-redux"
import {Link as RouterLink} from "react-router-dom"
import {AppRoutes} from "../../Stack"
import {useAttendeeLandingPage} from "../../utils/retreatUtils"

let useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    flex: 1,
    overflow: "hidden",
  },
  pageNav: {
    marginLeft: theme.spacing(2),
    display: "flex",
    flexDirection: "row",
  },
  pageTitleText: {
    paddingTop: theme.spacing(1.5),
    color: theme.palette.common.black,
  },
}))
type PageWebsiteLinkProps = {
  pageIdx: number
  retreatIdx: number
  currentPageIdx: string
  websitePageIds: number[] | undefined
}

function PageWebsiteLink(props: PageWebsiteLinkProps) {
  let classes = useStyles()
  let dispatch = useDispatch()
  let page = useAttendeeLandingPage(
    props.websitePageIds ? props.websitePageIds[props.pageIdx] : -1
  )
  return (
    <div className={classes.pageNav}>
      <Link
        className={classes.pageTitleText}
        component={RouterLink}
        to={AppRoutes.getPath("LandingPageGeneratorPage", {
          retreatIdx: props.retreatIdx.toString(),
          currentPageIdx: props.pageIdx.toString(),
        })}>
        <Typography>{page?.title}</Typography>
      </Link>
      <IconButton
        onClick={() => {
          dispatch(
            push(
              AppRoutes.getPath("LandingPageGeneratorConfigPageSettings", {
                retreatIdx: props.retreatIdx.toString(),
                currentPageIdx: props.currentPageIdx,
                pageIdx: props.pageIdx.toString(),
              })
            )
          )
        }}>
        <Settings fontSize="small" />
      </IconButton>
    </div>
  )
}
export default PageWebsiteLink
