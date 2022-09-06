import {Hidden, Icon, Link, makeStyles, Paper} from "@material-ui/core"
import {ArrowBackIos, InsertLink} from "@material-ui/icons"
import clsx from "clsx"
import {useRouteMatch} from "react-router"
import {Link as ReactRouterLink} from "react-router-dom"
import AppImageGrid from "../../components/base/AppImageGrid"
import AppMoreInfoIcon from "../../components/base/AppMoreInfoIcon"
import AppTypography from "../../components/base/AppTypography"
import AppHotelLocationMap from "../../components/lodging/AppHotelLocationMap"
import PageBody from "../../components/page/PageBody"
import PageHeader from "../../components/page/PageHeader"
import PageOverlay from "../../components/page/PageOverlay"
import {ResourceNotFound} from "../../models"
import {convertGuid, useQuery} from "../../utils"
import {HotelUtils, useHotel} from "../../utils/lodgingUtils"
import NotFound404Page from "../misc/NotFound404Page"

let useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: "none",
    backgrounColor: "#aaa",
  },
  popoverText: {
    padding: 5,
    backgroundColor: "rgba(0, 0, 0, 0.54)",
    color: "#f0f0f0",
    maxWidth: 350,
  },
  lightText: {
    fontWeight: 300,
  },
  websiteLink: {
    marginLeft: theme.spacing(0.5),
  },
  overviewContent: {
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  infoButton: {
    padding: "0 0 0 5px",
  },
  attributesContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: theme.spacing(-1),
    marginBottom: theme.spacing(1),
    "& > *": {
      marginBottom: theme.spacing(1),
      marginLeft: theme.spacing(1),
    },
  },
  attributeTag: {
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: theme.spacing(0.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: theme.palette.grey[300], // matching chip default background color
    "&.noHold": {
      backgroundColor: theme.palette.error.light,
    },
    "&.onHold": {
      backgroundColor: theme.palette.success.main,
    },
  },
  details: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: -theme.spacing(2),
    marginTop: -theme.spacing(2),
    "& > $detailsSection": {
      marginLeft: theme.spacing(2),
      marginTop: theme.spacing(2),
      width: "100%",
    },
  },
  detailsNoGallery: {
    "& $detailsSection": {
      width: `calc(50% - ${theme.spacing(2)}px)`,
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
    },
  },
  detailsSection: {
    boxShadow: theme.shadows[0],
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1.5),
  },
  detail: {
    marginTop: theme.spacing(1),
    width: "100%",
    paddingLeft: theme.spacing(0.5),
    "& > .MuiTypography-body1": {
      whiteSpace: "pre-wrap",
      paddingLeft: theme.spacing(1),
    },
    "& > .MuiTypography-body2": {
      marginBottom: theme.spacing(0.5),
    },
  },
  topButtonsContainer: {
    marginTop: theme.spacing(-2), // removes need to adjust page overlay default padding
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  lodgingTag: {
    marginTop: 4,
    color: "white",
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: theme.spacing(0.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  lodgingTagsWrapper: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  detailsSectionMap: {
    boxShadow: theme.shadows[0],
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1.5),
    height: 400,
    width: "100%",
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}))

export default function HotelProfilePage() {
  let classes = useStyles()
  let router = useRouteMatch<{
    retreatIdx: string
    hotelGuid: string
  }>()

  let hotelGuid = convertGuid(router.params.hotelGuid)
  let [hotel] = useHotel(hotelGuid)
  let [lastQueryParam] = useQuery("last")

  return (
    <PageBody appBar>
      {hotel === ResourceNotFound ? (
        <NotFound404Page />
      ) : hotel === undefined ? (
        <>Loading...</>
      ) : (
        <PageOverlay
          size="small"
          right={
            hotel.imgs && hotel.imgs.length ? (
              <AppImageGrid images={hotel.imgs} />
            ) : undefined
          }>
          <div className={classes.topButtonsContainer}>
            {lastQueryParam && (
              <Link
                component={ReactRouterLink}
                variant="inherit"
                underline="none"
                color="inherit"
                to={decodeURIComponent(lastQueryParam)}>
                <Icon>
                  <ArrowBackIos />
                </Icon>
                Venue Sourcing
              </Link>
            )}
          </div>

          <PageHeader
            header={
              <AppTypography variant="h1" fontWeight="bold">
                {hotel.name}
                {hotel.website_url ? (
                  <Link
                    href={hotel.website_url}
                    target="_blank"
                    className={classes.websiteLink}>
                    <InsertLink fontSize="inherit" />
                  </Link>
                ) : undefined}
              </AppTypography>
            }
            subheader={hotel.description_short}
          />
          <>
            <div
              className={clsx(
                classes.details,
                hotel && hotel.imgs.length
                  ? undefined
                  : classes.detailsNoGallery
              )}>
              <Paper className={classes.detailsSection}>
                <AppTypography variant="h3" fontWeight="bold">
                  General Info
                </AppTypography>
                {hotel.airport_travel_time && (
                  <div className={classes.detail}>
                    <AppTypography variant="body2" fontWeight="bold">
                      Airport Travel Time{" "}
                      <AppMoreInfoIcon
                        tooltipText={`This travel time is calculated to the nearest major airport${
                          hotel.airport ? `(${hotel.airport})` : ""
                        }. There may be smaller regional airports that are closer.`}
                      />
                    </AppTypography>
                    <AppTypography variant="body1">
                      {HotelUtils.getAirportTravelTime(
                        hotel.airport_travel_time
                      )}
                      {hotel.airport && ` to ${hotel.airport}`}
                    </AppTypography>
                  </div>
                )}
                <div className={classes.detail}>
                  <AppTypography variant="body2" fontWeight="bold">
                    Hotel Tags
                  </AppTypography>
                  <div className={classes.lodgingTagsWrapper}>
                    {hotel.lodging_tags.map((tag) => {
                      return (
                        <div className={classes.lodgingTag}>
                          <AppTypography fontWeight="bold">
                            {tag.name}
                          </AppTypography>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Paper>
              {hotel.address_coordinates && (
                <Paper className={classes.detailsSectionMap}>
                  <AppHotelLocationMap
                    lat={hotel.address_coordinates[0]}
                    long={hotel.address_coordinates[1]}
                    zoom={10}
                  />
                </Paper>
              )}
            </div>
            <Hidden mdUp>
              <AppImageGrid images={hotel.imgs} />
            </Hidden>
          </>
        </PageOverlay>
      )}
    </PageBody>
  )
}
