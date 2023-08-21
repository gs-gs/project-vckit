import { QRCode } from '@vckit/react-components'
import { Card } from 'antd'

interface CredentialAppleWalletProps {
  hash: string
}
const CredentialAppleWallet: React.FC<CredentialAppleWalletProps> = ({
  hash,
}) => {
  const walletEndpoint = process.env.REACT_APP_WALLET_ENDPOINT
  const appleWalletUrl = `${walletEndpoint}/credentials/${hash}/apple-pass`

  return (
    <Card bordered={false} style={{ textAlign: 'center' }}>
      <div>
        <QRCode value={appleWalletUrl} />
      </div>
      <div>
        <a href={appleWalletUrl} target="_blank" rel="noreferrer">
          Download pass
        </a>
      </div>
    </Card>
  )
}

export default CredentialAppleWallet
