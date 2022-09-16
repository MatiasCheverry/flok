import {
  Button,
  ButtonProps,
  Drawer,
  IconButton,
  Link,
  makeStyles,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core"
import {Menu} from "@material-ui/icons"
import {push} from "connected-react-router"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {Link as ReactRouterLink} from "react-router-dom"
import {RetreatModel} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getUserHome} from "../../store/actions/user"
import {FlokTheme} from "../../theme"
import {titleToNavigation, useQuery} from "../../utils"
import {useAttendeeLandingPage} from "../../utils/retreatUtils"
import AppMoreInfoIcon from "../base/AppMoreInfoIcon"
import AppUserSettings from "../base/AppUserSettings"

let useStyles = makeStyles((theme) => ({
  logo: {
    height: "50px",
    [theme.breakpoints.down("sm")]: {
      width: "120px",
      height: "auto",
    },
  },
  header: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
    alignItems: "normal",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      alignItems: "center",
      justifyContent: "space-between",
    },
  },
  drawer: {
    width: "100%",
  },
  imgWrapper: {
    width: "33%",
    [theme.breakpoints.down("sm")]: {
      width: "10",
    },
    justifyContent: "left",
  },
  registerWrapper: {
    width: "33%",
    justifyContent: "right",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  navLinkContainer: {
    width: "33%",
    overflowWrap: "break-word",
    justifyContent: "center",
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "center",
  },
  registerButton: {
    [theme.breakpoints.down("sm")]: {
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  mobileNavLinkContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  userHeader: {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center",
    cursor: "pointer",
  },
  userActions: {
    padding: theme.spacing(1),
    position: "absolute",
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(0.5),
    alignItems: "center",
    cursor: "pointer",
  },
  userHeaderSideNav: {},
  userHeaderSideNavWrapper: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "auto",
    marginBottom: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  sideNavLogout: {
    width: "80%",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
  },
  flightsNavDiv: {
    paddingRight: theme.spacing(2),
    display: "flex",
  },
  overallDiv: {
    display: "flex",
    flexDirection: "column",
  },
  adminHeader: {
    background: theme.palette.primary.main,
    display: "flex",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  adminHeaderText: {
    color: theme.palette.common.white,
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "0.75rem",
  },
  adminHeaderTextLink: {
    color: theme.palette.common.white,
    textDecoration: "underline",
  },
}))
type RetreatWebsiteHeaderProps = {
  logo: string
  pageIds: number[]
  retreatName: string
  selectedPage: string
  registrationLink?: string
  registrationPage?: true
  retreat: RetreatModel
}

function RetreatWebsiteHeader(props: RetreatWebsiteHeaderProps) {
  let dispatch = useDispatch()
  let classes = useStyles()
  let [attendeeViewQuery] = useQuery("view")

  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  let user = useSelector((state: RootState) => state.user.user)
  let loginStatus = useSelector((state: RootState) => state.user.loginStatus)
  let showRegisterNowButton = props.retreat.registration_live
    ? true
    : user?.retreat_ids
    ? user.retreat_ids.includes(props.retreat.id) &&
      attendeeViewQuery !== "attendee"
    : false
  useEffect(() => {
    if (loginStatus === "UNKNOWN" || !user) {
      dispatch(getUserHome())
    }
  }, [dispatch, loginStatus, user])

  let isRmc =
    user?.retreat_ids && user.retreat_ids.indexOf(props.retreat.id) !== -1
  return (
    <div className={classes.overallDiv}>
      {isRmc && (
        <header className={classes.adminHeader}>
          <Typography className={classes.adminHeaderText}>
            Viewing as an {attendeeViewQuery ? "attendee" : "admin"} switch to{" "}
            <Link
              component={ReactRouterLink}
              className={classes.adminHeaderTextLink}
              to={AppRoutes.getPath(
                "AttendeeSitePage",
                {
                  retreatName: props.retreatName,
                  pageName: props.selectedPage,
                },
                attendeeViewQuery ? {} : {view: "attendee"}
              )}>
              {!attendeeViewQuery ? "attendee" : "admin"}
            </Link>
            ?
          </Typography>
        </header>
      )}
      <div className={classes.header}>
        <div className={classes.imgWrapper}>
          <Link
            to={AppRoutes.getPath("AttendeeSiteHome", {
              retreatName: props.retreatName,
            })}
            component={ReactRouterLink}>
            <img src={props.logo} className={classes.logo} alt="logo"></img>
          </Link>
        </div>

        {!isSmallScreen ? (
          <>
            <div className={classes.navLinkContainer}>
              {props.pageIds.map((pageId) => {
                return (
                  <RetreatWebsiteHeaderLink
                    viewQuery={attendeeViewQuery}
                    retreatName={props.retreatName}
                    pageId={pageId}
                    selectedPage={props.selectedPage}
                  />
                )
              })}
              {(props.retreat.flights_live ||
                (isRmc && attendeeViewQuery !== "attendee")) && (
                <div className={classes.flightsNavDiv}>
                  <RetreatWebsiteHeaderLink
                    viewQuery={attendeeViewQuery}
                    retreatName={props.retreatName}
                    pageId={props.retreat.flights_page_id!}
                    selectedPage={"Flights"}
                  />

                  {!props.retreat.flights_live &&
                    user?.retreat_ids &&
                    user.retreat_ids.indexOf(props.retreat.id) !== -1 && (
                      <AppMoreInfoIcon tooltipText="This page is not viewable by attendees until flights goes live" />
                    )}
                </div>
              )}
            </div>
            <div className={classes.registerWrapper}>
              {props.registrationPage && user ? (
                <AppUserSettings
                  user={user}
                  collapsable
                  onLogoutSuccess={() =>
                    dispatch(
                      push(
                        AppRoutes.getPath("AttendeeSiteHome", {
                          retreatName: props.retreatName,
                        })
                      )
                    )
                  }
                />
              ) : (
                <RegisterNowButton
                  to={
                    showRegisterNowButton
                      ? AppRoutes.getPath("AttendeeSiteFormPage", {
                          retreatName: props.retreatName,
                        })
                      : undefined
                  }
                />
              )}
            </div>
          </>
        ) : (
          <>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <Menu />
            </IconButton>
            <Drawer
              anchor={"right"}
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false)
              }}
              className={classes.drawer}>
              <div className={classes.mobileNavLinkContainer}>
                {props.pageIds.map((pageId) => {
                  return (
                    <RetreatWebsiteHeaderLink
                      viewQuery={attendeeViewQuery}
                      retreatName={props.retreatName}
                      pageId={pageId}
                      selectedPage={props.selectedPage}
                    />
                  )
                })}
                {((props.retreat.flights_live &&
                  props.retreat.flights_page_id) ||
                  (isRmc && attendeeViewQuery !== "attendee")) && (
                  <RetreatWebsiteHeaderLink
                    viewQuery={attendeeViewQuery}
                    retreatName={props.retreatName}
                    pageId={props.retreat.flights_page_id!}
                    selectedPage={"Flights"}
                  />
                )}
              </div>
              <div className={classes.registerButton}>
                <RegisterNowButton
                  to={
                    showRegisterNowButton
                      ? AppRoutes.getPath("AttendeeSiteFormPage", {
                          retreatName: props.retreatName,
                        })
                      : undefined
                  }
                />
              </div>
              {loginStatus === "LOGGED_IN" && user && (
                <div className={classes.userHeaderSideNavWrapper}>
                  <AppUserSettings
                    user={user}
                    onLogoutSuccess={() =>
                      dispatch(
                        push(
                          AppRoutes.getPath("AttendeeSiteHome", {
                            retreatName: props.retreatName,
                          })
                        )
                      )
                    }
                  />
                </div>
              )}
            </Drawer>
          </>
        )}
      </div>
    </div>
  )
}
export default RetreatWebsiteHeader

