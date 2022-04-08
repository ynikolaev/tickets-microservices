import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    method: 'post',
    url: '/api/users/signin',
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push('/'),
  });

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    await doRequest();
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <h1>Sign In</h1>
      {errors}
      <div className='mb-3'>
        <label className='form-label'>Email address</label>
        <input
          type='email'
          autoComplete='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='form-control'
          id='exampleInputEmail1'
          aria-describedby='emailHelp'
        />
      </div>
      <div className='mb-3'>
        <label className='form-label'>Password</label>
        <input
          type='password'
          autoComplete='current-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='form-control'
          id='exampleInputPassword1'
        />
      </div>

      <button type='submit' className='btn btn-primary'>
        Submit
      </button>
    </form>
  );
}
