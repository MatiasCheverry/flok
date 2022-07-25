import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useMediaQuery,
} from "@material-ui/core"
import {HighlightOffRounded} from "@material-ui/icons"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import config, {IMAGE_SERVER_BASE_URL_KEY} from "../../config"
import {ImageModel} from "../../models"
import {PresetImageType} from "../../models/retreat"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {RootState} from "../../store"
import {getPresetImages} from "../../store/actions/retreat"
import {FlokTheme} from "../../theme"
import AppMoreInfoIcon from "../base/AppMoreInfoIcon"

let useImageStyles = makeStyles((theme) => ({
  uploadImageContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  header: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  loader: {
    height: 20,
  },
  imageUploadFlex: {
    display: "flex",
    alignItems: "center",
  },
  presetImage: {
    height: 150,
    width: 240,
  },
  titleDiv: {
    display: "flex",
    alignItems: "center",
  },
  orText: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  fileNameText: {
    width: 200,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    marginTop: "4px",
    marginLeft: "8px",
  },
}))
type UploadImageWithTemplateProps = {
  value: ImageModel | undefined
  handleChange: (image: ImageModel) => void
  id: string
  headerText: string
  tooltipText?: string
  handleClear?: () => void
  type: PresetImageType
}

export default function UploadImageWithTemplate(
  props: UploadImageWithTemplateProps
) {
  const [loading, setLoading] = useState(false)
  let dispatch = useDispatch()
  let [presetModalOpen, setPresetModalOpen] = useState(false)
  const isSmallScreen = useMediaQuery((theme: FlokTheme) =>
    theme.breakpoints.down("sm")
  )
  var splitFileName = function (str: string) {
    let popped = str.split("\\").pop()
    if (popped) {
      return popped.split("/").pop()
    }
  }
  let presetImages = useSelector((state: RootState) => {
    return state.retreat.presetImages
  })

  let rows: {img1: ImageModel; img2?: ImageModel}[] = []
  useEffect(() => {
    !presetImages[props.type][0] && dispatch(getPresetImages(props.type))
  }, [presetImages, props.type, dispatch])
  let classes = useImageStyles()
  if (!isSmallScreen) {
    for (let i = 0; i < presetImages[props.type].length; i += 2) {
      if (i < presetImages[props.type].length - 1) {
        rows.push({
          img1: presetImages[props.type][i].image,
          img2: presetImages[props.type][i + 1].image,
        })
      } else {
        rows.push({
          img1: presetImages[props.type][i].image,
        })
      }
    }
  } else {
    for (let i = 0; i < presetImages[props.type].length; i++) {
      rows.push({
        img1: presetImages[props.type][i].image,
      })
    }
  }
  function handleImageClick(image: ImageModel) {
    props.handleChange(image)
    setPresetModalOpen(false)
  }
  return (
    <div className={classes.uploadImageContainer}>
      <Dialog
        open={presetModalOpen}
        onClose={() => {
          setPresetModalOpen(false)
        }}>
        <DialogTitle>Choose Preset Image</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table aria-label="simple table">
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={row.img1.image_url}
                        className={classes.presetImage}
                        alt="preset"
                        onClick={() => {
                          handleImageClick(row.img1)
                        }}></img>
                    </TableCell>
                    {row.img2 && (
                      <TableCell align="right">
                        <img
                          src={row.img2.image_url}
                          alt="preset"
                          className={classes.presetImage}
                          onClick={() => {
                            row.img2 && handleImageClick(row.img2)
                          }}></img>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
      <div className={classes.titleDiv}>
        <Typography className={classes.header}>{props.headerText}</Typography>
        {props.tooltipText && (
          <AppMoreInfoIcon tooltipText={props.tooltipText} />
        )}
      </div>

      {loading ? (
        <CircularProgress size="20px" className={classes.loader} />
      ) : (
        <div className={classes.imageUploadFlex}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            component="label">
            Choose File
            <input
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              hidden
              onChange={(e) => {
                if (e.target && e.target.files && e.target.files[0]) {
                  let data = new FormData()
                  data.append("file", e.target.files[0])
                  setLoading(true)
                  fetch(`${config.get(IMAGE_SERVER_BASE_URL_KEY)}/api/images`, {
                    body: data,
                    method: "POST",
                    mode: "cors",
                  })
                    .then((res) => res.json())
                    .then((resdata) => {
                      props.handleChange(resdata.image)
                      setLoading(false)
                    })
                    .catch((error) => {
                      setLoading(false)
                      dispatch(
                        enqueueSnackbar({
                          message: "Oops, something went wrong",
                          options: {
                            variant: "error",
                          },
                        })
                      )
                    })
                }
              }}
            />
          </Button>
          <Typography className={classes.orText}>or</Typography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => {
              setPresetModalOpen(true)
            }}>
            Choose Preset
          </Button>
          {props.handleClear && (
            <IconButton onClick={props.handleClear} size="small">
              <HighlightOffRounded />
            </IconButton>
          )}
        </div>
      )}
      <Typography className={classes.fileNameText}>
        {props.value?.image_url
          ? splitFileName(props.value?.image_url)
          : "No file chosen"}
      </Typography>
    </div>
  )
}
