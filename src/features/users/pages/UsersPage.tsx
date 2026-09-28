import { UserList } from '../components/UserList';
import { SearchBar } from '../../../shared/components/SearchBar';
import { useApp } from '../hooks/useApp';
import styles from '../../../styles/features/users/pages/UsersPage.module.scss';

function UsersPage() {
  const placeholder: string = 'Buscar correo'
  const {filteredUsers,/*loading,error,*/handleSearch} = useApp();
  /*if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>*/

  return (
    <div className={styles.page}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.subtitle}>Listado de usuarios</p>
      </div>

      {/* search bar */}
      <SearchBar placeholder={placeholder} onQuery={handleSearch} />

      <UserList users={filteredUsers} />
    </div>
    );
}

export default UsersPage;
