import { useState, useMemo } from 'react'
import {
    Input,
    Form as AntForm,
    Select,
    Button as AntButton,
    message,
    Spin,
    Switch
} from 'antd'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import Top from '../../../components/Top'
import UploadFile from '../../../components/Upload'
import { UPDATE_ONE_RESTAURANT, FIND_UNIQUE_RESTAURANT } from '../../../gqls/restaurant'
import { FIND_MANY_PRODUCT } from '../../../gqls/product'
import { useUser } from '../../../utils/hooks'
import { RESTAURANT_CATEGORIES, RESTAURANT_PAYMENT_METHODS } from '../../../utils/const'
import { getSuggest, cityParser } from '../../../utils/dadata'

const Form = styled(AntForm)`
    max-width: 400px;

    .row {
        display: flex;
    }
`

const Button = styled(AntButton)`

`

const LoadingView = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`

const requiredRule = {
    required: true,
    message: 'Обязательное поле'
}

let inputTimeout

const EditRestaurant = () => {
    const [logo, setLogo] = useState('')
    const [image, setImage] = useState('')
    const { user, loading: userLoading } = useUser("moderator")
    const [suggestions, setSuggestions] = useState([])
    const navigate = useNavigate()
    const [form] = Form.useForm()

    const variables = useMemo(() => ({
        where: {
            id: user ? user.restaurantId : ""
        }
    }), [user])

    const checkVariables = useMemo(() => ({
        where: {
            restaurantId: { equals: user ? user.restaurantId : "" },
            publish: { equals: true },
            delete: { equals: false },
        }
    }), [user])

    const [checkProducts, { loading: checkedLoading }] = useLazyQuery(FIND_MANY_PRODUCT, {
        variables: checkVariables,
        onCompleted: ({ findManyProduct }) => {
            if (findManyProduct.length === 0) {
                message.warning("Необходмио добавить хотя бы один товар")
                form.setFieldsValue({
                    publish: false
                })
            }
        },
        onError: () => {
            message.error("Не удалось проверить наличие товаров в ресторане")
            form.setFieldsValue({
                publish: false
            })
        },
        notifyOnNetworkStatusChange: true
    })

    const { loading: findLoading } = useQuery(FIND_UNIQUE_RESTAURANT, {
        variables,
        onCompleted: ({ findUniqueRestaurant: restaurant }) => {
            form.setFieldsValue({
                ...restaurant
            })
        }
    })

    const [update, { loading }] = useMutation(UPDATE_ONE_RESTAURANT, {
        onCompleted: () => {
            message.success("Данные изменены")
            navigate("/moderator/restaurant")
        },
        onError: e => {
            message.error('Что то пошло не так, повторите попытку позже')
        },
        update: (client, { data: { updateOneRestaurant } }) => {
            client.writeQuery({
                query: FIND_UNIQUE_RESTAURANT,
                variables: {
                    where: {
                        id: user.restaurantId
                    }
                },
                data: {
                    findUniqueRestaurant: updateOneRestaurant
                }
            })
        }
    })

    const submit = ({
        minimumOrderAmount,
        categories,
        availablePaymentMethods,
        ...data
    }) => {
        const editData = Object.keys(data).reduce((acc, key) => {
            acc[key] = { set: data[key] }
            return acc
        }, {})
        update({
            variables: {
                where: {
                    id: user.restaurantId
                },
                data: {
                    ...editData,
                    categories,
                    availablePaymentMethods,
                    minimumOrderAmount: { set: parseInt(minimumOrderAmount) },

                }
            }
        })
    }

    const chengePublish = (checked) => {
        if (checked) {
            checkProducts()
            const shopId = form.getFieldValue('paymentId')
            if (!shopId) {
                message.warning("Необходмио добавить идентификатор магазина")
                form.setFieldsValue({
                    publish: false
                })
            }
        }
    }

    const onChnageSearch = (text) => {
        clearTimeout(inputTimeout)
        inputTimeout = setTimeout(() => {
            if (text) {
                getSuggest(text).then(response => response.json()).then(result => {
                    const { suggestions } = result
                    const arr = cityParser(suggestions)
                    if (arr.length > 0) {
                        setSuggestions(arr)
                    }
                }).catch(e => {
                    console.error(e)
                })
            }
            clearTimeout(inputTimeout)
        }, 1300)
    }

    if (findLoading || userLoading) {
        return (
            <LoadingView>
                <Spin />
            </LoadingView>
        )
    }

    return (
        <>
            <Top title="Редактирование ресторана" />
            {
                findLoading || userLoading ? (
                    <LoadingView>
                        <Spin />
                    </LoadingView>
                ) : (
                    <Form form={form} onFinish={submit} layout="vertical" name="edit-restaurant">
                        <Form.Item
                            name="name"
                            label="Название"
                            rules={[requiredRule]}
                        >
                            <Input placeholder="Введите назание ресторана" />
                        </Form.Item>
                        <div className="row">
                            <Form.Item
                                name="logo"
                                label="Логотип"
                                rules={[requiredRule]}
                                style={{ marginRight: 15 }}
                            >
                                <UploadFile
                                    value={logo}
                                    onChange={name => setLogo(name)}
                                >
                                    Выбрать изображение
                                </UploadFile>
                            </Form.Item>
                            <Form.Item
                                name="image"
                                label="Изображение"
                                rules={[requiredRule]}
                            >
                                <UploadFile
                                    value={image}
                                    onChange={name => setImage(name)}
                                >
                                    Выбрать изображение
                                </UploadFile>
                            </Form.Item>
                        </div>
                        <Form.Item
                            name="description"
                            label="Описание"
                            rules={[requiredRule]}
                        >
                            <Input.TextArea style={{ height: 150 }} placeholder="Введите описание" />
                        </Form.Item>
                        <Form.Item
                            name="minimumOrderAmount"
                            label="Минимальная стоимость доставки"
                            rules={[requiredRule]}
                        >
                            <Input placeholder="Введите стоимость в рб." type="number" />
                        </Form.Item>
                        <Form.Item
                            name="deliveryCondition"
                            label="Условия доставки"
                            rules={[requiredRule]}
                        >
                            <Input.TextArea style={{ height: 150 }} placeholder="Введите условия" />
                        </Form.Item>
                        <Form.Item
                            name="legalInformation"
                            label="Юридическая информация"
                            rules={[requiredRule]}
                        >
                            <Input.TextArea style={{ height: 150 }} placeholder="Введите информацию" />
                        </Form.Item>
                        <Form.Item
                            name="paymentId"
                            label="Идентификатор магазина"
                        >
                            <Input disabled placeholder="Введите id" />
                        </Form.Item>
                        <Form.Item
                            name="categories"
                            label="Категории"
                            rules={[requiredRule]}
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="Выберите категории"
                            >
                                {
                                    RESTAURANT_CATEGORIES.map(item => (
                                        <Select.Option
                                            key={item}
                                        >
                                            {item}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="availablePaymentMethods"
                            label="Доступные способы оплаты"
                        >
                            <Select mode="multiple" allowClear placeholder="Выберите способы оплаты">
                                {
                                    Object.keys(RESTAURANT_PAYMENT_METHODS).map((keyName, i) => (
                                        <Select.Option key={keyName}>
                                            {RESTAURANT_PAYMENT_METHODS[keyName]}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="city"
                            label="Населенный пункт или город"
                            rules={[requiredRule]}
                        >
                            <Select
                                showSearch
                                placeholder="Введите город или населенный пункт"
                                onSearch={onChnageSearch}
                                // onChange={onChangeValue}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {
                                    suggestions.map(item => (
                                        <Select.Option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.value}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="publish"
                            label="Опубликован"
                            valuePropName="checked"
                        >
                            <Switch
                                onChange={chengePublish}
                                loading={checkedLoading}
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{ marginRight: 15, marginBottom: 15 }}
                        >
                            Сохранить
                        </Button>
                        <Link to="/moderator/restaurant/request-id">
                            <Button>
                                Запросить индентификатор
                            </Button>
                        </Link>
                    </Form>
                )
            }
        </>
    )
}

export default EditRestaurant