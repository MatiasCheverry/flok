import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  makeStyles,
  TextField,
} from "@material-ui/core"
import {ExpandMore} from "@material-ui/icons"
import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  RawDraftContentState,
} from "draft-js"
import draftToHtml from "draftjs-to-html"
import {useFormik} from "formik"
import _ from "lodash"
import {Editor} from "react-draft-wysiwyg"
import {useDispatch} from "react-redux"
import {
  AccordionBlockContentModel,
  AttendeeLandingWebsiteBlockModel,
} from "../../../models/retreat"
import {patchBlock} from "../../../store/actions/retreat"

let useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.common.white,
    boxShadow: theme.shadows[1],
    width: "100%",
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
    minHeight: 200,
  },
  wrapper: {
    width: "100%",
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
    autofocus: "true",
    width: "100%",
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
    backgroundColor: "white",
  },
  saveButton: {
    position: "absolute",
    boxShadow: theme.shadows[2],
    bottom: 40,
    zIndex: 10,
    right: 60,
  },
}))

type AccordionBlockEditorProps = {
  block: AttendeeLandingWebsiteBlockModel
}
export function AccordionBlockEditor(props: AccordionBlockEditorProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  let formik = useFormik({
    initialValues: convertContentFromRaw(
      props.block.content as AccordionBlockContentModel
    ),
    onSubmit: (values) => {
      dispatch(
        patchBlock(props.block.id, {content: convertFormikToRaw(values)})
      )
    },
    enableReinitialize: true,
  })

  // TODO fix this "any"
  function convertFormikToRaw(values: any) {
    return {
      items: values.items.map((item: any) => ({
        ...item,
        body: convertToRaw(item.body.getCurrentContent()),
      })),
    }
  }

  function convertContentFromRaw(content: AccordionBlockContentModel | null) {
    if (!content) {
      return {items: []}
    } else {
      return {
        items: content.items.map((item) => {
          return {
            ...item,
            body: item.body
              ? EditorState.createWithContent(convertFromRaw(item.body))
              : EditorState.createEmpty(),
          }
        }),
      }
    }
  }

  return (
    <form className={classes.root} onSubmit={formik.handleSubmit}>
      {formik.values.items.map((item, index) => (
        <>
          <Accordion elevation={0}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <TextField
                id={`items[${index}].header`}
                value={formik.values.items[index].header}
                onChange={formik.handleChange}
                fullWidth
                placeholder="Item header"
              />
            </AccordionSummary>
            <AccordionDetails>
              <Editor
                spellCheck
                editorState={formik.values.items[index].body}
                onEditorStateChange={(val) =>
                  formik.setFieldValue(`items[${index}].body`, val)
                }
                wrapperClassName={classes.wrapper}
                editorClassName={classes.editor}
                toolbarClassName={classes.toolbar}
                stripPastedStyles={true}
                toolbarOnFocus
                placeholder="Start typing here"
                toolbar={{
                  options: [
                    "blockType",
                    "inline",
                    "list",
                    "textAlign",
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
            </AccordionDetails>
          </Accordion>
        </>
      ))}
      <Button
        variant="contained"
        onClick={() =>
          formik.setFieldValue("items", [
            ...formik.values.items,
            {header: "", body: EditorState.createEmpty()},
          ])
        }>
        Add accordion item
      </Button>
      {!_.isEqual(
        convertFormikToRaw(formik.initialValues),
        convertFormikToRaw(formik.values)
      ) && (
        <Button
          type="submit"
          className={classes.saveButton}
          variant="contained"
          color="primary">
          Save
        </Button>
      )}
    </form>
  )
}

let useRendererStyles = makeStyles((theme) => ({
  headerExpanded: {
    fontWeight: theme.typography.fontWeightBold,
  },
  websiteBody: {
    "& > *:not(:first-child)": {
      margin: "1em 0",
    },
    "& > *:not(:first-child) > *:not(:first-child)": {
      margin: "1em 0",
    },
  },
}))

type AccordionBlockRendererProps = {
  block: AttendeeLandingWebsiteBlockModel
}

export function AccordionBlockRenderer(props: AccordionBlockRendererProps) {
  let classes = useRendererStyles()
  let items = props.block.content
    ? (props.block.content as AccordionBlockContentModel)!.items
    : []
  return (
    <>
      {items.map((item, index) => (
        <Accordion elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            classes={{expanded: classes.headerExpanded}}>
            {item.header}
          </AccordionSummary>
          <AccordionDetails>
            {item.header ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: draftToHtml(
                    item.body as unknown as RawDraftContentState
                  ),
                }}
                className={classes.websiteBody}></div>
            ) : (
              <></>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}
