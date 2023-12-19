import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { SortBy, type User } from './types.d';
import { UsersList } from './components/UserList';

function App() {

  const [ users, setUsers ] = useState<User[]>( [] );

  const [ showColors, setShowColors ] = useState( false );

  const [ sorting, setSorting ] = useState<SortBy>( SortBy.NONE );

  const [ filterCountry, setFilterCountry ] = useState<string | null>( null );

  //* useRef => para guardar un valor que queremos que se comparta entre renderizados, 
  //* pero que al cambiar no vuelva a renderizar el componente
  const originalUsers = useRef<User[]>( [] );

  const toggleSortByCountry = () => {
    const newSortingValue = sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE;
    setSorting( newSortingValue );
  };

  const handleChangeSort = ( sort: SortBy ) => {
    setSorting( sort );
  };

  const toggleColors = () => {
    setShowColors( prevState => !prevState );
  };

  useEffect( () => {
    fetch( 'https://randomuser.me/api/?results=100' )
      .then( async resp => await resp.json() )
      .then( resp => {
        setUsers( resp.results );
        originalUsers.current = resp.results;
      } ).catch( error => console.log( error ) );
  }, [] );

  //TODO: Filtrar por País y memorizamos
  const filteredUsers = useMemo( () => {
    return typeof filterCountry === 'string' && filterCountry.length > 0
      ? users.filter( user => {
        return user.location.country.toLowerCase().includes( filterCountry.toLowerCase() );
      } ) : users;
  }, [ users, filterCountry ] );

  //TODO: Ordenar y memorizamos 
  const sortedUsers = useMemo( () => {

    if ( sorting === SortBy.NONE ) return filteredUsers;

    if ( sorting === SortBy.NAME ) {
      return [ ...filteredUsers ].sort( ( a, b ) =>
        //* localeCompare => Comparar dos string 
        a.name.first.localeCompare( b.name.first )
      );
    }

    if ( sorting === SortBy.LAST ) {
      return [ ...filteredUsers ].sort( ( a, b ) =>
        //* localeCompare => Comparar dos string 
        a.name.last.localeCompare( b.name.last )
      );
    }

    if ( sorting === SortBy.COUNTRY ) {
      return [ ...filteredUsers ].sort( ( a, b ) =>
        //* localeCompare => Comparar dos string 
        a.location.country.localeCompare( b.location.country )
      );
    }
  }
    , [ filteredUsers, sorting ] );

  //* 1 Forma de realizar
  /*  ? [...users].sort( ( a, b ) => {
    return a.location.country.localeCompare( b.location.country );
  } )
  : users; */

  //* 2 Forma de realizar
  /* ? structuredClone(users).sort( ( a, b ) => {
    return a.location.country.localeCompare( b.location.country );
  } )
  : users; */


  const handleDelete = ( email: string ) => {
    const filterUsers = users.filter( ( user, _ ) => {
      return user.email !== email;
    } );
    setUsers( filterUsers );
  };

  const handleReset = () => {
    setUsers( originalUsers.current );
  };

  return (
    <>
      <div className='App'>
        <h1>Prueba técnica</h1>
        <header>
          <button onClick={ toggleColors }>
            Colorear Files
          </button>
          <button onClick={ toggleSortByCountry }>
            { sorting === SortBy.COUNTRY ? 'No ordernar por país' : 'Ordernar por país' }
          </button>
          <button onClick={ handleReset }>
            Reset
          </button>
          <input placeholder='Filtra por País' onChange={ ( e ) => {
            setFilterCountry( e.target.value );
          } } />
        </header>
        <main>
          <UsersList showColors={ showColors } users={ sortedUsers } deleteUser={ handleDelete } changeSorting={ handleChangeSort } />
        </main>
      </div>
    </>
  );
}

export default App;
