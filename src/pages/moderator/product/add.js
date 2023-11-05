import { useMemo, useState } from "react";
import {
  Button,
  Form as AntForm,
  Input,
  message,
  Select,
  Switch,
  Card,
  Space,
} from "antd";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { CloseOutlined } from "@ant-design/icons";

import Top from "../../../components/Top";
import UploadFile from "../../../components/Upload";
import { variables as listVariables } from ".";
import { useUser } from "../../../utils/hooks";
import {
  CREATE_ONE_PRODUCT,
  FIND_MANY_PRODUCT,
  CATEGORIES,
} from "../../../gqls/product";
import { UPDATE_ONE_RESTAURANT } from "../../../gqls/restaurant";

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
`;

const rules = {
  required: {
    required: true,
    message: "Обязательное поле",
  },
};

const AddProduct = () => {
  const { user } = useUser("moderator");
  const [form] = Form.useForm();
  const [type, setType] = useState([
    { title: "", data: [{ name: "", count: 0, price: 0 }] },
    { title: "", data: [{ name: "", count: 0, price: 0 }] },
  ]);
  const [image, setImage] = useState("");
  const variables = useMemo(
    () => ({
      where: {
        restaurantId: {
          equals: user ? user.restaurantId : "",
        },
        delete: { equals: false },
      },
    }),
    [user],
  );

  const { data } = useQuery(CATEGORIES, {
    variables,
    fetchPolicy: "network-only",
  });

  const [updatedRestaurant, { loading: updateLoading }] = useMutation(
    UPDATE_ONE_RESTAURANT,
  );

  const usedCategories = useMemo(
    () => (data ? data.findManyCategoryByProduct : []),
    [data],
  );

  const [create, { loading }] = useMutation(CREATE_ONE_PRODUCT, {
    onCompleted: () => {
      message.success("Товар добавлен");
      form.resetFields();
    },
    onError: (e) => {
      console.error(e);
      message.error("Что то пошло не так, повторите попытку позже");
    },
    update: (client, { data: { createOneProduct } }) => {
      const prevData = client.readQuery({
        query: FIND_MANY_PRODUCT,
        variables: listVariables,
      });
      if (prevData) {
        const { findManyProduct } = prevData;
        client.writeQuery({
          query: FIND_MANY_PRODUCT,
          variables: listVariables,
          data: {
            findManyProduct: [createOneProduct, ...findManyProduct],
          },
        });
      }
    },
  });

  const submit = async ({ ...data }) => {
    const newCategories = [];
    for (let category of data.categories) {
      if (!usedCategories.find((item) => item === category)) {
        newCategories.push(category);
      }
    }
    await updatedRestaurant({
      variables: {
        where: { id: user ? user.restaurantId : "" },
        data: {
          productsCategoriers: [...usedCategories, ...newCategories],
        },
      },
    });
    create({
      variables: {
        data: {
          ...data,
          restaurant: {
            connect: { id: user.restaurantId },
          },
        },
      },
    });
  };

  return (
    <>
      <Top title="Добавление товара" />
      <Form
        form={form}
        onFinish={submit}
        layout="vertical"
        name="add-restaurant"
      >
        <Form.Item name="image" label="Изображение" required rules={[rules]}>
          <UploadFile value={image} onChange={(name) => setImage(name)}>
            Выбрать изображение
          </UploadFile>
        </Form.Item>
        <Form.Item name="name" label="Название" required rules={[rules]}>
          <Input placeholder="Введите название" />
        </Form.Item>
        <Form.Item name="description" label="Описание" required rules={[rules]}>
          <Input.TextArea
            style={{ height: 150 }}
            placeholder="Введите описание"
          />
        </Form.Item>
        <Form.Item name="price" label="Цена" required rules={[rules]}>
          <Input placeholder="Введите стоимость" type="number" />
        </Form.Item>
        <Form.Item name="categories" label="Категории" required rules={[rules]}>
          <Select mode="tags" placeholder="Выбрать категории" allowClear>
            {usedCategories.map((item) => (
              <Select.Option key={item}>{item}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.List name="types">
          {(fields, { add, remove }) => (
            <div
              style={{ display: "flex", rowGap: 16, flexDirection: "column" }}
            >
              {fields.map((field) => (
                <Card
                  size="small"
                  title={`Тип ${field.name + 1}`}
                  key={field.key}
                  extra={
                    <CloseOutlined
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  }
                >
                  <Form.Item label="Имя" name={[field.name, "name"]}>
                    <Input />
                  </Form.Item>

                  {/* Nest Form.List */}
                  <Form.Item label="Список">
                    <Form.List name={[field.name, "list"]}>
                      {(subFields, subOpt) => (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            rowGap: 10,
                          }}
                        >
                          {subFields.map((subField) => (
                            <Space key={subField.key}>
                              <Form.Item
                                noStyle
                                name={[subField.name, "title"]}
                              >
                                <Input placeholder="title" />
                              </Form.Item>
                              <Form.Item
                                noStyle
                                name={[subField.name, "price"]}
                              >
                                <Input placeholder="price" />
                              </Form.Item>
                              <CloseOutlined
                                onClick={() => {
                                  subOpt.remove(subField.name);
                                }}
                              />
                            </Space>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() => subOpt.add()}
                            block
                          >
                            + добавить внутренний тип
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </Form.Item>
                </Card>
              ))}

              <Button type="dashed" onClick={() => add()} block>
                + добавить тип
              </Button>
            </div>
          )}
        </Form.List>
        <Form.Item name="publish" label="Опубликован" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button
          loading={loading || updateLoading}
          type="primary"
          htmlType="submit"
        >
          Добавить
        </Button>
      </Form>
    </>
  );
};

export default AddProduct;
