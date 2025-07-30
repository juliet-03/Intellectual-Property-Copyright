import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import { clientsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  amountOwed: '',
  status: 'active',
  riskScore: '',
  notes: '',
};

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await clientsAPI.create({
        ...formData,
        amountOwed: formData.amountOwed === '' ? 0 : parseFloat(formData.amountOwed),
        riskScore: formData.riskScore === '' ? 0 : parseInt(formData.riskScore),
        notes: formData.notes ? formData.notes.split('\n').map(n => n.trim()).filter(Boolean) : [],
      });
      toast.success('Client added successfully');
      setShowAddModal(false);
      setFormData(initialFormData);
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientsAPI.delete(clientId);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const getRiskScoreClass = (score) => {
    if (score >= 70) return 'risk-score-high';
    if (score >= 40) return 'risk-score-medium';
    return 'risk-score-low';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClients = clients.filter(client =>
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your debt recovery clients</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client._id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{client.fullName}</h3>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(client.status)}`}>
                {client.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                ${client.amountOwed.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskScoreClass(client.riskScore)}`}>
                Risk: {client.riskScore}
              </span>
              <div className="flex gap-2">
                <Link
                  to={`/clients/${client._id}`}
                  className="text-primary-600 hover:text-primary-900"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <button className="text-gray-600 hover:text-gray-900">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(client._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No clients found</p>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowAddModal(false)}
              disabled={submitting}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ''}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="input-field"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount Owed</label>
                <input
                  type="number"
                  required
                  value={formData.amountOwed}
                  onChange={e => setFormData({ ...formData, amountOwed: e.target.value })}
                  className="input-field"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                  disabled={submitting}
                >
                  <option value="active">Active</option>
                  <option value="overdue">Overdue</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Risk Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.riskScore}
                  onChange={e => setFormData({ ...formData, riskScore: e.target.value })}
                  className="input-field"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (one per line)</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows="3"
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Client'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients; 