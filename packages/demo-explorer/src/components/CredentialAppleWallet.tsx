import { QRCode } from '@vckit/react-components'

interface CredentialAppleWalletProps {
  hash: string
}
const CredentialAppleWallet: React.FC<CredentialAppleWalletProps> = ({
  hash,
}) => {
  const walletEndpoint = process.env.REACT_APP_WALLET_ENDPOINT
  const appleWalletUrl = `${walletEndpoint}/credentials/${hash}/apple-pass`

  return <QRCode value={appleWalletUrl} />
}

export default CredentialAppleWallet
