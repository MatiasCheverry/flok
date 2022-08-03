import {Link, makeStyles} from "@material-ui/core"
import {Link as RouterLink} from "react-router-dom"
import {AppRoutes} from "../../Stack"
import {useAttendeeLandingPage} from "../../utils/retreatUtils"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  tabText: {
    color: theme.palette.common.black,
  },
  link: {
    "&:hover": {
      textDecoration: "none",
    },
  },
}))

type LandingPageGeneratorTabProps = {
  pageIdx: number
  retreatIdx: number
  selected: boolean
  pageIds: number[]
}

function LandingPageGeneratorTab(props: LandingPageGeneratorTabProps) {
  let page = useAttendeeLandingPage(props.pageIds[props.pageIdx])
  let classes = useStyles()

  return (
    <Link
      component={RouterLink}
      className={classes.link}
      to={AppRoutes.getPath("LandingPageGeneratorPage", {
        retreatIdx: props.retreatIdx.toString(),
        currentPageIdx: props.pageIdx.toString(),
      })}>
      <AppTypography
        className={classes.tabText}
        fontWeight="bold"
        underline={props.selected}>
        {page?.title}
      </AppTypography>
    </Link>
  )
}
export default LandingPageGeneratorTab
