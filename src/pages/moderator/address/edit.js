import { useState, useMemo } from 'react'
import {
    Button,
    Form as AntForm,
    Input,
    message,
    TimePicker,
    Select,
    Checkbox
} from 'antd'
import { MinusCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useMutation, useQuery } from '@apollo/client'
import { useParams, useNavigate } from 'react-router'
import moment from 'moment'

import Top from '../../../components/Top'
import { variables as listVariables } from '.'
import { UPDATE_ONE_ADDRESS, FIND_MANY_ADDRESS, FIND_UNIQUE_ADDRESS } from '../../../gqls/address'

import { getSuggest } from '../../../utils/dadata'
import { useUser } from '../../../utils/hooks'

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

let inputTimeout

const EditAddress = () => {

    const [form] = Form.useForm()
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useUser('moderator')

    const [suggestions, setSuggestions] = useState([])
    const [point, setPoint] = useState(undefined)
    const [allTime, setAllTime] = useState(false)

    useQuery(FIND_UNIQUE_ADDRESS, {
        variables: {
            where: { id },
        },
        onCompleted: ({ findUniqueAddress: { startWorkAt, endWorkAt, ...address } }) => {
            setAllTime(address.allTime)
            form.setFieldsValue({
                ...address,
                startWorkAt: moment(startWorkAt),
                endWorkAt: moment(endWorkAt)
            })
        }
    })

    const [update, { loading }] = useMutation(UPDATE_ONE_ADDRESS, {
        onCompleted: () => {
            message.success("Адрес обновлён")
            navigate("/moderator/address")
        },
        onError: e => {
            console.error(e)
            message.error('Что то пошло не так, повторите попытку позже')
        },
        update: async (client, { data: { updateOneAddress } }) => {
            const prevData = await client.readQuery({
                query: FIND_MANY_ADDRESS,
                variables: listVariables
            })
            if (prevData) {
                const { findManyAddress } = prevData
                client.writeQuery({
                    query: FIND_MANY_ADDRESS,
                    variables: listVariables,
                    data: {
                        findManyAddress: findManyAddress.map(item => item.id === updateOneAddress.id ? updateOneAddress : item)
                    }
                })
            }
        }
    })

    const city = useMemo(() => {
        if (user.restaurant && user.restaurant.city) {
            let cityArray = user.restaurant.city.split(", ")
            if (cityArray.length > 1) {
                return cityArray[1]
            } else {
                return cityArray[0]
            }
        }
        return ''
    }, [user])

    const onChnageSearch = (text) => {
        clearTimeout(inputTimeout)
        inputTimeout = setTimeout(() => {
            if (text) {
                getSuggest(city + " " + text).then(response => response.json()).then(result => {
                    const { suggestions } = result
                    const arr = []
                    for (let item of suggestions) {
                        const { data } = item
                        let value = city

                        if (data.street_with_type) {
                            value = value + ', ' + data.street_with_type
                            if (data.house) {
                                value = value + ' ' + data.house
                                const newSuggest = {
                                    lat: data.geo_lat,
                                    lng: data.geo_lon,
                                    value
                                }
                                if (!arr.find(exist => exist.value === value)) {
                                    arr.push(newSuggest)
                                }
                            }
                        }
                    }
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

    const onChangeValue = (value) => {
        const exist = suggestions.find(item => item.value === value)
        if (exist) {
            setPoint({
                longitude: exist.lng,
                latitude: exist.lat
            })
        } else {
            setPoint(undefined)
        }
    }

    const submit = ({ startWorkAt, endWorkAt, phones, value, allTime }) => {
        update({
            variables: {
                where: { id },
                data: {
                    value: { set: value },
                    phones,
                    startWorkAt: { set: startWorkAt && endWorkAt ? startWorkAt : null },
                    endWorkAt: { set: startWorkAt && endWorkAt ? endWorkAt : null },
                    geoPoint: point,
                    allTime: { set: allTime }
                }
            }
        })
    }

    return (
        <>
            <Top
                title="Редактирование адреса"
            />
            <Form form={form} onFinish={submit} layout="vertical" name="add-restaurant">
                <Form.Item
                    name="value"
                    label="Адрес"
                    required
                    rules={[rules]}
                >
                    <Select
                        showSearch
                        placeholder="Введите адрес"
                        onSearch={onChnageSearch}
                        onChange={onChangeValue}
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
                <Form.List
                    name="phones"
                    label="Номер телефона"
                    initialValue={[""]}
                    rules={[
                        {
                            validator: async (_, phones) => {
                                if (!phones) {
                                    return Promise.reject(new Error('Введите номер'));
                                }
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map((field, index) => (
                                <Form.Item
                                    key={field.key}
                                    label={index === 0 ? "Номер телефона" : null}
                                    className="row"
                                    required
                                >
                                    <Form.Item
                                        {...field}
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[
                                            {
                                                required: true,
                                                whitespace: true,
                                                message: "Обязательно поле",
                                            },
                                        ]}
                                        noStyle
                                    >
                                        <Input
                                            placeholder="Введите номер телефона"
                                            className={index > 0 ? "phone-input" : ""}
                                            type="tel"
                                        />
                                    </Form.Item>
                                    {
                                        index > 0 && (
                                            <MinusCircleOutlined onClick={() => remove(field.name)} className="dynamic-delete-button" />
                                        )
                                    }
                                </Form.Item>
                            ))}
                            <Button
                                onClick={() => add('')}
                                style={{ marginBottom: 24 }}
                            >
                                Добавить еще номер
                            </Button>
                        </>
                    )}
                </Form.List>
                <div className='time-picker'>
                    <Form.Item
                        name='startWorkAt'
                        label='Время работы'
                        required={!allTime}
                        rules={!allTime ? [rules] : null}
                        className='time-picker-item-margin-right'
                    >
                        <TimePicker disabled={allTime} format={"HH:mm"} />
                    </Form.Item>
                    <Form.Item
                        name='endWorkAt'
                        required={!allTime}
                        rules={!allTime ? [rules] : null}
                    >
                        <TimePicker disabled={allTime} format={"HH:mm"} />
                    </Form.Item>
                </div>
                <Form.Item
                    name="allTime"
                    valuePropName='checked'
                >
                    <Checkbox
                        onChange={(e) => setAllTime(e.target.checked)}
                    >
                        Круглосуточно
                    </Checkbox>
                </Form.Item>
                <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                >
                    Сохранить
                </Button>
            </Form>
        </>
    )
}

export default EditAddress