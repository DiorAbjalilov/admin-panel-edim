import styled from "styled-components";
import {
  Form,
  Card as AntCard,
  Input,
  Button as AntButton,
  message,
} from "antd";
import { useMutation } from "@apollo/client";
import { Link, useParams } from "react-router-dom";
import { REPASSWORD_MODERATOR } from "../gqls/moderator";
import { REPASSWORD_ADMIN } from "../gqls/admin";

const Card = styled(AntCard)`
  width: 400px;

  @media only screen and (max-width: 420px) {
    width: 95%;
  }
`;

const Button = styled(AntButton)``;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;

  @media only screen and (max-width: 420px) {
    justify-content: flex-start;
    padding-top: 30px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-top: 5px;
`;
const requiredRule = {
  required: true,
  message: "Обязательное поле",
};

const Forgot = () => {
  const { type } = useParams();

  if (type === "admin") {
    return <AdminForgot />;
  }
  if (type === "moderator") {
    return <ModeratorForgot />;
  }
  return null;
};

const AdminForgot = () => {
  const [repasswordAdmin, { loading }] = useMutation(REPASSWORD_ADMIN, {
    onCompleted: () => {
      message.success("Новый пароль отправлен на почту");
    },
    onError: (e) => {
      if (e.message === "not exist") {
        return message.error("Пользователь не зарегистрирован");
      }
      message.error("Что то пошло не так, повторите попытку позже");
    },
  });

  const handleSubmitForm = ({ email }) => {
    repasswordAdmin({
      variables: {
        where: {
          email,
        },
      },
    });
  };

  return (
    <Wrapper>
      <Card title="Востановление пароля Администратора">
        <Form
          onFinish={handleSubmitForm}
          layout="vertical"
          name="repassword-admin"
        >
          <Form.Item
            colon={false}
            label="Эл. почта"
            name="email"
            rules={[requiredRule]}
          >
            <Input placeholder="Введите электронную почту..." />
          </Form.Item>
          <Actions>
            <Button loading={loading} type="primary" htmlType="submit">
              Сбросить
            </Button>
          </Actions>
          <Link to={`/admin/login`}>Войти</Link>
        </Form>
      </Card>
    </Wrapper>
  );
};

const ModeratorForgot = () => {
  const [repasswordModerator, { loading }] = useMutation(REPASSWORD_MODERATOR, {
    onCompleted: () => {
      message.success("Новый пароль отправлен на почту");
    },
    onError: (e) => {
      if (e.message === "not exist") {
        return message.error("Пользователь не зарегистрирован");
      }
      message.error("Что то пошло не так, повторите попытку позже");
    },
  });

  const handleSubmitForm = ({ email }) => {
    repasswordModerator({
      variables: {
        where: { email },
      },
    });
  };

  return (
    <Wrapper>
      <Card title="Востановление пароля Aдминистратора">
        <Form
          onFinish={handleSubmitForm}
          layout="vertical"
          name="repassword-moderator"
        >
          <Form.Item
            colon={false}
            label="Эл. почта"
            name="email"
            rules={[requiredRule]}
          >
            <Input placeholder="Введите электронную почту..." />
          </Form.Item>
          <Actions>
            <Button loading={loading} type="primary" htmlType="submit">
              Сбросить
            </Button>
          </Actions>
          <Link to={`/moderator/login`}>Войти</Link>
        </Form>
      </Card>
    </Wrapper>
  );
};

export default Forgot;
