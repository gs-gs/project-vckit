import { IAgent } from '@vckit/core-types';
import { Template, constants } from '@walletpass/pass-js';
import { Request, Response } from 'express';

interface RequestWithAgent extends Request {
  agent?: IAgent;
}
/**
 * public
 *
 */
export const getApplePass = async (
  req: RequestWithAgent,
  res: Response,
  args: any
) => {
  try {
    if (!req.agent) {
      throw Error('Agent not available');
    }

    const credential = await req.agent?.execute(
      'dataStoreGetVerifiableCredential',
      { hash: req.params.hash }
    );

    if (!credential) {
      throw Error('Credential not found');
    }

    const encryptedCredentialData = await req.agent?.execute(
      'fetchEncryptedDataByCredentialHash',
      { credentialHash: req.params.hash }
    );

    if (!encryptedCredentialData) {
      throw Error('Encrypted data not found');
    }
    const { encryptedEndpoint, qrCodeVerifyEndpoint } = args;

    const id = encryptedCredentialData.encryptedDataId;
    const uri = `${encryptedEndpoint}/${id}`;
    const decryptedKey = encryptedCredentialData.decryptedKey;
    const payload = { uri, decryptedKey };
    const encodedUrlPayload = encodeURIComponent(JSON.stringify({ payload }));
    const vcQrcodeUrl = `${qrCodeVerifyEndpoint}?q=${encodedUrlPayload}`;

    const pass = await generateApplePass(credential, vcQrcodeUrl);
    res
      .status(200)
      .setHeader(
        'Content-disposition',
        'attachment; filename="student_visa_grant.pkpass"'
      )
      .setHeader('Content-type', constants.PASS_MIME_TYPE)
      .send(await pass.asBuffer());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

async function generateApplePass(vc: any, vcQrcodeUrl: string) {
  const template = await Template.load(
    './packages/wallet/src/apple-wallet/StudentVisaGrant.pass'
  );
  await template.loadCertificate(
    './packages/wallet/src/apple-wallet/com.testvc.passbook.pem',
    '12345678'
  );
  const pass = template.createPass({
    serialNumber: '12354',
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: `${vcQrcodeUrl}`,
        messageEncoding: 'iso-8859-1',
      },
    ],
    generic: {
      primaryFields: [
        {
          key: 'name',
          value: vc.credentialSubject.name,
        },
      ],
      secondaryFields: [
        {
          key: 'degreeSchool',
          value: 'Visa Grant Letter With Conditions.',
        },
      ],
      backFields: [
        {
          key: 'issueDate',
          label: 'Issue Date',
          value: vc.issuanceDate,
          dateStyle: 'PKDateStyleFull',
        },
        {
          key: 'issuerDID',
          label: 'Issuer DID',
          value: vc.issuer.id,
        },
        {
          key: 'subjectDID',
          label: 'Subject DID',
          value: vc.credentialSubject.id,
        },
      ],
    },
  });
  return pass;
}
