import {
  Box,
  IconButton,
  ListItem,
  makeStyles,
  MenuItem,
  Popover,
} from "@material-ui/core"
import {Add, Delete} from "@material-ui/icons"
import React, {useState} from "react"
import {useDispatch} from "react-redux"
import {
  FormBlockType,
  FormBlockTypeName,
  FormBlockTypeValues,
} from "../../../models/retreat"
import {WYSIWYGBlockRenderer} from "../../../pages/attendee-site/AttendeeSitePage"
import {deleteBlock, postBlock} from "../../../store/actions/retreat"
import {useAttendeeLandingPageBlock} from "../../../utils/retreatUtils"
import AppLoadingScreen from "../../base/AppLoadingScreen"
import AppTypography from "../../base/AppTypography"
import AppConfirmationModal from "../../base/ConfirmationModal"
import {AccordionBlockEditor, AccordionBlockRenderer} from "./AccordionBlock"
import WYSIWYGBlockEditor from "./WYSIWYGBlock"

let useStyles = makeStyles((theme) => ({
  blockRoot: {
    position: "relative",
  },
  deleteBlockBtnContainer: {
    position: "absolute",
    top: 0,
    display: "flex",
    width: "100%",
  },
  deleteBlockBtn: {
    marginLeft: "auto",
    zIndex: 1000,
  },
}))

type BlockEditorProps = {blockId: number}
export function BlockEditor(props: BlockEditorProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  let [block, loading] = useAttendeeLandingPageBlock(props.blockId)
  let [deleteOpen, setDeleteOpen] = useState(false)
  return !block && loading ? (
    <AppLoadingScreen />
  ) : block ? (
    <div className={classes.blockRoot}>
      <div className={classes.deleteBlockBtnContainer}>
        <IconButton
          className={classes.deleteBlockBtn}
          onClick={() => setDeleteOpen(true)}>
          <Delete />
        </IconButton>
        <AppConfirmationModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onSubmit={async () => {
            await dispatch(deleteBlock(props.blockId))
            setDeleteOpen(false)
          }}
          text="Proceed with caution! This action cannot be undone."
          title="Are you sure you want to delete this section?"
        />
      </div>
      {block.type === "WYSIWYG" ? (
        <WYSIWYGBlockEditor block={block} />
      ) : block.type === "ACCORDION" ? (
        <AccordionBlockEditor block={block} />
      ) : (
        <div>Something went wrong loading the block.</div>
      )}
    </div>
  ) : (
    <div>Something went wrong</div>
  )
}

let useRendererStyles = makeStyles((theme) => ({
  blockRoot: {
    width: "100%",
    maxWidth: 800,
  },
  deleteBlockBtnContainer: {
    position: "absolute",
    top: 0,
    display: "flex",
    width: "100%",
  },
  deleteBlockBtn: {
    marginLeft: "auto",
    zIndex: 1000,
  },
}))

type BlockRendererProps = {blockId: number}
export function BlockRenderer(props: BlockRendererProps) {
  let classes = useRendererStyles(props)
  let [block, loading] = useAttendeeLandingPageBlock(props.blockId)
  return !block && loading ? (
    <AppLoadingScreen />
  ) : block ? (
    <div className={classes.blockRoot}>
      {block.type === "WYSIWYG" ? (
        <WYSIWYGBlockRenderer block={block} />
      ) : block.type === "ACCORDION" ? (
        <AccordionBlockRenderer block={block} />
      ) : (
        <div>Something went wrong loading the block.</div>
      )}
    </div>
  ) : (
    <div>Something went wrong</div>
  )
}

let useNewBlockButtonStyles = makeStyles((theme) => ({
  addBlockButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.common.white,
    },
  },
}))

type AddNewBlockButtonProps = {
  pageId: number
}
export function AddNewBlockButton(props: AddNewBlockButtonProps) {
  let classes = useNewBlockButtonStyles()
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
      <IconButton
        color="inherit"
        className={classes.addBlockButton}
        onClick={openAddBlockPopover}>
        <Add />
      </IconButton>
      <Popover
        anchorEl={addBlockAnchorEl}
        open={addBlockOpen}
        onClose={closeNewBlockPopover}>
        <div>
          <ListItem>
            <AppTypography fontWeight="bold" variant="body1">
              Add new website section
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
