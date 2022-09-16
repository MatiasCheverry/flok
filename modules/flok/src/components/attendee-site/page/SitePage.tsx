import {Box, makeStyles} from "@material-ui/core"
import NotFound404Page from "../../../pages/misc/NotFound404Page"
import {useAttendeeLandingPage} from "../../../utils/retreatUtils"
import {AddBlockButton, PageBlock} from "../block/PageBlock"

let useStyles = makeStyles((theme) => ({
  blocks: {
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(2),
    },
  },
}))

type SitePageProps = {
  pageId: number
  editable?: boolean
}

function SitePage(props: SitePageProps) {
  let [page, loadingPage] = useAttendeeLandingPage(props.pageId)
  let classes = useStyles()

  return !page ? (
    <NotFound404Page />
  ) : (
    <div className={classes.blocks}>
      {page.block_ids.map((blockId) => {
        return <PageBlock blockId={blockId} editable={props.editable} />
      })}
      {props.editable && (
        <Box display="flex" justifyContent="center">
          <AddBlockButton pageId={props.pageId} />
        </Box>
      )}
    </div>
  )
}
export default SitePage
