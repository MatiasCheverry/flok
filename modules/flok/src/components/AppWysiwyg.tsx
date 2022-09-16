import {makeStyles} from "@material-ui/core"
import {convertFromRaw, EditorState, RawDraftContentState} from "draft-js"
import draftToHtml from "draftjs-to-html"
import {useEffect, useState} from "react"
import {Editor} from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import {SaveOption} from "./attendee-site/block/WYSIWYGBlock"

let useEditorStyles = makeStyles((theme) => ({
  wrapper: {
    position: "relative",
    display: "flex",
    width: "100%",
  },
  editor: {
    padding: theme.spacing(1),
    width: "100%",
  },
  toolbar: {
    position: "absolute",
    borderRadius: theme.shape.borderRadius,
    zIndex: 1000,
    backgroundColor: theme.palette.grey[200],
    boxShadow: theme.shadows[1],
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
}))

type AppWysiwygEditorProps = {
  editorState: EditorState
  onEditorStateChange: (val: EditorState) => void
  placeholder?: string
}
export function AppWysiwygEditor(props: AppWysiwygEditorProps) {
  let classes = useEditorStyles(props)
  let [offsetToolbar, setOffsetToolbar] = useState<number | null>(null)
  let [activeAnchorKey, setActiveAnchorKey] = useState<string | null>(null)
  useEffect(() => {
    let hasFocus = props.editorState.getSelection().getHasFocus()
    if (hasFocus) {
      let anchorKey = props.editorState.getSelection().getAnchorKey()
      const blockEl = document.querySelector(
        `[data-offset-key="${anchorKey}-0-0"][data-block="true"]`
      )
      if (blockEl) {
        // @ts-ignore
        setOffsetToolbar(blockEl.offsetTop)
      } else {
        // In this instance sometimes the blockEl hasn't been rendered yet.
        // This is a hack -- if there's a better way we should fix it
        // Example: pressing enter changes content state, but the element not in DOM when we get anchor key
        setTimeout(() => {
          const blockEl = document.querySelector(
            `[data-offset-key="${anchorKey}-0-0"][data-block="true"]`
          )
          // @ts-ignore
          setOffsetToolbar(blockEl ? blockEl.offsetTop : null)
        }, 1)
      }
    } else {
      setOffsetToolbar(null)
      setActiveAnchorKey(null)
    }
  }, [props.editorState, activeAnchorKey])

  console.log(props.editorState.getSelection().getStartOffset())

  return (
    <Editor
      spellCheck
      editorState={props.editorState}
      onEditorStateChange={props.onEditorStateChange}
      stripPastedStyles={true}
      wrapperClassName={classes.wrapper}
      editorClassName={classes.editor}
      toolbarClassName={classes.toolbar}
      toolbarStyle={{top: offsetToolbar ? offsetToolbar : undefined}}
      toolbarOnFocus
      placeholder={props.placeholder || "Start typing here"}
      toolbarCustomButtons={[<SaveOption />]}
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
        list: {
          inDropdown: true,
          options: ["unordered", "ordered"],
        },
        textAlign: {
          inDropdown: false,
          options: ["left", "center", "right"],
        },
        link: {
          inDropdown: false,
          options: ["link"],
          showOpenOptionOnHover: false,
        },
        colorPicker: {
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
  )
}

let useViewerStyles = makeStyles((theme) => ({
  root: {
    // "& > *:not(:first-child)": {
    //   margin: "1em 0",
    // },
    // "& > *:not(:first-child) > *:not(:first-child)": {
    //   margin: "1em 0",
    // },
  },
}))

type AppWysiwygViewerProps = {content: RawDraftContentState}
export function AppWysiwygViewer(props: AppWysiwygViewerProps) {
  let classes = useViewerStyles(props)
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: draftToHtml(props.content),
      }}
      className={classes.root}
    />
  )
}

/**
 * When initializing EditorState from server driven data
 *  the selection state resets the first position. The issue
 *  is that if the Editor was already created this causes the
 *  cursor not to update back to the first line. This will force
 *  the selection and cursor to match.
 */
export function createEditorState(raw?: RawDraftContentState | null) {
  let editorState = raw
    ? EditorState.createWithContent(convertFromRaw(raw))
    : EditorState.createEmpty()
  return EditorState.forceSelection(editorState, editorState.getSelection())
}
