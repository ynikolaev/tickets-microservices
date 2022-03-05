import { useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default function Signout() {
  const { doRequest } = useRequest({
    method: 'post',
    url: '/api/users/signout',
    body: {},
    onSuccess: () => Router.push('/'),
  });

  useEffect(async () => {
    doRequest();
  }, []);

  return <div>Signing you out...</div>;
}
