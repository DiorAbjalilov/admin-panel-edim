import { gql } from '@apollo/client'

export const GET_ADMIN = gql`
    {
        findMeAdmin {
            id
            email
        }
    }
`

export const LOGIN_ADMIN = gql`
    mutation($data: AdminSignInInput!) {
        signInAdmin(data: $data) {
            token
            admin {
                id
                email
            }
        }
    }
`

export const REPASSWORD_ADMIN = gql`
    mutation($where: AdminWhereUniqueInput!) {
        repasswordAdmin(where: $where)
    }
`

export const CHANGE_PASSWORD_ADMIN = gql`
    mutation($data: ChangePasswordInput!) {
        changePasswordAdmin(data: $data){
                id
                email
        }
    }
`
