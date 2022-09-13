import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  Divider,
  IconButton,
  makeStyles,
  Paper,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core"
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Close,
  Delete,
} from "@material-ui/icons"
import {useFormik} from "formik"
import _ from "lodash"
import {useState} from "react"
import {useDispatch} from "react-redux"
import config, {IMAGE_SERVER_BASE_URL_KEY} from "../../config"
import {
  AdminHotelDetailsModel,
  AdminImageModel,
  AdminImageTagOptions,
} from "../../models/index"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {patchHotel, PATCH_HOTEL_SUCCESS} from "../../store/actions/admin"
import {nullifyEmptyString} from "../../utils"
import AppLoadingScreen from "../base/AppLoadingScreen"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "100%",
    marginLeft: -theme.spacing(2),
  },
  formGroup: {
    marginLeft: theme.spacing(2),
    padding: theme.spacing(2),
    overflowY: "auto",
    height: 0,
    flex: 1,
    display: "flex",
    width: "100%",
    flexDirection: "column",
    "& > *:not(:first-child)": {marginTop: theme.spacing(2)},
    minHeight: 400,
  },
}))

export type HotelImageFormType = {hotel: AdminHotelDetailsModel}

export default function HotelImageForm(props: HotelImageFormType) {
  let dispatch = useDispatch()
  let classes = useStyles(props)
  let [uploadImageModalOpen, setUploadImageModalOpen] = useState(false)

  type Form = {
    spotlight_img?: Partial<AdminImageModel> | null
    imgs: Partial<AdminImageModel>[]
  }

  function nullifyForm(form: Form): Form {
    return {
      imgs: form.imgs
        .map((img) => nullifyEmptyString(img))
        .map((nullifiedImg) => ({
          ...nullifiedImg,
          alt: nullifiedImg.alt ? nullifiedImg.alt : "",
        })),
      spotlight_img: form.spotlight_img
        ? {
            ...nullifyEmptyString(form.spotlight_img),
            alt: form.spotlight_img.alt ? form.spotlight_img.alt : "",
          }
        : null,
    }
  }

  let formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      imgs: props.hotel.imgs,
      spotlight_img: props.hotel.spotlight_img,
    },
    onSubmit: (values) => {
      dispatch(
        patchHotel(props.hotel.id, values as Partial<AdminHotelDetailsModel>)
      )
    },
  })

  const textFieldProps: TextFieldProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    fullWidth: true,
  }

  function reorderImgs(direction: "up" | "down", imgIdx: number) {
    if (direction === "up") {
      formik.setFieldValue("imgs", [
        ...formik.values.imgs.slice(undefined, imgIdx - 1),
        formik.values.imgs[imgIdx],
        formik.values.imgs[imgIdx - 1],
        ...formik.values.imgs.slice(imgIdx + 1, undefined),
      ])
    } else {
      formik.setFieldValue("imgs", [
        ...formik.values.imgs.slice(undefined, imgIdx),
        formik.values.imgs[imgIdx + 1],
        formik.values.imgs[imgIdx],
        ...formik.values.imgs.slice(imgIdx + 2, undefined),
      ])
    }
  }

  return (
    <form className={classes.root} onSubmit={formik.handleSubmit}>
      <Paper elevation={0} className={classes.formGroup}>
        <AppTypography variant="h4">Spotlight image</AppTypography>
        {formik.values.spotlight_img ? (
          <ImageFormRow
            img={formik.values.spotlight_img}
            formId={"spotlight_img"}
            textFieldProps={textFieldProps}
          />
        ) : (
          <AppTypography variant="body1">
            Please upload a spotlight image
          </AppTypography>
        )}
        <Divider />
        <AppTypography variant="h4">
          Gallery images ({formik.values.imgs.length})
        </AppTypography>
        {formik.values.imgs.map((img, i) => (
          <>
            <ImageFormRow
              key={img.id}
              img={img}
              onDelete={() =>
                formik.setFieldValue(
                  "imgs",
                  formik.values.imgs.filter((val, j) => j !== i)
                )
              }
              textFieldProps={textFieldProps}
              formId={`imgs[${i}]`}
              onReorderDown={
                i + 1 !== formik.values.imgs.length
                  ? () => reorderImgs("down", i)
                  : undefined
              }
              onReorderUp={i !== 0 ? () => reorderImgs("up", i) : undefined}
            />
            <Divider />
          </>
        ))}
      </Paper>
      <Box
        display="flex"
        flexDirection="row-reverse"
        justifyContent="space-between"
        width="100%"
        paddingY={1}
        marginLeft={2}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={_.isEqual(
            nullifyForm(formik.values),
            nullifyForm(formik.initialValues)
          )}>
          Save Changes
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setUploadImageModalOpen(true)}>
          Upload Images
        </Button>
        <Dialog open={uploadImageModalOpen} fullWidth>
          <ImageUploadForm
            hotelId={props.hotel.id}
            onClose={() => {
              setUploadImageModalOpen(false)
            }}
          />
        </Dialog>
      </Box>
    </form>
  )
}

