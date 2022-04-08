import Router from 'next/router';
import React from 'react';
import useRequest from '../../hooks/use-request';

export default function TicketShow({ ticket }) {
  const { doRequest, errors } = useRequest({
    method: 'post',
    url: '/api/orders',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      {errors}
      <h4>Price: {ticket.price}</h4>
      <button className='btn btn-primary' onClick={() => doRequest()}>
        Purchase
      </button>
    </div>
  );
}

TicketShow.getInitialProps = async (context, client) => {
  const { data } = await client.get(`/api/tickets/${context.query.ticketId}`);
  return { ticket: data };
};
