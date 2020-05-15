import type { Client, ClientRegisteredCallback } from './clientTypes';

module.exports = function () {
  const clients = new Map();

  /**
     * Save connected clients in map for accessing later
     * @param {socket} client the client that connected to the server
     */
  function addClient(client: any): void {
    console.log(client.id + ' connected');
    clients.set(client.id, { client });
  }

  /**
     * Remove client from map after they disconnect from server
     * @param {socket} client the client that disconnected from the server
     */
  function removeClient(client: any): void {
    clients.delete(client.id);
  }

  /**
     * Save the unique username to the client
     * @param {socket} client the client to register a username to
     * @param {string} userName the unique username to register to the client
     */
  function registerClientUserName(client: any, userName: string): void {
    const clientId = client.id;
    const address = client.request.connection.remoteAddress;
    clients.set(clientId, {
      clientId: client.id,
      userName,
      address,
    });
  }

  // function emitAllClients() {
  //     io.emit('clients', getAllClients())
  // }

  /**
   * @return {Array<Client>}
   */
  // function getAllClients(): Array<Client> {
  //   const allClients = (
  //     Array
  //         .from(clients.values()))
  //       .map((client) => (
  //         {
  //           clientId: client.client.id,
  //           userName: client.userName,
  //           client,
  //         }
  //       ));
  //   return allClients;
  // }

  // function getRegisteredClients(): Array<Client> {
  //   return (getAllClients()).filter((client) => client.userName);
  // }

  // function emitRegisteredClients() {
  //     io.emit('registered-clients', getRegisteredClients())
  // }

  /**
     * Check that the username is unique among other registered usernames
     * @param {string} userName the username to check uniqueness
     * @return {boolean}
     */
  function isUserNameTaken(userName: string): boolean {
    return (Array.from(clients.values())).some(
      (client) =>
        client.userName === userName);
  }

  const getClientByUserName = (userName: string): Client => {
    const clientList = (Array.from(clients.values()));

    const c = clientList.find((client) => {
      return client.userName === userName;
    });

    return c;
  };

  /**
     * Attempt to register user with chosen username
     * @param {socket} client the client attempting to register their name
     * @param {string} userName the username chosen by client
     * @param {function(err, res)} callback to return data to the client
     * @return {ClientRegisteredCallback}
     */
  function handleRegister(
    client: any,
    userName: string,
    callback: ClientRegisteredCallback): ClientRegisteredCallback {
    if (!userName || userName === '' || userName.length === 0) {
      return callback('Enter a username and try logging in again');
    }

    const clientId = client.id;
    const address = client.request.connection.remoteAddress;
    if (isUserNameTaken(userName)) {
      const byUsername = getClientByUserName(userName);
      if (byUsername) {
        if (byUsername.address === address) {
          registerClientUserName(client, userName);
          return callback(null, { userName, clientId, address });
        }
      }
      return callback('userName already taken');
    }

    registerClientUserName(client, userName);

    return callback(null, { userName, clientId, address });
  }

  /**
     * Handle client disconnecting from server
     * @param {socket} client to be removed
     */
  function handleDisconnect(client: any) {
    removeClient(client);
  }

  // const removeHostedRoom = (clientId: string) => {

  // }

  /**
   * Gets client
   * @param {string} clientId
   * @return {Promise} client
   */
  function getClientById(clientId: string): Promise<Client> {
    return new Promise((resolve) => {
      const client = clients.get(clientId);
      if (client) resolve(client);
    });
  }

  return {
    handleRegister,
    handleDisconnect,
    getClientByUserName,
    addClient,
    getClientById,
  };
};
