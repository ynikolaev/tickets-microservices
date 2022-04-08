import Router from 'next/router';
import React, { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

export default function OrderShow({ order, currentUser }) {
  const { doRequest, errors } = useRequest({
    method: 'post',
    url: '/api/payments',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push(`/orders`),
  });
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft <= 0)
    return (
      <div>
        <h1>Purchasing {order.ticket.title}</h1>
        <p>Order Expired</p>
      </div>
    );

  return (
    <div>
      <h1>Purchasing {order.ticket.title}</h1>
      <p>{timeLeft} seconds until order expires</p>
      {errors}
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey='pk_test_51Kjo9NIKPIyhJQhe1QMbLauXydMZVGpyqW2BRaXn2uOkcwANBZJQoOf0CExoKh9CEVTZ6czdan8utSRncsbfg3iU00ZLMJQthh'
        amount={order.ticket.price * 100}
        email={currentUser.email}
        currency={'GBP'}
      />
    </div>
  );
}

OrderShow.getInitialProps = async (context, client) => {
  const { data } = await client.get(`/api/orders/${context.query.orderId}`);
  return { order: data };
};
