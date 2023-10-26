import GlobalStyles from './components/GlobalStyles'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import locale from 'antd/es/locale/ru_RU'
import { ConfigProvider } from 'antd'
import { ApolloProvider } from '@apollo/client'
import moment from 'moment'
import 'moment/locale/ru'

import Layout from './pages/Layout'
import Main from './pages/Main'
import Selecter from './pages/Selecter'
import Login from './pages/Login'
import Clients from './pages/clients'
import AddClients from './pages/clients/add'
import Orders from './pages/orders'
import Restuarant from './pages/moderator/restaurant'
import AddRestuarant from './pages/moderator/restaurant/add'
import EditRestuarant from './pages/moderator/restaurant/edit'
import RequestIdRestuarant from './pages/moderator/restaurant/requestId'
import Address from './pages/moderator/address'
import AddAddress from './pages/moderator/address/add'
import EditAddress from './pages/moderator/address/edit'
import Product from './pages/moderator/product'
import AddProduct from './pages/moderator/product/add'
import EditProduct from './pages/moderator/product/edit'
import Stock from './pages/moderator/stock'
import AddStock from './pages/moderator/stock/add'
import EditStock from './pages/moderator/stock/edit'
import ProductCategories from './pages/moderator/category'
import EditProductCategory from './pages/moderator/category/edit'
import Restaurant from './pages/restaurant'
import EditRestaurant from './pages/restaurant/edit'
import AdminRequestIdRestuarant from './pages/restaurant/requestId'
import Policy from './pages/Policy'
import Forgot from './pages/Forgot'
import Terms from './pages/Terms'

import Promocodes from './pages/promocodes'
import EditPromocode from './pages/promocodes/edit'

import apolloClient from './utils/apollo'

moment.locale('ru')

const App = () => {
    return (
        <ApolloProvider client={apolloClient}>
            <ConfigProvider locale={locale}>
                <Router>
                    <Routes>
                        <Route
                            path='/'
                            exact
                            element={
                                <Selecter />
                            }
                        />
                        <Route
                            path="/:type/login"
                            exact
                            element={
                                <Login />
                            }
                        />
                        <Route
                            path="/:type/forgot"
                            exact
                            element={
                                <Forgot />
                            }
                        />
                        <Route
                            path="/:type"
                            exact
                            element={
                                <Layout>
                                    <Main />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/clients"
                            exact
                            element={
                                <Layout>
                                    <Clients />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/clients/add"
                            exact
                            element={
                                <Layout>
                                    <AddClients />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/orders"
                            exact
                            element={
                                <Layout>
                                    <Orders />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/restaurant"
                            exact
                            element={
                                <Layout>
                                    <Restuarant />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/restaurant/add"
                            exact
                            element={
                                <Layout>
                                    <AddRestuarant />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/restaurant/edit"
                            exact
                            element={
                                <Layout>
                                    <EditRestuarant />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/restaurant/request-id"
                            exact
                            element={
                                <Layout>
                                    <RequestIdRestuarant />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/restaurant/request-id/:id"
                            exact
                            element={
                                <Layout>
                                    <AdminRequestIdRestuarant />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/address"
                            exact
                            element={
                                <Layout>
                                    <Address />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/address/add"
                            exact
                            element={
                                <Layout>
                                    <AddAddress />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/address/edit/:id"
                            exact
                            element={
                                <Layout>
                                    <EditAddress />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/product"
                            exact
                            element={
                                <Layout>
                                    <Product />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/product/add"
                            exact
                            element={
                                <Layout>
                                    <AddProduct />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/product/edit/:id"
                            exact
                            element={
                                <Layout>
                                    <EditProduct />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/stock"
                            exact
                            element={
                                <Layout>
                                    <Stock />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/stock/add"
                            exact
                            element={
                                <Layout>
                                    <AddStock />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/stock/edit/:id"
                            exact
                            element={
                                <Layout>
                                    <EditStock />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/restaurant/:id"
                            exact
                            element={
                                <Layout>
                                    <Restaurant />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/restaurant/edit/:id"
                            exact
                            element={
                                <Layout>
                                    <EditRestaurant />
                                </Layout>
                            }
                        />
                        <Route
                            path="/policy"
                            exact
                            element={
                                <Policy />
                            }
                        />
                        <Route
                            path="/terms"
                            exact
                            element={
                                <Terms />
                            }
                        />
                        <Route
                            path="/:type/categories"
                            exact
                            element={
                                <Layout>
                                    <ProductCategories />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/categories/:name"
                            exact
                            element={
                                <Layout>
                                    <EditProductCategory />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/promocodes"
                            exact
                            element={
                                <Layout>
                                    <Promocodes />
                                </Layout>
                            }
                        />
                        <Route
                            path="/:type/promocodes/:id"
                            exact
                            element={
                                <Layout>
                                    <EditPromocode />
                                </Layout>
                            }
                        />
                    </Routes>
                </Router>
                <GlobalStyles />
            </ConfigProvider>
        </ApolloProvider>
    )
}

export default App