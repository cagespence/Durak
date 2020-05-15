const ClientManager = require('../clientManager');

const mockClient = {
  id: '1234-1234-abc',
  request: {
    connection: {
      remoteAddress: '123',
    },
  },
};

const mockName = 'Jeffery';

const {
  addClient,
  getClientById,
  handleDisconnect,
  handleRegister,
  getClientByUserName,
} = ClientManager();

describe('Client connection and disconnection', () => {
  test('Handle client connecting', () => {
    addClient(mockClient);

    const response = getClientById(mockClient.id);
    expect(response).toHaveProperty('client');

    const client = response.client;
    expect(client).toHaveProperty('id');
    expect(client).toBe(mockClient);
  });

  test('Handle client disconnecting', () => {
    addClient(mockClient);
    handleDisconnect(mockClient);
    const recievedClient = getClientById(mockClient.id);
    expect(recievedClient).toBe(undefined);
  });
});

describe('Client registration', () => {
  beforeEach(() => {
    addClient(mockClient);
  });

  afterEach(() => {
    handleDisconnect(mockClient);
  });

  test('should properly register client', () => {
    handleRegister(mockClient, mockName, () => { });
    const client = getClientById(mockClient.id);
    expect(client).toHaveProperty('userName');
    expect(client).toHaveProperty('client');
    expect(client.userName).toBe(mockName);
  });

  test('should get client by username', () => {
    handleRegister(mockClient, mockName, () => {});
    const byName = getClientByUserName(mockName);
    expect(byName.userName).toBe(mockName);
  });

  test('should not register empty name', () => {
    handleRegister(mockClient, '', () => {});
    const client = getClientById('');
    expect(client).toBe(undefined);
  });
});
