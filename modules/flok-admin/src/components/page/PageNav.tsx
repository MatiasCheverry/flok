import {
  AppBar,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu"
import React, {useState} from "react"
import {Link as ReactRouterLink} from "react-router-dom"
import {AppRoutes} from "../../Stack"
import AppTypography from "../base/AppTypography"

type PageNavProps = {}
export default function PageNav(props: PageNavProps) {
  let [sideNavOpen, setSideNavOpen] = useState(false)
  return (
    <>
      <PageTopNav onClickMenu={() => setSideNavOpen(!sideNavOpen)} />
      <PageSideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
    </>
  )
}

let useSideNavStyles = makeStyles((theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
  },
  list: {
    width: 250,
  },
}))

type PageSideNavProps = {
  open: boolean
  onClose: () => void
}
function PageSideNav(props: PageSideNavProps) {
  let classes = useSideNavStyles(props)
  return (
    <Drawer open={props.open} onClose={props.onClose} variant={"temporary"}>
      <AppTypography className={classes.title} variant="h3" fontWeight="bold">
        Flok Admin
      </AppTypography>
      <List className={classes.list}>
        <ListItem
          button
          component={ReactRouterLink}
          to={AppRoutes.getPath("HomePage")}>
          <ListItemText>Home</ListItemText>
        </ListItem>
        <ListItem
          button
          component={ReactRouterLink}
          to={AppRoutes.getPath("RetreatsPage")}>
          <ListItemText>Retreats</ListItemText>
        </ListItem>
        <ListItem
          button
          component={ReactRouterLink}
          to={AppRoutes.getPath("HotelsPage")}>
          <ListItemText>Hotel content</ListItemText>
        </ListItem>
        <ListItem
          button
          component={ReactRouterLink}
          to={AppRoutes.getPath("AllUsersPage")}>
          <ListItemText>Users</ListItemText>
        </ListItem>
        <ListItem
          button
          component={ReactRouterLink}
          to={AppRoutes.getPath("PastItinerariesPage")}>
          <ListItemText>Past Itineraries</ListItemText>
        </ListItem>
      </List>
    </Drawer>
  )
}

let useTopNavStyles = makeStyles((theme) => ({
  menuIcon: {
    marginRight: theme.spacing(2),
  },
}))

type PageTopNavProps = {
  onClickMenu: () => void
}
function PageTopNav(props: PageTopNavProps) {
  let classes = useTopNavStyles(props)
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          className={classes.menuIcon}
          onClick={props.onClickMenu}
          edge="start"
          color="inherit"
          aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Link
          to={AppRoutes.getPath("HomePage")}
          component={ReactRouterLink}
          color="inherit"
          underline="none">
          <AppTypography variant="h3" fontWeight="bold">
            Flok Admin
          </AppTypography>
        </Link>
        <Link
          style={{marginLeft: "auto"}}
          underline="always"
          color="inherit"
          href="https://goflok.slack.com/archives/eng-qa"
          target="_blank">
          <Tooltip title="Confused about how to use the dashboard? Or is something not working as expected? Reach out to Jared via the #eng-qa Slack channel!">
            <Typography variant="body2">Get help</Typography>
          </Tooltip>
        </Link>
      </Toolbar>
    </AppBar>
  )
}
