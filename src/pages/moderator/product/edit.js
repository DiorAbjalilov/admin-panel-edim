import { useState, useMemo } from "react";
import {
  Button,
  Form as AntForm,
  Input,
  message,
  Select,
  Spin,
  Popconfirm,
  Switch,
  Card,
  Space,
} from "antd";
import styled from "styled-components";
import { CloseOutlined } from "@ant-design/icons";

import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@apollo/client";

import Top from "../../../components/Top";
import UploadFile from "../../../components/Upload";
import {
  UPDATE_ONE_PRODUCT,
  FIND_UNIQUE_PRODUCT,
  DELETE_ONE_PRODUCT,
  FIND_MANY_PRODUCT,
  CATEGORIES,
} from "../../../gqls/product";
import { COLORS } from "../../../utils/const";
import { useUser } from "../../../utils/hooks";
import { variables as listVariables } from ".";

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
`;
const LoadingView = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const rules = {
  required: {
    required: true,
    message: "Обязательное поле",
  },
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [image, setImage] = useState("");
  const { user } = useUser("moderator");

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

  const usedCategories = useMemo(
    () => (data ? data.findManyCategoryByProduct : []),
    [data],
  );

  const { loading: productLoading } = useQuery(FIND_UNIQUE_PRODUCT, {
    variables: {
      where: { id },
    },
    onCompleted: ({ findUniqueProduct }) => {
      form.setFieldsValue({ ...findUniqueProduct });
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const [update, { loading }] = useMutation(UPDATE_ONE_PRODUCT, {
    onCompleted: () => {
      message.success("Товар обновлен");
      navigate("/moderator/product");
    },
    onError: (e) => {
      console.error(e);
      message.error("Что то пошло не так, повторите попытку позже");
    },
  });

  const [deleteProduct, { loading: deleteLoading }] = useMutation(
    DELETE_ONE_PRODUCT,
    {
      onCompleted: () => {
        message.success("Товар удален");
        navigate("/moderator/product");
      },
      onError: (e) => {
        console.error(e);
        message.error("Что то пошло не так, повторите попытку позже");
      },
      update: (client, { data: { deleteOneProduct } }) => {
        const prevData = client.readQuery({
          query: FIND_MANY_PRODUCT,
          variables: listVariables,
        });
        if (prevData) {
          const { findManyProduct } = prevData;
          const newPoducts = findManyProduct.filter(
            (item) => item.id !== deleteOneProduct.id,
          );
          client.writeQuery({
            query: FIND_MANY_PRODUCT,
            variables: listVariables,
            data: {
              findManyProduct: newPoducts,
            },
          });
        }
      },
    },
  );

  const submit = ({ categories, ...data }) => {
    const editData = Object.keys(data).reduce((acc, key) => {
      acc[key] = { set: data[key] };
      return acc;
    }, {});
    update({
      variables: {
        where: {
          id,
        },
        data: {
          ...editData,
          categories,
        },
      },
    });
  };

  if (productLoading) {
    return (
      <LoadingView>
        <Spin />
      </LoadingView>
    );
  }

  return (
    <>
      <Top title="Редактирование товара" />
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
          <Select mode="tags" placeholder="Выбрать категории">
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
        <div>
          <Button loading={loading} type="primary" htmlType="submit">
            Сохранить
          </Button>
          <Popconfirm
            title={"Удалить товар?"}
            onConfirm={() => {
              deleteProduct({ variables: { where: { id } } });
            }}
            okText="Да"
            cancelText="Нет"
            disabled={deleteLoading}
          >
            <Button loading={loading} type="primary" className="delte-button">
              Удалить
            </Button>
          </Popconfirm>
        </div>
      </Form>
    </>
  );
};

export default EditProduct;
