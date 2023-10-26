import { useState } from 'react'
import {
    Button,
    DatePicker,
    Form as AntForm,
    Input,
    message,
    Switch
} from 'antd'
import styled from 'styled-components'
import { useMutation } from '@apollo/client'

import Top from '../../../components/Top'
import UploadFile from '../../../components/Upload'
import { variables as listVariables } from '.'
import { useUser } from '../../../utils/hooks'
import { CREATE_ONE_STOCK, FIND_MANY_STOCK } from '../../../gqls/stock'

const Form = styled(AntForm)`
    max-width: 400px;

    .row {
        display: flex;
        justify-content: space-between;
    }

    .dynamic-delete-button {
        position: relative;
        top: 4px;
        color: #999;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.3s;
        width: 20px;
    }

    .phone-input {
        max-width: 370px;
        margin-right: 10px;
    }
`


const rules = {
    required: {
        required: true,
        message: 'Обязательное поле'
    }
}

const AddStock = () => {

    const { user } = useUser("moderator")
    const [form] = Form.useForm()
    const [image, setImage] = useState('')

    const [create, { loading }] = useMutation(CREATE_ONE_STOCK, {
        onCompleted: () => {
            message.success("Акция добавлена")
            form.resetFields()
        },
        onError: e => {
            console.error(e)
            message.error(e.message)
        },
        // update: (client, { data: { createOneProduct } }) => {
        //     const prevData = client.readQuery({
        //         query: FIND_MANY_STOCK,
        //         variables: listVariables
        //     })
        //     if (prevData) {
        //         const { findManyStock } = prevData
        //         client.writeQuery({
        //             query: FIND_MANY_STOCK,
        //             variables: listVariables,
        //             data: {
        //                 findManyStock: [createOneProduct, ...findManyStock]
        //             }
        //         })
        //     }
        // }
    })

    const submit = ({ ...data }) => {
        create({
            variables: {
                data: {
                    ...data,
                    restaurant: {
                        connect: { id: user.restaurantId }
                    }
                }
            }
        })
    }

    return (
        <>
            <Top
                title="Добавление акции"
            />
            <Form form={form} onFinish={submit} layout="vertical" name="add-stock">
                <Form.Item
                    name="image"
                    label="Изображение"
                    required
                    rules={[rules]}
                >
                    <UploadFile
                        value={image}
                        onChange={name => setImage(name)}
                    >
                        Выбрать изображение
                    </UploadFile>
                </Form.Item>
                <Form.Item
                    name="name"
                    label="Название"
                    required
                    rules={[rules]}
                >
                    <Input placeholder="Введите название" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Описание"
                    required
                    rules={[rules]}
                >
                    <Input.TextArea style={{ height: 150 }} placeholder="Введите описание" />
                </Form.Item>
                <Form.Item
                    name="endAt"
                    label="Доступен до"
                    required
                    rules={[rules]}
                >
                    <DatePicker 
                        placeholder="Выберите дату и время"
                        showTime
                    />
                </Form.Item>
                <Form.Item
                    name="publish"
                    label="Опубликован"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                >
                    Добавить
                </Button>
            </Form>
        </>
    )
}

export default AddStock