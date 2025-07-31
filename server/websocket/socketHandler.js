const jwt = require('jsonwebtoken');
const ActivityLog = require('../models/ActivityLog');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.use(this.authenticateSocket.bind(this));
    
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Handle client-specific subscriptions
      socket.on('subscribe_client', (clientId) => {
        socket.join(`client_${clientId}`);
      });
      
      socket.on('unsubscribe_client', (clientId) => {
        socket.leave(`client_${clientId}`);
      });
      
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
      });
    });
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  }

  // Broadcast real-time statistics updates
  broadcastStatsUpdate(stats) {
    this.io.emit('stats_update', {
      type: 'stats_update',
      payload: stats,
      timestamp: new Date()
    });
  }

  // Notify specific user about client updates
  notifyUserClientUpdate(userId, clientId, updateData) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('client_update', {
        type: 'client_update',
        clientId,
        payload: updateData,
        timestamp: new Date()
      });
    }
  }

  // Broadcast to all users subscribed to a client
  broadcastClientUpdate(clientId, updateData) {
    this.io.to(`client_${clientId}`).emit('client_update', {
      type: 'client_update',
      clientId,
      payload: updateData,
      timestamp: new Date()
    });
  }

  // Real-time activity notifications
  broadcastActivity(activity) {
    // Notify users subscribed to this client
    this.io.to(`client_${activity.client}`).emit('new_activity', {
      type: 'new_activity',
      payload: activity,
      timestamp: new Date()
    });
  }

  // Risk score alerts
  broadcastRiskAlert(clientId, riskData) {
    this.io.emit('risk_alert', {
      type: 'risk_alert',
      clientId,
      payload: riskData,
      timestamp: new Date()
    });
  }

  // Payment notifications
  broadcastPaymentUpdate(clientId, paymentData) {
    this.io.to(`client_${clientId}`).emit('payment_update', {
      type: 'payment_update',
      clientId,
      payload: paymentData,
      timestamp: new Date()
    });
  }

  // System-wide notifications
  broadcastSystemNotification(notification) {
    this.io.emit('system_notification', {
      type: 'system_notification',
      payload: notification,
      timestamp: new Date()
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get users subscribed to a client
  getClientSubscribers(clientId) {
    const room = this.io.sockets.adapter.rooms.get(`client_${clientId}`);
    return room ? room.size : 0;
  }
}

module.exports = SocketHandler;