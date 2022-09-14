import {makeStyles} from "@material-ui/core"
import {useState} from "react"
import {HotelModel} from "../../models/lodging"
import {RetreatModel} from "../../models/retreat"
import AppTypography from "../base/AppTypography"
import {
  AdditionalInfo,
  FinalConcessions,
  FoodAndBeverage,
  GeneralInfo,
  MeetingSpace,
  RoomRates,
} from "./ProposalComponents"

let useStyles = makeStyles((theme) => ({
  td: {
    minWidth: "250px",
    width: (props: {length: number}) => `${100 / props.length}%`,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: theme.spacing(2),
  },
  tr: {
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  header: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&:hover": {
      textOverflow: "clip",
      whiteSpace: "normal",
    },
  },
}))

export default function ProposalComparision(props: {
  hotels: HotelModel[]
  retreat: RetreatModel
}) {
  let classes = useStyles({length: props.hotels.length})
  let {retreat} = props
  let [proposalsIndex, setProposalsIndex] = useState<{[index: number]: number}>(
    {}
  )
  function showFinalConcessions(retreat: RetreatModel) {
    let show = false
    retreat.selected_hotels.forEach((hotel) => {
      if (
        props.hotels.map((pHotel) => pHotel.id).indexOf(hotel.hotel_id) !== -1
      )
        hotel.hotel_proposals?.forEach((proposal) => {
          if (proposal.final_concessions) {
            show = true
          }
        })
    })
    return show
  }
  return (
    <table className={classes.table}>
      <tr className={classes.tr}>
        {props.hotels.map((hotel) => {
          return (
            <td valign="top" className={classes.td}>
              {hotel && (
                <AppTypography
                  variant="h3"
                  fontWeight="bold"
                  className={classes.header}>
                  {hotel.name}
                </AppTypography>
              )}
            </td>
          )
        })}
      </tr>
      <tr className={classes.tr}>
        {props.hotels.map((hotel, idx) => {
          let proposals =
            retreat.selected_hotels.find(
              (selectedHotel) => selectedHotel.hotel_id === hotel.id
            )?.hotel_proposals ?? []
          return (
            <td valign="top" className={classes.td}>
              {hotel && (
                <GeneralInfo
                  hotel={hotel}
                  retreat={retreat}
                  proposals={proposals}
                  proposal={
                    proposalsIndex[idx]
                      ? proposals[proposalsIndex[idx]]
                      : proposals[0]
                  }
                  updateProposalIndex={(newIndex: number) => {
                    setProposalsIndex((proposalsIndex) => ({
                      ...proposalsIndex,
                      [idx]: newIndex,
                    }))
                  }}
                />
              )}
            </td>
          )
        })}
      </tr>
      {showFinalConcessions(retreat) && (
        <tr className={classes.tr}>
          {props.hotels.map((hotel, idx) => {
            let proposals =
              retreat.selected_hotels.find(
                (selectedHotel) => selectedHotel.hotel_id === hotel.id
              )?.hotel_proposals ?? []
            return (
              <td valign="top" className={classes.td}>
                {hotel && (
                  <FinalConcessions
                    proposal={
                      proposalsIndex[idx]
                        ? proposals[proposalsIndex[idx]]
                        : proposals[0]
                    }
                  />
                )}
              </td>
            )
          })}
        </tr>
      )}
      <tr className={classes.tr}>
        {props.hotels.map((hotel, idx) => {
          let proposals =
            retreat.selected_hotels.find(
              (selectedHotel) => selectedHotel.hotel_id === hotel.id
            )?.hotel_proposals ?? []
          return (
            <td valign="top" className={classes.td}>
              {hotel && (
                <RoomRates
                  proposal={
                    proposalsIndex[idx]
                      ? proposals[proposalsIndex[idx]]
                      : proposals[0]
                  }
                />
              )}
            </td>
          )
        })}
      </tr>
      <tr className={classes.tr}>
        {props.hotels.map((hotel, idx) => {
          let proposals =
            retreat.selected_hotels.find(
              (selectedHotel) => selectedHotel.hotel_id === hotel.id
            )?.hotel_proposals ?? []
          return (
            <td valign="top" className={classes.td}>
              {hotel && (
                <FoodAndBeverage
                  proposal={
                    proposalsIndex[idx]
                      ? proposals[proposalsIndex[idx]]
                      : proposals[0]
                  }
                />
              )}
            </td>
          )
        })}
      </tr>
      <tr className={classes.tr}>
        {props.hotels.map((hotel, idx) => {
          let proposals =
            retreat.selected_hotels.find(
              (selectedHotel) => selectedHotel.hotel_id === hotel.id
            )?.hotel_proposals ?? []
          return (
            <td valign="top" className={classes.td}>
              {hotel && (
                <MeetingSpace
                  proposal={
                    proposalsIndex[idx]
                      ? proposals[proposalsIndex[idx]]
                      : proposals[0]
                  }
                />
              )}
            </td>
          )
        })}
      </tr>
      <tr className={classes.tr}>
        {props.hotels.map((hotel, idx) => {
          let proposals =
            retreat.selected_hotels.find(
              (selectedHotel) => selectedHotel.hotel_id === hotel.id
            )?.hotel_proposals ?? []
          return (
            <td valign="top" className={classes.td}>
              {hotel && (
                <AdditionalInfo
                  proposal={
                    proposalsIndex[idx]
                      ? proposals[proposalsIndex[idx]]
                      : proposals[0]
                  }
                />
              )}
            </td>
          )
        })}
      </tr>
    </table>
  )
}
