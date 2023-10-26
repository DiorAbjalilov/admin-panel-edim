import { gql } from "@apollo/client"

export const FIND_UNIQUE_STOCK = gql`
	query(
		$where: StockWhereUniqueInput!
	){
		findUniqueStock(
			where: $where
		){
			id
			createdAt
			updatedAt
			endAt
			name
			description
			publish
			image
			delete
		}
	}
`
export const FIND_FIRST_STOCK = gql`
	query(
		$where: StockWhereInput
		$orderBy: [StockOrderByWithRelationInput]
		$cursor: StockWhereUniqueInput
		$take: Int
		$skip: Int
		$distinct: [StockScalarFieldEnum]
	){
		findFirstStock(
			where: $where
			orderBy: $orderBy
			cursor: $cursor
			take: $take
			skip: $skip
			distinct: $distinct
		){
			id
			createdAt
			updatedAt
			endAt
			name
			description
			publish
			image
			delete
		}
	}
`
export const FIND_MANY_STOCK = gql`
	query(
		$where: StockWhereInput
		$orderBy: [StockOrderByWithRelationInput]
		$cursor: StockWhereUniqueInput
		$take: Int
		$skip: Int
		$distinct: [StockScalarFieldEnum]
	){
		findManyStock(
			where: $where
			orderBy: $orderBy
			cursor: $cursor
			take: $take
			skip: $skip
			distinct: $distinct
		){
			id
			createdAt
			updatedAt
			endAt
			name
			description
			publish
			image
			delete
		}
	}
`
export const CREATE_ONE_STOCK = gql`
	mutation(
		$data: StockCreateInput!
	){
		createOneStock(
			data: $data
		){
			id
			createdAt
			updatedAt
			endAt
			name
			description
			publish
			image
			delete
		}
	}
`
export const UPDATE_ONE_STOCK = gql`
	mutation(
		$data: StockUpdateInput!
		$where: StockWhereUniqueInput!
	){
		updateOneStock(
			data: $data
			where: $where
		){
			id
			createdAt
			updatedAt
			endAt
			name
			description
			publish
			image
			delete
		}
	}
`
export const DELETE_ONE_STOCK = gql`
	mutation(
		$where: StockWhereUniqueInput!
	){
		deleteOneStock(
			where: $where
		){
			id
			createdAt
			updatedAt
			endAt
			name
			description
			publish
			image
			delete
		}
	}
`
export const UPSERT_ONE_STOCK = gql`
	mutation(
		$where: StockWhereUniqueInput!
		$create: StockCreateInput!
		$update: StockUpdateInput!
	){
		upsertOneStock(
			where: $where
			create: $create
			update: $update
		){
			id
			createdAt
			updatedAt
			endAt
			name
			description
			publish
			image
			delete
		}
	}
`