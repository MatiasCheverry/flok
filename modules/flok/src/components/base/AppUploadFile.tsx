import {
  Button,
  CircularProgress,
  makeStyles,
  Typography,
} from "@material-ui/core"
import {useState} from "react"
import {useDispatch} from "react-redux"
import config, {IMAGE_SERVER_BASE_URL_KEY} from "../../config"
import {FileModel} from "../../models/retreat"
import {enqueueSnackbar} from "../../notistack-lib/actions"

let useStyles = makeStyles((theme) => ({
  uploadImageContainer: {
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
  fileNameText: {
    marginLeft: theme.spacing(0.5),
    maxWidth: 200,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
}))
type AppUploadFileProps = {
  handleChange: (file: FileModel) => void
  id: string
  tooltipText?: string
  handleClear?: () => void
  type?: string
  accepts?: string
  buttonText?: string
  rightText?: string
}

export default function AppUploadFile(props: AppUploadFileProps) {
  const [loading, setLoading] = useState(false)
  let dispatch = useDispatch()

  let classes = useStyles()
  return (
    <div className={classes.uploadImageContainer}>
      {loading ? (
        <CircularProgress size="20px" className={classes.loader} />
      ) : (
        <div className={classes.imageUploadFlex}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            component="label">
            {props.buttonText ? props.buttonText : "Choose File"}
            <input
              type="file"
              accept={props.accepts ? props.accepts : "application/pdf"}
              hidden
              onChange={(e) => {
                if (e.target && e.target.files && e.target.files[0]) {
                  let data = new FormData()
                  data.append("file", e.target.files[0])
                  setLoading(true)
                  fetch(
                    `${config.get(IMAGE_SERVER_BASE_URL_KEY)}/api/files${
                      props.type ? "?type=" + props.type : ""
                    }`,
                    {
                      body: data,
                      method: "POST",
                      mode: "cors",
                    }
                  )
                    .then((res) => res.json())
                    .then(async (resdata) => {
                      await props.handleChange(resdata.file)
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
            {props.rightText}
          </Typography>
        </div>
      )}
    </div>
  )
}
