import {TextFieldProps} from "@material-ui/core"
import {push} from "connected-react-router"
import {useCallback, useEffect, useState} from "react"
import {useDispatch} from "react-redux"
import {useLocation} from "react-router-dom"

/**
 * Converts given string to guid with hypens if possible, else return str unchanged
 */
export function convertGuid(str: string) {
  if (str.length === 32) {
    return (
      str.slice(0, 8) +
      "-" +
      str.slice(8, 12) +
      "-" +
      str.slice(12, 16) +
      "-" +
      str.slice(16, 20) +
      "-" +
      str.slice(20, str.length + 1)
    )
  } else {
    return str
  }
}

export function useQuery(param: string) {
  let dispatch = useDispatch()
  let searchString = useLocation().search.substring(1)
  let [paramVal, setParamVal] = useState<string | null>(
    new URLSearchParams(searchString).get(param)
  )
  useEffect(() => {
    setParamVal(new URLSearchParams(searchString).get(param))
  }, [searchString, setParamVal, param])

  /* If null is given for newParamVal, delete the param */
  function setParam(newParamVal: string | null) {
    let allParams = new URLSearchParams(searchString)
    if (newParamVal == null) {
      allParams.delete(param)
    } else {
      allParams.set(param, newParamVal)
    }
    return dispatch(
      push({
        search: `${allParams.toString() ? "?" + allParams.toString() : ""}`,
      })
    )
  }

  let setCallback = useCallback(setParam, [dispatch, param, searchString])
  return [paramVal, setCallback] as const
}

export function useQueryAsList(param: string, separator: string = ",") {
  let dispatch = useDispatch()
  let searchString = useLocation().search.substring(1)
  let [paramVals, setParamVals] = useState<string[]>(
    new URLSearchParams(searchString).getAll(param)
  )
  useEffect(() => {
    setParamVals(new URLSearchParams(searchString).getAll(param))
  }, [searchString, setParamVals, param, separator])

  function setParams(newParamVals: string[]) {
    let allParams = new URLSearchParams(searchString)
    allParams.delete(param)
    newParamVals.forEach((newParamVal) => allParams.append(param, newParamVal))
    dispatch(
      push({
        search: `${allParams.toString() ? "?" + allParams.toString() : ""}`,
      })
    )
  }
  return [paramVals, setParams] as const
}

// Hook
export type ScriptLoadingState = "loading" | "idle" | "ready" | "error"
export function useScript(src: string): [boolean, ScriptLoadingState] {
  // Keep track of script status ("idle", "loading", "ready", "error")
  const [status, setStatus] = useState<ScriptLoadingState>(
    src ? "loading" : "idle"
  )
  const [ready, setReady] = useState(false)

  useEffect(
    () => {
      // Allow falsy src value if waiting on other data needed for
      // constructing the script URL passed to this hook.
      if (!src) {
        setStatus("idle")
        return
      }

      // Fetch existing script element by src
      // It may have been added by another intance of this hook
      let script = document.querySelector<HTMLScriptElement>(
        `script[src="${src}"]`
      )

      if (!script) {
        // Create script
        script = document.createElement("script")
        script.src = src
        script.async = true
        script.setAttribute("data-status", "loading")
        // Add script to document body
        document.body.appendChild(script)

        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = (event: Event) => {
          if (script) {
            script.setAttribute(
              "data-status",
              event.type === "load" ? "ready" : "error"
            )
          }
        }

        script.addEventListener("load", setAttributeFromEvent)
        script.addEventListener("error", setAttributeFromEvent)
      } else {
        // Grab existing script status from attribute and set to state.
        let _status = script.getAttribute("data-status") as ScriptLoadingState
        if (_status) {
          setStatus(_status)
        }
      }

      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = (event: Event) => {
        setStatus(event.type === "load" ? "ready" : "error")
      }

      // Add event listeners
      script.addEventListener("load", setStateFromEvent)
      script.addEventListener("error", setStateFromEvent)

      // Remove event listeners on cleanup
      return () => {
        if (script) {
          script.removeEventListener("load", setStateFromEvent)
          script.removeEventListener("error", setStateFromEvent)
        }
      }
    },
    [src] // Only re-run effect if script src changes
  )

  useEffect(() => {
    if (status === "ready") {
      setReady(true)
    } else {
      setReady(false)
    }
  }, [status, setReady])

  return [ready, status]
}

/**
 * Given an integer, returns dollar or euro formatted string.
 */
export function formatCurrency(
  amount: number,
  currency?: "USD" | "EUR"
): string {
  currency = currency ? currency : "USD"
  let formatter = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

export function getTextFieldErrorProps(
  formik: any,
  field: string
): TextFieldProps {
  let isError = formik.errors && !!formik.errors[field]
  return {
    error: isError,
    helperText: isError && formik.errors && formik.errors[field],
  }
}

export function titleToNavigation(str: string) {
  let letters = str.split("")
  letters.forEach((letter, i) => {
    if (letter === " ") {
      letters[i] = "-"
    }
  })
  return letters.join("").toLowerCase()
}

export function replaceDashes(str: string) {
  let strArray = str.split("")
  strArray.forEach((char, i) => {
    if (char === "-") {
      strArray[i] = " "
    }
  })
  return strArray.join("")
}