let useRowStyles = makeStyles((theme) => ({
  root: {},
  imgRow: {
    display: "flex",
    width: "100%",
    "& > *": {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      "& > *": {
        margin: theme.spacing(0.5),
      },
    },
    alignContent: "flex-start",
    alignItems: "flex-start",
  },
  imgPreview: {
    width: "20%",
    marginRight: theme.spacing(1),
    cursor: "pointer",
    "&:hover": {
      opacity: "50%",
    },
  },
}))

type ImageFormRowProps = {
  img: AdminImageModel
  formId: string
  onReorderDown?: () => void
  onReorderUp?: () => void
  onDelete?: () => void
  textFieldProps: TextFieldProps
}
function ImageFormRow(props: ImageFormRowProps) {
  let classes = useRowStyles(props)
  let [showImgModal, setShowImgModal] = useState(false)
  return (
    <div className={classes.imgRow}>
      <img
        src={props.img.image_url}
        alt={props.img.alt}
        className={classes.imgPreview}
        onClick={() => setShowImgModal(true)}
      />
      <Dialog
        open={showImgModal}
        onClose={() => setShowImgModal(false)}
        maxWidth="lg">
        <img src={props.img.image_url} alt={props.img.alt} />
      </Dialog>
      <div>
        <TextField
          {...props.textFieldProps}
          id={`${props.formId}.alt`}
          value={props.img.alt}
          label="Alt Text"
        />
        <TextField
          {...props.textFieldProps}
          id={`${props.formId}.tag`}
          value={props.img.tag ?? ""}
          select
          SelectProps={{native: true}}
          label="Tag">
          <option value={""} label="No tag" />
          {AdminImageTagOptions.map((o, i) => (
            <option
              key={i}
              value={o}
              label={o
                .split("_")
                .map((word) =>
                  word.length > 0
                    ? word[0].toLocaleUpperCase() +
                      word.slice(1).toLocaleLowerCase()
                    : word
                )
                .join(" ")}
            />
          ))}
          {props.img.tag && !AdminImageTagOptions.includes(props.img.tag) ? (
            <option
              value={props.img.tag}
              label={props.img.tag
                .split("_")
                .map((word) =>
                  word.length > 0
                    ? word[0].toLocaleUpperCase() +
                      word.slice(1).toLocaleLowerCase()
                    : word
                )
                .join(" ")}
            />
          ) : undefined}
        </TextField>
        <Box display="flex" justifyContent="flex-end" alignItems="flex-end">
          {props.onReorderDown && (
            <IconButton onClick={props.onReorderDown}>
              <ArrowDownward />
            </IconButton>
          )}
          {props.onReorderUp && (
            <IconButton onClick={props.onReorderUp}>
              <ArrowUpward />
            </IconButton>
          )}
          {props.onDelete && (
            <IconButton onClick={props.onDelete}>
              <Delete />
            </IconButton>
          )}
        </Box>
      </div>
    </div>
  )
}

let useUploadFormStyles = makeStyles((theme) => ({
  verticalSpacing: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1),
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
  success: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
  },
  error: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
  },
  titleDiv: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}))

type ImageUploadFormProps = {
  hotelId: number
  onClose?: () => void
}

