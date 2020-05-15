import socket from '../../socket/socket'

let client;

const getClient = () => {
  if (!client) {
    client = socket();
  }

  return client;
}

export default getClient