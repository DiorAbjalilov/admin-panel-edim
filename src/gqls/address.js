import { gql } from '@apollo/client'

export const CREATE_ONE_ADDRESS = gql`
    mutation($data: AddressCreateInput!){
        createOneAddress(data: $data){
            id
            value
            phones
            startWorkAt
            endWorkAt
            publish
            allTime
        }
    }
`

export const FIND_MANY_ADDRESS = gql`
    query(
        $where: AddressWhereInput
        $orderBy: [AddressOrderByWithRelationInput]
        $cursor: AddressWhereUniqueInput
        $take: Int
        $skip: Int
        $distinct: [AddressScalarFieldEnum]
    ){
        findManyAddress(
            where: $where
            orderBy: $orderBy
            cursor: $cursor
            take: $take
            skip: $skip
            distinct: $distinct
        ){
            id
            value
            phones
            startWorkAt
            endWorkAt
            publish
            allTime
        }
    }
`
export const FIND_MANY_ADDRESS_COUNT = gql`
    query(
        $where: AddressWhereInput
        $orderBy: [AddressOrderByWithRelationInput]
        $cursor: AddressWhereUniqueInput
        $take: Int
        $skip: Int
        $distinct: [AddressScalarFieldEnum]
    ){
        findManyAddressCount(
            where: $where
            orderBy: $orderBy
            cursor: $cursor
            take: $take
            skip: $skip
            distinct: $distinct
        )
    }
`
export const DELETE_ONE_ADDRESS = gql`
    mutation(
        $where: AddressWhereUniqueInput!
    ){
        deleteOneAddress(where: $where){
            id
            value
            phones
            startWorkAt
            endWorkAt
            publish
            allTime
        }
    }
`
export const FIND_UNIQUE_ADDRESS = gql`
	query(
		$where: AddressWhereUniqueInput!
	){
        findUniqueAddress(
			where: $where
		){
            id
            value
            phones
            startWorkAt
            endWorkAt
            publish
            allTime
        }
    }
`
export const UPDATE_ONE_ADDRESS = gql`
    mutation(
		$data: AddressUpdateInput!
		$where: AddressWhereUniqueInput!
	){
		updateOneAddress(
			data: $data
			where: $where
		){
            id
            value
            phones
            startWorkAt
            endWorkAt
            publish
            allTime
		}
	}
`