import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// Wrapper
function MyApp({ Component, pageProps, currentUser }) {
  return (
    <div className='container'>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
}

MyApp.getInitialProps = async ({ ctx, ...rest }) => {
  const { data } = await buildClient(ctx).get('/api/users/currentuser');

  let pageProps = {};
  if (rest.Component.getInitialProps) {
    const { currentUser } = await rest.Component.getInitialProps(ctx);
    pageProps = { ...pageProps, currentUser: currentUser };
  }

  return {
    pageProps,
    currentUser: data.currentUser,
  };
};

export default MyApp;
