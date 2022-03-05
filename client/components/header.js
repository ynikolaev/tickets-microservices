import Link from 'next/link';

export default function Header({ currentUser }) {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => (
      <li key={label} className='nav-item'>
        <Link href={href}>
          <a className='nav-link link-light'>{label}</a>
        </Link>
      </li>
    ));

  return (
    <nav className='navbar navbar-dark bg-dark'>
      <div className='container-fluid'>
        <Link href='/'>
          <a className='navbar-brand'>Tickets</a>
        </Link>

        <div className='d-flex justify-content-end'>
          <ul style={{ color: 'white' }} className='nav d-flex align-items-center'>
            {links}
          </ul>
        </div>
      </div>
    </nav>
  );
}
