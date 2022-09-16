import {
  Box,
  IconButton,
  ListItem,
  makeStyles,
  MenuItem,
  Popover,
  Tooltip,
} from "@material-ui/core"
import {Add, Delete} from "@material-ui/icons"
import React, {useState} from "react"
import {useDispatch} from "react-redux"
import {
  AccordionBlockContentModel,
  AttendeeLandingWebsiteBlockModel,
  FormBlockType,
  FormBlockTypeName,
  FormBlockTypeValues,
  WYSIWYGBlockContentModel,
} from "../../../models/retreat"
import {deleteBlock, postBlock} from "../../../store/actions/retreat"
import {useAttendeeLandingPageBlock} from "../../../utils/retreatUtils"
import AppLoadingScreen from "../../base/AppLoadingScreen"
import AppTypography from "../../base/AppTypography"
import AppConfirmationModal from "../../base/ConfirmationModal"
import {AccordionBlockEditor, AccordionBlockRenderer} from "./AccordionBlock"
import WYSIWYGBlockEditor, {WYSIWYGBlockRenderer} from "./WYSIWYGBlock"

let useStyles = makeStyles((theme) => ({
  blockRoot: {
    width: "100%",
  },
}))

type PageBlockProps = {blockId: number; editable?: boolean}
export function PageBlock(props: PageBlockProps) {
  let classes = useStyles(props)
  let [block, loading] = useAttendeeLandingPageBlock(props.blockId)
  return !block || loading ? (
    <AppLoadingScreen />
  ) : block ? (
    <div className={classes.blockRoot}>
      {block.type === "WYSIWYG" ? (
        props.editable ? (
          <WYSIWYGBlockEditor
            block={
              block as AttendeeLandingWebsiteBlockModel<WYSIWYGBlockContentModel>
            }
          />
        ) : (
          <WYSIWYGBlockRenderer
            block={
              block as AttendeeLandingWebsiteBlockModel<WYSIWYGBlockContentModel>
            }
          />
        )
      ) : block.type === "ACCORDION" ? (
        props.editable ? (
          <AccordionBlockEditor
            block={
              block as AttendeeLandingWebsiteBlockModel<AccordionBlockContentModel>
            }
          />
        ) : (
          <AccordionBlockRenderer
            block={
              block as AttendeeLandingWebsiteBlockModel<AccordionBlockContentModel>
            }
          />
        )
      ) : (
        <div>Something went wrong loading the section.</div>
      )}
    </div>
  ) : (
    <div>Something went wrong</div>
  )
}

type AddBlockButtonProps = {
  pageId: number
}
export function AddBlockButton(props: AddBlockButtonProps) {
  let dispatch = useDispatch()
  const [addBlockAnchorEl, setAddBlockAnchorEl] =
    React.useState<HTMLButtonElement | null>(null)
  const openAddBlockPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddBlockAnchorEl(event.currentTarget)
  }
  const addBlockOpen = Boolean(addBlockAnchorEl)
  let [loadingNewBlock, setLoadingNewBlock] = useState(false)
  function closeNewBlockPopover() {
    setAddBlockAnchorEl(null)
  }
  async function postNewBlock(blockType: FormBlockType) {
    setLoadingNewBlock(true)
    closeNewBlockPopover()
    await dispatch(postBlock({page_id: props.pageId, type: blockType}))
    setLoadingNewBlock(false)
  }
  return loadingNewBlock ? (
    <Box width="100%" height="100px" position="relative">
      <AppLoadingScreen />
    </Box>
  ) : (
    <>
      <Tooltip title="Add a new section">
        <IconButton color="primary" onClick={openAddBlockPopover}>
          <Add />
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={addBlockAnchorEl}
        open={addBlockOpen}
        onClose={closeNewBlockPopover}>
        <div>
          <ListItem>
            <AppTypography fontWeight="bold" variant="body1">
              Add new section
            </AppTypography>
          </ListItem>
          {FormBlockTypeValues.map((type) => (
            <MenuItem value={type} button onClick={() => postNewBlock(type)}>
              {FormBlockTypeName[type] ?? type}
            </MenuItem>
          ))}
        </div>
      </Popover>
    </>
  )
}

type DeleteBlockButtonProps = {block: AttendeeLandingWebsiteBlockModel}
function DeleteBlockButton(props: DeleteBlockButtonProps) {
  let dispatch = useDispatch()
  let [deleteOpen, setDeleteOpen] = useState(false)
  return (
    <>
      <IconButton onClick={() => setDeleteOpen(true)}>
        <Delete />
      </IconButton>
      <AppConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onSubmit={async () => {
          await dispatch(deleteBlock(props.block.id))
          setDeleteOpen(false)
        }}
        text="Proceed with caution! This action cannot be undone."
        title="Are you sure you want to delete this section?"
      />
    </>
  )
}
