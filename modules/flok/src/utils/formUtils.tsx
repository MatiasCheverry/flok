import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {RootState} from "../store"
import {
  getForm,
  getFormQuestion,
  getFormQuestionOption,
  getFormQuestionRule,
  getFormResponse,
} from "../store/actions/form"

export function useForm(formId: number) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let form = useSelector((state: RootState) => state.form.forms[formId])
  useEffect(() => {
    async function loadForm() {
      setLoading(true)
      await dispatch(getForm(formId))
      setLoading(false)
    }
    if (!form) {
      loadForm()
    }
  }, [form, dispatch, formId])
  return [form, loading] as const
}

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

export function useFormQuestionOption(optionId: number) {
  let dispatch = useDispatch()
  let [loadingOption, setLoadingOption] = useState(false)
  let option = useSelector(
    (state: RootState) => state.form.questionOptions[optionId]
  )
  useEffect(() => {
    async function loadOption() {
      setLoadingOption(true)
      await dispatch(getFormQuestionOption(optionId))
      setLoadingOption(false)
    }
    if (!option) {
      loadOption()
    }
  }, [option, optionId, dispatch])
  return [option, loadingOption] as const
}

export function useFormQuestionRule(ruleId: number) {
  let dispatch = useDispatch()
  let [loadingRule, setLoadingRule] = useState(false)
  let rule = useSelector((state: RootState) => state.form.questionRules[ruleId])
  useEffect(() => {
    async function loadRule() {
      setLoadingRule(true)
      await dispatch(getFormQuestionRule(ruleId))
      setLoadingRule(false)
    }
    if (!rule) {
      loadRule()
    }
  }, [rule, ruleId, dispatch])
  return [rule, loadingRule] as const
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
