import {
  Box,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  MenuItem,
  TextField,
  useMediaQuery,
} from "@material-ui/core"
import {
  ApartmentRounded,
  Build,
  FlightRounded,
  HomeRounded,
  LocalAtm,
  MapRounded,
  PeopleAlt,
  SvgIconComponent,
} from "@material-ui/icons"
import {createContext, PropsWithChildren, useContext, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {Link as ReactRouterLink, matchPath} from "react-router-dom"
import AppImage from "../../components/base/AppImage"
import {Constants} from "../../config"
import {ResourceNotFound} from "../../models"
import {RetreatModel} from "../../models/retreat"
import {useRetreat} from "../../pages/misc/RetreatProvider"
import {AppRoutes, FlokPageName} from "../../Stack"
import {RootState} from "../../store"
import {deleteUserSignin} from "../../store/actions/user"
import {FlokTheme} from "../../theme"
import {useRetreatByGuid} from "../../utils/retreatUtils"

let DRAWER_WIDTH = 240
const TRANSITION_DURATION = 250

const useStyles = makeStyles((theme: FlokTheme) => ({
  root: {
    width: DRAWER_WIDTH,
  },
  paper: {
    width: DRAWER_WIDTH,
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),

    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  footer: {
    marginTop: "auto",
    marginBottom: theme.spacing(2),
  },
  companySelector: {
    color: theme.palette.common.white,
    "& .MuiSelect-select:focus": {
      backgroundColor: "inherit",
    },
  },
}))

type NavItem = {
  title: string
  icon?: SvgIconComponent
  activeRoutes: FlokPageName[]
  redirect?: (
    retreat: RetreatModel,
    retreatIdx: number
  ) => {url: string; external?: boolean} | undefined
  hidden?: (retreat: RetreatModel) => boolean
  navSubItems?: Exclude<NavItem, "navSubItems">[]
}

function redirectFlok(pageName: FlokPageName) {
  return (retreat: RetreatModel, retreatIdx: number) => ({
    url: AppRoutes.getPath(pageName, {retreatIdx: retreatIdx.toString()}),
  })
}

let navItems: NavItem[] = [
  {
    title: "Overview",
    icon: HomeRounded,
    activeRoutes: ["RetreatHomePage"],
    redirect: redirectFlok("RetreatHomePage"),
  },
  {
    title: "Lodging",
    icon: ApartmentRounded,
    activeRoutes: [],
    redirect: redirectFlok("RetreatLodgingPage"),
    navSubItems: [
      {
        title: "Proposals",
        activeRoutes: [
          "RetreatLodgingProposalsPage",
          "RetreatLodgingProposalPage",
        ],
        redirect: redirectFlok("RetreatLodgingProposalsPage"),
      },
      {
        title: "Contract",
        activeRoutes: ["RetreatLodgingContractPage"],
        redirect: redirectFlok("RetreatLodgingContractPage"),
      },
      {
        title: "Site Inspection",
        activeRoutes: [],
        redirect: (retreat) =>
          retreat.lodging_site_inspection_url
            ? {url: retreat.lodging_site_inspection_url, external: true}
            : undefined,
        hidden: (retreat) => {
          return !retreat.lodging_site_inspection_url
        },
      },
    ],
  },
  {
    title: "Attendees",
    icon: PeopleAlt,
    activeRoutes: ["RetreatAttendeesPage", "RetreatAttendeePage"],
    redirect: redirectFlok("RetreatAttendeesPage"),
    hidden: (retreat) => !!retreat.attendees_v2_released,
  },
  {
    title: "Attendees",
    icon: PeopleAlt,
    activeRoutes: [],
    redirect: redirectFlok("RetreatAttendeesPage"),
    hidden: (retreat) => !retreat.attendees_v2_released,
    navSubItems: [
      {
        title: "Attendees",
        activeRoutes: [
          "RetreatAttendeePage",
          "RetreatAttendeesPage",
          "RetreatAttendeeRegResponsePage",
        ],
        redirect: redirectFlok("RetreatAttendeesPage"),
        hidden: (retreat) => !retreat.attendees_v2_released,
      },
      {
        title: "Registration",
        activeRoutes: ["RetreatAttendeesRegFormBuilderPage"],
        redirect: redirectFlok("RetreatAttendeesRegFormBuilderPage"),
        hidden: (retreat) => !retreat.attendees_v2_released,
      },
      {
        title: "Website",
        activeRoutes: [
          "LandingPageGeneratorConfig",
          "LandingPageGeneratorConfigAddPage",
          "LandingPageGeneratorConfigWebsiteSettings",
          "LandingPageGeneratorConfigPageSettings",
          "LandingPageGeneratorHome",
          "LandingPageGeneratorPage",
        ],
        redirect: redirectFlok("LandingPageGeneratorHome"),
        hidden: (retreat) => !retreat.attendees_v2_released,
      },
    ],
  },
  {
    title: "Flights",
    icon: FlightRounded,
    activeRoutes: ["RetreatFlightsPage", "RetreatAttendeeFlightsPage"],
    redirect: redirectFlok("RetreatFlightsPage"),
  },
  {
    title: "Itinerary",
    icon: MapRounded,
    activeRoutes: ["RetreatItineraryPage"],
    redirect: (retreat, retreatIdx) =>
      retreat.itinerary_final_draft_link
        ? {url: retreat.itinerary_final_draft_link, external: true}
        : {
            url: AppRoutes.getPath("RetreatItineraryPage", {
              retreatIdx: retreatIdx.toString(),
            }),
          },
  },
  // TODO ADD BACK ONCE ITINERARY INSPIRATION LAUNCHED
  // {
  //   title: "Itinerary",
  //   icon: MapRounded,
  //   activeRoutes: [],
  //   redirect: redirectFlok("RetreatItineraryInspirationPage"),
  //   navSubItems: [
  //     {
  //       title: "Inspiration",
  //       activeRoutes: ["RetreatItineraryInspirationPage"],
  //       redirect: redirectFlok("RetreatItineraryInspirationPage"),
  //     },
  //     {
  //       title: "Draft Itinerary",
  //       activeRoutes: [],
  //       redirect: (retreat, retreatIdx) =>
  //         retreat.itinerary_final_draft_link
  //           ? {url: retreat.itinerary_final_draft_link, external: true}
  //           : {
  //               url: AppRoutes.getPath("RetreatItineraryPage", {
  //                 retreatIdx: retreatIdx.toString(),
  //               }),
  //             },
  //     },
  //   ],
  // },
  {
    title: "Budget",
    icon: LocalAtm,
    activeRoutes: [],
    redirect: redirectFlok("RetreatBudgetEstimatePage"),
    navSubItems: [
      {
        title: "Estimate",
        activeRoutes: ["RetreatBudgetEstimatePage"],
        redirect: redirectFlok("RetreatBudgetEstimatePage"),
      },
      {
        title: "Actual",
        activeRoutes: ["RetreatBudgetPage"],
        redirect: (retreat, retreatIdx) =>
          retreat.budget_link
            ? {url: retreat.budget_link, external: true}
            : {
                url: AppRoutes.getPath("RetreatBudgetPage", {
                  retreatIdx: retreatIdx.toString(),
                }),
              },
      },
    ],
  },
]

const SidebarContext = createContext<{
  sidebarOpen: boolean
  openSidebar: (() => void) | undefined
  closeSidebar: (() => void) | undefined
}>({sidebarOpen: false, openSidebar: undefined, closeSidebar: undefined})

export function useSidebar() {
  const {sidebarOpen, openSidebar, closeSidebar} = useContext(SidebarContext)
  if (openSidebar === undefined || closeSidebar === undefined) {
    throw Error("useSidebar must be used within a SidebarProvider")
  }
  return {sidebarOpen, openSidebar, closeSidebar}
}

export function SidebarProvider(props: PropsWithChildren<{}>) {
  let [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        openSidebar: () => setSidebarOpen(true),
        closeSidebar: () => setSidebarOpen(false),
      }}>
      {props.children}
    </SidebarContext.Provider>
  )
}

