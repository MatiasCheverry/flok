import {Box} from "@material-ui/core"
import NotFound404Page from "../../pages/misc/NotFound404Page"
import {useAttendeeLandingPage} from "../../utils/retreatUtils"
import {AddNewBlockButton, BlockEditor} from "./blocks/Blocks"

import {makeStyles} from "@material-ui/core"

let useStyles = makeStyles((theme) => ({
  blocks: {
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: 800,
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(2),
    },
  },
}))

type LandingPageEditFormProps = {
  pageId: number
  config: boolean
}

function LandingPageEditForm(props: LandingPageEditFormProps) {
  let page = useAttendeeLandingPage(props.pageId)
  let classes = useStyles()

  if (!page) {
    return <NotFound404Page />
  }

  return (
    <div className={classes.blocks}>
      {page.block_ids.map((blockId) => {
        return <BlockEditor blockId={blockId} />
      })}
      <Box display="flex" justifyContent="center">
        <AddNewBlockButton pageId={props.pageId} />
      </Box>
    </div>
  )
}
export default LandingPageEditForm
