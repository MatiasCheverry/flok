import {Box, Hidden, Link, makeStyles} from "@material-ui/core"
import {InsertLink} from "@material-ui/icons"
import {useEffect, useState} from "react"
import {withRouter} from "react-router"
import {RouteComponentProps} from "react-router-dom"
import AppImageGrid from "../../components/base/AppImageGrid"
import AppTypography from "../../components/base/AppTypography"
import {Proposal} from "../../components/lodging/ProposalComponents"
import PageContainer from "../../components/page/PageContainer"
import PageHeader from "../../components/page/PageHeader"
import PageOverlay from "../../components/page/PageOverlay"
import {ResourceNotFound, ResourceNotFoundType} from "../../models"
import {HotelModel} from "../../models/lodging"
import {HotelLodgingProposal} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {convertGuid, useQuery} from "../../utils"
import {useHotel} from "../../utils/lodgingUtils"
import {useRetreatByGuid} from "../../utils/retreatUtils"

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
}))

type ProposalPageProps = RouteComponentProps<{
  retreatGuid: string
  hotelGuid: string
}>
function ProposalPage(props: ProposalPageProps) {
  let classes = useStyles(props)

  let hotelGuid = convertGuid(props.match.params.hotelGuid)
  let [hotel, loadingHotel] = useHotel(hotelGuid)
  let retreatGuid = convertGuid(props.match.params.retreatGuid)
  let [retreat, loadingRetreat] = useRetreatByGuid(retreatGuid)
  let [proposals, setProposals] = useState<HotelLodgingProposal[]>([])
  let [proposal, setProposal] = useState<
    HotelLodgingProposal | ResourceNotFoundType | undefined
  >(undefined)
  let [proposalIndexQuery, setProposalIndexQuery] = useQuery("proposal")
  useEffect(() => {
    if (
      hotel &&
      hotel !== ResourceNotFound &&
      retreat &&
      retreat !== ResourceNotFound
    ) {
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
    if (
      hotel &&
      hotel !== ResourceNotFound &&
      retreat &&
      retreat !== ResourceNotFound
    ) {
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
    <PageContainer>
      {retreat === ResourceNotFound ? (
        <Box
          height={"100%"}
          width={"100%"}
          display="flex"
          justifyContent="center"
          alignItems="center">
          <AppTypography variant="h4">Retreat not found</AppTypography>
        </Box>
      ) : hotel === ResourceNotFound ? (
        <Box
          height={"100%"}
          width={"100%"}
          display="flex"
          justifyContent="center"
          alignItems="center">
          <AppTypography variant="body1">
            Proposal missing or unavailable. View your{" "}
            <a
              href={AppRoutes.getPath("DeprecatedProposalsListPage", {
                retreatGuid: retreatGuid,
              })}>
              proposals list
            </a>
          </AppTypography>
        </Box>
      ) : hotel === undefined || loadingRetreat || loadingHotel ? (
        <>Loading...</>
      ) : (
        <PageOverlay
          size="small"
          right={
            hotel.imgs && hotel.imgs.length ? (
              <AppImageGrid images={hotel.imgs} />
            ) : undefined
          }>
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
                href={AppRoutes.getPath("DeprecatedProposalsListPage", {
                  retreatGuid: retreatGuid,
                })}>
                proposals list
              </a>
            </AppTypography>
          ) : (
            <>
              {retreat && (
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
              )}
              <Hidden mdUp>
                <AppImageGrid images={hotel.imgs} />
              </Hidden>
            </>
          )}
        </PageOverlay>
      )}
    </PageContainer>
  )
}

export default withRouter(ProposalPage)
