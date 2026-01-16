import { Link, NavLink } from 'react-router';
import useAuth from '@/context/useAuth';

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <div className='navbar bg-base-100'>
      <div className='flex-1'>
        <Link to='/' className='btn btn-ghost text-xl'>
          Travel journal
          <span role='img' aria-labelledby='airplane'>
            🛫
          </span>
          <span role='img' aria-labelledby='heart'>
            ❤️
          </span>
        </Link>
      </div>
      <div className='flex-none'>
        <ul className='menu menu-horizontal px-1'>
          <li>
            <NavLink to='/'>Home</NavLink>
          </li>
          <li>
            <NavLink to='/create'>Create post</NavLink>
          </li>
          {user ? (
            <p>{`Hello ${user.firstName}`}</p>
          ) : (
            <li>
              <NavLink to='/register'>Register</NavLink>
            </li>
          )}
          {user ? (
            <li>
              <button onClick={signOut}>Logout</button>
            </li>
          ) : (
            <li>
              <NavLink to='/login'>Login</NavLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
