import {
  BalanceResponse,
  PiNetworkInstance,
  TransferRequest,
  User
} from './classes/PiNetworkInstance'

export const PiNetworkClient = new PiNetworkInstance()
export { User, TransferRequest, BalanceResponse }
