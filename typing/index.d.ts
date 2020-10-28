import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

interface Message {
  type: string
  title?: string
  sharingMessage?: string
  data?: any
  uuid?: string
}

declare class RequestHandler {
  accessToken?: string
  backendURL?: string
  frontendURL?: string
  axiosClient?: AxiosInstance

  constructor()

  /**
   * Whether the handler is ready to use
   * @returns The state of the request handler
   */
  isReady(): boolean

  /**
   * Handle Axios request error
   * @param error - The error of an Axios request
   */
  handleError(error: AxiosError): void

  /**
   * Get options for Axios API requests
   * @returns The API request options
   */
  getOptions(): AxiosRequestConfig

  /**
   * Perform a GET API request with the Axios client
   * @param url - The URL of the GET request
   * @returns The result of the request if no error occurred
   */
  get(url: string): Promise<any>

  /**
   * Perform a POST API request with the Axios client
   * @param url - The URL of the GET request
   * @param data - The data to post
   * @returns The result of the request if no error occurred
   */
  post(url: string, data: any): Promise<any>

  /**
   * Send a message to the Pi Network hosting page
   * @param message - The message to send
   */
  sendMessageToPiNetwork(message: Message): void

  /**
   * Wait for a specific message of the Pi Network hosting page
   * @param awaitedMessage - The awaited message
   * @returns The expected message if received before timeout
   */
  waitForAction(awaitedMessage: Message): Promise<Message>

  /**
   * Handle message sent by the Pi Network hosting page
   * @param event - The received message event
   * @param awaitedMessage - The expected message
   * @returns The data of the received message if it match the expected one
   */
  handlePiNetworkMessage(
    event: MessageEvent,
    awaitedMessage: Message
  ): any | void

  /**
   * Report an error to the Pi Network Core Team
   * @param action - The action that was running when the error occurred
   * @param message - A message about the error
   * @param data - Some informations returned by the error
   */
  reportError(action: string, message: string, data?: any): Promise<void>
}

export interface User {
  username: string
  access_token: string
  rewardable: boolean
}

export interface TransferRequest {
  uuid: string
  status: 'succeeded' | 'failed' | 'requested'
  from_username: string
  to_username: string
  reason: string
  amount: number
  created_at: string
  updated_at?: string
}

export interface BalanceResponse {
  balance: number
}

export declare class PiNetworkInstance {
  api: RequestHandler

  constructor()

  /**
   * Get information about the current User
   * @returns The user if no error occurred
   */
  Authenticate(): Promise<User>

  /**
   * Request a transfer to the authenticate user
   * @param amount - The amount of Pi to request
   * @param reason - The reason of the transaction
   * @returns Informations about the requested transfer
   */
  RequestTransfer(amount: number, reason: string): Promise<TransferRequest>

  /**
   * Request a reward transfer to the application balance
   * @returns Informations about the requested reward transfer
   */
  RewardUser(): Promise<TransferRequest>

  /**
   * Get the amount of Pi in the balance of the application
   * @returns The content of the balance
   */
  Balance(): Promise<BalanceResponse>

  OpenAppConversation(): Promise<void>

  ShareDialog(title: string, message: string): Promise<void>
}

export declare const PiNetworkClient: PiNetworkInstance
