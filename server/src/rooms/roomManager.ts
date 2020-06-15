import { Room, RoomCreatedCallback, RoomJoinedCallback, GetRoomsCallback } from './roomTypes';

import { Client } from '../clients/clientTypes';

module.exports = function () {
  const rooms = new Map<string, Room>();
  const roomArray: Room[] = [];

  /**
     * Handle user creating a room
     * 1: automatically add the user to the room
     * 2: make list of rooms available
     * 3: allow user to join one of these rooms and
     *    send messages from within the room to other participants
     * @param {id} client client creating room
     * @param {string} roomId id of room that users can join to
     * @param {function(err, res)} callback to send data back to client
     * @return {void}
     */
  const handleCreateRoom = (
    client: Client,
    roomId: string,
    callback: RoomCreatedCallback
  ): void => {
    return (
      validRoom(client, roomId, callback) ?
        createRoom(client, roomId, callback) :
        callback('error creating room')
    );
  };

  // check if room is valid to create / join
  // any of the values can be undefined if you dont' want to check that field
  const validRoom = (client: Client, roomId: string, callback: RoomCreatedCallback): RoomCreatedCallback | boolean => {
    return (
      isHostingRoom(client) ? callback(`${client.userName} already host of a room`) :
        isInRoom(client) ? callback(`${client.userName} already in a room`) :
          roomExists(roomId) ? callback(`room name taken '${roomId}'`) :
            true
    );
  };

  /**
   * Add valid room to list of rooms
   */

  /**
   * Creates a room and adds client as host and member
   * @param client client creating room
   * @param roomId id of room that should be created
   * @param callback callback to send back room info to caller
   */
  const createRoom = (client: Client, roomId: string, callback: RoomCreatedCallback): void => {
    console.log('✔ room created ' + roomId);
    const newRoom = {
      roomId: roomId,
      roomInfo: {
        host: client,
        clients: [client],
      }
    }
    rooms.set(roomId, newRoom);
    roomArray.push(newRoom)
    callback(null, roomId);
  };

  /**
   * Handle client trying to join a room
   * @param {Client} client client attempting to join
   * @param {string} roomId room client wants to join
   * @param {function(err, res)} callback to return data to clietn
   */
  const handleJoinRoom = async (
    client: Client,
    roomId: string,
    callback: RoomJoinedCallback) => {
    return new Promise((resolve) => {
      if (validRoom(client, undefined, callback)) {
        if (rooms.get(roomId)) {
          joinRoom(client, roomId, callback).then(clients => {
            resolve(clients)
          })
        } else {
          callback('Room doesn\'t exist');
        }
      } else {
        callback('Room is not valid');
      }
    })
  };

  // Add client to room and send back the roomId that they joined
  const joinRoom = async (
    client: Client,
    roomId: string,
    callback: RoomJoinedCallback) => {
    return new Promise((resolve) => {
      addClientToRoom(client, roomId);
      callback(null, roomId);
      resolve(getClientsInRoom(roomId))
    }
    // console.log(`${client.userName} joined ${roomId}`)
  )};

  // add a client to a room
  const addClientToRoom = (client: Client, roomId: string): void => {
    const currentRoom = rooms.get(roomId);
    const host = currentRoom.roomInfo.host;
    const clients = currentRoom.roomInfo.clients;
    const updatedClients = [...clients, client];

    const updatedRoom: Room = {
      roomId,
      roomInfo: {
        host,
        clients: updatedClients,
      },
    };

    rooms.set(roomId, updatedRoom);
    const index = roomArray.findIndex(room => room.roomId === roomId)
    roomArray.splice(index, 1)
    roomArray.push(updatedRoom)
  };

  // remove client from room
  // const leaveRoom = (clientId, roomId, callback) => {
  //     const room = getRoomByid(roomId)
  //     const clientIndex = findClientInRoom(clientId, roomId)
  //     removeClient(room, clientIndex)
  //     callback(null, room.clients.splice(client, 1))
  // }

  // find index of client in a room (assuming they exist)
  // returns index

  // TODO:
  const findClientInRoom = (client: Client, room: Room): number => {
    return room.roomInfo.clients.indexOf(client);
  };

  /**
   * returns a room
   * @param client client to search for
   */
  function findRoomByClient(clientId: string): Room {
    console.log('searching ...')
    
      // const roomList = Array.from(rooms.values());
      const roomList = roomArray
      let found = undefined;

      for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];
        for (let j = 0; j < room.roomInfo.clients.length; j++) {
          const client = room.roomInfo.clients[j];
          if (client.clientId === clientId) {
            // console.log(`found client in ${room.roomId}`)
            found = room;
            // console.log('found1', clientId, found)
            // resolve(found)
          }
        }
      }
  
    console.log('found2', clientId, found)
    return found

      // if (found) {
      //   resolve(found)
      // }
      // else {
      //   reject('not in a room')
      // }
  }

  // check if user doesnt currently host any rooms already
  const isHostingRoom = (client: Client) => {
    const _rooms = Array.from(rooms.values());
    const hosts = _rooms.map((room) => room.roomInfo.host);
    return hosts.some((host) => host.clientId == client.clientId);
  };

  const findHostedRoom = (client: Client): Room => {
    return (Array.from(rooms.values())).find((room) => {
      room.roomInfo.host.clientId === client.clientId;
    });
  };

  // check if user isnt joined in a room already
  const isInRoom = (client: Client): boolean => {
    const roomlist = Array.from(rooms.values());
    if (roomlist.length > 0) {
      const clients = roomlist.map((client) => client.roomInfo.clients)[0];
      return clients.some((attendee) => attendee.clientId === client.clientId);
    }
    return false;
  };

  const removeClientFromRoom = (client: Client, room: Room) => {
    rooms.get(room.roomId)
      .roomInfo
      .clients
      .splice(findClientInRoom(client, room), 1);
  };

  const handleLeaveRoom = (client: Client) => {
    // console.log(`${client.userName} leaving room ...`)
    if (isInRoom(client)) {
      const room = findRoomByClient(client.clientId)
      if (room) {
        removeClientFromRoom(client, room);
      }
    }
  };

  const removeHostedRoom = (client: Client) => {
    const room = findHostedRoom(client);
    if (room) {
      // emit to everyone that the room has closed
      // console.log(`deleting room ${room.roomId}`)
      rooms.delete(room.roomId);
    }
  };

  const getRooms = (callback: GetRoomsCallback) => {
    const roomList = Array.from(rooms.values());
    callback(null, roomList);
  };

  // check if roomId is free
  const roomExists = (roomId: string): boolean => {
    return (Array.from(rooms.keys())).some((id) => id === roomId);
  };

  const getClientsInRoom = (roomId: string) => {
    if (rooms.get(roomId)) {
      const clients = rooms.get(roomId).roomInfo.clients;
      return clients;
    }
    if (!rooms.get(roomId)) {
      return [];
    }
  };

  return {
    handleCreateRoom,
    handleJoinRoom,
    isHostingRoom,
    isInRoom,
    getRooms,
    removeHostedRoom,
    handleLeaveRoom,
    getClientsInRoom,
    findRoomByClient,
    // leaveRoom
  };
};
