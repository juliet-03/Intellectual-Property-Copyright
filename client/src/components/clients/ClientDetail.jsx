import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign,
  MessageSquare,
  Send,
  Calendar
} from 'lucide-react';
import { clientsAPI, messagesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ClientDetail = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      const [clientResponse, messagesResponse] = await Promise.all([
        clientsAPI.getById(id),
        messagesAPI.getClientMessages(id)
      ]);
      
      setClient(clientResponse.data);
      setMessages(messagesResponse.data);
    } catch (error) {
      toast.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await messagesAPI.sendMessage({
        client: id,
        content: newMessage,
      });
      
      setNewMessage('');
      toast.success('Message sent successfully');
      fetchClientData(); // Refresh messages
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/clients"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.fullName}</h1>
            <p className="text-gray-600">Client Details</p>
          </div>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{client.email || 'Not provided'}</p>
                </div>
              </div>

              {client.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{client.phone}</p>
                  </div>
                </div>
              )}

              {client.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium">{client.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Amount Owed</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${client.amountOwed.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(client.status)}`}>
                    {client.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskScoreClass(client.riskScore)}`}>
                    {client.riskScore}
                  </span>
                </div>
              </div>

              {client.lastContacted && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Last Contacted</p>
                    <p className="text-sm font-medium">
                      {format(new Date(client.lastContacted), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {client.notes && client.notes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                <div className="space-y-2">
                  {client.notes.map((note, index) => (
                    <p key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication History</h2>
            
            {/* Send Message */}
            <form onSubmit={handleSendMessage} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input-field flex-1"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </form>

            {/* Messages List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                messages.map((message) => (
                  <div key={message._id} className="border-l-4 border-primary-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(message.sentAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail; 