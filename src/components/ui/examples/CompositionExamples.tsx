import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { ComposableCard, createCardSlots, createCardSlotProps } from '../base/Card/ComposableCard';
import { ComposableModal, createModalSlots } from '../base/Modal/ComposableModal';
import { ComposableForm, createFormSlots } from '../composite/Form/ComposableForm';
import { ComposableList, createListSlots } from '../composite/List/ComposableList';

/**
 * Comprehensive examples demonstrating advanced composition patterns
 * Shows how to use slots, render props, and type-safe composition
 * Validates Requirements: 3.4, 6.4, 8.4
 */

// ============================================================================
// EXAMPLE DATA TYPES
// ============================================================================

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface UserFormData {
  name: string;
  email: string;
  role: string;
}

// ============================================================================
// CARD COMPOSITION EXAMPLES
// ============================================================================

/**
 * Example 1: Card with slot-based composition
 */
export const CardSlotExample: React.FC = () => {
  const [user] = useState<User>({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Developer',
  });

  const cardSlots = createCardSlots({
    header: ({ data }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="h6">{data.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {data.role}
          </Typography>
        </Box>
      </Box>
    ),
    content: ({ data }) => (
      <Box>
        <Typography variant="body2" gutterBottom>
          Email: {data.email}
        </Typography>
        <Chip label={data.role} size="small" color="primary" />
      </Box>
    ),
    actions: ({ data }) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton size="small" color="primary">
          <EditIcon />
        </IconButton>
        <IconButton size="small" color="error">
          <DeleteIcon />
        </IconButton>
      </Box>
    ),
  });

  return (
    <ComposableCard
      variant="elevated"
      padding="medium"
      data={user}
      slots={cardSlots}
      sx={{ maxWidth: 400 }}
    />
  );
};

/**
 * Example 2: Card with render prop
 */
export const CardRenderPropExample: React.FC = () => {
  const [user] = useState<User>({
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Designer',
  });

  return (
    <ComposableCard
      variant="outlined"
      padding="medium"
      data={user}
      render={({ data }) => (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {data.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{data.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {data.email}
              </Typography>
            </Box>
          </Box>
          <Chip label={data.role} variant="outlined" />
        </Box>
      )}
      sx={{ maxWidth: 400 }}
    />
  );
};

// ============================================================================
// MODAL COMPOSITION EXAMPLES
// ============================================================================

/**
 * Example 3: Modal with slot-based composition
 */
export const ModalSlotExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useState<User>({
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Manager',
  });

  const modalSlots = createModalSlots({
    title: () => 'User Details',
    body: ({ data }) => (
      <Box>
        <Typography variant="body1" gutterBottom>
          <strong>Name:</strong> {data.name}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Email:</strong> {data.email}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Role:</strong> {data.role}
        </Typography>
      </Box>
    ),
    actions: ({ onClose }) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" onClick={onClose}>
          Edit User
        </Button>
      </Box>
    ),
  });

  return (
    <>
      <Button variant="contained" onClick={() => setIsOpen(true)}>
        Open User Modal
      </Button>
      <ComposableModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="medium"
        data={user}
        slots={modalSlots}
      />
    </>
  );
};

// ============================================================================
// FORM COMPOSITION EXAMPLES
// ============================================================================

/**
 * Example 4: Form with slot-based composition
 */
export const FormSlotExample: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'Developer',
  });

  const handleSubmit = async (data: UserFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('User created successfully!');
  };

  const formSlots = createFormSlots({
    fields: ({ data, onChange }) => (
      <Stack spacing={2}>
        <TextField
          label="Name"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Email"
          type="email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Role"
          value={data.role}
          onChange={(e) => onChange('role', e.target.value)}
          fullWidth
          required
        />
      </Stack>
    ),
    actions: ({ onSubmit, onReset, isSubmitting }) => (
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onReset}
          disabled={isSubmitting}
          startIcon={<CancelIcon />}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isSubmitting}
          startIcon={<SaveIcon />}
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </Button>
      </Box>
    ),
  });

  return (
    <ComposableForm
      initialData={formData}
      onSubmit={handleSubmit}
      title="Create New User"
      description="Fill in the details to create a new user account."
      slots={formSlots}
      sx={{ maxWidth: 500 }}
    />
  );
};

