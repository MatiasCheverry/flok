import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {RootState} from "../store"
import {getFormQuestion, getFormResponse} from "../store/actions/form"

export function useForm(formId: number) {}

export function useFormQuestion(questionId: number) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let formQuestion = useSelector(
    (state: RootState) => state.form.formQuestions[questionId]
  )
  useEffect(() => {
    async function loadQuestion() {
      setLoading(true)
      await dispatch(getFormQuestion(questionId))
      setLoading(false)
    }
    if (!formQuestion) {
      loadQuestion()
    }
  }, [formQuestion, dispatch, questionId])
  return [formQuestion, loading] as const
}

export function useFormResponse(formResponseId: number) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let formResponse = useSelector(
    (state: RootState) => state.form.formResponses[formResponseId]
  )

  useEffect(() => {
    async function loadFormResponse() {
      setLoading(true)
      dispatch(getFormResponse(formResponseId))
      setLoading(false)
    }
    if (!formResponse) {
      loadFormResponse()
    }
  }, [formResponseId, dispatch, formResponse])
  return [formResponse, loading] as const
}