let useLinkStyles = makeStyles((theme) => ({
  navigationLink: {
    paddingRight: theme.spacing(2),
    color: theme.palette.text.primary,
    [theme.breakpoints.down("sm")]: {
      minWidth: 200,
      height: "45px",
      fontSize: "1.3rem",
      fontWeight: theme.typography.fontWeightBold,
      marginLeft: theme.spacing(2),
    },
  },
}))
type RetreatWebsiteHeaderLinkProps = {
  retreatName: string
  pageId: number
  selectedPage: string // if pageId doesn't exist use this for the title
  viewQuery: string | null
}
function RetreatWebsiteHeaderLink(props: RetreatWebsiteHeaderLinkProps) {
  let classes = useLinkStyles()
  let [page, loadingPage] = useAttendeeLandingPage(props.pageId)

  return (
    <Link
      underline={
        page && titleToNavigation(page.title) === props.selectedPage
          ? "always"
          : "none"
      }
      component={ReactRouterLink}
      to={AppRoutes.getPath(
        "AttendeeSitePage",
        {
          retreatName: props.retreatName,
          pageName: titleToNavigation(page?.title ?? props.selectedPage),
        },
        !props.viewQuery ? {} : {view: "attendee"}
      )}
      className={classes.navigationLink}>
      {page?.title ?? props.selectedPage}
    </Link>
  )
}

function RegisterNowButton(props: {to?: string}) {
  const buttonProps: Pick<ButtonProps, "color" | "variant" | "size"> = {
    color: "primary",
    variant: "contained",
    size: "small",
  }
  const registerText = "Register Now"
  return props.to ? (
    <Button {...buttonProps} component={ReactRouterLink} to={props.to}>
      {registerText}
    </Button>
  ) : (
    <Tooltip title="Registration isn't live yet">
      <span>
        <Button {...buttonProps} disabled>
          {registerText}
        </Button>
      </span>
    </Tooltip>
  )
}
