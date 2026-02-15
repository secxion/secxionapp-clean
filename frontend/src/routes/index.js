import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Reset from '../Components/Reset';
import SignUp from '../pages/SignUp';
import AdminPanel from '../pages/AdminPanel';
import AllUsers from '../pages/AllUsers';
import AllProducts from '../pages/AllProducts';
import CategoryProduct from '../pages/CategoryProduct';
import ProductDetails from '../Components/ProductDetails';
import SearchProduct from '../pages/SearchProduct';
import Section from '../pages/Section';
import Profile from '../Components/Profile';
import Settings from '../Components/Settings';
import RedirectIfLoggedIn from '../Components/RedirectIfLoggedIn';
import ProtectedRoute from '../Components/ProtectedRoute';
import UserUploadMarket from '../Components/UserUploadMarket';
import UserMarket from '../pages/UserMarket';
import Net from '../Components/Net';
import UsersMarket from '../pages/UsersMarket';
import BlogManagementPage from '../pages/BlogManagement';
import Report from '../pages/Report';
import AdminReports from '../pages/AdminReports';
import Room from '../pages/Room';
import ContactUs from '../pages/ContactUs';
import AdminAnonymousReports from '../pages/AdminAnonymousReports';
import AdminGetAllData from '../pages/AdminGetAllData';
import WalletDashboard from '../pages/WalletDashboard';
import AdminRPR from '../pages/AdminRPR';
import NotificationsPage from '../pages/Notifications';
import ReportDetailsPage from '../pages/ReportDetailsPage';
import ReportCard from '../Components/ReportCard';
import AdminCommunity from '../pages/AdminCommunity';
import Buzz from '../pages/Buzz';
import Terms from '../Components/Terms';
import Aboutus from '../Components/Aboutus';
import Privacy from '../Components/Privacy';
import Profiler from '../Components/Profiler';
import VerifyEmail from '../Components/VerifyEmail';
import NotFound from '../pages/NotFound';
import DataPad from '../pages/DataPad';
import Landing from '../pages/Landing';
import EthWallet from '../pages/EthWallet';
import AdminEthWithdrawals from '../pages/AdminEthWithdrawals';
import AdminLiveScript from '../pages/AdminLiveScript';
import HiRateSlider from '../Components/HiRateSlider';

const publicRoutes = [
  {
    path: 'login',
    element: (
      <RedirectIfLoggedIn>
        <Login />
      </RedirectIfLoggedIn>
    ),
  },
  {
    path: 'sign-up',
    element: (
      <RedirectIfLoggedIn>
        <SignUp />
      </RedirectIfLoggedIn>
    ),
  },
  { path: 'reset', element: <Reset /> },
];

// Public information routes that should be accessible to everyone (logged in or not)
const publicInfoRoutes = [
  {
    path: 'system-blog',
    element: <Net />,
  },
  {
    path: 'contact-us',
    element: <ContactUs />,
  },
  {
    path: 'about-us',
    element: <Aboutus />,
  },
  {
    path: 'terms',
    element: <Terms />,
  },
  {
    path: 'privacy',
    element: <Privacy />,
  },
  {
    path: '/',
    element: (
      <RedirectIfLoggedIn>
        <Landing />
      </RedirectIfLoggedIn>
    ),
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
  { path: 'rateslider', element: <HiRateSlider /> },
];

const protectedRoutes = [
  { path: 'home', element: <Home /> },
  { path: 'section', element: <Section /> },
  { path: 'userMarketUpload', element: <UserUploadMarket /> },
  { path: 'record', element: <UserMarket /> },
  { path: 'product-category', element: <CategoryProduct /> },
  { path: 'product/:id', element: <ProductDetails /> },
  { path: 'search', element: <SearchProduct /> },
  { path: 'myprofile', element: <Profiler /> },
  { path: 'profile', element: <Profile /> },
  { path: 'settings', element: <Settings /> },
  { path: 'report', element: <Report /> },
  { path: 'reports/:reportId', element: <ReportDetailsPage /> },
  { path: 'datapad', element: <DataPad /> },
  { path: 'r', element: <Room /> },
  { path: 'mywallet', element: <WalletDashboard /> },
  { path: 'notifications', element: <NotificationsPage /> },
  { path: 'chat/:reportId', element: <ReportCard /> },
  { path: 'community-feed', element: <Buzz /> },
  { path: 'eth', element: <EthWallet /> },
];

const adminRoutes = [
  { path: 'all-users', element: <AllUsers /> },
  { path: 'users-market', element: <UsersMarket /> },
  { path: 'users-datapad', element: <AdminGetAllData /> },
  { path: 'all-products', element: <AllProducts /> },

  { path: 'system-blog', element: <BlogManagementPage /> },
  { path: 'admin-report', element: <AdminReports /> },
  { path: 'admin-rpr', element: <AdminRPR /> },
  { path: 'anonymous-report', element: <AdminAnonymousReports /> },
  { path: 'community-feeds', element: <AdminCommunity /> },
  { path: 'eth-requests', element: <AdminEthWithdrawals /> },
  { path: 'livescript', element: <AdminLiveScript /> },
];

const router = createBrowserRouter([
  {
    path: '',
    element: <App />,
    children: [
      // Auth routes - should redirect logged-in users to home
      ...publicRoutes.map((route) => ({
        path: route.path,
        element: <RedirectIfLoggedIn>{route.element}</RedirectIfLoggedIn>,
      })),
      // Public info routes - accessible to everyone (logged in or not)
      ...publicInfoRoutes.map((route) => ({
        path: route.path,
        element: route.element,
      })),
      // Protected routes
      ...protectedRoutes.map((route) => ({
        path: route.path,
        element: <ProtectedRoute>{route.element}</ProtectedRoute>,
      })),
      {
        path: 'admin-panel',
        element: (
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        ),
        children: adminRoutes.map((route) => ({
          path: route.path,
          element: <ProtectedRoute>{route.element}</ProtectedRoute>,
        })),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
