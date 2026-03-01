import { UserList } from '../components/UserList';
import CustomHeader from '../../../shared/components/CustomHeader';
import { SearchBar } from '../../../shared/components/SearchBar';
import { useApp } from '../hooks/useApp';

function UsersPage() {
  const title: string = 'Buscardor de correos'
  const placeholder: string = 'Buscar correo'
  const {filteredUsers,/*loading,error,*/handleSearch} = useApp();
  /*if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>*/

  return (
    <>
      {/* Header */}
      <CustomHeader title={title}/>

      {/* search bar */}
      <SearchBar placeholder={placeholder} onQuery={handleSearch} />
        
      <UserList users={filteredUsers} />
    </>
    );
}

export default UsersPage;
