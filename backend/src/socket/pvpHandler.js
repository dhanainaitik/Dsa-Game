let matchmakingQueue = [];
let activeMatches = new Map();

const setupPvP = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      matchmakingQueue = matchmakingQueue.filter(s => s.id !== socket.id);
      
      // Cleanup active matches
      for (const [roomId, match] of activeMatches.entries()) {
        if (match.p1.id === socket.id || match.p2.id === socket.id) {
          const opponent = match.p1.id === socket.id ? match.p2 : match.p1;
          opponent.emit('pvp:opponent_disconnected');
          activeMatches.delete(roomId);
          break;
        }
      }
    });

    socket.on('pvp:find_match', (data) => {
      console.log(`Player ${socket.id} looking for match...`);
      
      if (matchmakingQueue.length > 0) {
        const opponent = matchmakingQueue.shift();
        if (opponent && opponent.id !== socket.id) {
          const roomId = `room_${Date.now()}`;
          
          socket.join(roomId);
          opponent.join(roomId);
          
          activeMatches.set(roomId, { p1: socket, p2: opponent });

          io.to(roomId).emit('pvp:match_found', {
            roomId,
            message: 'Match found! Get ready to battle.'
          });
          return;
        }
      }

      matchmakingQueue.push(socket);
      socket.emit('pvp:waiting', { message: 'Waiting for an opponent...' });
    });

    socket.on('pvp:attack', (payload) => {
      socket.to(payload.roomId).emit('pvp:receive_damage', { 
        damage: payload.damage, 
        from: socket.id 
      });
    });

    socket.on('pvp:typing_status', (payload) => {
      socket.to(payload.roomId).emit('pvp:typing_status', { 
        isTyping: payload.isTyping, 
        from: socket.id 
      });
    });
  });
};

module.exports = setupPvP;
