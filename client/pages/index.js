import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return <div>{currentUser ? <h1>You are signed in</h1> : <h1>You are NOT signed in</h1>}</div>;
};

LandingPage.getInitialProps = async (context) => {
  const { data } = await buildClient(context).get('/api/users/currentuser');
  return { currentUser: data.currentUser };
};

export default LandingPage;