/**
 * PageSideav requires access to the useRetreat hook therefore needs to be rendered in a RetreatProvider.
 * PageSidenav also requires access to the user object, therefore needs to be rendered in a ProtectedRoute
 */
export default function PageSidenav() {
  let dispatch = useDispatch()
  const classes = useStyles()
  let [retreat, retreatIdx] = useRetreat()
  let user = useSelector((state: RootState) => state.user.user)
  let {sidebarOpen, closeSidebar} = useSidebar()
  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )

  let isLoggedIn = useSelector(
    (state: RootState) => state.user.loginStatus === "LOGGED_IN"
  )

  return (
    <Drawer
      open={sidebarOpen}
      transitionDuration={TRANSITION_DURATION}
      onClose={closeSidebar}
      color="primary"
      classes={{root: classes.root, paper: classes.paper}}
      variant={isSmallScreen ? "temporary" : "permanent"}>
      <Box
        marginLeft="auto"
        marginRight="auto"
        marginBottom={4}
        style={{display: "flex", alignItems: "flex-end"}}>
        <AppImage
          height="40px"
          alt="White Flok logo"
          img="branding/logos/icon_text-empty_bg-white%40.5x.png"
        />
      </Box>
      <List>
        {navItems
          .filter((navItem) => {
            if (navItem.hidden) {
              return !navItem.hidden(retreat)
            } else {
              return true
            }
          })
          .map((navItem, i) => {
            let redirect = navItem.redirect
              ? navItem.redirect(retreat, retreatIdx)
              : undefined
            let activeRoutes = navItem.activeRoutes.filter((page) => {
              return matchPath(window.location.pathname, {
                path: AppRoutes.getPath(page),
                exact: true,
              })
            })
            let active = activeRoutes.length > 0
            let activeSubItem = false
            let subItems: JSX.Element[] = []
            if (navItem.navSubItems) {
              subItems = navItem.navSubItems
                .filter((subItem) => {
                  if (subItem.hidden !== undefined) {
                    return !subItem.hidden(retreat)
                  } else {
                    return true
                  }
                })
                .map((subItem, j) => {
                  let subnavRedirect = subItem.redirect
                    ? subItem.redirect(retreat, retreatIdx)
                    : undefined
                  let subItemActiveRoutes = subItem.activeRoutes.filter(
                    (page) => {
                      return matchPath(window.location.pathname, {
                        path: AppRoutes.getPath(page),
                        exact: true,
                      })
                    }
                  )
                  let subActive = subItemActiveRoutes.length > 0
                  if (subActive) {
                    activeSubItem = true
                  }
                  return (
                    <NavListItem
                      key={`${i}-${j}`}
                      title={subItem.title}
                      redirect={subnavRedirect?.url}
                      externalLink={subnavRedirect?.external}
                      Icon={subItem.icon}
                      active={subActive}
                    />
                  )
                })
            }
            return (
              <>
                <NavListItem
                  key={i}
                  title={navItem.title}
                  redirect={redirect?.url}
                  externalLink={redirect?.external}
                  Icon={navItem.icon}
                  active={active}
                />
                {activeSubItem ? subItems : undefined}
              </>
            )
          })}
      </List>
      <List className={classes.footer}>
        {retreat && user && user.retreats.length > 1 ? (
          <ListItem button>
            <TextField
              onChange={(e) =>
                (window.location.href = AppRoutes.getPath("RetreatHomePage", {
                  retreatIdx: e.target.value,
                }))
              }
              fullWidth
              select
              SelectProps={{native: false, IconComponent: Box}}
              value={retreatIdx}
              InputProps={{
                disableUnderline: true,
                className: classes.companySelector,
              }}>
              {user?.retreats?.map((retreat, i) => (
                <MenuItem value={i} key={i}>
                  {retreat.company_name}
                </MenuItem>
              ))}
            </TextField>
          </ListItem>
        ) : retreat ? (
          <ListItem>
            <ListItemText>{retreat.company_name}</ListItemText>
          </ListItem>
        ) : undefined}
        {isLoggedIn && (
          <Link
            component={ListItem}
            color="inherit"
            button
            dense
            onClick={() => {
              dispatch(deleteUserSignin())
            }}>
            <ListItemText>Log out</ListItemText>
          </Link>
        )}
      </List>
    </Drawer>
  )
}

