import {Button, InputAdornment, TextField} from "@material-ui/core"
import {Send} from "@material-ui/icons"
import {useState} from "react"
import {theme} from "../../theme"

export default function AppEmailTemplateForm() {
  let [showOptionsDropDown, setShowOptionsDropdown] = useState(false)
  return (
    <form style={{width: "100%", display: "flex", flexDirection: "column"}}>
      <TextField
        fullWidth
        // disabled
        size="medium"
        placeholder="Subject"
        // variant="underlined"
        select
        //  ,
        defaultValue={"All Attendees"}
        InputProps={{
          startAdornment: <InputAdornment position="start">To</InputAdornment>,
        }}>
        <option>All Attendees</option>
      </TextField>
      <TextField
        fullWidth
        placeholder="Subject"
        size="medium"
        style={{marginTop: theme.spacing(1)}}></TextField>
      <TextField
        fullWidth
        multiline
        rows={20}
        variant="outlined"
        style={{marginTop: theme.spacing(2)}}
      />
      <div
        style={{
          marginTop: showOptionsDropDown ? -30 : 8,
          // marginTop: theme.spacing(1),
          display: "flex",
          justifyContent: "space-between",
        }}>
        <Button color="primary" variant="contained">
          Save
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="primary"
          style={{
            background: "white",
          }}>
          Send to Myself &nbsp;
          <Send fontSize="small" />
        </Button>
      </div>
    </form>
  )
}
