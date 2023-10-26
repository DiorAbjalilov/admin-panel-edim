import styled from 'styled-components'
import { Form as AntForm, Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'

import { CREATE_MODERATOR } from '../../gqls/moderator'
import Top from '../../components/Top'

const Form = styled(AntForm)`
    max-width: 600px;
`
const rules = {
    required: {
        required: true,
        message: 'Обязательное поле'
    }
}

const AddModerator = () => {
    const navigate = useNavigate()

    const [createNews, { loading }] = useMutation(CREATE_MODERATOR, {
        onCompleted: () => {
            message.success('Клиент успешно добавлена')
            navigate('/admin/clients')
        },
        onError: (e) => {
            console.error(e)
            message.error('Что то пошло не так, повторите попытку позже')
        }
    })

    const handleSubmit = (values) => {
        const data = {
            ...values
        }
        createNews({
            variables: { data }
        })
    }

    return (
        <>
            <Top title="Добавление клиента" />
            <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item name="email" label="Email" rules={[rules.required]}>
                    <Input />
                </Form.Item>
                <Button loading={loading} type="primary" htmlType="submit">
                    Добавить
                </Button>
            </Form>
        </>
    )
}

export default AddModerator
