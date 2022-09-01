import {Fade, IconButton, Menu, MenuItem} from "@material-ui/core"
import {Delete, MoreVert} from "@material-ui/icons"
import {useState} from "react"

function DataGridDeleteDropDown(props: {onDelete: () => void; text?: string}) {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const menuOpen = Boolean(anchorEl)
  const handleCloseMenu = () => {
    setAnchorEl(null)
  }
  return (
    <div>
      <Menu
        id="fade-menu"
        anchorEl={anchorEl}
        keepMounted
        open={menuOpen}
        onClose={handleCloseMenu}
        TransitionComponent={Fade}>
        <MenuItem onClick={props.onDelete}>
          <Delete fontSize="small" />
          &nbsp; {props.text ?? "Delete Attendee"}
        </MenuItem>
      </Menu>
      <IconButton
        size="small"
        aria-controls="fade-menu"
        aria-haspopup="true"
        onClick={(event) => {
          setAnchorEl(event.currentTarget)
        }}>
        <MoreVert />
      </IconButton>
    </div>
  )
}
export default DataGridDeleteDropDown
