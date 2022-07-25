import {Box, CircularProgress} from "@material-ui/core"
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react"
import {useDispatch, useSelector} from "react-redux"
import {FormModel} from "../../models/form"
import {RootState} from "../../store"
import {getForm} from "../../store/actions/form"

const FormContext = createContext<FormModel | undefined>(undefined)

export function useForm() {
  const form = useContext(FormContext)
  if (form === undefined) {
    throw Error("useRetreat must be used within a FormProvider")
  }
  return form
}

type FormProviderProps = PropsWithChildren<{formId: number}>
export default function FormProvider(props: FormProviderProps) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let form = useSelector((state: RootState) => state.form.forms[props.formId])
  useEffect(() => {
    async function loadForm() {
      setLoading(true)
      await dispatch(getForm(props.formId))
      setLoading(false)
    }
    if (!form) {
      loadForm()
    }
  }, [form, dispatch, props.formId])

  return !form && loading ? (
    // this loader is pretty lazy with minHeight. Shouldn't copy this pattern, didn't feel like refactoring though
    <Box
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="300px">
      <CircularProgress />
    </Box>
  ) : !form ? (
    <div>Error loading form</div>
  ) : (
    <FormContext.Provider value={form}>{props.children}</FormContext.Provider>
  )
}
