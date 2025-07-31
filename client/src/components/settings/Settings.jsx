import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { profileAPI } from '../../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  // Safe parsing of user data from localStorage
  const getUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData || userData === 'undefined' || userData === 'null') {
        return null;
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const user = getUserFromStorage();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      console.log('Updating profile with data:', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password ? '[PROVIDED]' : '[EMPTY]'
      });
      
      const response = await profileAPI.updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Profile update response:', response);
      
      // Update localStorage with new user and token
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      setFormData({ ...formData, password: '' });
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Failed to update profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="input-field"
            required
            disabled={saving}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            required
            disabled={saving}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password (leave blank to keep unchanged)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            disabled={saving}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn-danger flex-1"
            onClick={handleLogout}
            disabled={saving}
          >
            Log Out
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 
