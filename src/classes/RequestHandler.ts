import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

import { AUTH_ERROR, UNKNOWN_ERROR } from '../util/constants'
import { getDateTime } from '../util/getTime'

interface RequestData {
  accessToken: string
  backendURL: string
  frontendURL: string
}

export interface Message {
  type: string
  title?: string
  sharingMessage?: string
  data?: any
  uuid?: string
}

export class RequestHandler {
  accessToken?: string
  backendURL?: string
  frontendURL?: string
  axiosClient?: AxiosInstance

  constructor() {
    const data = window.location.hash.substring(1).split('=')[1]
    const parsedData: RequestData = JSON.parse(decodeURIComponent(data))

    this.accessToken = parsedData.accessToken
    this.backendURL = parsedData.backendURL
    this.frontendURL = parsedData.frontendURL

    if (this.backendURL) {
      this.axiosClient = axios.create({
        baseURL: this.backendURL,
        timeout: 20000
      })
    }
  }

  /**
   * Whether the handler is ready to use
   * @returns The state of the request handler
   */
  isReady(): boolean {
    return Boolean(
      this.accessToken &&
        this.backendURL &&
        this.frontendURL &&
        this.axiosClient
    )
  }

  /**
   * Handle Axios request error
   * @param error - The error of an Axios request
   */
  handleError(error: AxiosError): void {
    const errorCode = error.response?.status

    this.sendMessageToPiNetwork({
      type: errorCode !== 401 && errorCode !== 403 ? UNKNOWN_ERROR : AUTH_ERROR
    })
  }

  /**
   * Get options for Axios API requests
   * @returns The API request options
   */
  getOptions(): AxiosRequestConfig {
    return {
      headers: this.accessToken
        ? { Authorization: 'Bearer ' + this.accessToken }
        : {}
    }
  }

  /**
   * Perform a GET API request with the Axios client
   * @param url - The URL of the GET request
   * @returns The result of the request if no error occurred
   */
  async get(url: string): Promise<any> {
    if (!this.axiosClient) return

    const options = this.getOptions()
    const response = await this.axiosClient
      .get(url, options)
      .catch((error: AxiosError) => this.handleError(error))

    return response && response.data
  }

  /**
   * Perform a POST API request with the Axios client
   * @param url - The URL of the GET request
   * @param data - The data to post
   * @returns The result of the request if no error occurred
   */
  async post(url: string, data: any): Promise<any> {
    if (!this.axiosClient) return

    const options = this.getOptions()
    const response = await this.axiosClient
      .post(url, data, options)
      .catch((error: AxiosError) => this.handleError(error))

    return response && response.data
  }

  /**
   * Send a message to the Pi Network hosting page
   * @param message - The message to send
   */
  sendMessageToPiNetwork(message: Message): void {
    if (!this.frontendURL) return

    window.parent.postMessage(JSON.stringify(message), this.frontendURL)
  }

  /**
   * Wait for a specific message of the Pi Network hosting page
   * @param awaitedMessage - The awaited message
   * @returns The expected message if received before timeout
   */
  waitForAction(awaitedMessage: Message): Promise<Message> {
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject('timeout')
      }, 60000)

      window.addEventListener('message', event => {
        const data = this.handlePiNetworkMessage(event, awaitedMessage)
        if (!data) return

        window.clearTimeout(timeout)

        resolve(data)
      })
    })
  }

  /**
   * Handle message sent by the Pi Network hosting page
   * @param event - The received message event
   * @param awaitedMessage - The expected message
   * @returns The data of the received message if it match the expected one
   */
  handlePiNetworkMessage(
    event: MessageEvent,
    awaitedMessage: Message
  ): any | void {
    let parsedData: any
    try {
      parsedData = JSON.parse(event.data)
    } catch (e) {
      console.warn('Error while parsing request', event, event.data)

      return
    }

    if (!parsedData) {
      console.warn('Unable to parse action')

      return
    }

    if (parsedData.type === awaitedMessage.type) {
      return parsedData
    }
  }

  /**
   * Report an error to the Pi Network Core Team
   * @param action - The action that was running when the error occurred
   * @param message - A message about the error
   * @param data - Some informations returned by the error
   */
  reportError(action: string, message: string, data?: any): void {
    this.post('network/error', {
      error: {
        time: getDateTime(),
        call: action,
        message,
        data
      }
    })
  }
}
