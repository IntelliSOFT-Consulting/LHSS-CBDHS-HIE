import { FhirApi } from "./utils"


const findPossibleMatches = async () => {
    let res = await FhirApi({
        url: `/$match`
    })
}


const linkRecords = async (goldenRecord: string, sourceRecord: string) => {
    let res = await FhirApi({
        url: `/$match`,
        method:'POST',
        data:JSON.stringify({

        })
    })
}