type NavListItemType = {
  title: string
  Icon?: SvgIconComponent
  redirect?: string
  externalLink?: boolean
  active?: boolean
}
function NavListItem(props: NavListItemType) {
  let {sidebarOpen, closeSidebar} = useSidebar()
  let listItemProps = props.externalLink
    ? {
        component: "a",
        href: props.redirect,
        target: "_blank",
      }
    : {
        component: ReactRouterLink,
        to: props.redirect,
      }
  let disabled = !props.redirect
  return (
    <ListItem
      {...listItemProps}
      button
      selected={props.active}
      disabled={disabled}
      onClick={() => {
        if (sidebarOpen) closeSidebar()
      }}>
      <ListItemIcon>
        {props.Icon ? <props.Icon fontSize={"large"} /> : undefined}
      </ListItemIcon>
      <ListItemText>{props.title}</ListItemText>
    </ListItem>
  )
}

let demoNavItems: NavItem[] = [
  {
    title: "Pretrip Tools",
    icon: Build,
    activeRoutes: [],
    redirect: () => ({
      url: AppRoutes.getPath("PretripHomePage"),
    }),
    navSubItems: [
      {
        title: "Budget",
        activeRoutes: ["PretripBudgetEstimatorPage"],
        redirect: () => ({
          url: AppRoutes.getPath("PretripBudgetEstimatorPage"),
        }),
      },
      {
        title: "Proposals",
        activeRoutes: [
          "PretripLodgingProposalPage",
          "PretripLodgingProposalsPage",
        ],
        redirect: () => ({
          url: AppRoutes.getPath("PretripLodgingProposalsPage"),
        }),
      },
    ],
  },
  {
    title: "Overview",
    icon: HomeRounded,
    activeRoutes: [],
    redirect: undefined,
  },
  {
    title: "Lodging",
    icon: ApartmentRounded,
    activeRoutes: [],
    redirect: undefined,
  },
  {
    title: "Attendees",
    icon: PeopleAlt,
    activeRoutes: [],
    redirect: undefined,
  },
  {
    title: "Flights",
    icon: FlightRounded,
    activeRoutes: [],
    redirect: undefined,
  },
  {
    title: "Itinerary",
    icon: MapRounded,
    activeRoutes: [],
    redirect: undefined,
  },
  {
    title: "Budget",
    icon: LocalAtm,
    activeRoutes: [],
    redirect: undefined,
  },
]

