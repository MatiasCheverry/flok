import {Box, Grid, TextField, Typography} from "@material-ui/core"
import {LocationCity} from "@material-ui/icons"
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteInputChangeReason,
} from "@material-ui/lab"
import parse from "autosuggest-highlight/parse"
import throttle from "lodash/throttle"
import * as React from "react"
import config, {GOOGLE_API_KEY} from "../../config"
import {GooglePlace} from "../../models/lodging"
import {useScript} from "../../utils"

const autocompleteService = {current: null}

interface MainTextMatchedSubstrings {
  offset: number
  length: number
}
interface StructuredFormatting {
  main_text: string
  secondary_text: string
  main_text_matched_substrings: readonly MainTextMatchedSubstrings[]
}
interface PlaceType {
  description: string
  structured_formatting: StructuredFormatting
}

type GooglePlacesAutoCompleteProps = {
  types: string[]
  clearOnBlur?: true
  disableClearable?: true
  selectOnFocus?: true
  onInputChange: (
    event: React.ChangeEvent<{}>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => void
  inputValue: string
  selectedOptions: string[]
  onChange: (
    event: React.ChangeEvent<{}>,
    value: any,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => void
  clearOnSelect?: boolean
}
export default function GooglePlacesAutoComplete(
  props: GooglePlacesAutoCompleteProps
) {
  const [value, setValue] = React.useState<PlaceType | null>(null)
  const [inputSearchValue, setInputSearchValue] = React.useState("")
  const [options, setOptions] = React.useState<readonly PlaceType[]>([])

  let [googleMapScriptLoaded] = useScript(
    `https://maps.googleapis.com/maps/api/js?libraries=places&key=${config.get(
      GOOGLE_API_KEY
    )}`
  )

  let FLOK_FAVORITE_DESTINATIONS = [
    {
      description: "Austin, TX, USA",
      matched_substrings: [{length: 3, offset: 0}],
      place_id: "ChIJLwPMoJm1RIYRetVp1EtGm10",
      reference: "ChIJLwPMoJm1RIYRetVp1EtGm10",
      structured_formatting: {
        main_text: "Austin",
        main_text_matched_substrings: [{length: 3, offset: 0}],
        secondary_text: "TX, USA",
      },
      terms: [
        {offset: 0, value: "Austin"},
        {offset: 8, value: "TX"},
        {offset: 12, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Palm Springs, CA, USA",
      matched_substrings: [{length: 7, offset: 0}],
      place_id: "ChIJs-Xb_9Qa24ARfHntwodp5aE",
      reference: "ChIJs-Xb_9Qa24ARfHntwodp5aE",
      structured_formatting: {
        main_text: "Palm Springs",
        main_text_matched_substrings: [{length: 7, offset: 0}],
        secondary_text: "CA, USA",
      },
      terms: [
        {offset: 0, value: "Palm Springs"},
        {offset: 14, value: "CA"},
        {offset: 18, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Miami, FL, USA",
      matched_substrings: [{length: 5, offset: 0}],
      place_id: "ChIJEcHIDqKw2YgRZU-t3XHylv8",
      reference: "ChIJEcHIDqKw2YgRZU-t3XHylv8",
      structured_formatting: {
        main_text: "Miami",
        main_text_matched_substrings: [{length: 5, offset: 0}],
        secondary_text: "FL, USA",
      },
      terms: [
        {offset: 0, value: "Miami"},
        {offset: 7, value: "FL"},
        {offset: 11, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "San Diego, CA, USA",
      matched_substrings: [{length: 6, offset: 0}],
      place_id: "ChIJSx6SrQ9T2YARed8V_f0hOg0",
      reference: "ChIJSx6SrQ9T2YARed8V_f0hOg0",
      structured_formatting: {
        main_text: "San Diego",
        main_text_matched_substrings: [{length: 6, offset: 0}],
        secondary_text: "CA, USA",
      },
      terms: [
        {offset: 0, value: "San Diego"},
        {offset: 11, value: "CA"},
        {offset: 15, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Denver, CO, USA",
      matched_substrings: [{length: 6, offset: 0}],
      place_id: "ChIJzxcfI6qAa4cR1jaKJ_j0jhE",
      reference: "ChIJzxcfI6qAa4cR1jaKJ_j0jhE",
      structured_formatting: {
        main_text: "Denver",
        main_text_matched_substrings: [{length: 6, offset: 0}],
        secondary_text: "CO, USA",
      },
      terms: [
        {offset: 0, value: "Denver"},
        {offset: 8, value: "CO"},
        {offset: 12, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Park City, UT, USA",
      matched_substrings: [{length: 9, offset: 0}],
      place_id: "ChIJ_QNjLGMPUocRlFc3Jd_Ecdg",
      reference: "ChIJ_QNjLGMPUocRlFc3Jd_Ecdg",
      structured_formatting: {
        main_text: "Park City",
        main_text_matched_substrings: [{length: 9, offset: 0}],
        secondary_text: "UT, USA",
      },
      terms: [
        {offset: 0, value: "Park City"},
        {offset: 11, value: "UT"},
        {offset: 15, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "San Francisco, CA, USA",
      matched_substrings: [{length: 8, offset: 0}],
      place_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      reference: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      structured_formatting: {
        main_text: "San Francisco",
        main_text_matched_substrings: [{length: 8, offset: 0}],
        secondary_text: "CA, USA",
      },
      terms: [
        {offset: 0, value: "San Francisco"},
        {offset: 15, value: "CA"},
        {offset: 19, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Nashville, TN, USA",
      matched_substrings: [{length: 4, offset: 0}],
      place_id: "ChIJPZDrEzLsZIgRoNrpodC5P30",
      reference: "ChIJPZDrEzLsZIgRoNrpodC5P30",
      structured_formatting: {
        main_text: "Nashville",
        main_text_matched_substrings: [{length: 4, offset: 0}],
        secondary_text: "TN, USA",
      },
      terms: [
        {offset: 0, value: "Nashville"},
        {offset: 11, value: "TN"},
        {offset: 15, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Portland, OR, USA",
      matched_substrings: [{length: 8, offset: 0}],
      place_id: "ChIJJ3SpfQsLlVQRkYXR9ua5Nhw",
      reference: "ChIJJ3SpfQsLlVQRkYXR9ua5Nhw",
      structured_formatting: {
        main_text: "Portland",
        main_text_matched_substrings: [{length: 8, offset: 0}],
        secondary_text: "OR, USA",
      },
      terms: [
        {offset: 0, value: "Portland"},
        {offset: 10, value: "OR"},
        {offset: 14, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Las Vegas, NV, USA",
      matched_substrings: [{length: 6, offset: 0}],
      place_id: "ChIJ0X31pIK3voARo3mz1ebVzDo",
      reference: "ChIJ0X31pIK3voARo3mz1ebVzDo",
      structured_formatting: {
        main_text: "Las Vegas",
        main_text_matched_substrings: [{length: 6, offset: 0}],
        secondary_text: "NV, USA",
      },
      terms: [
        {offset: 0, value: "Las Vegas"},
        {offset: 11, value: "NV"},
        {offset: 15, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "New Orleans, LA, USA",
      matched_substrings: [{length: 7, offset: 0}],
      place_id: "ChIJZYIRslSkIIYRtNMiXuhbBts",
      reference: "ChIJZYIRslSkIIYRtNMiXuhbBts",
      structured_formatting: {
        main_text: "New Orleans",
        main_text_matched_substrings: [{length: 7, offset: 0}],
        secondary_text: "LA, USA",
      },
      terms: [
        {offset: 0, value: "New Orleans"},
        {offset: 13, value: "LA"},
        {offset: 17, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Scottsdale, AZ, USA",
      matched_substrings: [{length: 10, offset: 0}],
      place_id: "ChIJlyx3p9kIK4cRGOaPGBLk0iY",
      reference: "ChIJlyx3p9kIK4cRGOaPGBLk0iY",
      structured_formatting: {
        main_text: "Scottsdale",
        main_text_matched_substrings: [{length: 10, offset: 0}],
        secondary_text: "AZ, USA",
      },
      terms: [
        {offset: 0, value: "Scottsdale"},
        {offset: 12, value: "AZ"},
        {offset: 16, value: "USA"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Barcelona, Spain",
      matched_substrings: [{length: 5, offset: 0}],
      place_id: "ChIJ5TCOcRaYpBIRCmZHTz37sEQ",
      reference: "ChIJ5TCOcRaYpBIRCmZHTz37sEQ",
      structured_formatting: {
        main_text: "Barcelona",
        main_text_matched_substrings: [{length: 5, offset: 0}],
        secondary_text: "Spain",
      },
      terms: [
        {offset: 0, value: "Barcelona"},
        {offset: 11, value: "Spain"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Montego Bay, Jamaica",
      matched_substrings: [{length: 7, offset: 0}],
      place_id: "ChIJseJ3_V0q2o4RZlfMWtua1vw",
      reference: "ChIJseJ3_V0q2o4RZlfMWtua1vw",
      structured_formatting: {
        main_text: "Montego Bay",
        main_text_matched_substrings: [{length: 7, offset: 0}],
        secondary_text: "Jamaica",
      },
      terms: [
        {offset: 0, value: "Montego Bay"},
        {offset: 13, value: "Jamaica"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Playa del Carmen, Quintana Roo, Mexico",
      matched_substrings: [
        {
          length: 9,
          offset: 0,
        },
      ],
      place_id: "ChIJYU4t0iNDTo8R3EqrO3gLweg",
      reference: "ChIJYU4t0iNDTo8R3EqrO3gLweg",
      structured_formatting: {
        main_text: "Playa del Carmen",
        main_text_matched_substrings: [
          {
            length: 9,
            offset: 0,
          },
        ],
        secondary_text: "Quintana Roo, Mexico",
      },
      terms: [
        {
          offset: 0,
          value: "Playa del Carmen",
        },
        {
          offset: 18,
          value: "Quintana Roo",
        },
        {
          offset: 32,
          value: "Mexico",
        },
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Cancún, Quintana Roo, Mexico",
      matched_substrings: [{length: 4, offset: 0}],
      place_id: "ChIJ21P2rgUrTI8Ris1fYjy3Ms4",
      reference: "ChIJ21P2rgUrTI8Ris1fYjy3Ms4",
      structured_formatting: {
        main_text: "Cancún",
        main_text_matched_substrings: [{length: 4, offset: 0}],
        secondary_text: "Quintana Roo, Mexico",
      },
      terms: [
        {offset: 0, value: "Cancún"},
        {offset: 8, value: "Quintana Roo"},
        {offset: 22, value: "Mexico"},
      ],
      types: ["locality", "political", "geocode"],
    },
    {
      description: "Tulum, Quintana Roo, Mexico",
      matched_substrings: [
        {
          length: 5,
          offset: 0,
        },
      ],
      place_id: "ChIJSyrkEAPUT48Rt5r_k9vA7Q4",
      reference: "ChIJSyrkEAPUT48Rt5r_k9vA7Q4",
      structured_formatting: {
        main_text: "Tulum",
        main_text_matched_substrings: [
          {
            length: 5,
            offset: 0,
          },
        ],
        secondary_text: "Quintana Roo, Mexico",
      },
      terms: [
        {
          offset: 0,
          value: "Tulum",
        },
        {
          offset: 7,
          value: "Quintana Roo",
        },
        {
          offset: 21,
          value: "Mexico",
        },
      ],
      types: ["locality", "political", "geocode"],
    },
  ]

  const fetch = React.useMemo(
    () =>
      throttle(
        (
          request: {input: string; types: string[]},
          callback: (results?: readonly PlaceType[]) => void
        ) => {
          ;(autocompleteService.current as any).getPlacePredictions(
            request,
            callback
          )
        },
        200
      ),
    []
  )

  React.useEffect(() => {
    let active = true

    if (
      !autocompleteService.current &&
      (window as any).google &&
      googleMapScriptLoaded
    ) {
      autocompleteService.current = new (
        window as any
      ).google.maps.places.AutocompleteService()
    }
    if (!autocompleteService.current) {
      return undefined
    }

    if (inputSearchValue === "") {
      setOptions(value ? [value] : [])
      return undefined
    }

    fetch(
      {input: inputSearchValue, types: props.types},
      (results?: readonly PlaceType[]) => {
        if (active) {
          let newOptions: readonly PlaceType[] = []

          if (value) {
            newOptions = [value]
          }

          if (results) {
            newOptions = [...newOptions, ...results]
          }

          setOptions(newOptions)
        }
      }
    )

    return () => {
      active = false
    }
  }, [value, inputSearchValue, fetch, props.types, googleMapScriptLoaded])

  return (
    <Autocomplete
      id="google-map-demo"
      selectOnFocus={props.selectOnFocus}
      disableClearable={props.disableClearable}
      clearOnBlur={props.clearOnBlur}
      style={{width: 300}}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.description
      }
      options={
        !!inputSearchValue[0]
          ? (options.filter((x) => {
              let place = x as unknown as GooglePlace
              return props.selectedOptions.indexOf(place.place_id) === -1
            }) as PlaceType[])
          : FLOK_FAVORITE_DESTINATIONS.filter((x) => {
              let place = x as unknown as GooglePlace
              return props.selectedOptions.indexOf(place.place_id) === -1
            })
      }
      autoComplete
      groupBy={(option) => {
        return !!inputSearchValue[0] ? "" : "Flok Favorites"
      }}
      includeInputInList
      filterSelectedOptions
      onChange={(event: any, newValue: PlaceType | null, reason) => {
        setOptions(newValue ? [newValue, ...options] : options)
        setValue(newValue)
        props.onChange(event, newValue, reason)
        if (props.clearOnSelect) {
          setInputSearchValue("")
        }
      }}
      onInputChange={(event, newInputValue, reason) => {
        setInputSearchValue(newInputValue)
        if (reason === "reset") {
          setInputSearchValue("")
        }
        props.onInputChange(event, newInputValue, reason)
      }}
      inputValue={props.inputValue}
      renderInput={(params) => (
        <TextField {...params} label="Add a location" fullWidth />
      )}
      renderOption={(option, state) => {
        const matches =
          option.structured_formatting.main_text_matched_substrings

        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match: any) => [
            match.offset,
            match.offset + match.length,
          ])
        )

        return (
          <li>
            <Grid container alignItems="center">
              <Grid item>
                <Box component={LocationCity} />
              </Grid>
              <Grid item xs>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{
                      fontWeight: part.highlight ? 700 : 400,
                    }}>
                    {part.text}
                  </span>
                ))}
                <Typography variant="body2">
                  {option.structured_formatting.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          </li>
        )
      }}
    />
  )
}
