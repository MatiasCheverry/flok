import {
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnUnderline,
  Editor,
  EditorProps,
  EditorProvider,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg"

export default function AppWysiwygEditor(props: EditorProps) {
  return (
    <EditorProvider>
      <Editor {...props}>
        <Toolbar>
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <Separator />
          <BtnNumberedList />
          <BtnBulletList />
          <BtnLink />
          <Separator />
        </Toolbar>
      </Editor>
    </EditorProvider>
  )
}
