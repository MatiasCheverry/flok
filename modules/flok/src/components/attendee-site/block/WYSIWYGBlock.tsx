import {Paper} from "@material-ui/core"
import {convertFromRaw, convertToRaw, EditorState} from "draft-js"
import {useFormik} from "formik"
import _ from "lodash"
import {FormEvent, useEffect} from "react"
import {useDispatch} from "react-redux"
import {
  AttendeeLandingWebsiteBlockModel,
  WYSIWYGBlockContentModel,
} from "../../../models/retreat"
import {patchBlock} from "../../../store/actions/retreat"
import {
  AppWysiwygEditor,
  AppWysiwygViewer,
  createEditorState,
} from "../../AppWysiwyg"
import BeforeUnload from "../../base/BeforeUnload"

type WYSIWYGBlockEditorProps = {
  block: AttendeeLandingWebsiteBlockModel<WYSIWYGBlockContentModel>
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
        content: createEditorState(props.block.content),
        type: "WYSIWYG",
      },
    })
  }, [props.block, resetForm])
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
      <Paper
        elevation={0}
        variant="outlined"
        component={"form"}
        onSubmit={(e) =>
          // as unkown is okay because TS isn't recognizing the component is "form"
          formik.handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
        }>
        <AppWysiwygEditor
          editorState={formik.values.content}
          onEditorStateChange={(val) => formik.setFieldValue(`content`, val)}
        />
      </Paper>
    </div>
  )
}
export default WYSIWYGBlockEditor

type WYSIWYGBlockRendererProps = {
  block: AttendeeLandingWebsiteBlockModel
}
export function WYSIWYGBlockRenderer(props: WYSIWYGBlockRendererProps) {
  return props.block.content != null ? (
    <AppWysiwygViewer
      content={(props.block.content as WYSIWYGBlockContentModel)!}
    />
  ) : (
    <></>
  )
}
