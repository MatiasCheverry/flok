import {Button, makeStyles} from "@material-ui/core"
import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  RawDraftContentState,
  RichUtils,
} from "draft-js"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect, useState} from "react"
import {RGBColor, SketchPicker} from "react-color"
import {Editor} from "react-draft-wysiwyg"
import {useDispatch} from "react-redux"
import {patchBlock} from "../../store/actions/retreat"
import {useAttendeeLandingPageBlock} from "../../utils/retreatUtils"
import BeforeUnload from "../base/BeforeUnload"

let useStyles = makeStyles((theme) => ({
  wrapper: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
  },
  toolbar: {
    display: "flex",
    position: "absolute",
    zIndex: 1000,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderRadius: 20,
    marginTop: -30,
    [theme.breakpoints.down("sm")]: {
      marginTop: -20,
    },
    maxWidth: "70%",
    boxShadow: theme.shadows[2],
  },
  editor: {
    boxShadow: theme.shadows[1],

    autofocus: "true",
    width: "90%",
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
    minHeight: 200,
    backgroundColor: "white",
  },
  saveButton: {
    position: "absolute",
    boxShadow: theme.shadows[2],
    bottom: 40,
    zIndex: 10,
    right: 60,
    display: (props: any) =>
      _.isEqual(
        convertToRaw(props.values.content.getCurrentContent()),
        convertToRaw(props.initialValues.content.getCurrentContent())
      )
        ? "none"
        : "block",
  },
}))
type WYSIWYGBlockEditorProps = {
  blockId: number
  config: boolean
}

function WYSIWYGBlockEditor(props: WYSIWYGBlockEditorProps) {
  let dispatch = useDispatch()
  let block = useAttendeeLandingPageBlock(props.blockId)
  let formik = useFormik({
    initialValues: {
      content: block?.content
        ? EditorState.createWithContent(
            convertFromRaw(block.content as unknown as RawDraftContentState)
          )
        : EditorState.createEmpty(),
      type: "WYSIWYG",
    },
    onSubmit: (values) => {
      dispatch(
        patchBlock(props.blockId, {
          content: convertToRaw(values.content.getCurrentContent()),
        })
      )
    },
  })
  let {resetForm} = formik
  useEffect(() => {
    resetForm({
      values: {
        content: block?.content
          ? EditorState.createWithContent(
              convertFromRaw(block.content as unknown as RawDraftContentState)
            )
          : EditorState.createEmpty(),
        type: "WYSIWYG",
      },
    })
  }, [block, resetForm])
  let classes = useStyles(formik)
  return (
    <div>
      <BeforeUnload
        when={
          !_.isEqual(
            convertToRaw(formik.values.content.getCurrentContent()),
            convertToRaw(formik.initialValues.content.getCurrentContent())
          ) && !props.config
        }
        message="Are you sure you wish to leave without saving your changes?"
      />
      <form onSubmit={formik.handleSubmit}>
        <Editor
          spellCheck
          toolbarCustomButtons={[
            <ToolbarColorPicker
              selectedColor={getCurrentColor(formik.values.content)}
              onSelectColor={(color) =>
                formik.setFieldValue(
                  "content",
                  applyColor(formik.values.content, color)
                )
              }
            />,
          ]}
          editorState={formik.values.content}
          onEditorStateChange={(val) => formik.setFieldValue(`content`, val)}
          wrapperClassName={classes.wrapper}
          editorClassName={classes.editor}
          toolbarClassName={classes.toolbar}
          stripPastedStyles={true}
          toolbarOnFocus
          placeholder="Start typing here to create your page"
          toolbar={{
            options: [
              "blockType",
              "inline",
              "list",
              "textAlign",
              "link",
              "colorPicker",
            ],
            inline: {
              inDropdown: true,
              options: ["bold", "italic", "underline", "strikethrough"],
            },
            list: {inDropdown: true, options: ["unordered", "ordered"]},
            textAlign: {
              inDropdown: false,
              options: ["left", "center", "right"],
            },
            link: {inDropdown: false, options: ["link"]},
          }}
        />
        <Button
          type="submit"
          className={classes.saveButton}
          variant="contained"
          color="primary">
          Save
        </Button>
      </form>
    </div>
  )
}
export default WYSIWYGBlockEditor

function ToolbarColorPicker(props: {
  selectedColor: RGBColor | undefined
  onSelectColor: (color: RGBColor) => void
}) {
  let [el, setEl] = useState<HTMLButtonElement | null>(null)
  return (
    <>
      <button onClick={(e) => setEl(e.currentTarget)}>open</button>
      {/* <ClickAwayListener onClickAway={() => setEl(null)}> */}
      {/* <Dialog open={!!el} onClose={() => setEl(null)}> */}
      <SketchPicker
        onChangeComplete={(color) => props.onSelectColor(color.rgb)}
        disableAlpha
        presetColors={["rgb(0,0,0)", "rgb(100,100,100)", "rgb(255,255,255)"]}
        color={props.selectedColor}
      />
      {/* </Dialog> */}
      {/* </ClickAwayListener> */}
    </>
  )
}

function getCurrentColor(editorState: EditorState): RGBColor | undefined {
  let colorStrs = editorState
    .getCurrentInlineStyle()
    .filter((val) => !!val && val.startsWith("color-rgb"))
  if (colorStrs.size) {
    let colorStr = colorStrs.last().replace("color-rgb(", "").replace(")", "")
    return {
      r: parseInt(colorStr.split(",")[0]),
      g: parseInt(colorStr.split(",")[1]),
      b: parseInt(colorStr.split(",")[2]),
    }
  }
}

function applyColor(editorState: EditorState, color: RGBColor): EditorState {
  let updatedEditorState = editorState
  let colorStrs = updatedEditorState
    .getCurrentInlineStyle()
    .filter((val) => !!val && val.startsWith("color-rgb"))
  colorStrs.forEach((style) => {
    console.log(style)
    if (style) {
      updatedEditorState = RichUtils.toggleInlineStyle(
        updatedEditorState,
        style
      )
    }
  })
  let newColorStr = `color-rgb(${color.r}, ${color.g}, ${color.b})`
  updatedEditorState = RichUtils.toggleInlineStyle(
    updatedEditorState,
    newColorStr
  )
  return updatedEditorState
}
