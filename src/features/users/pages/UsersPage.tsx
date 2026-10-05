import { useId } from 'react';
import { FiAlertTriangle, FiPlusCircle, FiSearch, FiUsers } from 'react-icons/fi';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Pagination } from '../../../shared/components/Pagination';
import styles from '../../../styles/features/users/pages/UsersPage.module.scss';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { UserFormDrawer } from '../components/UserFormDrawer';
import { UserStatusDialog } from '../components/UserStatusDialog';
import { UsersTable } from '../components/UsersTable';
import { UsersTableSkeleton } from '../components/UsersTableSkeleton';
import { useUsersMaintainer } from '../hooks/useUsersMaintainer';
import { formatRoleLabel, STATUS_FILTER_OPTIONS, StatusFilter } from '../utils/user-filters';

// Reference: Admisiones "Asesores" (list card with filters, search, table and numbered pagination).
function UsersPage() {
  const m = useUsersMaintainer();
  const searchId = useId();
  const roleFilterId = useId();
  const statusFilterId = useId();
  const firstLoad = m.loading && m.users.length === 0 && !m.error;

  // New users default to the least-privileged role, like the reference's "Solo lectura (viewer)".
  const defaultRoleId = (m.roleOptions.find((r) => r.key === 'viewer') ?? m.roleOptions.find((r) => r.isActive))?.id ?? '';

  let content;
  if (m.error && m.users.length === 0) {
    content = (
      <div className={styles.stateWrap}>
        <EmptyState
          icon={<FiAlertTriangle aria-hidden />}
          title="No se pudieron cargar los usuarios"
          subtitle={m.error}
          action={<Button variant="outline" onClick={m.reload}>Reintentar</Button>}
        />
      </div>
    );
  } else if (firstLoad) {
    content = <UsersTableSkeleton />;
  } else if (m.users.length === 0) {
    content = (
      <div className={styles.stateWrap}>
        {m.hasFilters ? (
          <EmptyState
            icon={<FiSearch aria-hidden />}
            title="No hay usuarios para este filtro"
            subtitle="Prueba con otro nombre o correo, o cambia el rol o el estado."
            action={<Button variant="outline" onClick={m.clearFilters}>Limpiar filtros</Button>}
          />
        ) : (
          <EmptyState
            icon={<FiUsers aria-hidden />}
            title="No users yet"
            subtitle="Crea el primer usuario con «Nuevo usuario»."
          />
        )}
      </div>
    );
  } else {
    content = (
      <div aria-busy={m.loading}>
        <UsersTable
          data={m.users}
          roleOptions={m.roleOptions}
          roleChangePending={m.roleChangePending}
          currentUserId={m.currentUserId}
          onEdit={m.canEdit ? m.openEdit : undefined}
          onToggleStatus={m.canEdit ? m.askStatus : undefined}
          onDelete={m.canDelete ? m.askDelete : undefined}
          onChangeRole={m.canEdit ? m.changeRole : undefined}
        />
        <Pagination
          page={m.meta.page}
          pageSize={m.meta.pageSize}
          total={m.meta.total}
          totalPages={m.meta.totalPages}
          pageSizeOptions={m.pageSizeOptions}
          onPageChange={m.goToPage}
          onPageSizeChange={m.setPageSize}
        />
      </div>
    );
  }

  const editing = m.formTarget?.mode === 'edit' ? m.formTarget.user : undefined;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Crear y administrar los usuarios del panel y sus roles</p>
        </div>
        {m.canCreate && (
          <Button className={styles.primaryAction} icon={<FiPlusCircle aria-hidden />} onClick={m.openCreate}>
            Nuevo usuario
          </Button>
        )}
      </div>

      <section className={styles.card} aria-labelledby="users-card-title">
        <div className={styles.cardHeader}>
          <div className={styles.cardHeading}>
            <span className={styles.cardIcon} aria-hidden><FiUsers /></span>
            <div>
              <h2 id="users-card-title" className={styles.cardTitle}>Listado de usuarios</h2>
              <p className={styles.cardSubtitle}>Administra las cuentas y sus roles</p>
            </div>
          </div>
          <div className={styles.filters}>
            <label htmlFor={roleFilterId} className={styles.srOnly}>Filtrar por rol</label>
            <select id={roleFilterId} className={styles.filterSelect} value={m.roleId} onChange={(event) => m.setRoleId(event.target.value)}>
              <option value="">Todos los roles</option>
              {m.roleOptions.map((role) => (
                <option key={role.id} value={role.id}>{formatRoleLabel(role)}</option>
              ))}
            </select>
            <label htmlFor={statusFilterId} className={styles.srOnly}>Filtrar por estado</label>
            <select
              id={statusFilterId}
              className={styles.filterSelect}
              value={m.status}
              onChange={(event) => m.setStatus(event.target.value as StatusFilter)}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.searchRow}>
          <label htmlFor={searchId} className={styles.srOnly}>Buscar usuario</label>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} aria-hidden />
            <input
              id={searchId}
              type="search"
              className={styles.searchInput}
              placeholder="Buscar usuario por nombre o correo…"
              value={m.searchInput}
              onChange={(event) => m.setSearchInput(event.target.value)}
            />
          </div>
        </div>

        {content}
      </section>

      {m.formTarget && (
        <UserFormDrawer
          // remount per target so the form starts from that user's values
          key={editing?.id ?? 'create'}
          user={editing}
          roleOptions={m.roleOptions}
          defaultRoleId={defaultRoleId}
          canChangeRole={!editing || editing.id !== m.currentUserId}
          saving={m.saving}
          onSave={m.saveUser}
          onClose={m.closeForm}
        />
      )}
      {m.statusTarget && (
        <UserStatusDialog user={m.statusTarget} loading={m.saving} onConfirm={m.confirmStatus} onCancel={m.cancelStatus} />
      )}
      {m.deleteTarget && (
        <DeleteUserDialog user={m.deleteTarget} loading={m.saving} onConfirm={m.confirmDelete} onCancel={m.cancelDelete} />
      )}
    </div>
  );
}

export default UsersPage;
