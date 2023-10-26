import { useState } from 'react'
import {
    Button,
    Form as AntForm,
    Input,
    message,
    DatePicker,
    Spin,
    Popconfirm,
    Switch
} from 'antd'
import styled from 'styled-components'
import { useNavigate, useParams } from 'react-router'
import { useMutation, useQuery } from '@apollo/client'

import Top from '../../../components/Top'
import UploadFile from '../../../components/Upload'
import { UPDATE_ONE_STOCK, FIND_UNIQUE_STOCK, DELETE_ONE_STOCK, FIND_MANY_STOCK } from '../../../gqls/stock'
import { COLORS } from '../../../utils/const'
import { variables as listVariables } from '.'
import moment from 'moment'

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

    .delte-button {
        background-color: ${COLORS.secondary.red};
        border-color: ${COLORS.secondary.red};
        margin-left: 5px;
    }
`
const LoadingView = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`

const rules = {
    required: {
        required: true,
        message: 'Обязательное поле'
    }
}

const EditStock = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [image, setImage] = useState('')

    const { loading: productLoading } = useQuery(FIND_UNIQUE_STOCK, {
        variables: {
            where: { id }
        },
        onCompleted: ({ findUniqueStock: { endAt, ...stock } }) => {
            form.setFieldsValue({
                ...stock,
                endAt: moment(endAt)
            })
        },
        onError: e => {
            console.error(e)
        }
    })

    const [update, { loading }] = useMutation(UPDATE_ONE_STOCK, {
        onCompleted: () => {
            message.success("Акция обновлена")
            navigate('/moderator/stock')
        },
        onError: e => {
            console.error(e)
            message.error(e.message)
        },
    })

    const [deleteStock, { loading: deleteLoading }] = useMutation(DELETE_ONE_STOCK, {
        onCompleted: () => {
            message.success("Акция удалена")
            navigate('/moderator/stock')
        },
        onError: e => {
            console.error(e)
            message.error('Что то пошло не так, повторите попытку позже')
        },
        // update: (client, { data: { deleteOneStock } }) => {
        //     const prevData = client.readQuery({
        //         query: FIND_MANY_STOCK,
        //         variables: listVariables,
        //     })
        //     if (prevData) {
        //         const { findManyStock } = prevData
        //         const newPoducts = findManyStock.filter(item => item.id !== deleteOneStock.id)
        //         client.writeQuery({
        //             query: FIND_MANY_STOCK,
        //             variables: listVariables,
        //             data: {
        //                 findManyStock: newPoducts
        //             }
        //         })
        //     }
        // }
    })

    const submit = ({ categories, ...data }) => {
        const editData = Object.keys(data).reduce((acc, key) => {
            acc[key] = { set: data[key] }
            return acc
        }, {})
        update({
            variables: {
                where: {
                    id
                },
                data: {
                    ...editData,
                    categories
                }
            }
        })
    }

    if (productLoading) {
        return (
            <LoadingView>
                <Spin />
            </LoadingView>
        )
    }

    return (
        <>
            <Top
                title="Добавление адреса"
            />
            <Form form={form} onFinish={submit} layout="vertical" name="add-restaurant">
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
                <div>
                    <Button
                        loading={loading}
                        type="primary"
                        htmlType="submit"
                    >
                        Сохранить
                    </Button>
                    <Popconfirm
                        title={"Удалить товар?"}
                        onConfirm={() => { deleteStock({ variables: { where: { id } } }) }}
                        okText="Да"
                        cancelText="Нет"
                        disabled={deleteLoading}
                    >
                        <Button
                            loading={loading}
                            type="primary"
                            className="delte-button"
                        >
                            Удалить
                        </Button>
                    </Popconfirm>
                </div>
            </Form>
        </>
    )
}

export default EditStock