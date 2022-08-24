import {Breadcrumbs, Link, makeStyles} from "@material-ui/core"
import {push} from "connected-react-router"
import {useDispatch} from "react-redux"
import {RouteComponentProps, withRouter} from "react-router"
import {Link as ReactRouterLink} from "react-router-dom"
import AppTypography from "../components/base/AppTypography"
import PastItineraryEditForm from "../components/itinerary/PastItineraryEditForm"
import PageBase from "../components/page/PageBase"
import {AdminPastItineraryModel} from "../models"
import {AppRoutes} from "../Stack"
import {
  PastItineraryPostModel,
  patchPastItinerary,
  postPastItinerary,
} from "../store/actions/admin"
import {ApiAction} from "../store/actions/api"
import {useItineraries} from "../utils"

let useStyles = makeStyles((theme) => ({
  body: {
    flex: "1 1 auto",
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(20),
    paddingRight: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
  },
  retreatHeader: {
    marginBottom: theme.spacing(2),
  },
}))

type PastItineraryPageProps = RouteComponentProps<{itineraryId: string}>

function PastItineraryPage(props: PastItineraryPageProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()

  let numId = parseInt(props.match.params.itineraryId) || -1

  let itineraryId = props.match.params.itineraryId === "new" ? undefined : numId

  let [itineraries] = useItineraries()
  let itinerary = itineraryId != null ? itineraries[itineraryId] : undefined

  function patchItinerary(values: PastItineraryPostModel) {
    dispatch(patchPastItinerary(itineraryId!, values))
  }

  async function postItinerary(values: PastItineraryPostModel) {
    let response = (await dispatch(
      postPastItinerary(values)
    )) as unknown as ApiAction
    if (!response.error) {
      let newId = (
        response.payload as {
          past_itinerary: AdminPastItineraryModel
        }
      ).past_itinerary.id
      dispatch(
        push(
          AppRoutes.getPath("PastItineraryPage", {
            itineraryId: newId.toString(),
          })
        )
      )
    }
  }
  return (
    <PageBase>
      <div className={classes.body}>
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "8px"}}>
          <Link
            color="inherit"
            to={AppRoutes.getPath("PastItinerariesPage")}
            component={ReactRouterLink}>
            Past itineraries
          </Link>
          <AppTypography color="textPrimary">
            {itinerary ? itinerary.name : "New Itinerary"}
          </AppTypography>
        </Breadcrumbs>
        <AppTypography variant="h4" paragraph>
          {itinerary ? "Update Itinerary" : "Add New Itinerary"}
        </AppTypography>
        <PastItineraryEditForm
          itinerary={itinerary || {}}
          onSubmit={itineraryId != null ? patchItinerary : postItinerary}
        />
      </div>
    </PageBase>
  )
}

export default withRouter(PastItineraryPage)
