import {
  Button,
  CircularProgress,
  IconButton,
  makeStyles,
  TextField,
  Typography,
  useTheme,
} from "@material-ui/core"
import {HighlightOffRounded} from "@material-ui/icons"
import {push} from "connected-react-router"
import {useFormik} from "formik"
import _ from "lodash"
import {useState} from "react"
import {useDispatch} from "react-redux"
import * as yup from "yup"
import config, {IMAGE_SERVER_BASE_URL_KEY} from "../../config"
import {ImageModel} from "../../models"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {AppRoutes} from "../../Stack"
import {ApiAction} from "../../store/actions/api"
import {patchWebsite} from "../../store/actions/retreat"
import {useAttendeeLandingWebsite} from "../../utils/retreatUtils"
import AppMoreInfoIcon from "../base/AppMoreInfoIcon"
import ColorPicker from "./ColorPicker"
import UploadImageWithTemplate from "./UploadImageWithTemplate"

let useStyles = makeStyles((theme) => ({
  body: {
    display: "flex",
    flexDirection: "column",
  },
  textField: {
    minWidth: "200px",
    "&:not(:first-child)": {
      marginTop: theme.spacing(2),
    },
  },
  uploadButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

type EditWebsiteFormProps = {
  websiteId: number
  retreatIdx: number
  currentPageId: string
  isLive: boolean
}
function EditWebsiteForm(props: EditWebsiteFormProps) {
  let dispatch = useDispatch()
  let website = useAttendeeLandingWebsite(props.websiteId)
  let imageHolder: {[key: number]: ImageModel} = {}
  if (website?.banner_image) {
    imageHolder[website?.banner_image.id] = website?.banner_image
  }
  if (website?.logo_image) {
    imageHolder[website?.logo_image.id] = website?.logo_image
  }
  let [images, setImages] = useState<{[key: number]: ImageModel}>(imageHolder)
  async function handlePatchWebsite(values: {
    name: string
    banner_image_id: number | undefined
    logo_image_id: number | undefined
  }) {
    let patchWebsiteResponse = (await dispatch(
      patchWebsite(props.websiteId, values)
    )) as unknown as ApiAction
    if (!patchWebsiteResponse.error) {
      dispatch(
        push(
          AppRoutes.getPath("LandingPageGeneratorConfig", {
            retreatIdx: props.retreatIdx.toString(),
            currentPageId: props.currentPageId,
          })
        )
      )
    }
  }
  let theme = useTheme()
  let formik = useFormik({
    initialValues: {
      banner_image_id: website?.banner_image?.id ?? -1,
      logo_image_id: website?.logo_image?.id ?? -1,
      name: website?.name ?? "",
      background_color:
        website?.background_color ?? theme.palette.background.default,
      primary_color: website?.primary_color ?? theme.palette.primary.main,
      text_color: website?.text_color ?? theme.palette.text.primary,
    },
    onSubmit: (values) => {
      let newValues: {
        banner_image_id: number | undefined
        logo_image_id: number | undefined
        name: string
        background_color?: string
        primary_color?: string
      } = {...values}
      if (newValues.banner_image_id === -1) {
        newValues.banner_image_id = undefined
      }
      if (newValues.logo_image_id === -1) {
        newValues.logo_image_id = undefined
      }
      handlePatchWebsite(newValues)
    },
    validationSchema: yup.object({
      name: yup
        .string()
        .required()
        .matches(
          /^[aA-zZ\s0-9]+$/,
          "Can only contain letters, numbers, or spaces"
        ),
    }),
  })
  let classes = useStyles()
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className={classes.body}>
        <TextField
          required
          value={formik.values.name}
          id={`name`}
          onChange={formik.handleChange}
          disabled={props.isLive}
          variant="outlined"
          label="Website Name"
          className={classes.textField}
          error={formik.errors && !!formik.errors["name"]}
          helperText={
            formik.errors && formik.errors["name"]
              ? formik.errors["name"]
              : props.isLive
              ? "Website name cannot be changed once registration is live"
              : ""
          }
        />
        <UploadImageWithTemplate
          value={images[formik.values.banner_image_id]}
          tooltipText="Choose a banner image.  Large images with a landscape view work best"
          id="banner_image"
          handleChange={(image) => {
            formik.setFieldValue("banner_image_id", image.id)
            setImages({...images, [image.id]: image})
          }}
          handleClear={() => {
            formik.setFieldValue("banner_image_id", -1)
          }}
          headerText="Banner Image"
          type="BANNER"
        />
        <UploadImage
          value={images[formik.values.logo_image_id]}
          tooltipText="Choose a Logo for your Website. PNG's with a transparent background work best"
          id="logo_image"
          handleChange={(image) => {
            formik.setFieldValue("logo_image_id", image.id)
            setImages({...images, [image.id]: image})
          }}
          handleClear={() => {
            formik.setFieldValue("logo_image_id", -1)
          }}
          headerText="Logo Image"
        />
        <div className={classes.uploadButton}>
          <div className={classes.uploadButton}>
            <ColorPicker
              selectedColor={formik.values.text_color}
              setSelectedColor={(newColor) => {
                formik.setFieldValue("text_color", newColor)
              }}
              title="Text Color"
              colors={["#000000", "#000080", "#006a28"]}
            />
          </div>
          <ColorPicker
            selectedColor={formik.values.background_color}
            setSelectedColor={(newColor) => {
              formik.setFieldValue("background_color", newColor)
            }}
            noPicker
            title="Background Color"
            colors={["#ffffff", "#EFF1F7", "#ADD8E6", "#f5f5dc"]}
          />
        </div>
        <div className={classes.uploadButton}>
          <ColorPicker
            selectedColor={formik.values.primary_color}
            setSelectedColor={(newColor) => {
              formik.setFieldValue("primary_color", newColor)
            }}
            title="Primary Color"
            tooltip="This color will be the color of main components such as buttons"
            colors={["#4b51ff", "#8b0000", "#240073", "#006a28", "#49eaff"]}
          />
        </div>

        <Button
          type="submit"
          color="primary"
          variant="contained"
          className={classes.uploadButton}
          disabled={_.isEqual(formik.values, formik.initialValues)}>
          Save
        </Button>
      </div>
    </form>
  )
}
export default EditWebsiteForm

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
  fileNameText: {
    marginLeft: theme.spacing(0.5),
    maxWidth: 129.5,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
}))
type UploadImageProps = {
  value: ImageModel | undefined
  handleChange: (image: ImageModel) => void
  id: string
  headerText: string
  tooltipText?: string
  handleClear?: () => void
}
export const splitFileName = function (str: string) {
  let popped = str.split("\\").pop()
  if (popped) {
    return popped.split("/").pop()
  }
}
export function UploadImage(props: UploadImageProps) {
  const [loading, setLoading] = useState(false)
  let dispatch = useDispatch()

  let classes = useImageStyles()
  return (
    <div className={classes.uploadImageContainer}>
      <div style={{display: "flex", alignItems: "center"}}>
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
                    .then(async (resdata) => {
                      await props.handleChange(resdata.image)

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
