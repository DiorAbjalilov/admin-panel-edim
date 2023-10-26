import { gql } from '@apollo/client'

export const REQUEST_ID = gql`
    mutation($data: RegisterRestaurantForBillingInput!) {
        registerRestaurantForBilling(data: $data)
    }
`

export const REORDER_MODERATORS = gql`
    mutation($where: ReorderModeratorsInput!) {
        reorderModerators(where: $where){
            id
            createdAt
            email
            block
            delete
            restaurantId
            weight
            phone
            restaurant {
                id
                name
                city
            }
        }
    }
`

export const UPDATE_MANY_MODERATOR = gql`
    mutation (
        $where: ModeratorWhereInput
        $data: ModeratorUpdateManyMutationInput!
    ){
        updateManyModerator(where: $where data: $data){
            count
        }
    }
`

export const GET_MODERATORS = gql`
    query( 
        $where: ModeratorWhereInput
        $orderBy: [ModeratorOrderByWithRelationInput!]
        $take: Int
        $skip: Int
        $cursor: ModeratorWhereUniqueInput
    ){
        findManyModerator(where: $where, orderBy: $orderBy, take: $take, skip: $skip, cursor: $cursor) {
            id
            createdAt
            email
            block
            delete
            restaurantId
            weight
            phone
            restaurant {
                id
                name
                city
            }
        }
        findManyModeratorCount(where: $where)
    }
`

export const GET_MODERATOR = gql`
    {
        findMeModerator {
            id
            createdAt
            email
            block
            delete
            restaurantId
            weight
            phone
            restaurant {
                id
                name
                city
            }
        }
    }
`

export const LOGIN_MODERATOR = gql`
    mutation($data: ModeratorSignInInput!) {
        signInModerator(data: $data) {
            token
            moderator {
                id
                createdAt
                email
                block
                delete
                restaurantId
                weight
                phone
                restaurant {
                    id
                    name
                    city
                }
            }
        }
    }
`


export const REPASSWORD_MODERATOR = gql`
    mutation($where: ModeratorWhereUniqueInput!) {
        repasswordModerator(where: $where)
    }
`

export const CREATE_MODERATOR = gql`
    mutation ($data: ModeratorCreateInput!) {
        createOneModerator(data: $data) {
            id
            createdAt
            email
            block
            delete
            restaurantId
            weight
            phone
            restaurant {
                id
                name
                city
            }
        }
    }
`

export const CHANGE_PASSWORD_MODERATOR = gql`
    mutation($data: ChangePasswordInput!) {
        changePasswordModerator(data: $data){
            id
            createdAt
            email
            block
            delete
            restaurantId
            weight
            phone
            restaurant {
                id
                name
                city
            }
        }
    }
`
export const UPDATE_MODERATOR = gql`
    mutation($data: ModeratorUpdateInput!, $where: ModeratorWhereUniqueInput!) {
        updateOneModerator(data: $data, where: $where) {
            id
            createdAt
            email
            block
            delete
            restaurantId
            weight
            phone
            restaurant {
                id
                name
                city
            }
        }
    }
`