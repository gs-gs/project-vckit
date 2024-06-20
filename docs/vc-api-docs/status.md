# Overview

Documentation of DVPs API for dealing with credential status (i.e.
revocation).

VCs supporting revocation/status changes include a URL that can be used to
check the status, as well as a 'type' that indicates to the verifier how to
use it.

In addition, DVP provides an APi for issuers to set the status of VCs that
they've previously issued using DVP

Thus, there are two uses to consider, corresponding to verifier (checking VC
status) and issuer (setting VC status) roles.

The status-setting side may be based on VC-API, but unlike the issue and
verify endpoints, the VC-API aspects do not need interop testing as they are
only seen by DVP users.

Below are sections summarising these procedures, followed by DVP's proposed
implementation.


## Checking VC status summary

For checking revocation status, the API is different for each revocation
method. There is no flexibility here.

### OpenAttestation OCSP responder

As defined [here](https://github.com/Open-Attestation/ocsp-responder), a
document's revocation status is determined by a GET request to a
OCSP_RESPONDER_URL/{documentHash}. The base URL to GET from is given in the
particular document under
`"OpenAttestationMetaData.revocation.location":"<OCSP_RESPONDER_URL>"`. The
responder also gives a reason code for why documents have been revoked, or
simply "unspecified" (which corresponds to reasonCode 0)

  

### RevocationList2020Status

For RevocationList2020Status (the revocation type used by SVIP VCs), status
checking is achieved by retrieving the revocation list (a vc in intself)
specified by the VC whose status is to be checked (at
`credentialStatus.revocationListCredential`). Typical examples of
RevocationList2020Status have these revocation list VCs served at
`<DOMAIN>/credential/status/{listNumber}` where {listNumber} is an integer.
When issuing documents, the number will be incremented each time all available
revocation positions in a previous list are used. The contents of the
revocation list VC is determined by the RevocationList2020Status
[spec](https://w3c-ccg.github.io/vc-status-rl-2020/#revocationlist2020status)

### StatusList2021

Akthough not used currently, future versions of the DHS interop profile (and
associated test suites) will likely use
[StatusList2021](https://w3c.github.io/vc-status-list-2021/), which is a
successor to RevocationList2020Status. Any plan should include account for
supporting StatusList2021 in the future.

Fortunately StatusList2021 is very similar to it's predecessor, with the main
substantive difference being the addition of a "purpose" associated with a
status list. If this purpose is "revocation", then it achieves the same goal
as the predecessor, but it could in principle be anything (e.g. suspension).

## Updating VC status (revoking) summary

For an issuer to revoke a document, they may do so via API. Considering prior
art, on the SVIP side the VC-API defines a general interface for achieving the
goal and is aimed to be method independant. OpenAttestation doesn't typically
define HTTP api's for their methods, but their reference OCSP responder does
have an API specific to it.

This "set status" API is not used externally to the DVP- only DVP issuers use
it to manage their credentials. Thus there are no interop issues except those
arising if a users migarting to/from DVP and having to learn a new API.

An advantage having a unified API for both types is that an issuer doesn't
need to consider the "type" of a VC to manage it.

This is slightly complicated that the two VC types specify their VCs
'natively' in different ways (i.e. SVIP uses the VC's `id` OpenAttestation
uses `targetHash`). However, as noted elsewhere, it's expected that
OpenAttestation will generally evolve more toward the general W3C-CCG (SVIP)
approach in the future and DVP already adds an `id` to OA documents. Thus it
is sensible for DVP to support both methods with an API based on the SVIP/VC-
API approach.

# Proposed endpoints and payloads for status update

## Update status (OpenAttestationOCSP)

/credentials/status/[Status Type]/docId (corresponds to credentialStatusId)

POST /credentials/status/oa-ocsp

    
    
    {
        "credentialId": {urn:uuid:XXX}
        "credentialStatus" : {
          "type": "OpenAttestationOCSP",
          "status": "1" 
          "reasonCode": 0
        }
    }
    

## Update status (RevocationList2020Status)

POST /credentials/status

    
    
    {
        "credentialId": {urn:uuid:XXX}
        "credentialStatus" : {
          "type": "RevocationList2020Status",
          "status": "1" 
        }
    }
    

## Update status (StatusList2021)

POST /credentials/status

    
    
    {
        "credentialId": {urn:uuid:XXX}
        "credentialStatus" : {
          "type": "StatusList2021"
          "status": "1" 
          "purpose": "revocation"
        }
    }
    

Question: The above include a "type" for each, as this unambiguiously defines
which type of revocation is desired no matter how it's described in the VC.
This also matches the way it is done in VC-API. However, for all cases I'm
aware there's only one type fo revocation list in a VC, and sothis type
information is redundant.

Should `type` and `purpose`, `reasonCode` be optional? Then it is possible to
revoke any VC regardless of type by

POST `/credentials/status`

    
    
    {
        "credentialId": {urn:uuid:XXX}
        "credentialStatus":{
          "status": 1
        }
    }
    

# Proposed endpoints and payloads for status checking

These are for consumption by verifiers, not DVP issuers, and the specs for
payloads are clearly defined by each protocol. There is flexibility in
endpoint name though, as these are specified in each VC explicitly.

  

The general approach is to use endpoints of the form

`/credentials/status/{statusType}/{listIndex or documentIdentifier}`

## RevocationList2020Status

`/credentials/status/revocation-list-2020-status/{listIndex}`

  

({listIndex} is incremented as previous lists get full. The lists themselves
are embedded in a VC as described in the spec. Lists can be retired once the
lifetime of the VCs they serve has expired, or equivalently once all VCs are
revoked.

## StatusList2021

If StatusList2021 is implemented in the future it can be read at

`/credentials/status/status-list-2021/{purpose}/{listIndex}`

where `purpose` represents the status type, e.g. "revocation" or "suspension",
and `listIndex` is the same as above.

  

## OpenAttestation OCSP

An OCSP responder is served at:

`/credentials/status/oa-ocsp/{documentHash}`

  

Where `docmentHash` is the document's `targetHash` as usual for OA documents.

The response is of the form in the OCSP spec, i.e.:

    
    
    {
      "revoked": true, //Is the document revoked? 
      "documentHash": "0x13e53a698cd616a4df6781d6e61ce851c06ffe27db11b4bbcc7e7b4f76935a53", //Should be same document hash as in request
      "reasonCode": 0 // The reason code 0 means "unspecifed", and is likely enough for VC-KIT use cases. However see [here](https://github.com/Open-Attestation/ocsp-responder#reasoncode) for other code meanings.
    } 
    

## Links:

  * [discussion of credentialId in /credential/status](https://github.com/w3c-ccg/vc-api/issues/126)
  * [more clairty around the `id` field in VCDM](https://github.com/w3c/vc-data-model/issues/973)
  * R[evocationList2020status spec](https://w3c-ccg.github.io/vc-status-rl-2020/#revocationlist2020status)
  * [StatusList2021 spec](https://w3c.github.io/vc-status-list-2021/)
  * [documentation of OA's OCSP responder](https://github.com/Open-Attestation/ocsp-responder/blob/main/README.md)


