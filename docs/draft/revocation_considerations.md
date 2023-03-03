
# Overview

Revocation is a method for an issuer to cancel a VC once it has been issued.
Revocation of DIDs, which may occur for example when keys are leaked, is a
different matter.

This is a note to explore and make initial choices about what revocation means
with regards to VCs and VCkit and how it should be implemented.

## Revoke the envelope or the payload?

If a VC is revoked, does it mean the claims in it are no longer true? Or does
it mean that the envelope (e.g. the signature) is invalidated? In principle
these two scenarios may have different outcomes, and in some implementations
it may be possible to differentiate these situations.

Given prior discussions, for the purposes of vckit and this note we will treat
these scenarios identically.

## Revoked or Suspended, and reasons

In some cases it might be useful for a verfier to gain further information
than just "revoked" or "not revoked". It also migth make sense to "suspend"
rather than revoke a credential- with the main implication being that a
suspended credential may be re-instated in the future while a revoked one will
stay revoked.

Some implementations allow for extra granularity, such as different kinds of
credential status or reasons for status chainge. However these mechanisms
aren't widely supported, and it's not yet clear if it's important for vckit.
This document focuses simple revocation.

## "Phoning home"

The concern of allowing an issuer to monitor every time one of their
credential's is used, aka "phoning home", drives a significant amount of
choices in the Self Sovereign Identity space. In the context of VC revocation,
this will occur if a verifier queries the issuer on the status of the specific
credential they're verifying, allowing the issuer to monitor when and
potentially where that credential is used. This occurs with certain revocation
mechanisms.

In the trade use case this might be of concern if the times at which a VC is
verified reveals commercially sensitive information to the issuer. Many times this is not an issue, but it needs to be considered.

## Short-lived credentials as an alternative

A possible alternative to revocation for some use cases may be to use short-
lived credentials in combination with the credential refresh mechanism. In
this case, the credential set to expire at the minimum time for which it is
valid. If needing the credential after this date, the holder (or verifier) can
receive a new credential via the credentialRefresh service listed in the
credential. In this case 'revocation' would be equivalent to refusing the
request for a new, un-expired credential.

As the refresh mechanism is a little less widely supported than revocation
within VC implemntations, and in particular may require some sophistication
from the holder, this isn't currently recommended. That my change in the
future.

# Revocation Methods

OpenAttestation has it's own revocation methods, while a number of methods are
developed by the W3C-CCG.

## OpenAttestation's

OpenAttestation's original revocation mechanism relates to "documentStore"
(i.e. blockchain-anchored) docs. This is not relevant for VCkit as this mechanism is not used for issuing.

Instead, OpenAttesation has recently developed an "Online Certificate Status
Protocol" (OCSP) implementation. This represents an additonal service that
must be run.

This OCSP-responder provides an endpoint which verifiers query with the Hash
of the document they're verifying. The response is an object with the
revocation status and a reason code. This is a flexible mechanism, giving
reason codes as well as status. It does however "phone home" to the issuer
that may make it unsuitable for some use cases. It also requires a high
availability service, i.e. a VC using it cannot be verified offline

### Links:

https://github.com/Open-Attestation/adr/blob/master/did-certificate-
revocation.md https://www.openattestation.com/blog/revocation-ocsp-responder/

## Developed by W3C-CCG

The VCDM doesn't specify the status/revocation mechanism to be used, if one is
used. It simply requires it to be specified in an object under
`credentialStatus`. It can also be an array of such objects if many mechanisms
are used (or many lists for different reasons).

