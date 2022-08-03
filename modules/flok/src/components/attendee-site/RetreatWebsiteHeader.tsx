import {
  Button,
  Drawer,
  IconButton,
  Link,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core"
import {Menu} from "@material-ui/icons"
import {push} from "connected-react-router"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getUserHome} from "../../store/actions/user"
import {FlokTheme} from "../../theme"
import {titleToNavigation} from "../../utils"
import {useAttendeeLandingPage} from "../../utils/retreatUtils"
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
      width: "70%",
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
}))
type RetreatWebsiteHeaderProps = {
  logo: string
  pageIds: number[]
  retreatName: string
  selectedPage: string
  homeRoute: string
  registrationLink?: string
  registrationPage?: true
}

function RetreatWebsiteHeader(props: RetreatWebsiteHeaderProps) {
  let dispatch = useDispatch()
  let classes = useStyles()

  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  let user = useSelector((state: RootState) => state.user.user)
  let loginStatus = useSelector((state: RootState) => state.user.loginStatus)
  useEffect(() => {
    if (loginStatus === "UNKNOWN" || !user) {
      dispatch(getUserHome())
    }
  }, [dispatch, loginStatus, user])
  return (
    <div className={classes.header}>
      <div className={classes.imgWrapper}>
        <a href={props.homeRoute}>
          <img src={props.logo} className={classes.logo} alt="logo"></img>
        </a>
      </div>

      {!isSmallScreen ? (
        <>
          <div className={classes.navLinkContainer}>
            {props.pageIds.map((pageId) => {
              return (
                <RetreatWebsiteHeaderLink
                  retreatName={props.retreatName}
                  pageId={pageId}
                  selectedPage={props.selectedPage}
                />
              )
            })}
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
              <Button
                color="primary"
                variant="contained"
                size="small"
                className={classes.registerButton}
                onClick={() => {
                  dispatch(
                    push(
                      AppRoutes.getPath("AttendeeSiteFormPage", {
                        retreatName: props.retreatName,
                      })
                    )
                  )
                }}>
                Register Now
              </Button>
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
                    retreatName={props.retreatName}
                    pageId={pageId}
                    selectedPage={props.selectedPage}
                  />
                )
              })}
            </div>

            <Button
              color="primary"
              variant="contained"
              size="small"
              className={classes.registerButton}
              onClick={() => {
                dispatch(
                  push(
                    AppRoutes.getPath("AttendeeSiteFormPage", {
                      retreatName: props.retreatName,
                    })
                  )
                )
              }}>
              Register Now
            </Button>
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
  )
}
export default RetreatWebsiteHeader

let useLinkStyles = makeStyles((theme) => ({
  navigationLink: {
    paddingRight: theme.spacing(2),
    color: theme.palette.grey[900],
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
  selectedPage: string
}
function RetreatWebsiteHeaderLink(props: RetreatWebsiteHeaderLinkProps) {
  let classes = useLinkStyles()
  let page = useAttendeeLandingPage(props.pageId)

  return (
    <Link
      underline={
        page && titleToNavigation(page.title) === props.selectedPage
          ? "always"
          : "none"
      }
      href={AppRoutes.getPath("AttendeeSitePage", {
        retreatName: props.retreatName,
        pageName: titleToNavigation(page?.title ?? "home"),
      })}
      className={classes.navigationLink}>
      {page?.title}
    </Link>
  )
}
