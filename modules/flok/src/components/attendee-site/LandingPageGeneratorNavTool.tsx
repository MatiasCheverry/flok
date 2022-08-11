import {
  Button,
  IconButton,
  Link,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core"
import {Add} from "@material-ui/icons"
import {push} from "connected-react-router"
import {useDispatch} from "react-redux"
import {Link as RouterLink} from "react-router-dom"
import {
  AttendeeLandingWebsiteModel,
  AttendeeLandingWebsitePageModel,
} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {FlokTheme} from "../../theme"
import {titleToNavigation} from "../../utils"
import AppTypography from "../base/AppTypography"
import LandingPageGeneratorTab from "./LandingPageGeneratorTab"

let useStyles = makeStyles((theme) => ({
  navTool: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabsAndControlsDiv: {
    display: "flex",
    alignItems: "center",
  },
  tabsDiv: {
    display: "flex",
    alignItems: "center",
    maxWidth: "85%",
    overflow: "auto",
  },
  tab: {
    margin: theme.spacing(1),
  },
  tabText: {
    color: theme.palette.common.black,
    whiteSpace: "nowrap",
  },
  link: {
    "&:hover": {
      textDecoration: "none",
    },
  },
}))

type LandingPageGeneratorNavToolProps = {
  pageIds: number[]
  retreatIdx: number
  selectedPage: AttendeeLandingWebsitePageModel
  website: AttendeeLandingWebsiteModel
  flightsPageId?: number
}

function LandingPageGeneratorNavTool(props: LandingPageGeneratorNavToolProps) {
  let dispatch = useDispatch()
  let classes = useStyles()

  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )
  return (
    <div className={classes.navTool}>
      <div className={classes.tabsAndControlsDiv}>
        <div className={classes.tabsDiv}>
          {!isSmallScreen ? (
            <>
              {props.pageIds.map((pageId) => (
                <div className={classes.tab}>
                  <LandingPageGeneratorTab
                    selected={pageId === props.selectedPage.id}
                    retreatIdx={props.retreatIdx}
                    pageId={pageId}
                  />
                </div>
              ))}
              <div className={classes.tab}>
                <Link
                  component={RouterLink}
                  className={classes.link}
                  to={AppRoutes.getPath("RetreatAttendeesRegFormBuilderPage", {
                    retreatIdx: props.retreatIdx.toString(),
                  })}>
                  <AppTypography className={classes.tabText} fontWeight="bold">
                    Registration
                  </AppTypography>
                </Link>
              </div>

              <div className={classes.tab}>
                <Link
                  component={RouterLink}
                  className={classes.link}
                  to={AppRoutes.getPath("RetreatFlightsOptionsPage", {
                    retreatIdx: props.retreatIdx.toString(),
                  })}>
                  <AppTypography className={classes.tabText} fontWeight="bold">
                    Flights
                  </AppTypography>
                </Link>
              </div>
            </>
          ) : (
            <div className={classes.tab}>
              <LandingPageGeneratorTab
                selected={true}
                retreatIdx={props.retreatIdx}
                pageId={props.selectedPage.id}
              />
            </div>
          )}
        </div>
        <IconButton
          onClick={() => {
            dispatch(
              push(
                AppRoutes.getPath("LandingPageGeneratorConfigAddPage", {
                  retreatIdx: props.retreatIdx.toString(),
                  currentPageId: props.selectedPage.id.toString(),
                })
              )
            )
          }}>
          <Add fontSize="default" />
        </IconButton>
        {/* <IconButton
          onClick={() => {
            dispatch(
              push(
                AppRoutes.getPath("LandingPageGeneratorConfig", {
                  retreatIdx: props.retreatIdx.toString(),
                  currentPageId: props.selectedPage.id.toString(),
                })
              )
            )
          }}>
          <Settings fontSize="default"></Settings>
        </IconButton> */}
      </div>
      <Link
        href={AppRoutes.getPath("AttendeeSitePage", {
          retreatName: titleToNavigation(props.website.name),
          pageName: titleToNavigation(props.selectedPage.title ?? "home"),
        })}
        target="landing-page">
        <Button variant="outlined" color="primary" size="small">
          View Page
        </Button>
      </Link>
    </div>
  )
}
export default LandingPageGeneratorNavTool