function ImageUploadForm(props: ImageUploadFormProps) {
  let dispatch = useDispatch()
  let classes = useUploadFormStyles(props)
  let initialValues: {
    imgs: {url: string; alt: string; tag?: string; spotlight: boolean}[]
  } = {
    imgs: [{url: "", alt: "", spotlight: false}],
  }
  let [uploadLoading, setUploadLoading] = useState(false)
  let [uploadStatus, setUploadStatus] = useState<boolean[]>([])
  let formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      setUploadLoading(true)
      fetch(
        `${config.get(IMAGE_SERVER_BASE_URL_KEY)}/api/hotels/${
          props.hotelId
        }/images`,
        {
          body: JSON.stringify({imgs: values.imgs}),
          method: "POST",
          headers: {"content-type": "application/json"},
          mode: "cors",
        }
      )
        .then((resp) => resp.json())
        .then((resp) => {
          let error = false
          if (resp.uploads) {
            setUploadStatus(resp.uploads)
            if (resp.uploads.filter((status: boolean) => !status).length) {
              error = true
            } else {
              dispatch({
                type: PATCH_HOTEL_SUCCESS,
                payload: {hotel: resp.hotel},
              })
            }
          } else {
            error = true
          }
          if (error) {
            dispatch(
              enqueueSnackbar({
                options: {variant: "error"},
                message: "Something went wrong",
              })
            )
          }
        })
        .catch((err) => {
          dispatch(
            enqueueSnackbar({
              options: {variant: "error"},
              message: "Something went wrong",
            })
          )
        })
        .finally(() => setUploadLoading(false))
    },
  })
  let textFieldProps: TextFieldProps = {
    InputLabelProps: {shrink: true},
    fullWidth: true,
    onChange: formik.handleChange,
    disabled: uploadLoading,
  }

  return (
    <form className={classes.verticalSpacing} onSubmit={formik.handleSubmit}>
      <div className={classes.titleDiv}>
        <Typography variant="h4">Upload Images</Typography>{" "}
        {props.onClose && (
          <IconButton onClick={props.onClose}>
            <Close />
          </IconButton>
        )}
      </div>

      {uploadLoading ? <AppLoadingScreen /> : undefined}
      {formik.values.imgs.map((img, i) => (
        <Box className={classes.verticalSpacing}>
          <TextField
            {...textFieldProps}
            id={`imgs[${i}].url`}
            label="Image url"
            value={formik.values.imgs[i].url ?? ""}
            required
          />
          <TextField
            {...textFieldProps}
            id={`imgs[${i}].alt`}
            label="Image alt"
            value={formik.values.imgs[i].alt ?? ""}
            required
          />
          <TextField
            {...textFieldProps}
            id={`imgs[${i}].tag`}
            select
            SelectProps={{native: true}}
            label="Image tag"
            value={formik.values.imgs[i].tag ?? ""}>
            <option value={""} label="No tag" />
            {AdminImageTagOptions.map((o, i) => (
              <option
                key={i}
                value={o}
                label={o
                  .split("_")
                  .map((word) =>
                    word.length > 0
                      ? word[0].toLocaleUpperCase() +
                        word.slice(1).toLocaleLowerCase()
                      : word
                  )
                  .join(" ")}
              />
            ))}
          </TextField>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center">
            <Box display="flex" alignItems="center">
              <Checkbox
                disabled={
                  (formik.values.imgs.filter((a) => a.spotlight).length > 0 &&
                    !formik.values.imgs[i].spotlight) ||
                  uploadLoading
                }
                id={`imgs[${i}].spotlight`}
                value={formik.values.imgs[i].spotlight ?? false}
                onChange={formik.handleChange}
              />
              <Typography variant="body1">Spotlight image?</Typography>
            </Box>
            {uploadStatus[i] === undefined ? undefined : uploadStatus[i] ? (
              <Chip className={classes.success} label="Success!" />
            ) : (
              <Chip className={classes.error} label="Error!" />
            )}
            {i !== 0 || formik.values.imgs.length !== 1 ? (
              <IconButton
                size="medium"
                onClick={() =>
                  formik.setFieldValue(
                    "imgs",
                    formik.values.imgs.filter((val, j) => i !== j)
                  )
                }>
                <Delete fontSize="inherit" />
              </IconButton>
            ) : undefined}
          </Box>
          {i !== formik.values.imgs.length - 1 ? <Divider /> : undefined}
        </Box>
      ))}
      <Box
        display="flex"
        flexDirection="row-reverse"
        justifyContent="space-between"
        alignItems="center"
        paddingX={2}>
        <IconButton
          disabled={formik.values.imgs.length > 4}
          size="medium"
          onClick={() =>
            formik.setFieldValue("imgs", [
              ...formik.values.imgs,
              {url: "", alt: ""},
            ])
          }>
          <Add fontSize="inherit" />
        </IconButton>
        <Box display="flex">
          <Button
            disabled={uploadLoading || uploadStatus.length > 0}
            type="submit"
            variant="contained"
            color="primary">
            Upload
          </Button>
          {uploadStatus.length > 0 ? (
            <Button
              variant="outlined"
              color="primary"
              style={{marginLeft: 4}}
              onClick={() => {
                setUploadStatus([])
                formik.resetForm({values: formik.initialValues})
              }}>
              Clear form
            </Button>
          ) : undefined}
        </Box>
      </Box>
    </form>
  )
}
