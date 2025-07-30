import { useEffect, useState } from 'react';
import { clientsAPI, messagesAPI } from '../../services/api';
import { MessageSquare, Send, User2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Messages = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await clientsAPI.getAll();
      setClients(res.data);
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchMessages = async (clientId) => {
    setLoadingMessages(true);
    try {
      const res = await messagesAPI.getClientMessages(clientId);
      setMessages(res.data);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setMessages([]);
    setNewMessage('');
    fetchMessages(client._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient) return;
    setSending(true);
    try {
      await messagesAPI.sendMessage({
        client: selectedClient._id,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages(selectedClient._id);
      toast.success('Message sent');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[70vh]">
      {/* Clients List */}
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Clients</h2>
        {loadingClients ? (
          <div className="text-center py-8">Loading clients...</div>
        ) : (
          <ul>
            {clients.map((client) => (
              <li
                key={client._id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer mb-1 hover:bg-primary-50 ${selectedClient?._id === client._id ? 'bg-primary-100' : ''}`}
                onClick={() => handleSelectClient(client)}
              >
                <User2 className="h-5 w-5 text-primary-600" />
                <span className="font-medium">{client.fullName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Messages Panel */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
        {selectedClient ? (
          <>
            <div className="mb-2 border-b pb-2">
              <h2 className="text-lg font-semibold">Messages with {selectedClient.fullName}</h2>
              <p className="text-sm text-gray-500">{selectedClient.email}</p>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 max-h-80">
              {loadingMessages ? (
                <div className="text-center py-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No messages yet.</div>
              ) : (
                <ul className="space-y-4">
                  {messages.map((msg) => (
                    <li key={msg._id} className="border-l-4 border-primary-500 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-primary-600" />
                        <span className="font-medium text-gray-900">{msg.sender?.name || 'You'}</span>
                        <span className="text-xs text-gray-500">{format(new Date(msg.sentAt), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      <div className="text-gray-700 text-sm">{msg.content}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Type your message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={sending || !newMessage.trim()}
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="h-10 w-10 mb-2" />
            <p>Select a client to view and send messages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 