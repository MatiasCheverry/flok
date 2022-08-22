import {useFormQuestion} from "../../utils/formUtils"

export default function AttendeeFormResponseDataGridHeader(props: {
  questionId: number
}) {
  let [question] = useFormQuestion(props.questionId)
  return <div>{question?.title}</div>
}
