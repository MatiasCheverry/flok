import {
  Box,
  Button,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core"
import {push} from "connected-react-router"
import {useFormik} from "formik"
import {useEffect, useState} from "react"
import {useDispatch} from "react-redux"
import * as yup from "yup"
import {UploadImage} from "../../components/attendee-site/EditWebsiteForm"
import UploadImageWithTemplate from "../../components/attendee-site/UploadImageWithTemplate"
import PageBody from "../../components/page/PageBody"
import PageContainer from "../../components/page/PageContainer"
import {ImageModel} from "../../models"
import {AppRoutes} from "../../Stack"
import {ApiAction} from "../../store/actions/api"
import {postInitialWebsite, postPage} from "../../store/actions/retreat"
import {getTextFieldErrorProps} from "../../utils"
import {useAttendeeLandingWebsite} from "../../utils/retreatUtils"
import {useRetreat} from "../misc/RetreatProvider"

let useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    flex: 1,
    overflow: "hidden",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    paddingTop: theme.spacing(1),
  },
  form: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
  submitButton: {
    marginTop: theme.spacing(1),
  },
}))
function CreateRetreatWebsite() {
  let [retreat, retreatIdx] = useRetreat()
  let classes = useStyles()
  let website = useAttendeeLandingWebsite(retreat.attendees_website_id ?? -1)
  let dispatch = useDispatch()
  let [images, setImages] = useState<{[key: number]: ImageModel}>({})
  useEffect(() => {
    if (website && !website.page_ids[0]) {
      dispatch(
        postPage({
          title: "Home",
          website_id: website.id,
        })
      )
    }
  }, [dispatch, website])

  async function handleCreateWebsite(values: {
    name: string
    retreat_id: number
  }) {
    let websiteResponse = (await dispatch(
      postInitialWebsite(values)
    )) as unknown as ApiAction
    if (!websiteResponse.error) {
      dispatch(
        push(
          AppRoutes.getPath("LandingPageGeneratorPage", {
            retreatIdx: retreatIdx.toString(),
            currentPageId: websiteResponse.payload.website.page_ids[0],
          })
        )
      )
    }
  }
  let formik = useFormik({
    initialValues: {
      banner_image_id: -1,
      logo_image_id: -1,
      name: retreat.company_name,
    },
    onSubmit: (values) => {
      for (let k in values) {
        if (values[k as keyof typeof values] === -1) {
          delete values[k as keyof typeof values]
        }
      }
      handleCreateWebsite({
        ...values,
        retreat_id: retreat.id,
      })
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

  return (
    <PageContainer>
      <PageBody appBar>
        <div className={classes.root}>
          <Typography variant="h1">Create a Website</Typography>
          <form onSubmit={formik.handleSubmit} className={classes.form}>
            <Box className={classes.body}>
              <Tooltip
                title="The website name determines the URL that attendees will use to access the landing page"
                placement="top-start">
                <TextField
                  required
                  value={formik.values.name}
                  id={`name`}
                  onChange={formik.handleChange}
                  variant="outlined"
                  label="Website Name"
                  {...getTextFieldErrorProps(formik, "name")}
                />
              </Tooltip>
              <UploadImageWithTemplate
                value={images[formik.values.banner_image_id]}
                id="banner_image"
                handleChange={(image) => {
                  formik.setFieldValue("banner_image_id", image.id)
                  setImages({...images, [image.id]: image})
                }}
                handleClear={() => {
                  formik.setFieldValue("banner_image_id", -1)
                }}
                headerText="Banner Image"
                tooltipText="Choose a banner image.  Large images with a landscape view work best"
                type="BANNER"
              />
              <UploadImage
                value={images[formik.values.logo_image_id]}
                id="logo_image"
                handleClear={() => {
                  formik.setFieldValue("logo_image_id", -1)
                }}
                handleChange={(image) => {
                  formik.setFieldValue("logo_image_id", image.id)
                  setImages({...images, [image.id]: image})
                }}
                headerText="Logo Image"
                tooltipText="Choose a Logo for your Website. PNG's with a transparent background work best"
              />
            </Box>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={classes.submitButton}
              disabled={formik.values.name === ""}>
              Create
            </Button>
          </form>
        </div>
      </PageBody>
    </PageContainer>
  )
}
export default CreateRetreatWebsite