The original proposed mechanism was labelled
[CredentialStatusList2017](https://w3c-ccg.github.io/vc-csl2017/). This hasn't
had much uptake, possibly due to the main sticking point of causing "phoning
home" to the issuer about when their credentials are being used.

In it's place, a mechanism preserving privacy via "herd anonyminity" has
become the most widely used. This method is labelled
[RevocationList2020Status](https://w3c-ccg.github.io/vc-status-rl-2020/).

In this method, the status of many credentials is stored in a single
revocation list. This list takes the form of a compressed bitstring which is
wrapped in a VC. This list can be signed by the issuer to make it tamper
resistant.

It is this mechanism that is used by the Silicon Valley Innovation Project
plugfests.

The mechanism has the benefit of protecting potentially sensitive trade data
of holders (assuming implemented correctly). It's also has some robustness
about outages as the lists may be cached.

The "minimum size" of this list is (according to the spec) 16kb, corresponding
to ~130k possible VCs. Due to efficient compression, the size of this list is
apaprently typically <1kB for lists with a small fraction of VCs revoked,
making it quite space efficient.

In practice, the VC list is simply served at an endpoint such as
abf.gov.au/credentials/status/3

The list is updated by replacing that credential with a new one.

Will be superceded by: RevocationList2021Status. https://w3c-ccg.github.io/vc-
status-list-2021/

The main difference with this is to allow a status type/purpose. Currently
this is can be simply revocation or suspsension. Discussions indicate that
arbitrary labels may be possible in the final spec.

# Open source libraries for revocation

The main open source libraries implementing RevocationList2020Status appear to
be those of [Digital Bazaar](https://github.com/digitalbazaar/vc-revocation-
list) and [Transmute](https://www.npmjs.com/package/@transmute/vc-status-
rl-2020).

Transmute's is based on Digital Bazaar's. The libraries are very similar. The
main difference is Transmute's uses Typescript while DB's uses plain
JavaScript. Both have compatible licenses.

Transmute's is perhaps a slightly preferred choice due to the use of
Typescript.

As for OpenAttestation's OCSP, there is a [reference
implementation](https://github.com/Open-Attestation/ocsp-responder), although
the API is fairly straightforward such that a custom implementation could be
plausible too.

# VCkit's implementation

For interoperability reasons, it's clear that VCkit should focus on support for
RevocationList2020Status at present. If revocation is required when
interacting with countries that require OpenAttestation only, vckit will ideally
use OA's OCSP responder unless there are concerns about "phoning home" as
described above

Another possibility for OA docs is to use (and for vckit to support)
RevocationList2020Status for OA docs, but this only really makes sense if it's
expected that vckit will be the verifier (i.e via QR code).

In the next few years it is likely that a new revocation type will become
commonplace, such as RevocationList2021Status. vckit should be designed to make
such an update easy.

## Revocation services

To support these mechanisms, vckit will need to:

  * publish revocation list VCs at a suitable URL
  * run a publicly facing OCSP responder according to the OpenAttestation [spec](https://www.openattestation.com/blog/revocation-ocsp-responder/)

In addition, vckit will need to provide methods for users to revoke documents
via UI and API.

# Summary:

vckit should support RevocationList2020Status for SVIP VCs, on both issuance and
verification sides.

Ideally it will support OA's OCSP for OA documents, but this may not be MVP.

If vckit supports credentialRefresh (not yet discussed), users may consider this
in combination with short-lived credentials as an alternative.

The most

# Appendix: Revocation APIs

According to VC-API, a credential will be revoked by a post to
/credentials/status with a payload like

    
    
    {
        "credentialId": "{{verifiable_credential_id}}",
        "credentialStatus": [
            {
                "type": "RevocationList2020Status",
                "status": "1"
            }
        ]
    }
    

Under OA's scheme however, docs are addressed by documentHash (that is,
proof.targetHash for a V3 doc) Specifically, OA's reference responder uses a
post request like:

    
    
    {
      "documentHash": "0x13e53a698cd616a4df6781d6e61ce851c06ffe27db11b4bbcc7e7b4f76935a53",
      "reasonCode": 3
    }
    

And issues a response like:

    
    
    {
      "revoked": true,
      "documentHash": "0x13e53a698cd616a4df6781d6e61ce851c06ffe27db11b4bbcc7e7b4f76935a53",
      "reasonCode": 3
    }
    

The second of these is the only one seen by outside users. So it may make
sense to re-use the VC-API revocation interface using something like:

    
    
    {
        "credentialId": "{{verifiable_credential_id}}",
        "credentialStatus": [
            {
                "type": "OpenAttestationOCSP",
                "status": "1"
                "reasonCode": 3
            }
        ]
    }
    

, thus allowing an API user to revoke documents in a similar manner (and
referenced by credentialId rather than hash) regardless of the document type.

For responding to status requests however, OA documents still need to be
indexable by hash- which will be the case if we use the OSCP responder.

# Appendix: Code example using Transmute's vc-status-rl-2020 libary

    
    
    //import checkStatus function
    import { checkStatus } from "@transmute/vc-status-rl-2020";
    // Pass into verify:
    const verification = await verifiable.credential.verify({
      credential: verifiableCredential,
      suite,
      checkStatus,
      format: [format],
      documentLoader,
    });
    
    //Create a Verifiable Credential Revocation List Status
    import { ld as vc } from '@transmute/vc.js';
    import { createList, createCredential } from '@transmute/vc-status-rl-2020';
    const id = 'https://example.com/status/2';
    const list = await createList({ length: 100000 });
    const verifiableCredentialStatusList = await vc.issue({
      credential: {
        ...(await createCredential({ id, list })),
        issuer: suite.key.controller,
        issuanceDate: '2021-03-01T01:16:12.860Z',
      },
      suite,
      documentLoader,
    });
    
    //Issue a Verifiable Credential with Revocation Status
    const verifiableCredentialWithRevocationStatus = await vc.issue({
      credential: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/vc-revocation-list-2020/v1',
        ],
        id: 'https://example.com/credenials/123',
        type: ['VerifiableCredential'],
        issuer: 'did:key:z6MkjdvvhidKavKoWwkdf4Sb8JkHTvnFUsGxvbmNMJUBPJs4',
        issuanceDate: '2021-03-01T01:16:12.860Z',
        credentialStatus: {
          id: 'https://example.com/status/2#0',
          type: 'RevocationList2020Status',
          revocationListIndex: '0',
          revocationListCredential: 'https://example.com/status/2',
        },
        credentialSubject: {
          id: 'did:example:123',
        },
      },
      suite,
      documentLoader,
    });
    
    //Revoke a Verifiable Credential with Revocation Status
    import { ld as vc } from '@transmute/vc.js';
    import { decodeList, createCredential } from '@transmute/vc-status-rl-2020';
    
    const list = await decodeList(signedRevocationList2020.credentialSubject);
    list.setRevoked(0, true); // set the status of an exiting credential to revoked.
    const verifiableCredentialStatusList = await vc.issue({
      credential: {
        ...(await createCredential({
          id: signedRevocationList2020.id,
          list,
        })),
        issuer: suite.key.controller,
        issuanceDate: '2021-03-01T01:16:12.860Z',
      },
      suite,
      documentLoader,
    });
    // make sure to publish the updated list at the expected location,
    // for example: https://example.com/status/2
    

