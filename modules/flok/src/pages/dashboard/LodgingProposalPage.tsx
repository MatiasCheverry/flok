import {Hidden, Icon, Link, makeStyles} from "@material-ui/core"
import {ArrowBackIos, InsertLink} from "@material-ui/icons"
import clsx from "clsx"
import {useEffect, useState} from "react"
import {useRouteMatch} from "react-router"
import {Link as ReactRouterLink} from "react-router-dom"
import AppImageGrid from "../../components/base/AppImageGrid"
import AppShareableLinkButton from "../../components/base/AppShareableLinkButton"
import AppTypography from "../../components/base/AppTypography"
import {Proposal} from "../../components/lodging/ProposalComponents"
import PageBody from "../../components/page/PageBody"
import PageHeader from "../../components/page/PageHeader"
import PageOverlay from "../../components/page/PageOverlay"
import {ResourceNotFound, ResourceNotFoundType} from "../../models"
import {HotelModel} from "../../models/lodging"
import {HotelLodgingProposal} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {convertGuid, useQuery} from "../../utils"
import {useHotel} from "../../utils/lodgingUtils"
import NotFound404Page from "../misc/NotFound404Page"
import {useRetreat} from "../misc/RetreatProvider"

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
  proposalWrapper: {
    marginLeft: theme.spacing(2),
  },
}))

export default function LodgingProposalPage() {
  let classes = useStyles()
  let router = useRouteMatch<{
    retreatIdx: string
    hotelGuid: string
  }>()

  let hotelGuid = convertGuid(router.params.hotelGuid)
  let [hotel] = useHotel(hotelGuid)
  let [retreat, retreatIdx] = useRetreat()
  let [proposals, setProposals] = useState<HotelLodgingProposal[]>([])
  let [proposal, setProposal] = useState<
    HotelLodgingProposal | ResourceNotFoundType | undefined
  >(undefined)
  let [proposalIndexQuery, setProposalIndexQuery] = useQuery("proposal")
  useEffect(() => {
    if (hotel && hotel !== ResourceNotFound) {
      let _selectedHotels = retreat.selected_hotels.filter(
        (selectedHotel) => selectedHotel.hotel_id === (hotel as HotelModel)!.id
      )
      let _proposalIndex = parseInt(proposalIndexQuery || "0") || 0
      if (
        _selectedHotels.length &&
        _selectedHotels[0].hotel_proposals?.length
      ) {
        if (_selectedHotels[0].hotel_proposals.length > _proposalIndex) {
          setProposal(_selectedHotels[0].hotel_proposals[_proposalIndex])
        } else {
          setProposalIndexQuery(null)
          setProposal(_selectedHotels[0].hotel_proposals[0])
        }
      } else {
        setProposal(ResourceNotFound)
      }
    }
  }, [retreat, hotel, setProposal, proposalIndexQuery, setProposalIndexQuery])

  useEffect(() => {
    if (hotel && hotel !== ResourceNotFound) {
      let _selectedHotels = retreat.selected_hotels.filter(
        (selectedHotel) => selectedHotel.hotel_id === (hotel as HotelModel)!.id
      )
      if (
        _selectedHotels.length &&
        _selectedHotels[0].hotel_proposals?.length
      ) {
        setProposals(_selectedHotels[0].hotel_proposals)
      }
    }
  }, [retreat, setProposals, hotel])

  useEffect(() => {
    if (hotel && hotel !== ResourceNotFound) {
      document.title = `${hotel.name} Proposal`
    } else if (hotel === ResourceNotFound) {
      document.title = `Proposal Not Found`
    } else {
      document.title = `Lodging Proposal`
    }
  }, [hotel])

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
            <Link
              component={ReactRouterLink}
              variant="inherit"
              underline="none"
              color="inherit"
              to={AppRoutes.getPath("RetreatLodgingProposalsPage", {
                retreatIdx: retreatIdx.toString(),
              })}>
              <Icon>
                <ArrowBackIos />
              </Icon>
              Proposals
            </Link>
            <AppShareableLinkButton
              link={
                new URL(
                  AppRoutes.getPath("DeprecatedProposalPage", {
                    retreatGuid: retreat.guid,
                    hotelGuid: hotelGuid,
                  }),
                  window.location.origin
                ).href
              }
            />
          </div>

          <PageHeader
            header={
              <AppTypography variant="h1" fontWeight="bold">
                {hotel.name}{" "}
                <AppTypography variant="inherit" fontWeight="light">
                  Proposal
                </AppTypography>
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
          {proposal === undefined ? (
            <>Loading...</>
          ) : proposal === ResourceNotFound ? (
            <AppTypography variant="body1">
              Proposal missing or unavailable. View your{" "}
              <a
                href={AppRoutes.getPath("RetreatLodgingProposalsPage", {
                  retreatIdx: retreatIdx.toString(),
                })}>
                proposals list
              </a>
            </AppTypography>
          ) : (
            <>
              <div
                className={clsx(
                  classes.details,
                  hotel && hotel.imgs.length
                    ? undefined
                    : classes.detailsNoGallery
                )}>
                <div className={classes.proposalWrapper}>
                  <Proposal
                    hotel={hotel}
                    proposals={proposals}
                    proposal={proposal}
                    retreat={retreat}
                    updateProposalIndex={(newIndex) => {
                      if (newIndex === 0) {
                        setProposalIndexQuery(null)
                      } else {
                        setProposalIndexQuery(newIndex.toString())
                      }
                    }}
                  />
                </div>
              </div>
              <Hidden mdUp>
                <AppImageGrid images={hotel.imgs} />
              </Hidden>
            </>
          )}
        </PageOverlay>
      )}
    </PageBody>
  )
}
