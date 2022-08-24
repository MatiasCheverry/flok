import {
  Box,
  Button,
  Link,
  makeStyles,
  Modal,
  Paper,
  TextField,
} from "@material-ui/core"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {AdminHotelModel} from "../../models"
import {RootState} from "../../store"
import {getDestinations, getHotelsByDest} from "../../store/actions/admin"
import AppTypography from "../base/AppTypography"
import DestinationSelect from "./DestinationSelect"
import HotelSearchBar from "./HotelSearchBar"

type HotelSelectModalProps = {
  submitText?: string
  onSubmit: (hotelId: number) => void
  onClose: () => void
}
export default function HotelSelectModal(props: HotelSelectModalProps) {
  let [searchType, setSearchType] = useState<"select" | "search">("search")
  return (
    <Modal open onClose={props.onClose}>
      <Box
        maxWidth={500}
        minWidth={400}
        position="fixed"
        top="50%"
        left="50%"
        style={{
          transform: "translate(-50%, -50%)",
        }}>
        <Paper>
          <Box paddingY={4} paddingX={2} display="flex" flexDirection="column">
            <AppTypography variant="body1" fontWeight="bold" paragraph>
              Select Hotel
            </AppTypography>
            {searchType === "search" ? (
              <>
                <HotelSearchBar onSelect={props.onSubmit} />
                <Box display="flex" paddingTop={2}>
                  <Link
                    component="button"
                    variant="body1"
                    underline="always"
                    onClick={() => setSearchType("select")}>
                    Find by destination?
                  </Link>
                </Box>
              </>
            ) : (
              <>
                <HotelSelectForm onSubmit={props.onSubmit} />
                <Box display="flex" paddingTop={2}>
                  <Link
                    component="button"
                    variant="body1"
                    underline="always"
                    onClick={() => setSearchType("search")}>
                    Find by name?
                  </Link>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Modal>
  )
}

let useFormStyles = makeStyles((theme) => ({
  root: {
    "& > *:not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
}))

type HotelSelectFormProps = {
  onSubmit: (hotelId: number) => void
  submitText?: string
}
export function HotelSelectForm(props: HotelSelectFormProps) {
  let classes = useFormStyles()
  let dispatch = useDispatch()
  let destinationsList = useSelector(
    (state: RootState) => state.admin.allDestinations
  )
  let [selectedDestinationId, setSelectedDestinationId] = useState<
    number | undefined
  >(undefined)
  let hotelsByDestination = useSelector(
    (state: RootState) => state.admin.hotelsByDestination
  )
  let hotels = useSelector((state: RootState) => state.admin.hotels)
  let [selectedHotelId, setSelectedHotelId] = useState<number | undefined>(
    undefined
  )

  useEffect(() => {
    if (destinationsList == null) {
      dispatch(getDestinations())
    }
  }, [destinationsList, dispatch])

  useEffect(() => {
    if (selectedDestinationId != null) {
      let hotelIds = hotelsByDestination[selectedDestinationId]
      if (hotelIds == null) {
        dispatch(getHotelsByDest(selectedDestinationId))
      }
    }
  }, [selectedDestinationId, hotelsByDestination, dispatch])
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        props.onSubmit(selectedHotelId!)
      }}
      className={classes.root}>
      <DestinationSelect
        value={selectedDestinationId}
        onChange={(e) => {
          setSelectedDestinationId(parseInt(e.target.value))
          setSelectedHotelId(undefined)
        }}
      />
      <TextField
        select
        SelectProps={{native: true}}
        fullWidth
        label="Hotels"
        placeholder="Select a hotel"
        InputLabelProps={{shrink: true}}
        value={selectedHotelId}
        onChange={(e) => {
          setSelectedHotelId(parseInt(e.target.value))
        }}>
        {selectedHotelId == null && (
          <option value={undefined}>Select a hotel</option>
        )}
        {selectedDestinationId != null &&
          hotelsByDestination[selectedDestinationId] &&
          hotelsByDestination[selectedDestinationId].map((id) => {
            let hotel: AdminHotelModel = hotels[id]!
            return <option value={hotel.id}>{hotel.name}</option>
          })}
      </TextField>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button
          disabled={selectedHotelId == null}
          type="submit"
          color="primary"
          variant="contained">
          {props.submitText ? props.submitText : "Submit"}
        </Button>
      </Box>
    </form>
  )
}
