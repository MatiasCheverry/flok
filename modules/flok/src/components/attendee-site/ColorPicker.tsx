import {IconButton, makeStyles, Typography} from "@material-ui/core"
import {Check, CloseOutlined, Colorize} from "@material-ui/icons"
import clsx from "clsx"
import {useState} from "react"
import {SketchPicker} from "react-color"
import {theme} from "../../theme"
import AppMoreInfoIcon from "../base/AppMoreInfoIcon"

let useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  colorsDiv: {
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(1),
    alignItems: "center",
  },
  color: {
    height: 35,
    width: 35,
    cursor: "pointer",
    display: "flex",
  },
  notSelectedColor: {
    border: "0.5px solid black",
    borderRadius: 6,
  },
  selectedColor: {
    borderRadius: 8,
    height: 38,
    width: 38,
    border: `2px solid ${theme.palette.primary.main}`,
    display: "flex",
  },
  centered: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "auto",
    marginBottom: "auto",
  },
  colorPicker: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    zIndex: 1,
    marginTop: -70,
    marginLeft: 60,
  },
  closePicker: {
    marginLeft: "auto",
  },
}))
type ColorPickerProps = {
  title: string
  colors: string[]
  selectedColor: string
  setSelectedColor: (newColor: string) => void
  tooltip?: string
  noPicker?: true
}
export default function ColorPicker(props: ColorPickerProps) {
  let classes = useStyles()
  let [pickerOpen, setPickerOpen] = useState(false)
  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <Typography>{props.title}</Typography>
        {props.tooltip && <AppMoreInfoIcon tooltipText={props.tooltip} />}
      </div>
      {pickerOpen && (
        <div
          className={classes.colorPicker}
          onBlur={() => {
            setPickerOpen(false)
          }}>
          <IconButton
            className={classes.closePicker}
            onClick={() => {
              setPickerOpen(false)
            }}>
            <CloseOutlined />
          </IconButton>

          <SketchPicker
            presetColors={[]}
            onChange={(color) => props.setSelectedColor(color.hex)}
            color={props.selectedColor}
          />
        </div>
      )}
      <div className={classes.colorsDiv}>
        {props.colors.map((color) => {
          return (
            <div
              onClick={() => {
                props.setSelectedColor(color)
              }}
              className={clsx(
                classes.color,
                props.selectedColor === color
                  ? classes.selectedColor
                  : classes.notSelectedColor
              )}
              style={{backgroundColor: color}}>
              {props.selectedColor === color && (
                <Check
                  htmlColor={theme.palette.getContrastText(color)}
                  className={classes.centered}
                />
              )}
            </div>
          )
        })}
        {!props.noPicker && (
          <div
            onClick={() => {
              setPickerOpen(true)
            }}
            className={clsx(
              classes.color,
              props.colors.indexOf(props.selectedColor) === -1
                ? classes.selectedColor
                : classes.notSelectedColor
            )}
            style={{
              backgroundColor:
                props.colors.indexOf(props.selectedColor) === -1
                  ? props.selectedColor
                  : "#ffffff",
            }}>
            <Colorize
              className={classes.centered}
              htmlColor={theme.palette.getContrastText(
                props.colors.indexOf(props.selectedColor) === -1
                  ? props.selectedColor
                  : "#ffffff"
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}
