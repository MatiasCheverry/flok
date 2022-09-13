import {Button, List, makeStyles, Menu, MenuItem} from "@material-ui/core"
import {ArrowDropDown, ArrowDropUp, ExitToApp, Person} from "@material-ui/icons"
import {MouseEvent, PropsWithChildren, useState} from "react"
import {useDispatch} from "react-redux"
import {UserModel} from "../../models/user"
import {ApiAction} from "../../store/actions/api"
import {deleteUserSignin} from "../../store/actions/user"

let useStyles = makeStyles((theme) => ({
  emailContainer: {
    "& > *:not(:first-child)": {
      marginLeft: theme.spacing(0.5),
    },
  },
  centerText: {
    justifyContent: "center",
  },
}))

type AppUserSettingsProps = {
  collapsable?: boolean
  user: UserModel
  onLogoutSuccess?: () => void
}
export default function AppUserSettings(props: AppUserSettingsProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  let [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  let toggleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }
  return (
    <div>
      <WithButton
        className={classes.emailContainer}
        onClick={props.collapsable ? toggleOpen : undefined}>
        <Person fontSize="small" />
        <span>{props.user.email}</span>
        {props.collapsable ? (
          anchorEl ? (
            <ArrowDropUp fontSize="small" />
          ) : (
            <ArrowDropDown fontSize="small" />
          )
        ) : (
          <></>
        )}
      </WithButton>
      <WithMenu
        MenuProps={
          props.collapsable
            ? {
                anchorEl: anchorEl,
                open: Boolean(anchorEl),
                onClose: () => setAnchorEl(null),
              }
            : undefined
        }>
        <MenuItem
          onClick={async () => {
            let logoutRequest = (await dispatch(
              deleteUserSignin()
            )) as unknown as ApiAction
            if (props.onLogoutSuccess && !logoutRequest.error) {
              props.onLogoutSuccess()
            }
          }}
          classes={{root: props.collapsable ? undefined : classes.centerText}}>
          <ExitToApp fontSize="small" />
          Logout
        </MenuItem>
      </WithMenu>
    </div>
  )
}

function WithButton(
  props: PropsWithChildren<{
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void
    className?: string
  }>
) {
  return props.onClick ? (
    <Button onClick={props.onClick} classes={{label: props.className}}>
      {props.children}
    </Button>
  ) : (
    <div className={props.className}>{props.children}</div>
  )
}

function WithMenu(
  props: PropsWithChildren<{
    MenuProps?: {
      anchorEl: HTMLElement | null
      onClose: () => void
      open: boolean
    }
  }>
) {
  return props.MenuProps ? (
    <Menu
      getContentAnchorEl={null}
      anchorOrigin={{vertical: "bottom", horizontal: "left"}}
      transformOrigin={{vertical: "top", horizontal: "left"}}
      {...props.MenuProps}>
      {props.children}
    </Menu>
  ) : (
    <List>{props.children}</List>
  )
}
