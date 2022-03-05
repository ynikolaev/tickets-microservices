import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // on the server
    const domain = 'tickets.dev';
    const { host, ...headers } = req.headers;
    // creating a new instance with inharited COOKIES
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: {
        Host: domain,
        ...headers,
      },
    });
  } else {
    // on the browser
    return axios.create({
      baseURL: '/',
    });
  }
};
