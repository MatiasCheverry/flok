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
  types?: string[]
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
  inputLabel?: string
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

  const fetch = React.useMemo(
    () =>
      throttle(
        (
          request: {
            input: string
            location: {lat: () => number; lng: () => number}
            radius: number
          },
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
    let latLng = {lat: () => 0, lng: () => 0}

    fetch(
      {
        input: inputSearchValue,
        location: latLng,
        radius: 1,
      },
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
  }, [value, inputSearchValue, fetch, googleMapScriptLoaded])

  return (
    <Autocomplete
      fullWidth
      id="google-map-demo"
      selectOnFocus={props.selectOnFocus}
      disableClearable={props.disableClearable}
      clearOnBlur={props.clearOnBlur}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.description
      }
      options={options as PlaceType[]}
      autoComplete
      includeInputInList
      filterSelectedOptions
      onChange={(event: any, newValue: PlaceType | null, reason) => {
        setOptions(newValue ? [newValue, ...options] : options)
        setValue(newValue)
        props.onChange(event, newValue, reason)
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
        <TextField
          {...params}
          label={props.inputLabel ?? "Add a location"}
          fullWidth
        />
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
