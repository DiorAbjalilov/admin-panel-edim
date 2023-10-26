import { useQuery } from '@apollo/client'

import { GET_ADMIN } from '../gqls/admin'
import { GET_MODERATOR } from '../gqls/moderator'

export const useUser = (type) => {
    const { data, loading, error } = useQuery(type === 'moderator' ? GET_MODERATOR : GET_ADMIN)

    const user = data ? (type === 'moderator' ? data.findMeModerator : data.findMeAdmin) : null

    return {
        loading,
        error,
        user
    }
}