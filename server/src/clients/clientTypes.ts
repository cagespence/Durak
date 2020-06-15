export interface Client {
    clientId: string,
    userName: string,
    // address: string
}

export interface ClientRegisteredCallback {
    (err?: string, client?: Client)
}
