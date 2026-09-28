import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

export const useAdminUsers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [customerForm, setCustomerForm] = useState({
    name: '', phone: '', email: '', city: '', state: '', address: '', isPhoneVerified: true, isProfileComplete: true
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers();
      if (res.data.success) setCustomers(res.data.customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditMode(false);
    setCurrentItem(null);
    setCustomerForm({ name: '', phone: '', email: '', city: '', state: '', address: '', isPhoneVerified: true, isProfileComplete: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditMode(true);
    setCurrentItem(item);
    setCustomerForm({
      name: item.name || '',
      phone: item.phone || '',
      email: item.email || '',
      city: item.city || '',
      state: item.state || '',
      address: item.address || '',
      isPhoneVerified: item.isPhoneVerified ?? true,
      isProfileComplete: item.isProfileComplete ?? true
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const res = await adminApi.deleteCustomer(deleteConfirm.id);
      if (res.data.success) {
        setDeleteConfirm({ isOpen: false, id: null });
        fetchCustomers();
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert(err.response?.data?.message || 'Delete operation failed');
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentItem) {
        await adminApi.updateCustomer(currentItem.id, customerForm);
      } else {
        await adminApi.createCustomer(customerForm);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error('Form submit error:', err);
      alert(err.response?.data?.message || 'Save operation failed');
    }
  };

  return {
    customers, loading, isModalOpen, editMode, currentItem, deleteConfirm, customerForm,
    setCustomerForm, setIsModalOpen, setDeleteConfirm,
    handleOpenCreateModal, handleOpenEditModal, handleDeleteItem, executeDelete, handleSubmitForm
  };
};
