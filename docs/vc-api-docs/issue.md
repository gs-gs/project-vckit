  1. [Cargo and Trade Systems](index.html)
  2. [W3C-VC/DID and Interoperability Analysis and Design](301662287.html)
  3. [DVP - Verifiable Credential API (VC-API)](301662296.html)

#  Cargo and Trade Systems : Issuance API

Created by  Morgan HEDGES, last modified on Feb 23, 2023

# Credential Issuance API Overview

For issuance, VC-KIT offers an API compatible with the W3C-CCG developed VC-
API. This is done both to avoid solved-problems, and to enable the use of
interop tests.

In particular, VC-KIT seeks to follow conventions of the supply chain
traceability group participating in the Silicaon Valley Innovation Program.
This api is known as "traceability-interop". The OpenAPI spec is
[here](https://w3c-ccg.github.io/traceability-interop/openapi/).

Acronymns:

  * VC-API <-> The verifiable credential REST API developed by the CCG [here](https://github.com/w3c-ccg/vc-api):
  * TI <-> traceability-interop, based on VC-API. Developed [here](https://github.com/w3c-ccg/traceability-interop)

## Minimal example request/response

POST to `/credentials/issue`:

    
    
    {
        "credential": {
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],
            "type": [
                "VerifiableCredential"
            ],
            "id" : "{credentialId}"
            "issuer": "{issuer}",
            "issuanceDate": "{issuanceDate}",
            "credentialSubject": {}
        },
        "options": {
            "type": "Ed25519Signature2018" 
        }
    }
    

Example response (success):

    
    
    {
        "verifiableCredential": {
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],
            "type": [
                "VerifiableCredential"
            ],
            "id" : "{credentialId}"
            "issuer": "{issuer}",
            "issuanceDate": "{issuanceDate}",
            "credentialSubject": {},
            "proof": {
                "type": "Ed25519Signature2018",
                "created": "2021-10-30T19:16:30Z",
                "verificationMethod": "did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn#z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn",
                "proofPurpose": "assertionMethod",
                "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..puetBYS3pkYlYzAecBiT-WkigYAlVbslrz9wPFnk9JW4AwjrpJvcsSdZJPhZtNy_myMJUNzC_QaYyw3ni1V0BA"
                type": "Ed25519Signature2018" 
            }
        }
    }
    

## Differences from "plain" VC-API

  * `issuer` field in the credential is required
  * `options.type` is required, and can one of `JsonWebSignature2020`, `Ed25519Signature2018`, or `vc-jwt`
  * currently `id` is required, but that looks to change shortly (as of 17/2/23) with [this PR](https://github.com/w3c-ccg/traceability-interop/pull/519)

## Authorisation

(discussed in the API overview) Some discussion of scopes
https://github.com/w3c-ccg/traceability-interop/issues/457 [relate ddicussion
on VC-API](https://github.com/w3c-ccg/vc-api/issues/301)

## How is the issuer's id/DID specified and checked?

For TI, The issuer is specified in the credential to be issued. It is a
required property (see https://github.com/w3c-ccg/traceability-
interop/pull/194).

The returned credential should have the same issuer as that posted.

422 for unknown issuer, see issue https://github.com/w3c-ccg/traceability-
interop/issues/349

Note however that in the future it may standard to have `issuer` left blank
and filled in by the endpoint: https://github.com/w3c-ccg/vc-api/issues/265

For OpenAttestationV3 docs, there is some ambiguity since the library
primarily uses the `OpenAttestationMetadata.identityProof` field for
determining the "issuer" in the true sense.

## How is the specific signing key chosen?

It is up to the backend to choose an appropriate verificationMethod/signing
key (from those listed in the issuer's DID document), chosen to suit the
parameters given.

Some relevant parameters might be:

  * it's `expirationDate` ( i.e. use a short-lived key for short-lived credentials ).
  * credential `type` : different doc types may have different targets, hence different key requirements: E.g. CoO's may have different signature requirements than others
  * Similar to previous point, OpenAttestation doc recipients will most likely only support secp256k1 keys in the form of a did:ethr.

Related: see this PR on VC-API to [remove the option to specify whcih key
(verificationMethod)](https://github.com/w3c-ccg/vc-api/pull/263) from VC-API

## Supported Options:

An options object is required in TI. At minimum it must include a `type`.

### options.type

The minimum supported types are "Ed25519Signature2018" and
"JsonWebSignature2020" (from traceability-interop. There is also vc-jwt, but
this is not supported by VC-KIT/DVP). This specifies the type of `proof`
object that should be created,

The endpoint is responsible for choosing an apprpriate key/verificationMethod
that matches the issuer (n both cases the same Ed25519 keys may be used (just
the format/encoding of the output is different).

For VC-KIT, an additional type of "OpenAttestationV3" is supported. This will
result in the issuance of an OpenAttestation v3 document via the open-
attestation library. As this format is not yet convergent with DHS/SVIP VCs,
this will accept a different subset of parameters.

In particular:

  * credentialStatus: OpenAttestationOCSPResponder2

  * issuer: did:ethr

  * JsonWebSignature2020 and vc-jwt proof types are supported See the following [issue](https://github.com/w3c-ccg/traceability-interop/issues/454) for discussion. VC-KIT's implementation may use this to choose OpenAttestation document types.

  * Other supported options:

    * credentialStatus: object with string "type" at minimum
    * created: valid XML date string if present, states the 'created' time of the proof

### options.credentialStatus

The type of revocation/credentialStatus to use with the credential. E.g:

    
    
    {
        "credential": {...},
        "options": {
            "type": "Ed25519Signature2018" 
            "credentialStatus":{
                "type": "RevocationList2020Status"
            }
    
        }
    }
    

This will cause the API to add a credentialStatus field to the issued VC, and
to peform the required teps so that this VC can be revoked using this method.

### options.created

This option sets the `created` field on the `proof` of the issued VC, see e.g.
the [Data Integrity spec](https://www.w3.org/community/reports/credentials/CG-
FINAL-data-integrity-20220722/#proof-algorithm). This indicates a statement of
when the VC proof is signed, and if present should be the date/time at which
the signing request is made. If not given in options, the API will add the
date/time automatically.

## Errors summary:

Errors due to missing fields/bad formats result in Bad Request 400 and auth
errors return 401, 403 as expected.

The only other error specified error is when an unknown issuer is specified in
the credential, which should result in an unprocessable request (422).

Request, response, and error schema's are found in the open api spec, and the
conformance postman collection

## Multi vs single tenancy endpoints

A VC-API instance may support a single or several issuers.

In the multi-tenant case, each issuer may be served either:

  * with a single common endpoint:
    * www.example.com/credentials/issue
  * with it's own endpoint, e.g.
    * www.example.com/issuers/issuerABC/credentials/issue
    * www.example.com/issuers/issuerXYZ/credentials/issue

In both cases, the authorisation and specified `issuer` should match. In the
second case the authorisation and 'issuer' specified in the credential needs
also match the endpoint's configuration.

There is a lot of discussion around this in the relevant github repos. See:

  * [multi-format credential issuance](https://github.com/w3c-ccg/vc-api/issues/332)

  * [Issuer API doesn't expose identifiers and supported crypto](https://github.com/w3c-ccg/vc-api/issues/266)

# Handling OpenAttestation v3 docs and "SVIP" docs with a single endpoint

  

There has been considerable discussion both in the W3C-CCG and among DVP
developers about whether multiple credential types should be handled by
multiple or a single endpoint.

In general, the preferred approach seems to be a single endpoint with
parameters to handle both. The most relevant question is how this works to
support both OA and SVIP style docs.

The following example show how this can/should work:

Consider the following `credentialSubject`:

    
    
    {
        "credentialSubject": {
            "id": "did:bob",
            "age": 18
        }
    }
    

An issue request for this might ideally look like the the following:

    
    
    {
        "credential": {
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],
            "type": [
                "VerifiableCredential",
                "ProofOfAgeCredential"
            ],
            "issuer": "did:web:someauthority.com.au",
            "credentialSubject": {
                "id": "did:bob",
                "age": 18
            }
    
        },
        "options": {
            "type": "Ed25519Signature2018"  | "OpenAttestationMerkleProof2018"
            "credentialStatus": "" | "RevocationList2020Stats" | "OpenAttestationOCSP" // These could also be defaults
        }
    }
    

The result of this might be the following:

"SVIP", i.e. options.type = "Ed25519Signature2018" (and
RevocationList2020Status)

    
    
    {
        "@context":{...}
        "type": {"VerifiableCredential", "ProofOfAgeCredential"}
        "issuer": "did:web:someauthority"
        "credentialSubject": {
            "id": "did:person",
            "age": 21
        }
        "credentialStatus": {
            (RevocationList2020Status) object[]
        }
        "proof": {some linked date proof}
    }
    

Or for "OpenAttestationMerkleProof2018", this would ideally result in an OA v3
doc using did:web (noting that did:web is a question mark for
OpenAttestation). This could like like so:

    
    
    {
        "@context":{...},
        "type": {"VerifiableCredential", "ProofOfAgeCredential", "OpenAttestationCredential"}
        "issuer": "did:web:someauthority.com.au"
        "credentialSubject": {
            "id": "did:person",
            "age": 21
        }
        "OpenAttestationMetadata":{
            "proof":{
                "method": "DID",
                "value": "did:web:somauthority.com.au"
                "revocation": {
                    "type": "OCSPResponder"
                    "location": "someauthority.com.au/credential/OAstatus"
                }
            }
            "identityProof": {
                "type": "DID",
                "identifier": "did:web:someauthority.com.au"
            }
        }
        "proof": {OpenAttestationProof}
    }
    

A functionally similar result would be to issue an OpenAttestation doc using
DNS-DID rather than did:web, that would look like the following:

    
    
    {
        "@context":{...}
        "type": {"VerifiableCredential", "ProofOfAgeCredential", "OpenAttestationCredential"}
        "issuer": "dnsdid:someauthority.com.au"
        "credentialSubject": {
            "id": "did:person",
            "age": 21
        }
        "OpenAttestationMetadata":{
            "proof":{
                "method": "DID",
                "value": "did:ethr:0x1235"
                "revocation": {
                    "type": "OCSP_RESPONDER"
                    "location": "someauthority.com.au/credential/status/oa-ocsp"
                }
            }
            "identityProof": {
                "type": "DNS-DID",
                "identifier": "someauthority.com.au"
            }
        }
        "proof": {OpenAttestationMerkleProof2018 proof object}
    }
    

Note that the `issuer` field is actually ignored by OpenAttestation. The
`did:web` prefix was replaced with "dnsdid:" in attempt to aid interpretation
(and maintain the VCDM requirement that `issuer` is a URI). An alternative
could be to use an `issuer` object.

This gives the following logic:

  * if "type" is "Ed25519Signature2018" and `issuer` is prefixed with `did:web` -> issue an SVIP VC
  * if "type" is "OpenAttestationMerkleProof2018" and issuer is prefixed with dnsdid -> issue OA v3 VC
  * If "type" is "OpenAttestationMerkleProof2018" and issuer is prefixed with `did:web` -> (maybe) issue OA v3 with did:web and a secp256k1 key.
  * Any other combination -> Bad Request
  * Similar considerations for requesting a revocation/status type that's incompatible.

# Appendix- Complete /credentials/issue OAS as of Feb 13 2023:

    
    
      /credentials/issue:
        post:
          summary: Create
          operationId: issueCredential
          description: Issue a credential
          tags:
            - Credentials
          security:
            - OAuth2:
                - 'issue:credentials'
          requestBody:
            description: Parameters for issuing the credential.
            content:
              application/json:
                schema:
                  type: object
                  required:
                    - credential
                    - options
                  properties:
                    credential:
                      type: object
                      required:
                        - '@context'
                        - id
                        - type
                        - issuer
                        - issuanceDate
                        - credentialSubject
                      properties:
                        '@context':
                          description: |
                            The JSON-LD Context defining all terms in the Credential. This array
                            MUST contain "https://w3id.org/traceability/v1".
                          type: array
                          items:
                            type: string
                        id:
                          description: The IRI identifying the Credential
                          type: string
                        type:
                          description: The Type of the Credential
                          type: array
                          items:
                            type: string
                          minItems: 1
                        issuer:
                          description: This value MUST match the assertionMethod used to create the Verifiable Credential.
                          oneOf:
                            - type: string
                            - type: object
                              required:
                                - id
                              properties:
                                id:
                                  description: The IRI identifying the Issuer
                                  type: string
                        issuanceDate:
                          description: This value MUST be an XML Date Time String
                          type: string
                        credentialSubject:
                          type: object
                          properties:
                            id:
                              description: The IRI identifying the Subject
                              type: string
                      example:
                        '@context':
                          - 'https://www.w3.org/2018/credentials/v1'
                          - 'https://w3id.org/traceability/v1'
                        id: 'urn:uuid:07aa969e-b40d-4c1b-ab46-ded252003ded'
                        type:
                          - VerifiableCredential
                        issuer: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                        issuanceDate: '2010-01-01T19:23:24Z'
                        credentialSubject:
                          id: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                    options:
                      title: Issue Credential Options
                      type: object
                      description: Options for issuing a verifiable credential
                      required:
                        - type
                      properties:
                        type:
                          type: string
                          description: Linked Data Signature Suite or signal to use JWT.
                          enum:
                            - Ed25519Signature2018
                            - JsonWebSignature2020
                            - jwt_vc
                        created:
                          type: string
                          description: Date the proof was created. This value MUST be an XML Date Time String.
                        credentialStatus:
                          type: object
                          description: The method of credential status.
                          required:
                            - type
                          properties:
                            type:
                              type: string
                              description: The type of credential status.
                              enum:
                                - RevocationList2020Status
                      example:
                        type: JsonWebSignature2020
                        created: '2020-04-02T18:28:08Z'
                        credentialStatus:
                          type: RevocationList2020Status
          responses:
            '201':
              description: Resource Created
              content:
                application/json:
                  schema:
                    type: object
                    required:
                      - verifiableCredential
                    properties:
                      verifiableCredential:
                        title: Serialized Verifiable Credential
                        oneOf:
                          - title: Verifiable Credential
                            type: object
                            allOf:
                              - type: object
                                required:
                                  - '@context'
                                  - id
                                  - type
                                  - issuer
                                  - issuanceDate
                                  - credentialSubject
                                properties:
                                  '@context':
                                    description: |
                                      The JSON-LD Context defining all terms in the Credential. This array
                                      MUST contain "https://w3id.org/traceability/v1".
                                    type: array
                                    items:
                                      type: string
                                  id:
                                    description: The IRI identifying the Credential
                                    type: string
                                  type:
                                    description: The Type of the Credential
                                    type: array
                                    items:
                                      type: string
                                    minItems: 1
                                  issuer:
                                    description: This value MUST match the assertionMethod used to create the Verifiable Credential.
                                    oneOf:
                                      - type: string
                                      - type: object
                                        required:
                                          - id
                                        properties:
                                          id:
                                            description: The IRI identifying the Issuer
                                            type: string
                                  issuanceDate:
                                    description: This value MUST be an XML Date Time String
                                    type: string
                                  credentialSubject:
                                    type: object
                                    properties:
                                      id:
                                        description: The IRI identifying the Subject
                                        type: string
                                example:
                                  '@context':
                                    - 'https://www.w3.org/2018/credentials/v1'
                                    - 'https://w3id.org/traceability/v1'
                                  id: 'urn:uuid:07aa969e-b40d-4c1b-ab46-ded252003ded'
                                  type:
                                    - VerifiableCredential
                                  issuer: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                                  issuanceDate: '2010-01-01T19:23:24Z'
                                  credentialSubject:
                                    id: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                              - type: object
                                required:
                                  - proof
                                properties:
                                  proof:
                                    title: Credential Linked Data Proof
                                    allOf:
                                      - title: Linked Data Proof
                                        type: object
                                        description: A JSON-LD Linked Data proof.
                                        required:
                                          - type
                                        properties:
                                          type:
                                            type: string
                                            description: Linked Data Signature Suite used to produce proof.
                                            enum:
                                              - Ed25519Signature2018
                                              - JsonWebSignature2020
                                              - jwt_vc
                                          created:
                                            type: string
                                            description: Date the proof was created.
                                          verificationMethod:
                                            type: string
                                            description: Verification Method used to verify proof.
                                          jws:
                                            type: string
                                            description: Detached JSON Web Signature
                                        example:
                                          type: JsonWebSignature2020
                                          created: '2020-04-02T18:28:08Z'
                                          verificationMethod: 'did:example:123#z6MksHh7qHWvybLg5QTPPdG2DgEjjduBDArV9EF9mRiRzMBN'
                                          proofPurpose: assertionMethod
                                          jws: eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YtqjEYnFENT7fNW-COD0HAACxeuQxPKAmp4nIl8jYAu__6IH2FpSxv81w-l5PvE1og50tS9tH8WyXMlXyo45CA
                                      - type: object
                                        properties:
                                          proofPurpose:
                                            type: string
                                            description: Credentials rely on assertionMethod proof purpose.
                                            enum:
                                              - assertionMethod
                            example:
                              '@context':
                                - 'https://www.w3.org/2018/credentials/v1'
                                - 'https://w3id.org/traceability/v1'
                              id: 'urn:uuid:07aa969e-b40d-4c1b-ab46-ded252003ded'
                              type:
                                - VerifiableCredential
                              issuer: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                              issuanceDate: '2010-01-01T19:23:24Z'
                              credentialSubject:
                                id: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                              proof:
                                type: Ed25519Signature2018
                                created: '2021-10-30T19:16:30Z'
                                verificationMethod: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn#z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                                proofPurpose: assertionMethod
                                jws: eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..puetBYS3pkYlYzAecBiT-WkigYAlVbslrz9wPFnk9JW4AwjrpJvcsSdZJPhZtNy_myMJUNzC_QaYyw3ni1V0BA
                          - title: VC JWT
                            type: string
                            example: eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3RpU3pxRjlrcXdkVThWa2RCS3g1NkVZelhmcGduTlBVQUd6bnBpY05pV2ZuI3o2TWt0aVN6cUY5a3F3ZFU4VmtkQkt4NTZFWXpYZnBnbk5QVUFHem5waWNOaVdmbiJ9.eyJpc3MiOiJkaWQ6a2V5Ono2TWt0aVN6cUY5a3F3ZFU4VmtkQkt4NTZFWXpYZnBnbk5QVUFHem5waWNOaVdmbiIsInN1YiI6ImRpZDprZXk6ejZNa3RpU3pxRjlrcXdkVThWa2RCS3g1NkVZelhmcGduTlBVQUd6bnBpY05pV2ZuIiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJodHRwczovL3czaWQub3JnL3NlY3VyaXR5L3N1aXRlcy9qd3MtMjAyMC92MSJdLCJpZCI6InVybjp1dWlkOjA3YWE5NjllLWI0MGQtNGMxYi1hYjQ2LWRlZDI1MjAwM2RlZCIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjoiZGlkOmtleTp6Nk1rdGlTenFGOWtxd2RVOFZrZEJLeDU2RVl6WGZwZ25OUFVBR3pucGljTmlXZm4iLCJpc3N1YW5jZURhdGUiOiIyMDEwLTAxLTAxVDE5OjIzOjI0WiIsImNyZWRlbnRpYWxTdWJqZWN0IjoiZGlkOmtleTp6Nk1rdGlTenFGOWtxd2RVOFZrZEJLeDU2RVl6WGZwZ25OUFVBR3pucGljTmlXZm4ifSwianRpIjoidXJuOnV1aWQ6MDdhYTk2OWUtYjQwZC00YzFiLWFiNDYtZGVkMjUyMDAzZGVkIiwibmJmIjoxMjYyMzczODA0fQ.ZXlKaGJHY2lPaUpGWkVSVFFTSXNJbUkyTkNJNlptRnNjMlVzSW1OeWFYUWlPbHNpWWpZMElsMTkuLlBUZ1N5UndTRmdRRmZRQXJRSkVfUm43c3cyNzJRZnhlTUZjYk16R05KZDRKVGtWS3d4a2p1UzRXQV9xTGdhM2NGYzRKd0JILXJPMk5haTFfRExsWEF3
                        example:
                          '@context':
                            - 'https://www.w3.org/2018/credentials/v1'
                            - 'https://w3id.org/traceability/v1'
                          id: 'urn:uuid:07aa969e-b40d-4c1b-ab46-ded252003ded'
                          type:
                            - VerifiableCredential
                          issuer: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                          issuanceDate: '2010-01-01T19:23:24Z'
                          credentialSubject:
                            id: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                          proof:
                            type: Ed25519Signature2018
                            created: '2021-10-30T19:16:30Z'
                            verificationMethod: 'did:key:z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn#z6MktiSzqF9kqwdU8VkdBKx56EYzXfpgnNPUAGznpicNiWfn'
                            proofPurpose: assertionMethod
                            jws: eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..puetBYS3pkYlYzAecBiT-WkigYAlVbslrz9wPFnk9JW4AwjrpJvcsSdZJPhZtNy_myMJUNzC_QaYyw3ni1V0BA
            '400':
              description: Bad Request
              content:
                application/json:
                  schema:
                    allOf:
                      - type: object
                        required:
                          - message
                        properties:
                          message:
                            type: string
                          details:
                            oneOf:
                              - type: string
                              - type: array
                                items:
                                  type: string
                              - type: object
                                additionalProperties: true
                      - type: object
                        properties:
                          message:
                            enum:
                              - 'Bad Request: Your request body does not conform to the required schema'
            '401':
              description: Unauthorized
              content:
                application/json:
                  schema:
                    allOf:
                      - type: object
                        required:
                          - message
                        properties:
                          message:
                            type: string
                          details:
                            oneOf:
                              - type: string
                              - type: array
                                items:
                                  type: string
                              - type: object
                                additionalProperties: true
                      - type: object
                        properties:
                          message:
                            enum:
                              - 'Unauthorized: This endpoint requires an OAuth2 bearer token'
            '403':
              description: Forbidden
              content:
                application/json:
                  schema:
                    allOf:
                      - type: object
                        required:
                          - message
                        properties:
                          message:
                            type: string
                          details:
                            oneOf:
                              - type: string
                              - type: array
                                items:
                                  type: string
                              - type: object
                                additionalProperties: true
                      - type: object
                        properties:
                          message:
                            enum:
                              - 'Forbidden: OAuth2 bearer token does not have the required scope'
            '422':
              description: Unknown Issuer
              content:
                application/json:
                  schema:
                    description: |
                      ErrUnknownIssuer is returned when the implementation does not have private
                      key material for the requested `issuer`, and is therefore unable to issue
                      the requested credential.
                    allOf:
                      - type: object
                        required:
                          - message
                        properties:
                          message:
                            type: string
                          details:
                            oneOf:
                              - type: string
                              - type: array
                                items:
                                  type: string
                              - type: object
                                additionalProperties: true
                      - type: object
                        properties:
                          message:
                            enum:
                              - 'Unknown Issuer: Unable to issue credentials for specified issuer'
            '500':
              description: Unexpected Error
              content:
                application/json:
                  schema:
                    type: object
                    required:
                      - message
                    properties:
                      message:
                        type: string
                      details:
                        oneOf:
                          - type: string
                          - type: array
                            items:
                              type: string
                          - type: object
                            additionalProperties: true
    

Document generated by Confluence on Mar 02, 2023 14:12

[Atlassian](http://www.atlassian.com/)

