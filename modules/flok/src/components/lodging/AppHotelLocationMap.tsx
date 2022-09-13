import {makeStyles} from "@material-ui/core"
import {HomeRounded} from "@material-ui/icons"
import React, {PropsWithChildren, useEffect, useRef, useState} from "react"
import ReactDOM from "react-dom"
import config, {
  GOOGLE_API_KEY,
  GOOGLE_MAPS_ID_HOTEL_PAGE_KEY,
} from "../../config"
import {useScript} from "../../utils"

// This entire file pretty much came from work done here:
//  https://github.com/Summ-Technologies/flok/tree/cfc5b421a4103465d32c4d7727d849e9e010e767

let useStyles = makeStyles((props) => ({
  root: {
    width: "100%",
    minWidth: "100px",
    height: "100%",
  },
}))

type AppHotelLocationMapProps = PropsWithChildren<{
  lat: number
  long: number
  zoom?: number
}>

function AppHotelLocationMap(props: AppHotelLocationMapProps) {
  let classes = useStyles(props)
  let mapRef = useRef<HTMLDivElement | null>(null)
  let [map, setMap] = useState<google.maps.Map | undefined>(undefined)

  let [googleMapScriptLoaded] = useScript(
    `https://maps.googleapis.com/maps/api/js?key=${config.get(
      GOOGLE_API_KEY
    )}&map_ids=${config.get(GOOGLE_MAPS_ID_HOTEL_PAGE_KEY)}&callback`
  )

  useEffect(() => {
    const MAP_OPTIONS: google.maps.MapOptions = {
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: false,
      panControl: false,
      streetViewControl: false,
      zoom: props.zoom ?? 15,
      mapId: config.get(GOOGLE_MAPS_ID_HOTEL_PAGE_KEY),
    } as google.maps.MapOptions

    if (googleMapScriptLoaded) {
      if (googleMapScriptLoaded && mapRef.current && !map) {
        let map = new google.maps.Map(mapRef.current, {
          ...MAP_OPTIONS,
          center: {
            lat: props.lat,
            lng: props.long,
          },
        })
        setMap(map)
      }
    }
  }, [
    googleMapScriptLoaded,
    mapRef,
    setMap,
    map,
    props.lat,
    props.long,
    props.zoom,
  ])

  return (
    <div ref={mapRef} className={classes.root}>
      {googleMapScriptLoaded && mapRef.current && google ? (
        <HotelMapMarker lat={props.lat} long={props.long} map={map} />
      ) : undefined}
    </div>
  )
}

export default React.memo(AppHotelLocationMap)

let useMarkerStyles = makeStyles((theme) => ({
  root: {},
  popupContainer: {
    color: "white",
    height: 0,
    position: "absolute",
    width: 400,
  },
  popupBubble: {
    position: "absolute",
    top: 0,
    left: 0,
    transform: "translate(-50%, -50%)",
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(1),
    borderRadius: "50%",
  },
  popupBubbleAnchor: {
    position: "absolute",
  },
}))

function HotelMapMarker(props: {
  lat: number
  long: number
  map?: google.maps.Map
}) {
  let classes = useMarkerStyles(props)
  let [popup, setPopup] = useState<any>(undefined)
  let content = document.createElement("div")
  ReactDOM.render(<HomeRounded fontSize="large" color="inherit" />, content)

  useEffect(() => {
    class Popup extends google.maps.OverlayView {
      position: google.maps.LatLng
      containerDiv: HTMLDivElement

      constructor(
        position: google.maps.LatLng,
        content: HTMLElement,
        classes: {anchor: string; container: string; bubble: string},
        map: google.maps.Map
      ) {
        super()
        this.position = position
        classes.bubble.split(" ").map((cls) => content.classList.add(cls))

        // This zero-height div is positioned at the bottom of the bubble.
        const bubbleAnchor = document.createElement("div")
        classes.anchor.split(" ").map((cls) => bubbleAnchor.classList.add(cls))
        bubbleAnchor.appendChild(content)

        // This zero-height div is positioned at the bottom of the tip.
        this.containerDiv = document.createElement("div")
        classes.container
          .split(" ")
          .map((cls) => this.containerDiv.classList.add(cls))
        this.containerDiv.appendChild(bubbleAnchor)

        // Optionally stop clicks, etc., from bubbling up to the map.
        Popup.preventMapHitsAndGesturesFrom(this.containerDiv)

        this.setMap(map)
      }

      /** Called when the popup is added to the map. */
      onAdd() {
        this.getPanes()!.floatPane.appendChild(this.containerDiv)
      }

      /** Called when the popup is removed from the map. */
      onRemove() {
        if (this.containerDiv.parentElement) {
          this.containerDiv.parentElement.removeChild(this.containerDiv)
        }
      }

      /** Called each frame when the popup needs to draw itself. */
      draw() {
        const divPosition = this.getProjection().fromLatLngToDivPixel(
          this.position
        )!

        // Hide the popup when it is far out of view.
        const display =
          Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
            ? "block"
            : "none"

        if (display === "block") {
          this.containerDiv.style.left = divPosition.x + "px"
          this.containerDiv.style.top = divPosition.y + "px"
        }

        if (this.containerDiv.style.display !== display) {
          this.containerDiv.style.display = display
        }
      }
    }
    if (props.map && !popup) {
      let _popup = new Popup(
        new google.maps.LatLng(props.lat, props.long),
        content,
        {
          anchor: classes.popupBubbleAnchor,
          container: classes.popupContainer,
          bubble: classes.popupBubble,
        },
        props.map
      )
      setPopup(_popup)
    }
  }, [props, popup, setPopup, classes, content])

  useEffect(() => {
    if (props.map && popup) {
      props.map.addListener("zoom_changed", () => {
        if (props.map && popup) {
          let zoom = props.map.getZoom()
          if (zoom && zoom <= 4) {
            ;(popup.containerDiv as HTMLElement).classList.remove("large")
            ;(popup.containerDiv as HTMLElement).classList.remove("medium")
            ;(popup.containerDiv as HTMLElement).classList.add("small")
          } else if (zoom && zoom <= 7) {
            ;(popup.containerDiv as HTMLElement).classList.remove("large")
            ;(popup.containerDiv as HTMLElement).classList.add("medium")
            ;(popup.containerDiv as HTMLElement).classList.remove("small")
          } else {
            ;(popup.containerDiv as HTMLElement).classList.add("large")
            ;(popup.containerDiv as HTMLElement).classList.remove("medium")
            ;(popup.containerDiv as HTMLElement).classList.remove("small")
          }
        }
      })
    }
  }, [popup, props.map])

  useEffect(() => {
    return () => {
      if (popup) {
        popup.onRemove()
      }
    }
  }, [popup])

  return <></>
}
