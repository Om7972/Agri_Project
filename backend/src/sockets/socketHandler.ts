import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '@/config/db';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export const setupSockets = (io: Server) => {
  // Middleware to authenticate socket connections via JWT
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: Token missing.'));
    }

    try {
      const jwtSecret = process.env.JWT_ACCESS_SECRET || 'jwt_access_secret_key_123';
      const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: Role };
      
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    } catch (err) {
      return next(new Error('Authentication error: Token invalid.'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user!.id;
    const userRole = socket.user!.role;

    console.log(`Socket client connected: ${userId} (${userRole})`);

    // Join a private room unique to this user
    socket.join(`user:${userId}`);

    // Join a role-specific room (e.g. role:FARMER)
    socket.join(`role:${userRole}`);

    // Private instant message transmission
    socket.on('send_message', async (data: { receiverId: string; content: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: data.receiverId,
            content: data.content,
          },
          include: {
            sender: {
              select: {
                profile: { select: { fullName: true } },
              },
            },
          },
        });

        // Emit to receiver's private room
        io.to(`user:${data.receiverId}`).emit('new_message', message);
        // Acknowledge back to sender
        socket.emit('message_sent', message);
      } catch (err: any) {
        socket.emit('error', { message: 'Message delivery failed.' });
      }
    });

    // Subscribing to specific live auction updates
    socket.on('join_auction', (data: { auctionId: string }) => {
      socket.join(`auction:${data.auctionId}`);
      console.log(`User ${userId} joined live auction room: ${data.auctionId}`);
    });

    socket.on('leave_auction', (data: { auctionId: string }) => {
      socket.leave(`auction:${data.auctionId}`);
      console.log(`User ${userId} left live auction room: ${data.auctionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${userId}`);
    });
  });
};
