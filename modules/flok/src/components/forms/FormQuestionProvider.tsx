import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react"
import {useDispatch, useSelector} from "react-redux"
import {FormQuestionModel} from "../../models/form"
import LoadingPage from "../../pages/misc/LoadingPage"
import {RootState} from "../../store"

const FormQuestionContext = createContext<FormQuestionModel | undefined>(
  undefined
)

export function useFormQuestion() {
  const formQuestion = useContext(FormQuestionContext)
  if (formQuestion === undefined) {
    throw Error("useFormQuestion must be used within a FormQuestionProvider")
  }
  return formQuestion
}

type FormQuestionProviderProps = PropsWithChildren<{questionId: number}>
export default function FormQuestionProvider(props: FormQuestionProviderProps) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let formQuestion = useSelector(
    (state: RootState) => state.retreat.formQuestions[props.questionId]
  )
  useEffect(() => {
    if (!formQuestion) {
      setLoading(true)
      // dispatch(getFormQuestion(formQuestionId))
      setLoading(false)
    }
  }, [formQuestion, dispatch])

  return !formQuestion && loading ? (
    <LoadingPage />
  ) : !formQuestion ? (
    <div>Error loading form question</div>
  ) : (
    <FormQuestionContext.Provider value={formQuestion}>
      {props.children}
    </FormQuestionContext.Provider>
  )
}