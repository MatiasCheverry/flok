import {makeStyles, MenuItem, Select} from "@material-ui/core"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {RootState} from "../../store"
import {getHotelsByHotelId} from "../../store/actions/admin"
import AppTypography from "../base/AppTypography"
import ViewRFP from "./ViewRFP"

let useStyles = makeStyles((theme) => ({
  title: {
    display: "flex",
    alignItems: "center",
  },
  root: {height: "100%"},
  rfp: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}))
type RetreatViewRFPTabProps = {
  retreatId: number
}
export default function ViewRFPTab(props: RetreatViewRFPTabProps) {
  let classes = useStyles()
  let retreat = useSelector((state: RootState) => {
    return state.admin.retreatsDetails[props.retreatId]
  })
  let hotels = useSelector((state: RootState) => state.admin.hotels)
  let dispatch = useDispatch()
  useEffect(() => {
    let missingHotels: number[] = []
    if (retreat) {
      retreat.selected_hotels.forEach((selectedHotel) => {
        if (hotels[selectedHotel.hotel_id] == null) {
          missingHotels.push(selectedHotel.hotel_id)
        }
      })
      if (missingHotels.length) {
        dispatch(getHotelsByHotelId(missingHotels))
      }
    }
  }, [hotels, retreat, dispatch])
  let [selectedHotelId, setSelectedHotelId] = useState("current")
  let [selectedRFPId, setSelectedRFPId] = useState<number | undefined>(
    retreat?.request_for_proposal_id
  )

  useEffect(() => {
    if (retreat?.request_for_proposal_id) {
      if (selectedHotelId === "current") {
        setSelectedRFPId(retreat.request_for_proposal_id)
      } else {
        let hotel = retreat.selected_hotels.find(
          (hotel) => hotel.hotel_id === parseInt(selectedHotelId)
        )
        if (hotel) {
          setSelectedRFPId(hotel.rfp_id)
        }
      }
    }
  }, [retreat, selectedHotelId])
  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <AppTypography variant="h4">View RFP&nbsp;&nbsp;&nbsp;</AppTypography>
        <Select
          value={selectedHotelId}
          label="Select Hotel"
          onChange={(e) => {
            e.target.value &&
              setSelectedHotelId(e.target.value as unknown as string)
          }}>
          <MenuItem value={"current"}>Most Recent RFP</MenuItem>
          {retreat?.selected_hotels &&
            retreat?.selected_hotels.map((selectedHotel) => {
              return (
                <MenuItem value={selectedHotel.hotel_id.toString()}>
                  {hotels[selectedHotel.hotel_id]?.name
                    ? hotels[selectedHotel.hotel_id]!.name
                    : ""}
                </MenuItem>
              )
            })}
        </Select>
      </div>
      <div className={classes.rfp}>
        <ViewRFP rfpId={selectedRFPId} />
      </div>
    </div>
  )
}
