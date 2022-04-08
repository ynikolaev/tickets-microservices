import React, { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default function NewTicket() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push('/'),
  });

  const onBlurHandler = () => {
    const value = parseFloat(price);

    if (isNaN(value)) return;

    setPrice(value.toFixed(2));
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    doRequest();
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <h1>New Ticket</h1>
      {errors}
      <div className='form-group mb-3'>
        <label className='form-label'>Title</label>
        <input className='form-control' value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className='form-group mb-3'>
        <label className='form-label'>Price</label>
        <input
          className='form-control'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={onBlurHandler}
        />
      </div>
      <button className='btn btn-primary'>Submit</button>
    </form>
  );
}
