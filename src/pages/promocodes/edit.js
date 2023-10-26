import Top from '../../components/Top'
import {
    Form as AntForm,
    Input,
    Button,
    message,
    Switch,
    Select,
} from 'antd'
import styled from 'styled-components'
import { useMutation, useQuery } from '@apollo/client'
import { useMemo } from 'react'
import {
    CREATE_ONE_PROMOCODE,
    FIND_UNIQUE_PROMOCODE,
    UPDATE_ONE_PROMOCODE,
    FIND_MANY_PROMOCODE,
} from '../../gqls/promocode'

import {
    FIND_MANY_RESTAURANT,
} from '../../gqls/restaurant'

import { useUser } from '../../utils/hooks'
import { useParams, useNavigate } from 'react-router-dom'
import { variables as listVariables } from '.'

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

    .time-picker {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
    }

    .time-picker-item-margin-right {
        margin-right: 10px;
    }
`

const rules = {
    required: {
        required: true,
        message: 'Обязательное поле'
    }
}

export let variables

const EditPromocode = () => {
    const [form] = Form.useForm()
    const { user: moderator } = useUser('moderator')
    const { user: admin } = useUser()
    const params = useParams()
    const navigate = useNavigate()

    const [create, { loading }] = useMutation(CREATE_ONE_PROMOCODE, {
        onCompleted: () => {
            message.success("Промокод добавлен")
            navigate("/moderator/promocodes")
        },
        onError: e => {
            console.error(e)
            message.error('Что то пошло не так, повторите попытку позже')
        },

        update: async (client, { data: { createOnePromocode } }) => {
            const prevData = await client.readQuery({
                query: FIND_MANY_PROMOCODE,
                variables: listVariables,
            })

            if (prevData) {
                client.writeQuery({
                    query: FIND_MANY_PROMOCODE,
                    variables: listVariables,
                    data: {
                        findManyPromocode: [createOnePromocode, ...prevData.findManyPromocode]
                    }
                })
            }
        }
    })

    const [update, { loading: updateLoading }] = useMutation(UPDATE_ONE_PROMOCODE, {
        onCompleted: () => {
            message.success("Промокод обновлен")
            if (admin && !moderator) navigate("/admin/promocodes")
            if (!admin && moderator) navigate("/moderator/promocodes")
        },
        onError: e => {
            console.error(e)
            message.error('Что то пошло не так, повторите попытку позже')
        },
        update: async (client, { data: { updateOnePromocode } }) => {
            const prevData = await client.readQuery({
                query: FIND_MANY_PROMOCODE,
                variables: listVariables,
            })

            if (prevData) {
                const { findManyPromocode } = prevData

                client.writeQuery({
                    query: FIND_MANY_PROMOCODE,
                    variables: listVariables,
                    data: {
                        findManyPromocode: findManyPromocode.map(item => item.id === updateOnePromocode.id ? updateOnePromocode : item)
                    }
                })
            }
        }
    })
    
    variables = useMemo(() => ({
        where: params.id ? {
            id: params.id,
        } : null,
    }), [params])

    const { data, loading: findLoading } = useQuery(FIND_UNIQUE_PROMOCODE, {
        variables
    })

    const { data: restaurants } = useQuery(FIND_MANY_RESTAURANT, {
        variables: {}
    })

    const promocode = useMemo(() => data ? data.findUniquePromocode : null, [data])

    useMemo(() => {
        if (promocode) {
            form.setFieldsValue({
                code: promocode.code,
                discount: promocode.discount,
                publish: promocode.publish,
                restaurantId: promocode.restaurant ? promocode.restaurant.id : null,
            })
        }
    }, [promocode])

    const submit = (formData) => {
        if (params.id === 'new' && params.id !== null) {
            create({
                variables: {
                    data: {
                        code: formData.code.toUpperCase(),
                        discount: Number(formData.discount),
                        publish: formData.publish,
                        restaurant: params.type === 'moderator' ? {
                            connect: {
                                id: moderator.restaurant.id
                            }
                        } : (formData.restaurantId ? {
                            connect: {
                                id: formData.restaurantId
                            }
                        } : { disconnect: null })
                    }
                }
            })
        } else {
            update({
                variables: {
                    data: {
                        code: { set: formData.code.toUpperCase(), },
                        publish: { set: formData.publish, },
                        discount: { set: Number(formData.discount) },
                        restaurant: !admin && moderator?.restaurant?.id ? {
                            connect: {
                                id: moderator.restaurant.id
                            }
                        } : (formData.restaurantId ? {
                            connect: {
                                id: formData.restaurantId
                            }
                        } : { disconnect: true })
                    },
                    where: {
                        id: params?.id
                    }
                }
            })
        }
    }

    return <>
        <Top title="Добавление промокода" />

        {((params.id !== 'new' && promocode && !findLoading) || (params.id === 'new')) && (
            <Form
                form={form}
                onFinish={submit}
                layout="vertical"
                name="add-promocode"
            >
                <Form.Item
                    name="code"
                    label="Код"
                    required
                    rules={[rules]}
                >
                    <Input
                        placeholder="Введите промокод"
                    />
                </Form.Item>

                <Form.Item
                    name="discount"
                    label="Сумма скидки"
                    required
                    rules={[rules]}
                >
                    <Input
                        placeholder="Введите сумму скидки в рублях без копеек"
                    />
                </Form.Item>

                <Form.Item
                    name="publish"
                    label="Опубликован"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                {(restaurants?.findManyRestaurant?.length > 0 && params.type === 'admin') && (
                    <Form.Item
                        name="restaurantId"
                        label="Ресторан"
                    >
                        <Select
                            placeholder="Выбрать ресторан"
                        >
                            {restaurants?.findManyRestaurant?.map(item => (
                                <Select.Option key={item.id}>
                                    {item.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                >
                    {params.id === 'new' ? 'Добавить' : 'Сохранить'}
                </Button>
            </Form>
        )}

        
    </>
}

export default EditPromocode