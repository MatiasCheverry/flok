import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core"
import {ExpandMore} from "@material-ui/icons"
import {convertToRaw, EditorState} from "draft-js"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect} from "react"
import {useDispatch} from "react-redux"
import {
  AccordionBlockContentModel,
  AttendeeLandingWebsiteBlockModel,
} from "../../../models/retreat"
import {patchBlock} from "../../../store/actions/retreat"
import {
  AppWysiwygEditor,
  AppWysiwygViewer,
  createEditorState,
} from "../../AppWysiwyg"

let useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[0],
    width: "100%",
    height: "100%",
    // padding: theme.spacing(1),
    // borderRadius: theme.shape.borderRadius,
    // [theme.breakpoints.down("sm")]: {
    //   width: "100%",
    // },
    // minHeight: 200,
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
            body: createEditorState(item.body),
          }
        }),
      }
    }
  }

  let {resetForm} = formik
  useEffect(() => {
    resetForm({
      values: convertContentFromRaw(
        props.block.content as AccordionBlockContentModel
      ),
    })
  }, [props.block.content, resetForm])

  return (
    <form className={classes.root} onSubmit={formik.handleSubmit}>
      {formik.values.items.map((item, index) => (
        <AccordionItem
          header={
            <TextField
              id={`items[${index}].header`}
              value={item.header}
              onChange={formik.handleChange}
              fullWidth
              placeholder="Item header"
            />
          }
          details={
            <AppWysiwygEditor
              editorState={item.body}
              onEditorStateChange={(val) =>
                formik.setFieldValue(`items[${index}].body`, val)
              }
            />
          }
        />
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

type AccordionBlockRendererProps = {
  block: AttendeeLandingWebsiteBlockModel<AccordionBlockContentModel>
}

export function AccordionBlockRenderer(props: AccordionBlockRendererProps) {
  let items =
    props.block.content && props.block.content.items
      ? props.block.content.items
      : []
  return (
    <>
      {items.map((item) => (
        <AccordionItem
          header={<Typography variant="body1">{item.header}</Typography>}
          details={<AppWysiwygViewer content={item.body} />}
        />
      ))}
    </>
  )
}

let useAccordionItemStyle = makeStyles((theme) => ({
  headerExpanded: {
    "& *": {
      fontWeight: theme.typography.fontWeightBold,
    },
  },
}))

type AccordionBlockProps = {
  header: JSX.Element
  details: JSX.Element
}

function AccordionItem(props: AccordionBlockProps) {
  let classes = useAccordionItemStyle()
  return (
    <Accordion elevation={0}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        classes={{expanded: classes.headerExpanded}}>
        {props.header}
      </AccordionSummary>
      <AccordionDetails>{props.details}</AccordionDetails>
    </Accordion>
  )
}
