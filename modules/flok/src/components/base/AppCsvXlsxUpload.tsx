import {Button} from "@material-ui/core"
import {Publish} from "@material-ui/icons"
import Papa from "papaparse"
import * as XLSX from "xlsx"
type AppCsvXlsxUploadProps = {
  onUpload: (data: string[][]) => void
  text?: string
}
function AppCsvXlsxUpload(props: AppCsvXlsxUploadProps) {
  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target && e.target.files && e.target.files[0]) {
      Papa.parse(e.target.files[0], {
        complete: function (results) {
          props.onUpload(results.data as unknown as string[][])
        },
      })
    }
  }
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    var files = e.target.files
    if (files) {
      let f = files[0]
      var reader = new FileReader()
      reader.onload = function (e) {
        var data = e!.target!.result
        let readedData = XLSX.read(data, {type: "binary"})
        const wsname = readedData.SheetNames[0]
        const ws = readedData.Sheets[wsname]

        /* Convert array to json*/
        const dataParse = XLSX.utils.sheet_to_json(ws, {header: 1})
        props.onUpload(dataParse as unknown as string[][])
      }
      reader.readAsBinaryString(f)
    }
  }
  return (
    <Button component="label" variant="outlined" color="primary">
      <Publish />
      {props.text ? props.text : "Upload"}
      <input
        type="file"
        accept=".xlsx, .csv"
        hidden
        onChange={(e) => {
          if (e.target && e.target.files && e.target.files[0]) {
            if (e.target.files[0].type === "text/csv") {
              handleCsvUpload(e)
            } else {
              handleUpload(e)
            }
          }
        }}></input>
    </Button>
  )
}
export default AppCsvXlsxUpload