/**
 * THIS IS NOT A GOOD COMPONENT.
 * Copy pasted from PageSidenav but sets some "demo parameters"
 */
export function PageDemoSidenav(props: {}) {
  const classes = useStyles()
  let [retreat] = useRetreatByGuid(Constants.demoRetreatGuid)
  let {sidebarOpen, closeSidebar} = useSidebar()
  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )

  return (
    <Drawer
      open={sidebarOpen}
      transitionDuration={TRANSITION_DURATION}
      onClose={closeSidebar}
      color="primary"
      classes={{root: classes.root, paper: classes.paper}}
      variant={isSmallScreen ? "temporary" : "permanent"}>
      <Box
        marginLeft="auto"
        marginRight="auto"
        marginBottom={4}
        style={{display: "flex", alignItems: "flex-end"}}>
        <AppImage
          height="40px"
          alt="White Flok logo"
          img="branding/logos/icon_text-empty_bg-white%40.5x.png"
        />
      </Box>
      <List>
        {demoNavItems.map((navItem, i) => {
          let redirect = navItem.redirect
            ? navItem.redirect(retreat as unknown as RetreatModel, -1)
            : undefined
          let activeRoutes = navItem.activeRoutes.filter((page) => {
            return matchPath(window.location.pathname, {
              path: AppRoutes.getPath(page),
              exact: true,
            })
          })
          let active = activeRoutes.length > 0
          let activeSubItem = false
          let subItems: JSX.Element[] = []
          if (navItem.navSubItems) {
            subItems = navItem.navSubItems.map((subItem, j) => {
              let subnavRedirect = subItem.redirect
                ? subItem.redirect(retreat as unknown as RetreatModel, -1)
                : undefined
              let subItemActiveRoutes = subItem.activeRoutes.filter((page) => {
                return matchPath(window.location.pathname, {
                  path: AppRoutes.getPath(page),
                  exact: true,
                })
              })
              let subActive = subItemActiveRoutes.length > 0
              if (subActive) {
                activeSubItem = true
              }
              return (
                <NavListItem
                  key={`${i}-${j}`}
                  title={subItem.title}
                  redirect={subnavRedirect?.url}
                  externalLink={subnavRedirect?.external}
                  Icon={subItem.icon}
                  active={subActive}
                />
              )
            })
          }
          return (
            <>
              <NavListItem
                key={i}
                title={navItem.title}
                redirect={redirect?.url}
                externalLink={redirect?.external}
                Icon={navItem.icon}
                active={active}
              />
              {activeSubItem ? subItems : undefined}
            </>
          )
        })}
      </List>
      <List className={classes.footer}>
        <ListItem>
          <ListItemText>
            {retreat && retreat !== ResourceNotFound
              ? retreat.company_name
              : undefined}
          </ListItemText>
        </ListItem>
      </List>
    </Drawer>
  )
}
