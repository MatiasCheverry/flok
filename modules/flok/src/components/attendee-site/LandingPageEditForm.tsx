import {Button} from "@material-ui/core"
import {useDispatch} from "react-redux"
import NotFound404Page from "../../pages/misc/NotFound404Page"
import {postBlock} from "../../store/actions/retreat"
import {useAttendeeLandingPage} from "../../utils/retreatUtils"
import WYSIWYGBlockEditor from "./WYSIWYGBlockEditor"

type LandingPageEditFormProps = {
  pageId: number
  config: boolean
}

function LandingPageEditForm(props: LandingPageEditFormProps) {
  let page = useAttendeeLandingPage(props.pageId)
  let dispatch = useDispatch()

  if (!page) {
    return <NotFound404Page />
  }

  return (
    <div>
      {!page.block_ids.length && (
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            dispatch(
              postBlock({
                page_id: props.pageId,
                type: "WYSIWYG",
              })
            )
          }>
          Add Block
        </Button>
      )}
      {page.block_ids.map((blockId) => {
        return <WYSIWYGBlockEditor blockId={blockId} config={props.config} />
      })}
    </div>
  )
}
export default LandingPageEditForm
