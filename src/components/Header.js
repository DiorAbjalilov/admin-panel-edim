import { useMemo } from 'react'
import styled from 'styled-components'
import { Layout, Button } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
// import { useQuery } from '@apollo/client'

// import { FIND_UNIQUE_RESTAURANT } from '../gqls/restaurant'

import { COLORS } from '../utils/const'

const { Header: AntHeader } = Layout

const HeaderContainer = styled(AntHeader)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding-right: 16px;
    padding-left: 0;
    background: #fff;

    .balance {
        font-size: 14px;
        margin-right: 15px;
        color: ${COLORS.primary.black}
    }
`

const Header = ({ user }) => {
    const handleLogout = () => {
        localStorage.clear()
        window.location.href = '/'
    }

    // const variables = useMemo(() => ({
    //     where: {
    //         id: user && user.restaurantId ? user.restaurantId : ""
    //     }
    // }), [user])

    // const { data } = useQuery(FIND_UNIQUE_RESTAURANT, {
    //     variables
    // })

    // const balance = data ? data?.findUniqueRestaurant?.payoff : null

    return (
        <HeaderContainer>
            {/* {balance && <div className="balance">Бонусный баланс: {balance}</div>} */}
            
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                Выйти
            </Button>
        </HeaderContainer>
    )
}

export default Header