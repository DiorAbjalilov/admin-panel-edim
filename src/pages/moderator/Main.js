import styled from "styled-components";
import { Input, Form, Button as AntButton, message } from "antd";
import { useMutation } from "@apollo/client";

import Top from "../../components/Top";
import {
  CHANGE_PASSWORD_MODERATOR,
  UPDATE_MODERATOR,
} from "../../gqls/moderator";
import { useUser } from "../../utils/hooks";

const Button = styled(AntButton)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;

  .change-pass-lable {
    font-size: 14px;
    color: gray;
    margin-bottom: 15px;
  }
`;

const requiredRule = {
  required: true,
  message: "Обязательное поле",
};

const Main = () => {
  const [form] = Form.useForm();
  const [phoneForm] = Form.useForm();
  const { user } = useUser("moderator");

  const [change, { loading }] = useMutation(CHANGE_PASSWORD_MODERATOR, {
    onCompleted: () => {
      message.success("Пароль успешно изменён");
      form.resetFields();
    },
    onError: (e) => {
      message.error("Что то пошло не так, повторите попытку позже");
    },
  });

  const [updateModerator, { loading: updateLoaing }] = useMutation(
    UPDATE_MODERATOR,
    {
      onCompleted: () => {
        message.success("Номер успешно изменен");
        phoneForm.resetFields();
      },
      onError: (e) => {
        message.error("Что то пошло не так, повторите попытку позже");
      },
    },
  );

  const handleSubmitForm = ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      message.error("Подтвердите пароль");
    }
    change({
      variables: {
        data: {
          password: password,
          confirmPassword: confirmPassword,
        },
      },
    });
  };

  const handleSubmitPhone = ({ phone }) => {
    updateModerator({
      variables: {
        where: { id: user.id },
        data: { phone: { set: phone } },
      },
    });
  };

  return (
    <>
      <Top title="Главная" helpText="Панель Aдминистратора" />
      <Container>
        <div className="change-pass-lable">Изменение пароля для входа</div>
        <Form
          form={form}
          onFinish={handleSubmitForm}
          layout="vertical"
          name="change_password"
        >
          <Form.Item name="password" rules={[requiredRule]}>
            <Input.Password placeholder="Введите новый пароль" />
          </Form.Item>
          <Form.Item name="confirmPassword" rules={[requiredRule]}>
            <Input.Password placeholder="Введите новый пароль еще раз" />
          </Form.Item>
          <Button disabled={loading} type="primary" htmlType="submit">
            Изменить пароль
          </Button>
        </Form>
        <Form
          form={phoneForm}
          onFinish={handleSubmitPhone}
          layout="vertical"
          name="change_phone"
          style={{ marginTop: 24 }}
          initialValues={{ phone: user ? user.phone : "" }}
        >
          <div className="change-pass-lable">
            Изменение номера телефона для уведомления о заказах
          </div>
          <Form.Item name="phone" rules={[requiredRule]}>
            <Input placeholder="Введите номер телефона" />
          </Form.Item>
          <Button disabled={updateLoaing} type="primary" htmlType="submit">
            Изменить номер
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default Main;
