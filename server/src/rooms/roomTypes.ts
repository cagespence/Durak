import {Client} from '../clients/clientTypes';

export interface Room {
    roomId: string,
    roomInfo: RoomInfo
}

export interface RoomInfo {
    host: Client,
    clients: Array<Client>
}

export interface RoomCreatedCallback {
    (error?: string, roomId?: string)
}

export interface RoomJoinedCallback {
    (error?: string, roomId?: string)
}

export interface GetRoomsCallback {
  (error?: string, rooms?: Array<Room>)
}
