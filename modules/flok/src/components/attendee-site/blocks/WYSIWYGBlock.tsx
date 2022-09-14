import {Button, makeStyles, Tooltip} from "@material-ui/core"
import {Save} from "@material-ui/icons"
import clsx from "clsx"
import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  RawDraftContentState,
} from "draft-js"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect} from "react"
import {Editor} from "react-draft-wysiwyg"
import {useDispatch} from "react-redux"
import {
  AttendeeLandingWebsiteBlockModel,
  WYSIWYGBlockContentModel,
} from "../../../models/retreat"
import {patchBlock} from "../../../store/actions/retreat"
import BeforeUnload from "../../base/BeforeUnload"

let useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    justifyContent: "center",
  },
  toolbar: {
    display: "flex",
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    zIndex: 1000,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderRadius: 20,
    marginTop: -30,
    [theme.breakpoints.down("sm")]: {},
    maxWidth: "70%",
    boxShadow: theme.shadows[2],
  },
  editor: {
    boxShadow: theme.shadows[1],
    autofocus: "true",
    width: "100%",
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
  block: AttendeeLandingWebsiteBlockModel
}

function WYSIWYGBlockEditor(props: WYSIWYGBlockEditorProps) {
  let dispatch = useDispatch()
  let formik = useFormik({
    initialValues: {
      content: props.block.content
        ? EditorState.createWithContent(
            convertFromRaw((props.block.content as WYSIWYGBlockContentModel)!)
          )
        : EditorState.createEmpty(),
      type: "WYSIWYG",
    },
    onSubmit: (values) => {
      dispatch(
        patchBlock(props.block.id, {
          content: convertToRaw(values.content.getCurrentContent()),
        })
      )
    },
  })
  let {resetForm} = formik
  useEffect(() => {
    resetForm({
      values: {
        content: props.block.content
          ? EditorState.createWithContent(
              convertFromRaw(
                props.block.content as unknown as RawDraftContentState
              )
            )
          : EditorState.createEmpty(),
        type: "WYSIWYG",
      },
    })
  }, [props.block, resetForm])
  let classes = useStyles(formik)
  return (
    <div>
      <BeforeUnload
        when={
          !_.isEqual(
            convertToRaw(formik.values.content.getCurrentContent()),
            convertToRaw(formik.initialValues.content.getCurrentContent())
          )
        }
        message="Are you sure you wish to leave without saving your changes?"
      />
      <form onSubmit={formik.handleSubmit}>
        <Editor
          spellCheck
          editorState={formik.values.content}
          onEditorStateChange={(val) => formik.setFieldValue(`content`, val)}
          wrapperClassName={classes.wrapper}
          editorClassName={classes.editor}
          toolbarClassName={classes.toolbar}
          stripPastedStyles={true}
          toolbarOnFocus
          placeholder="Start typing here to create your page"
          toolbarCustomButtons={[
            <SaveOption
              disabled={_.isEqual(
                convertToRaw(formik.values.content.getCurrentContent()),
                convertToRaw(formik.initialValues.content.getCurrentContent())
              )}
            />,
          ]}
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
            colorPicker: {
              // icon: color,
              className: undefined,
              component: undefined,
              popupClassName: undefined,
              colors: [
                "rgb(97,189,109)",
                "rgb(26,188,156)",
                "rgb(84,172,210)",
                "rgb(44,130,201)",
                "rgb(147,101,184)",
                "rgb(71,85,119)",
                "rgb(204,204,204)",
                "rgb(65,168,95)",
                "rgb(0,168,133)",
                "rgb(61,142,185)",
                "rgb(41,105,176)",
                "rgb(85,57,130)",
                "rgb(40,50,78)",
                "rgb(0,0,0)",
                "rgb(247,218,100)",
                "rgb(251,160,38)",
                "rgb(235,107,86)",
                "rgb(226,80,65)",
                "rgb(163,143,132)",
                "rgb(239,239,239)",
                "rgb(255,255,255)",
                "rgb(250,197,28)",
                "rgb(243,121,52)",
                "rgb(209,72,65)",
                "rgb(184,49,47)",
                "rgb(124,112,107)",
                "rgb(209,213,216)",
                "#0A6EFA",
                "#FF70A1",
                "#FFB746",
                "#FF5B29",
                "#A13DFF",
                "#FFFFFF",
                "#262624",
              ],
            },
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

let useSaveOptionStyles = makeStyles(() => ({
  disabled: {
    cursor: "not-allowed",
    color: "grey",
  },
}))

function SaveOption(props: {disabled?: boolean}) {
  let classes = useSaveOptionStyles()
  return (
    <Tooltip title={props.disabled ? "No changes to save" : "Save changes"}>
      <div>
        <button
          type="submit"
          disabled={props.disabled}
          className={clsx(
            "rdw-option-wrapper",
            props.disabled ? classes.disabled : undefined
          )}>
          <Save fontSize="small" color="primary" />
        </button>
      </div>
    </Tooltip>
  )
}
