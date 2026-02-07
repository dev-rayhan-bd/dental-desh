import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { UserRoutes } from '../modules/User/user.routes';
import aboutRouter from '../modules/about/about.route';
import privacyPolicyRouter from '../modules/PrivacyPolicy/privacyPolicy.routes';
import termsRouter from '../modules/Terms/terms.route';
import { FaqRoutes } from '../modules/FAQ/faq.routes';
import { ContactRoutes } from '../modules/ContactUs/contact.route';
import { DeliveryQuoteRoutes } from '../modules/deliveryQuote/deliveryQuote.routes';
import { OrderRoutes } from '../modules/Order/order.routes';
import { RiderRoutes } from '../modules/rider/rider.routes';
import { MessageRoutes } from '../modules/Message/message.routes';






const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route:AuthRoutes
  },
  {
    path: '/user',
    route:UserRoutes
  },
  {
    path: '/rider',
    route:RiderRoutes
  },
  {
    path: '/about',
    route:aboutRouter
  },
  {
    path: '/privacy',
    route:privacyPolicyRouter
  },
  {
    path: '/terms',
    route:termsRouter
  },
  {
    path: '/faq',
    route:FaqRoutes
  },
  {
    path: '/contact',
    route:ContactRoutes
  },
{
  path: '/delivery-quote',
  route: DeliveryQuoteRoutes
},
{
  path: '/order',
  route: OrderRoutes
},
{
  path: '/message',
  route: MessageRoutes
}

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
