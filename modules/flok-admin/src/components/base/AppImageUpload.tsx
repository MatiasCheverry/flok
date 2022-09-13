import {
  Button,
  CircularProgress,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core"
import {HighlightOffRounded} from "@material-ui/icons"
import {useState} from "react"
import {useDispatch} from "react-redux"
import config, {IMAGE_SERVER_BASE_URL_KEY} from "../../config"
import {AdminImageModel} from "../../models"
import {enqueueSnackbar} from "../../notistack-lib/actions"

let useStyles = makeStyles((theme) => ({
  uploadImageContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  header: {
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
  },
  previewImgContainer: {
    marginBottom: theme.spacing(1),
    maxWidth: 100,
    maxHeight: 100,
    "& > img": {
      maxHeight: "100%",
      maxWidth: "100%",
    },
  },
  loader: {
    height: 20,
  },
  imageUploadFlex: {
    display: "flex",
    alignItems: "center",
  },
  fileNameText: {
    marginLeft: theme.spacing(0.5),
    maxWidth: 129.5,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
}))
type AppImageUploadProps = {
  value: AdminImageModel | undefined
  handleChange: (image: AdminImageModel) => void
  label: string | JSX.Element
  handleClear?: () => void
  showPreview?: boolean
}

export default function AppImageUpload(props: AppImageUploadProps) {
  const [loading, setLoading] = useState(false)
  let dispatch = useDispatch()
  var splitFileName = function (str: string) {
    let popped = str.split("\\").pop()
    if (popped) {
      return popped.split("/").pop()
    }
  }

  let classes = useStyles()
  return (
    <div className={classes.uploadImageContainer}>
      <div className={classes.header}>
        {typeof props.label === "string" ? (
          <Typography></Typography>
        ) : (
          props.label
        )}
      </div>
      {props.showPreview && props.value && (
        <div className={classes.previewImgContainer}>
          <img src={props.value.image_url} alt={props.value.alt} />
        </div>
      )}

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
          <Typography className={classes.fileNameText}>
            {props.value?.image_url
              ? splitFileName(props.value?.image_url)
              : "No file chosen"}
          </Typography>
          {props.handleClear && (
            <IconButton onClick={props.handleClear} size="small">
              <HighlightOffRounded />
            </IconButton>
          )}
        </div>
      )}
    </div>
  )
}
