import { useState, useMemo } from 'react'
import {
    Button,
    Form as AntForm,
    Input,
    message,
    Spin,
    Popconfirm,
} from 'antd'
import styled from 'styled-components'
import { useNavigate, useParams } from 'react-router'
import { useMutation, useQuery } from '@apollo/client'

import Top from '../../../components/Top'
import { COLORS } from '../../../utils/const'
import { useUser } from '../../../utils/hooks'

import { CHANGE_CATEGORY_NAME, DELETE_CATEGORY } from '../../../gqls/product'

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

const EditProduct = () => {
    const { type, name: oldName } = useParams()
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const { user } = useUser('moderator')

    const [updateName, { loading }] = useMutation(CHANGE_CATEGORY_NAME, {
        onCompleted: ({ changeCategoryName }) => {
            if (changeCategoryName) {
                message.success("Категория изменена")
                navigate(`/${type}/categories`)
            }
        },
        onError: e => {
            message.error('Что то пошло не так, повторите попытку позже')
        }
    })
    const [deleteCategory, { loading: deleteLoading }] = useMutation(DELETE_CATEGORY, {
        onCompleted: ({ deleteCategory }) => {
            if (deleteCategory) {
                message.success("Категория удалена")
                navigate(`/${type}/categories`)
            }
        },
        onError: e => {
            message.error('Что то пошло не так, повторите попытку позже')
        }
    })

    const submit = ({ name }) => {
        updateName({
            variables: {
                where: {
                    id: user ? user.restaurantId : ""
                },
                data: {
                    newName: name,
                    oldName
                }
            }
        })
    }

    const deleteCat = () => {
        deleteCategory({
            variables: {
                where: {
                    id: user ? user.restaurantId : ""
                },
                data: {
                    name: oldName
                }
            }
        })
    }

    return (
        <>
            <Top
                title="Редактирование товара"
            />
            <Form
                form={form}
                onFinish={submit}
                layout="vertical"
                name="add-restaurant"
                initialValues={{ name: oldName }}
            >
                <Form.Item
                    name="name"
                    label="Название"
                    required
                    rules={[rules]}
                >
                    <Input placeholder="Введите название" />
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
                        onConfirm={deleteCat}
                        okText="Да"
                        cancelText="Нет"
                        disabled={deleteLoading}
                    >
                        <Button
                            loading={deleteLoading}
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

export default EditProduct