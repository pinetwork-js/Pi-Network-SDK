import {
  OPEN_APP_CONVERSATION,
  OPEN_SHARE_DIALOG_ACTION,
  REQUEST_TRANSFER,
  TRANSFER_RESPONSE
} from '../util/constants'
import { generateUUID } from '../util/generateUuid'
import { RequestHandler } from './RequestHandler'

export interface User {
  username: string
  access_token: string
  rewardable: boolean
}

type RequestedUser = Omit<User, 'access_token'>

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

export class PiNetworkInstance {
  api: RequestHandler

  constructor() {
    this.api = new RequestHandler()
  }

  /**
   * Get information about the current User
   * @returns The user if no error occurred
   */
  async Authenticate(): Promise<User> {
    if (!this.api.isReady()) {
      this.api.reportError('authentication', 'API is not ready')

      throw new Error('API is not ready')
    }

    try {
      const partialUser: RequestedUser = await this.api.get('network/me')

      return {
        ...partialUser,
        access_token: this.api.accessToken
      } as User
    } catch (error) {
      this.api.reportError('authentication', '/me failed', error.response?.data)

      throw new Error('Communication error')
    }
  }

  /**
   * Request a transfer to the authenticate user
   * @param amount - The amount of Pi to request
   * @param reason - The reason of the transaction
   * @returns Informations about the requested transfer
   */
  async RequestTransfer(
    amount: number,
    reason: string
  ): Promise<TransferRequest> {
    if (!this.api.isReady()) {
      this.api.reportError('request_transfer', 'API is not ready')

      throw new Error('API is not ready')
    }

    if (amount <= 0) {
      this.api.reportError('request_transfer', 'Amount must be positive')

      throw new Error('Amount must be positive')
    }

    let transferRequest: TransferRequest
    try {
      transferRequest = await this.api.post('network/transfers/request', {
        transfer_request: {
          amount,
          reason,
          direction: 'user_to_app',
          uuid: generateUUID()
        }
      })
    } catch (error) {
      this.api.reportError(
        'request_request_transfer',
        'Transfer request creation failed',
        error.response.data
      )

      throw new Error(error.response.data)
    }

    if (!transferRequest) {
      this.api.reportError(
        'request_transfer',
        'Transfer request creation succeeded but unable to fetch'
      )

      throw new Error('Unable to fetch the transfer request')
    }

    this.api.sendMessageToPiNetwork({
      type: REQUEST_TRANSFER,
      uuid: transferRequest.uuid
    })

    try {
      const response = await this.api.waitForAction({
        type: TRANSFER_RESPONSE,
        uuid: transferRequest.uuid
      })

      return this.api.get(`network/transfers/requests/${response.uuid}`)
    } catch (error) {
      this.api.reportError('request_transfer', 'Waiting for action failed', {
        rejection: error
      })

      throw new Error('Communication error')
    }
  }

  /**
   * Request a reward transfer to the application balance
   * @returns Informations about the requested reward transfer
   */
  async RewardUser(): Promise<TransferRequest> {
    if (!this.api.isReady()) {
      this.api.reportError('reward_user', 'API is not ready')

      throw new Error('API is not ready')
    }

    const uuid = generateUUID()

    try {
      await this.api.post('network/reward', { uuid })

      this.api.sendMessageToPiNetwork({
        type: TRANSFER_RESPONSE,
        uuid
      })
    } catch (error) {
      this.api.reportError('reward_user', 'Reward failed', error.response.data)

      throw new Error('Communication error')
    }

    let reward: TransferRequest
    try {
      reward = await this.api.get(`network/transfers/requests/${uuid}`)

      this.api.sendMessageToPiNetwork({
        type: TRANSFER_RESPONSE,
        uuid
      })
    } catch (error) {
      this.api.reportError(
        'reward_user',
        'Failed to inform Pi Network that the reward went through',
        { rejection: error }
      )

      throw new Error('Unable to fetch the transfer request')
    }

    return reward
  }

  /**
   * Get the amount of Pi in the balance of the application
   * @returns The content of the balance
   */
  Balance(): Promise<BalanceResponse> {
    if (!this.api.isReady()) {
      this.api.reportError('balance', 'API is not ready')

      throw new Error('API is not ready')
    }

    return this.api.get('network/balance')
  }

  async OpenAppConversation(): Promise<void> {
    if (!this.api.isReady()) {
      this.api.reportError('open_app_conversation', 'Open app conversation')

      throw new Error('API is not ready')
    }

    this.api.sendMessageToPiNetwork({
      type: OPEN_APP_CONVERSATION
    })
  }

  async ShareDialog(title: string, message: string): Promise<void> {
    if (!this.api.isReady()) {
      throw new Error('API is not ready')
    }

    this.api.sendMessageToPiNetwork({
      type: OPEN_SHARE_DIALOG_ACTION,
      title,
      sharingMessage: message
    })
  }
}
