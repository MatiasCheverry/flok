import {
  AppBar,
  Button,
  Drawer,
  makeStyles,
  MenuItem,
  Toolbar,
  Tooltip,
  useMediaQuery,
} from "@material-ui/core"
import clsx from "clsx"
import {push} from "connected-react-router"
import {PropsWithChildren, useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {Link as ReactRouterLink} from "react-router-dom"
import {AttendeeLandingWebsiteModel, RetreatModel} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getUserHome} from "../../store/actions/user"
import {FlokTheme} from "../../theme"
import {toPathStr} from "../../utils"
import {ImageUtils} from "../../utils/imageUtils"
import {useAttendeeLandingPage} from "../../utils/retreatUtils"

let useStyles = makeStyles((theme) => ({
  appBar: {},
  appBarSidenav: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    "& > *:nth-child(1)": {},
    "& > *:nth-child(2)": {},
    "& > *:nth-child(3)": {
      flexGrow: 1,
      justifyContent: "flex-end",
      display: "flex",
      flexDirection: "column",
    },
  },
  appBarTopnav: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    "& > *": {
      display: "flex",
    },
    "& > *:nth-child(1)": {
      justifyContent: "flex-start",
    },
    "& > *:nth-child(2)": {
      justifyContent: "center",
      flexGrow: 1,
      marinLeft: theme.spacing(1),
      marinRight: theme.spacing(1),
    },
    "& > *:nth-child(3)": {
      justifyContent: "flex-end",
    },
  },
  logo: {
    height: "40px",
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
  website: AttendeeLandingWebsiteModel
  retreat: RetreatModel
  selectedPage: string | "registration"
}

function RetreatWebsiteHeader(props: RetreatWebsiteHeaderProps) {
  let dispatch = useDispatch()
  let classes = useStyles()
  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )
  const [sidenavOpen, setSidenavOpen] = useState(false)

  // User Related
  let user = useSelector((state: RootState) => state.user.user)
  let loginStatus = useSelector((state: RootState) => state.user.loginStatus)
  useEffect(() => {
    if (loginStatus === "UNKNOWN" || !user) {
      dispatch(getUserHome())
    }
  }, [dispatch, loginStatus, user])
  function onLogoutSuccess() {
    dispatch(
      push(
        AppRoutes.getPath("AttendeeSiteHome", {
          retreatName: sitePathName,
        })
      )
    )
  }

  let isRegistrationPage = props.selectedPage === "registration"
  let sitePathName = toPathStr(props.website.name)
  let registrationLive = !!props.retreat.registration_live

  return (
    <NavWrapper
      variant={isSmallScreen ? "sidenav" : "topnav"}
      open={sidenavOpen}
      onClose={() => setSidenavOpen(false)}>
      <ReactRouterLink
        to={AppRoutes.getPath("AttendeeSiteHome", {
          retreatName: sitePathName,
        })}>
        <img
          src={
            props.website.logo_image?.image_url ??
            ImageUtils.getImageUrl("logoIconTextTrans")
          }
          className={classes.logo}
          alt="logo"
        />
      </ReactRouterLink>
      <WithNavItems variant={isSmallScreen ? "sidenav" : "topnav"}>
        {props.website.page_ids.map((pageId) => {
          return (
            <RetreatWebsiteHeaderLink
              retreatName={sitePathName}
              pageId={pageId}
            />
          )
        })}
      </WithNavItems>
      <RegisterButton
        to={
          registrationLive
            ? AppRoutes.getPath("AttendeeSiteFormPage", {
                retreatName: sitePathName,
              })
            : undefined
        }
      />
    </NavWrapper>
    // <div className={classes.header}>
    //   <div className={classes.imgWrapper}>
    //     <a
    //       href={AppRoutes.getPath("AttendeeSiteHome", {
    //         retreatName: sitePathName,
    //       })}>
    //       <img
    //         src={
    //           props.website.logo_image?.image_url ??
    //           ImageUtils.getImageUrl("logoIconTextTrans")
    //         }
    //         className={classes.logo}
    //         alt="logo"></img>
    //     </a>
    //   </div>

    //   {!isSmallScreen ? (
    //     <>
    //       <div className={classes.navLinkContainer}>
    //         {props.website.page_ids.map((pageId) => {
    //           return (
    //             <RetreatWebsiteHeaderLink
    //               retreatName={sitePathName}
    //               pageId={pageId}
    //               selectedPage={props.selectedPage}
    //             />
    //           )
    //         })}
    //       </div>
    //       <div className={classes.registerWrapper}>
    //         {isRegistrationPage && user ? (
    //           <AppUserSettings
    //             user={user}
    //             collapsable
    //             onLogoutSuccess={onLogoutSuccess}
    //           />
    //         ) : (

    //         )}
    //       </div>
    //     </>
    //   ) : (
    //     <>
    //       {/* <IconButton onClick={() => setDrawerOpen(true)}>
    //         <Menu />
    //       </IconButton>
    //       <Drawer
    //         anchor={"right"}
    //         open={drawerOpen}
    //         onClose={() => {
    //           setDrawerOpen(false)
    //         }}
    //         className={classes.drawer}>
    //         <div className={classes.mobileNavLinkContainer}>
    //           {props.website.page_ids.map((pageId) => {
    //             return (
    //               <RetreatWebsiteHeaderLink
    //                 retreatName={sitePathName}
    //                 pageId={pageId}
    //                 selectedPage={props.selectedPage}
    //               />
    //             )
    //           })}
    //         </div>

    //         <Button
    //           color="primary"
    //           variant="contained"
    //           size="small"
    //           className={classes.registerButton}
    //           onClick={() => {
    //             dispatch(
    //               push(
    //                 AppRoutes.getPath("AttendeeSiteFormPage", {
    //                   retreatName: sitePathName,
    //                 })
    //               )
    //             )
    //           }}>
    //           Register Now
    //         </Button>
    //         {loginStatus === "LOGGED_IN" && user && (
    //           <div className={classes.userHeaderSideNavWrapper}>
    //             <AppUserSettings
    //               user={user}
    //               onLogoutSuccess={onLogoutSuccess}
    //             />
    //           </div>
    //         )}
    //       </Drawer> */}
    //     </>
    //   )}
    // </div>
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
  active?: boolean
}
function RetreatWebsiteHeaderLink(props: RetreatWebsiteHeaderLinkProps) {
  let classes = useLinkStyles()
  let page = useAttendeeLandingPage(props.pageId)

  return (
    <MenuItem
      selected={props.active}
      button
      component={ReactRouterLink}
      to={AppRoutes.getPath("AttendeeSitePage", {
        retreatName: props.retreatName,
        pageName: toPathStr(page?.title ?? "home"),
      })}
      className={classes.navigationLink}>
      {page?.title}
    </MenuItem>
  )
}

function WithNavItems(
  props: PropsWithChildren<{variant: "sidenav" | "topnav"}>
) {
  return props.variant === "sidenav" ? (
    <div>{props.children}</div>
  ) : (
    <div style={{display: "flex"}}>{props.children}</div>
  )
}

function NavWrapper(
  props: PropsWithChildren<{
    variant: "mobile" | "large"
    logo: Element
    registerButton: Element
    navItems: Element[] // should be list of MenuItem's
    open?: boolean
    onClose?: () => void
  }>
) {
  let classes = useStyles()
  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar className={clsx(classes.appBar, classes.appBarTopnav)}>
          {props.children}
        </Toolbar>
      </AppBar>
      <Drawer anchor={"right"} open={true} onClose={props.onClose}>
        <div className={clsx(classes.appBar, classes.appBarSidenav)}>
          {props.children}
        </div>
      </Drawer>
    </>
  )
}

function RegisterButton(props: {to?: string}) {
  let button = (
    <Button
      color="primary"
      variant="contained"
      size="small"
      disabled={!props.to}>
      Register Now
    </Button>
  )
  return props.to ? (
    <ReactRouterLink to={props.to}>{button}</ReactRouterLink>
  ) : (
    <Tooltip title="Registration isn't live yet">
      <span>{button}</span>
    </Tooltip>
  )
}
