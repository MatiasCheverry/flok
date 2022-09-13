import {makeStyles} from "@material-ui/core"
import {useEffect, useState} from "react"
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd"
import {useDispatch} from "react-redux"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {ApiAction} from "../../store/actions/api"
import {postReorderQuestion} from "../../store/actions/form"
import {useForm} from "./FormProvider"
import FormQuestionProvider from "./FormQuestionProvider"
import {FormHeader} from "./Headers"
import {AddNewQuestionButton, RegFormBuilderQuestion} from "./Questions"

let useStyles = makeStyles((theme) => ({
  builderForm: {
    margin: theme.spacing(1),
    "& > :not(:first-child)": {marginTop: theme.spacing(2)},
  },
  formSection: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
  },
  formQuestionTitleInput: {
    ...theme.typography.body1,
    fontWeight: theme.typography.fontWeightBold,
  },
  formQuestionDescriptionInput: {
    ...theme.typography.body2,
  },
  addQuestionButtonContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  droppableDiv: {
    display: "flex",
    gap: theme.spacing(1),
    flexDirection: "column",
  },
}))

type FormBuilderProps = {}
export default function FormBuilder(props: FormBuilderProps) {
  let classes = useStyles(props)
  let form = useForm()
  let [questionIds, setQuestionIds] = useState(form.questions)
  let dispatch = useDispatch()

  useEffect(() => {
    setQuestionIds(form.questions)
  }, [form])

  return (
    <div className={classes.builderForm}>
      <div className={classes.formSection}>
        <FormHeader
          editable
          formId={form.id}
          title={form.title}
          description={form.description ?? ""}
        />
      </div>
      <DragDropContext
        onDragEnd={async (result: any) => {
          if (result && result.destination) {
            const items = Array.from(questionIds)
            const [reorderedItem] = items.splice(result.source.index, 1)
            items.splice(result.destination.index, 0, reorderedItem)
            setQuestionIds(items)
            let prevQuestionId: number | undefined =
              items[result.destination.index - 1]

            let response = (await dispatch(
              postReorderQuestion(
                parseInt(result.draggableId),
                form.id,
                prevQuestionId
              )
            )) as unknown as ApiAction
            if (response.error) {
              setQuestionIds(form.questions)
              dispatch(
                enqueueSnackbar({
                  message: "Something went wrong.",
                  options: {variant: "error"},
                })
              )
            }
          }
        }}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={classes.droppableDiv}>
              {questionIds.map((questionId, index) => {
                return (
                  <Draggable
                    key={questionId}
                    draggableId={questionId.toString()}
                    index={index}>
                    {(provided, snapshot) => (
                      <div {...provided.draggableProps} ref={provided.innerRef}>
                        <div className={classes.formSection}>
                          <FormQuestionProvider questionId={questionId}>
                            <RegFormBuilderQuestion
                              key={questionId}
                              dragHandleProps={provided.dragHandleProps}
                              isDragging={snapshot.isDragging}
                            />
                          </FormQuestionProvider>
                        </div>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className={classes.addQuestionButtonContainer}>
        <AddNewQuestionButton formId={form.id} />
      </div>
    </div>
  )
}
