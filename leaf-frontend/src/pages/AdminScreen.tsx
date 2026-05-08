import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import type { Role, UserListItem } from '../models/Domain'
import RoleDetail from '../components/RoleDetail'
import RoleForm from '../components/RoleForm'
import RoleList from '../components/RoleList'
import UserForm from '../components/UserForm'
import UserList from '../components/UserList'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

function AdminScreen() {
  const [tab, setTab] = useState(0)
  const [roleRefreshKey, setRoleRefreshKey] = useState(0)
  const [userRefreshKey, setUserRefreshKey] = useState(0)

  // Roles tab state
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // Users tab state
  const [editUser, setEditUser] = useState<UserListItem | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)

  function handleRoleSuccess(_role: Role) {
    setEditRole(null)
    setShowRoleForm(false)
    setRoleRefreshKey(k => k + 1)
    setUserRefreshKey(k => k + 1)
  }

  function handleRoleDeleted() {
    setUserRefreshKey(k => k + 1)
    setSelectedRole(null)
  }

  function handleUserSuccess(_user: UserListItem) {
    setEditUser(null)
    setShowUserForm(false)
    setUserRefreshKey(k => k + 1)
  }

  function handleUserEdit(user: UserListItem) {
    setEditUser(user)
    setShowUserForm(true)
  }

  function handleRoleSelect(role: Role) {
    setSelectedRole(prev => prev?.id === role.id ? null : role)
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        <AdminPanelSettingsIcon sx={{marginBottom: "-0.1em"}} /> Usuários e Cargos</Typography>
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Usuários" />
        <Tab label="Cargos" />
      </Tabs>

      {tab === 0 && (
        <Box>
          {showUserForm && <UserForm
            open
            editUser={editUser}
            onSuccess={handleUserSuccess}
            onCancel={() => { setShowUserForm(false); setEditUser(null) }}
          />}
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" onClick={() => { setEditUser(null); setShowUserForm(true) }}>
              Criar Usuário
            </Button>
          </Box>
          <UserList
            refreshKey={userRefreshKey}
            onEdit={handleUserEdit}
            onDeleted={() => setUserRefreshKey(k => k + 1)}
          />
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {(showRoleForm || !!editRole) && <RoleForm
            open
            editRole={editRole}
            onSuccess={handleRoleSuccess}
            onCancel={() => { setEditRole(null); setShowRoleForm(false) }}
          />}
          <Box sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditRole(null); setShowRoleForm(true) }}>
              Criar Cargo
            </Button>
          </Box>
          <RoleList
            refreshKey={roleRefreshKey}
            onEdit={role => { setEditRole(role); setSelectedRole(null) }}
            onDeleted={handleRoleDeleted}
            onSelect={handleRoleSelect}
            selectedRoleId={selectedRole?.id}
          />
          {selectedRole && (
            <Box sx={{ mt: 3 }}>
              <RoleDetail role={selectedRole} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default AdminScreen
