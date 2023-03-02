# Overview
While OpenAttestation (OA) docs are functionally equivent to other VC types (such as those matchin gthe "SVIP" profile), it's pre-VC history means the software uses a slightly different paradigm for reporting verification. This document is to briefly clarify the differences and how they translate.

## How OA's verification works

According to OpenAttestation documentation, OA tries to ensure 4 different things: (from the README of oa-verify):
1. The document has NOT been tampered, AND
2. The document has been issued, AND
3. The document has NOT been revoked, AND  
4. The issuer identity is valid.  

Verification reports are guided by this.

However for modern OA documents such as those used with VC-kit, this may be misleading: Now "issued" typically just means "digitally signed", whereas for older OpenAttestation documents "issued" means "put onto ethereum".

For digitally signed docs (e.g. DID-DNS), these checks are really

1. The `targetHash` included in the document does actually represent the hash of the rest of the document
2. The targetHash has been signed by the named DID (an ethereum ID)
3. The hash of the document is not in a revocation list (on-chain or elsewhere)
4. The named ethereum ID that did the signing is linked to the specified issuer's domain via DNS


And these map to the three verification fragments returned by OA's code (DOCUMENT_INTEGRITY, DOCUMENT_STATUS, ISSUER_IDENTITY) like so:
1. -> DOCUMENT_INTEGRITY
2. -> DOCUMENT_STATUS
3. -> DOCUMENT_STATUS
4. -> ISSUER_IDENTITY

That is a single OA 'verifier' will check both revocation status and the signature being valid, and return DOCUMENT_STATUS... but in this scenario DOCUMENT_INTEGRITY means nothing because the hash itself could've been altered. Anyone could've grabbed the VC, altered the payload, and simply altered the hash too to fit. Only verifying the hash AND the signature together confirms the document hasn't been tampered with. I.e DOCUMENT_INTEGRITY != "document has integrity"

## mapping for "proof" and "credentialStatus" from DOCUMENT_INTEGRITY and DOCUMENT_STATUS

The DVP verify API returns checks named "proof" and "credentialStatus"

"proof" = DOCUMENT_INTEGRITY && DOCUMENT_STATUS
"credentialStatus" = DOCUMENT_STATUS (if OA proof is 

This has the desired behavior when everything is "green". 

However, if a document is revoked then the response will be the same as if the signature check failed: 




## What about ISSUER_IDENTITY?

Another factor is the way OA handles issuer identity. For modern docs (e.g. DID-DNS/DID in OA terms) this corresponds to the "issuer" check described in ["what does verifying do"](what_does_verifying_do.md), which is redundant and already done as part of checking the proof and thus doesn't need to be signaled seperately.

