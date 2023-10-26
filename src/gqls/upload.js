import { gql } from '@apollo/client'

export const UPLOAD_FILE = gql`
    mutation($file: Upload!){
        uploadFile(file: $file)
    }
`

export const DELETE_FILE = gql`
    mutation($fileName: String!){
        deleteFile(fileName: $fileName)
    }
`