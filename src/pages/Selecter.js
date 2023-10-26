import styled from 'styled-components'
import { Button } from 'antd'
import { Link } from 'react-router-dom'

const View = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
`

const Selecter = () => {
    return (
        <View>
            <Link to={`/admin`}>
                <Button style={{ width: 170 }} type="primary" ghost>
                    Администратор
                </Button>
            </Link>
            <Link to={`/moderator`}>
                <Button style={{ marginTop: 12, width: 170 }} type="primary" ghost>
                    Модератор
                </Button>
            </Link>
        </View>
    )
}

export default Selecter