// ============================================================================
// LIST COMPOSITION EXAMPLES
// ============================================================================

/**
 * Example 5: List with slot-based composition
 */
export const ListSlotExample: React.FC = () => {
  const [users] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
  ]);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleItemSelect = (user: User, index: number, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, user]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const listSlots = createListSlots({
    header: ({ items, selectedItems }) => (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6">
          Users ({items.length})
        </Typography>
        {selectedItems.length > 0 && (
          <Chip
            label={`${selectedItems.length} selected`}
            color="primary"
            size="small"
          />
        )}
      </Box>
    ),
    items: ({ items, onItemSelect, isItemSelected }) => (
      <>
        {items.map((user, index) => (
          <Box
            key={user.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: isItemSelected(user, index) ? 'action.selected' : 'transparent',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => onItemSelect?.(user, index, !isItemSelected(user, index))}
          >
            <Avatar sx={{ mr: 2 }}>
              {user.name.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Chip label={user.role} size="small" variant="outlined" />
          </Box>
        ))}
      </>
    ),
    footer: ({ selectedItems }) => (
      <Box sx={{ p: 2, bgcolor: 'background.default' }}>
        <Button
          variant="contained"
          disabled={selectedItems.length === 0}
          startIcon={<AddIcon />}
        >
          Add to Team ({selectedItems.length})
        </Button>
      </Box>
    ),
  });

  return (
    <ComposableList
      items={users}
      selectedItems={selectedUsers}
      onItemSelect={handleItemSelect}
      slots={listSlots}
      sx={{ maxWidth: 600, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
    />
  );
};

// ============================================================================
// COMPLEX COMPOSITION EXAMPLE
// ============================================================================

/**
 * Example 6: Complex composition combining multiple patterns
 */
export const ComplexCompositionExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddUser = async (data: UserFormData) => {
    const newUser: User = {
      id: Date.now(),
      ...data,
    };
    setUsers(prev => [...prev, newUser]);
    setIsModalOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Advanced Composition Examples
      </Typography>
      
      <Stack spacing={4}>
        {/* Card Examples */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Card Composition
          </Typography>
          <Stack direction="row" spacing={2}>
            <CardSlotExample />
            <CardRenderPropExample />
          </Stack>
        </Box>

        {/* Modal Example */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Modal Composition
          </Typography>
          <ModalSlotExample />
        </Box>

        {/* Form Example */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Form Composition
          </Typography>
          <FormSlotExample />
        </Box>

        {/* List Example */}
        <Box>
          <Typography variant="h5" gutterBottom>
            List Composition
          </Typography>
          <ListSlotExample />
        </Box>

        {/* Complex Example */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Complex Composition
          </Typography>
          <ComposableCard
            variant="elevated"
            padding="medium"
            slots={{
              header: () => (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">User Management</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Add User
                  </Button>
                </Box>
              ),
              content: () => (
                <ComposableList
                  items={users}
                  renderItem={(user, index) => (
                    <Box
                      key={user.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.role}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                />
              ),
            }}
            sx={{ maxWidth: 600 }}
          />

          <ComposableModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingUser(null);
            }}
            size="medium"
            slots={{
              title: () => editingUser ? 'Edit User' : 'Add New User',
              body: () => (
                <ComposableForm
                  initialData={editingUser || { name: '', email: '', role: 'Developer' }}
                  onSubmit={handleAddUser}
                  slots={{
                    fields: ({ data, onChange }) => (
                      <Stack spacing={2}>
                        <TextField
                          label="Name"
                          value={data.name}
                          onChange={(e) => onChange('name', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Email"
                          value={data.email}
                          onChange={(e) => onChange('email', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Role"
                          value={data.role}
                          onChange={(e) => onChange('role', e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    ),
                  }}
                />
              ),
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default ComplexCompositionExample;